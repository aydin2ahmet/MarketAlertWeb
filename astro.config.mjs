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
      // /en/ kökün kopyası (canonical /), haritada yalnız kök durur.
      filter: page => { const p = new URL(page).pathname; return p !== '/en/' && !/^\/(?:[^/]+\/)?legal\//.test(p); },
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
