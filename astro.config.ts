import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

import { unified } from '@astrojs/markdown-remark';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import type { AstroIntegration } from 'astro';

import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
  // Deployment target: Cloudflare (Workers static assets — the successor to
  // Cloudflare Pages, with the same push-to-deploy git workflow via Workers
  // Builds in the dashboard).
  //
  // `output: 'static'` prerenders every page to plain HTML served from
  // Cloudflare's CDN — the right default for the marketing/SME sites this
  // template produces. Routes that opt out with `export const prerender =
  // false` (e.g. `src/pages/api/contact.ts`) run on-demand in a Cloudflare
  // Worker at the edge.
  //
  // The build emits static assets to `dist/client/`, the Worker to
  // `dist/server/`, and a ready-to-deploy config at
  // `dist/server/wrangler.json` — merged from ./wrangler.jsonc, where the
  // per-site Worker `name` is set. Deploy with
  // `npx wrangler deploy -c dist/server/wrangler.json`, or connect the repo
  // in the Cloudflare dashboard with build command `npm run build`.
  //
  // Security/cache headers live in `public/_headers`. Runtime secrets (Brevo
  // keys etc.) are read from the Worker env via `cloudflare:workers` — set
  // them with `wrangler secret put` or in the dashboard.
  output: 'static',
  // `prerenderEnvironment: 'node'` runs build-time prerendering under Node
  // instead of workerd. Our static pages render Markdown/MDX at build time,
  // and that pipeline (micromark → debug) imports Node built-ins like `tty`
  // that workerd can't resolve. Prerendering in Node sidesteps that; only the
  // genuinely on-demand routes (e.g. api/contact) run on workerd at the edge.
  // In `astro dev` the default image service ('cloudflare-binding') registers
  // an /_image endpoint that imports `cloudflare:workers`, but with
  // `prerenderEnvironment: 'node'` that endpoint is loaded in the Node dev
  // environment where the module can't resolve (FailedToLoadModuleSSR).
  // Use the passthrough service in dev only — builds keep the binding service.
  adapter: cloudflare({
    prerenderEnvironment: 'node',
    ...(process.argv.includes('dev') ? { imageService: 'passthrough' as const } : {}),
  }),

  integrations: [
    sitemap(),
    mdx(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    compress({
      // Keep CSS compression OFF: astro-compress (csso) doesn't understand the
      // range media-query syntax Tailwind 4 emits (`@media (width >= 48rem)`)
      // and silently strips every sm:/md:/lg: rule, leaving the site stuck in
      // the mobile layout. Vite already minifies CSS during the build anyway.
      CSS: false,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),

    astrowind({
      config: './src/config.yaml',
    }),
  ],

  image: {
    // Astro's default Sharp service handles local images.
    //
    // Most remote CDN images (Unsplash, Cloudinary, Imgix…) are routed by
    // src/components/common/Image.astro through `unpic`, which rewrites the
    // URL with CDN-side query parameters and serves it straight from the
    // provider — Astro never downloads it, so they don't need to be listed.
    //
    // `domains` only matters for remote URLs that fall through to Astro's
    // native <Image /> (i.e. providers Unpic can't detect, like Pixabay).
    // Listed entries are authorized to be processed by Sharp.
    domains: ['cdn.pixabay.com'],
  },

  markdown: {
    processor: unified({
      remarkPlugins: [readingTimeRemarkPlugin],
      rehypePlugins: [responsiveTablesRehypePlugin],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
