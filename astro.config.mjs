// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { LOCALES } from './src/config.ts';

export default defineConfig({
  site: 'https://www.marketalertapp.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: Object.fromEntries(LOCALES.map(l => [l.code, l.hreflang])),
      },
    }),
  ],
});
