export const prerender = false;

import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';
import { business } from '~/config/business';

// Cloudflare Workers runtime env: vars and secrets set in the Cloudflare
// dashboard or via `wrangler secret put` — rotatable without a rebuild.
const runtimeEnv = cfEnv as Record<string, string | undefined>;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Verify a Cloudflare Turnstile token against the siteverify API. Only enforced
// when TURNSTILE_SECRET_KEY is configured, so the form still works without it.
async function verifyTurnstile(token: string, remoteIp: string | null): Promise<boolean> {
  const secret = runtimeEnv.TURNSTILE_SECRET_KEY ?? import.meta.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Turnstile not configured — skip the check
  if (!token) return false;

  try {
    const params = new URLSearchParams({ secret: String(secret), response: token });
    if (remoteIp) params.set('remoteip', remoteIp);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error('Turnstile verify error:', err);
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  // Honeypot: silently succeed if a bot filled the hidden field
  if (body.website) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  // Cloudflare Turnstile (no-op unless TURNSTILE_SECRET_KEY is set)
  const turnstileToken = String(body['cf-turnstile-response'] ?? '');
  const remoteIp = request.headers.get('cf-connecting-ip');
  if (!(await verifyTurnstile(turnstileToken, remoteIp))) {
    return new Response(JSON.stringify({ error: 'Bot check failed. Please try again.' }), { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!name || name.length > 200) {
    return new Response(JSON.stringify({ error: 'Please enter your name.' }), { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return new Response(JSON.stringify({ error: 'Please enter a valid email address.' }), { status: 400 });
  }
  if (!message || message.length > 5000) {
    return new Response(JSON.stringify({ error: 'Please enter your message (max 5,000 characters).' }), {
      status: 400,
    });
  }

  // Prefer Cloudflare runtime vars/secrets; fall back to build-time env
  // (.env files) so local `astro dev` keeps working unchanged.
  const apiKey = runtimeEnv.BREVO_API_KEY ?? import.meta.env.BREVO_API_KEY;
  const senderEmail = runtimeEnv.BREVO_SENDER_EMAIL ?? import.meta.env.BREVO_SENDER_EMAIL;
  const senderName = (runtimeEnv.BREVO_SENDER_NAME ?? import.meta.env.BREVO_SENDER_NAME ?? business.name) as string;
  const toEmail = (runtimeEnv.CONTACT_TO_EMAIL ?? import.meta.env.CONTACT_TO_EMAIL ?? business.email) as string;
  const toName = (runtimeEnv.CONTACT_TO_NAME ?? import.meta.env.CONTACT_TO_NAME ?? business.name) as string;

  if (!apiKey || !senderEmail || !toEmail) {
    console.error('Contact form: missing BREVO_API_KEY, BREVO_SENDER_EMAIL, or CONTACT_TO_EMAIL');
    return new Response(JSON.stringify({ error: 'Mail service not configured. Please contact us directly.' }), {
      status: 503,
    });
  }

  const htmlContent = `
    <h2>New enquiry from ${escapeHtml(business.name)}</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey as string,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName }],
        replyTo: { email, name },
        subject: `New enquiry from ${business.name}`,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Brevo API error:', res.status, errText);
      return new Response(JSON.stringify({ error: 'Failed to send. Please try again.' }), { status: 502 });
    }

    // Auto-reply to the customer (best-effort — never fails the request).
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': apiKey as string, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email, name }],
          subject: `Thanks for contacting ${business.name}`,
          htmlContent: `
            <p>Hi ${escapeHtml(name)},</p>
            <p>Thanks for getting in touch with ${escapeHtml(business.name)} — we've received your message and will get back to you as soon as we can.</p>
            <p>For reference, here's what you sent:</p>
            <blockquote>${escapeHtml(message).replace(/\n/g, '<br>')}</blockquote>
            <p>Kind regards,<br>${escapeHtml(business.name)}</p>
          `,
        }),
      });
    } catch (replyErr) {
      console.error('Auto-reply failed (enquiry still delivered):', replyErr);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send. Please try again.' }), { status: 500 });
  }
};
