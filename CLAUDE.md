# Claude Code Configuration

See [AGENTS.md](./AGENTS.md) for full project documentation and architecture reference.  
See [DESIGN.md](./DESIGN.md) for Tailwind and design system standards — follow these on every task.

---

## Standing rules — follow these automatically on every task in this repo

### Layout and metadata

- Every page **must** render through `PageLayout.astro` (or `MarkdownLayout.astro` for `.md` files). Never hand-write `<title>`, `<meta>`, canonical, or any OG tag directly in a page file — the layout handles all of that via `Metadata.astro` and `astro-seo`.
- Pass `metadata={{ title: '…', description: '…' }}` on every page. Title must be unique across the site and under ~60 characters. Description must be unique and 150–160 characters.
- Every page must contain exactly one `<h1>`. Do not use an `<h1>` inside a widget if the page already has one.
- Canonicals are generated automatically from `SITE.site` in `src/config.yaml` — do not set them manually unless overriding for a specific reason.

### Images

- Use `~/components/common/Image.astro` (which wraps Astro Assets + Unpic) for every image. Never use a plain HTML `<img>` tag.
- Meaningful images (photos, illustrations, logos) must have a descriptive `alt` attribute that describes the content and context.
- Decorative images that add no information must have `alt=""`.
- Hero images should include `loading="eager"` and `fetchpriority="high"`.

### Structured data (JSON-LD)

- Local business sites get `LocalBusinessSchema` on the homepage and contact page. Inject it via `<Fragment slot="head">` inside the layout so it lands in `<head>`.
- Add `ServiceSchema` on any dedicated service page (or on the services index if it covers a single service clearly).
- Add `FaqSchema` on any page that includes a FAQs widget with real question/answer content.
- All schema components live in `~/components/schema/`. They default-read from `~/config/business.ts` — override via props only when a specific page needs different values.
- Never inline JSON-LD by hand. Always use the schema components.
- Add `Breadcrumbs` (`~/components/common/Breadcrumbs.astro`) at the top of inner pages (service detail pages already have it) — it renders the visible trail **and** `BreadcrumbList` JSON-LD in one go.
- **AggregateRating** (⭐ stars in Google) is emitted by `LocalBusinessSchema` only when `business.aggregateRating` is set. Set it **only** with a real rating that is also displayed on the site — fabricated ratings breach Google's guidelines. Leave it undefined otherwise.

### Services (data-driven — never hand-build service pages)

- Services live in the `service` content collection: one Markdown file per service in `src/data/services/`. Each becomes `/services/<filename>` with its own page, `ServiceSchema`, breadcrumbs, and a card on the `/services` index — all automatic.
- To add a service: copy an existing file, edit the frontmatter (`title`, `excerpt`, `icon`, `order`, optional `features`) and the Markdown body. `draft: true` hides one. Do **not** create bespoke `.astro` pages under `src/pages/services/`.
- The template ships with `example-service-*.md` placeholders — replace or delete them (the go-live guardrail and dev banner flag any that remain).

**Testimonials and FAQs are data-driven too** — don't hand-build them:

