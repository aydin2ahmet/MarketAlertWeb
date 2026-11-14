// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { LOCALES } from './src/config.ts';
import { existsSync, readFileSync } from 'node:fs';

// Görsel site haritası: her sayfadaki keskin görselleri (src/srcset en büyük dosya, og:image) <image:image> olarak ekler.
// Google Görseller'in .preview gibi küçük dosyaları değil asıl dosyaları alması için (2026-11-14).
const DIST = new URL('./dist/', import.meta.url);
function pageImages(loc) {
  const file = new URL('.' + new URL(loc).pathname + 'index.html', DIST);
  if (!existsSync(file)) return [];
  const html = readFileSync(file, 'utf8');
  const out = new Set();
  const og = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (og) out.add(og[1]);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    const set = tag.match(/srcset="([^"]+)"/);
    const src = set ? set[1].split(',').map(x => x.trim().split(/\s+/)[0]).pop() : (tag.match(/\ssrc="([^"]+)"/) || [])[1];
    if (!src || /preview|\/icons\/|zilbo\.webp|bot-96/.test(src)) continue;
    out.add(new URL(src, 'https://www.marketalertapp.com').href);
  }
  return [...out].slice(0, 1000).map(url => ({ url }));
}

export default defineConfig({
  site: 'https://www.marketalertapp.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      // /en/ kökün kopyası (canonical /), haritada yalnız kök durur.
      filter: page => { const p = new URL(page).pathname; return p !== '/en/' && !/^\/(?:[^/]+\/)?legal\//.test(p); },
      serialize(item) { const img = pageImages(item.url); if (img.length) item.img = img; return item; },
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
