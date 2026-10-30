// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { LOCALES } from './src/config.ts';

export default defineConfig({
  site: 'https://www.marketalertapp.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: page => new URL(page).pathname !== '/legal/',
      i18n: {
        defaultLocale: 'x-default',
        locales: {
          'x-default': 'x-default',
          ...Object.fromEntries(LOCALES.map(l => [l.code, l.hreflang])),
        },
      },
    }),
  ],
});