- Testimonials live in `src/data/testimonials/` (one file each: `name`, `job`, `testimonial`, optional `rating` for stars). Render with `<TestimonialsData />` — it loads and sorts them. For ⭐ in Google, set a **real** `business.aggregateRating`.
- FAQs live in `src/data/faq/` (`question`, `answer`, optional `icon`). Render with `<FaqsData />` — it renders the list **and** emits `FAQPage` JSON-LD automatically (don't also add `FaqSchema` by hand).
- Both ship `example-*.md` files flagged by the guardrail/dev banner.

### Conversion & trust components

- **Sticky call/WhatsApp bar** (`StickyContact.astro`, in the layout) — mobile-only, sourced from `business.ts`. Remove it from `Layout.astro` for a client that doesn't want it.
- **Opening hours + "Open now" badge** (`OpeningHours.astro`) reads `business.openingHours` (schema.org format like `Mo-Fr 09:00-17:00`); open/closed is computed client-side. It's on the contact page — reuse it anywhere.
- The **contact form auto-replies** to the customer (best-effort, via Brevo) — keep that behaviour when editing `api/contact.ts`.

### Business config

- `src/config/business.ts` is the **single source of truth** for the client's name, address, phone, type, and image for every new project. Fill it in before building any pages.
- The `type` field must be a valid schema.org subtype of `LocalBusiness` (e.g. `Plumber`, `Attorney`, `HairSalon`). Use `LocalBusiness` as a fallback only.

### Per-client tooling (use these instead of hand-editing)

- **`npm run setup`** ([scripts/setup.mjs](scripts/setup.mjs)) is the front door for a new client. One questionnaire writes `src/config/business.ts`, `src/config.yaml`, the brand colour in `CustomStyles.astro`, and the Worker name in `wrangler.jsonc`. It is re-runnable (targets values, not lines). Prefer it over editing those files by hand. For unattended setup, `npm run setup -- --from client.yaml` reads answers from a file (see `client.example.yaml`).
- **`npm run new -- <service|faq|testimonial|page> "<name>"`** ([scripts/new.mjs](scripts/new.mjs)) scaffolds a content/data file — use it instead of hand-creating files in `src/data/*`.
- **`npm run brand <logo>`** ([scripts/brand.mjs](scripts/brand.mjs)) regenerates the favicons **and** the OG image from one logo (brand colour + name pulled from config). Run it after `setup`.
- **`src/recipes/`** holds ready-made page compositions — `cp src/recipes/home.astro src/pages/index.astro` and edit, rather than building a page from a blank file.
- **`npm run check:golive`** ([scripts/check-golive.mjs](scripts/check-golive.mjs)) is the pre-deploy guardrail. It exits non-zero if template placeholders remain (example.com, noindex, `Business Name`, `G-TEST12345`, example collection files, etc.). Run it before every launch; treat a non-zero exit as "do not deploy".
- **`src/config/business.ts` is the single source of truth for client identity.** `config.yaml` holds site/SEO settings. When adding a value that identifies the business (name, phone, address, type), read it from `business.ts` — don't duplicate it. If you add a new placeholder-able field, add a matching check to `check-golive.mjs` and `DevBanner.astro`.
- **`DevBanner.astro`** shows outstanding placeholders in `astro dev` only (stripped from production). Keep its checks in sync with the guardrail.

### Site config and launch checklist

The template ships with `metadata.robots.index: false` so dev and staging builds are never indexed. Before going live (or just run `npm run setup` then `npm run check:golive`):

1. Set `site.site` in `src/config.yaml` to the real production URL — this value drives the sitemap, canonical URLs, robots.txt `Sitemap:` line, and OG URLs. It is the single domain constant.
2. Set `site.name`, `metadata.title.default`, `metadata.title.template`, and `metadata.description` in `src/config.yaml`.
3. Fill in `src/config/business.ts` with real client details.
4. Replace `src/assets/images/default.png` with the client's OG image (1200×628 px).
5. Replace `src/assets/favicons/` with the client's favicons.
6. Set `analytics.vendors.googleAnalytics.id` in `src/config.yaml` if the client has GA4 (see Analytics rule below).
7. Set `site.googleSiteVerificationId` in `src/config.yaml` if verifying in Search Console via the HTML-tag method (paste only the token, not the whole `<meta>`).
8. **Enable indexing**: in `src/config.yaml` set `metadata.robots.index: true`, `metadata.robots.follow: true`, and all three `apps.blog.*.robots.index: true` values. The site will not appear in Google until this is done.

### Analytics, Search Console & cookie consent

- **Google Analytics** is wired via `src/components/common/Analytics.astro` and gated by `analytics.vendors.googleAnalytics.id` in `config.yaml`. It runs under **Consent Mode v2**: analytics/ads storage default to `denied`, so GA sets no cookies until the visitor accepts. Do not add gtag/GA snippets by hand and do not remove the consent gating.
- **The cookie banner** (`src/components/common/CookieConsent.astro`) appears automatically **only when a GA id is set** — that's the only non-essential cookie source, so no id means no banner is needed. Accept/Decline is stored in `localStorage` (`aw-cookie-consent`) and drives `gtag('consent','update')`. Keep a working `/privacy` page, since the banner links to it.
- **Search Console verification** renders from `site.googleSiteVerificationId` via `SiteVerification.astro`. Prefer DNS verification when possible; use the HTML-tag token here otherwise.
- Partytown is **not** wired in this template — leave `googleAnalytics.partytown: false`. GA must run on the main thread for Consent Mode to work.
- **Contact form spam**: a hidden honeypot always runs. **Cloudflare Turnstile** is optional — set `PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` in `.env` (and the secret as a Worker secret in production) to enable it. The widget in `Form.astro` and the server check in `api/contact.ts` are both no-ops when unset, so the form always works. Don't hand-roll other CAPTCHAs.

### Language and localisation

- Default language is **Irish English**: `language: en-IE` in `src/config.yaml`. The `<html lang>` attribute and `og:locale` (`en_IE`) are derived from this automatically — do not override them per page.
- Date formatting and copy should follow Irish conventions (DD/MM/YYYY, €, phone numbers in +353 format).

### Layout and copy conventions

- Do not use numbered markers (01 / 02 / 03, or bare index numbers) to label sections, cards, or list items in layouts or widgets. Use icons, headings, or visual hierarchy instead.
- Keep section headings as real prose, not labels ("What we do" not "Services 01").

### Footer standard

The default footer structure is a standing standard for every build — keep it on all client sites:

- **Brand column (left)**: logo, short business description, then Terms · Privacy Policy links.
- **Icon-led link columns (right, evenly spread)**: an "Explore" nav column and a "Get in touch" column (phone, WhatsApp, email, locality) — contact details are sourced from `src/config/business.ts` and update automatically per client.
- **Bottom bar**: footnote left ("<Business Name>. All rights reserved. Website by Design My Website"), social icons right.
- Every link in the footer columns carries a tabler icon. Per-client changes go in `src/navigation.ts` and `src/config/business.ts` — do not restructure `Footer.astro`.

### Quality checks after every change

Run `npm run build` — it must pass with zero errors. The two expected warnings (`No files found matching "*.md,*.mdx"` and `The collection "post" does not exist`) are normal on a fresh clone with no blog posts yet.
