// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="vite/client" />
/// <reference types="../vendor/integration/types.d.ts" />

// Fontsource packages ship CSS only (no type declarations); declare them so
// side-effect imports type-check under TypeScript 6 strict (ts2882).
declare module '@fontsource-variable/*';
declare module '@fontsource/*';

// Cloudflare Workers runtime module (vars, secrets, and bindings), used by
// on-demand routes like src/pages/api/contact.ts. Minimal declaration so the
// base template doesn't need @cloudflare/workers-types; if a client site later
// runs `wrangler types`, replace this with the generated declarations.
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}

// Build-time env vars (from .env). Runtime secrets on Cloudflare are read via
// `cloudflare:workers` instead — see src/pages/api/contact.ts.
interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly BREVO_API_KEY?: string;
  readonly BREVO_SENDER_EMAIL?: string;
  readonly BREVO_SENDER_NAME?: string;
  readonly CONTACT_TO_EMAIL?: string;
  readonly CONTACT_TO_NAME?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
