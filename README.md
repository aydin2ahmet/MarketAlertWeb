# MarketAlert tanıtım sitesi (www.marketalertapp.com)

Astro 6 statik site, tasarım I (Terminal tur). Node 22.12+ gerekir.

```
npm install
npm run dev      # http://localhost:4321
npm run build    # çıktı: dist/
```

## Yayın

`main` dalına her gönderimde `.github/workflows/deploy.yml` siteyi derleyip GitHub Pages'e yükler.
Alan adı `public/CNAME` dosyasında: `www.marketalertapp.com`.

## Ayarlar (`src/config.ts`)

- `STORE.appStore`, `STORE.play`: boşken butonlar "Yakında" rozeti olur. Uygulama mağazaya çıkınca adresi yaz.
- `GA_ID`: Google Analytics 4 ölçüm kimliği (`G-XXXXXXXXXX`). Boşken Analytics ve çerez bandı hiç yüklenmez.
  Analytics yalnızca ziyaretçi "Kabul et" derse yüklenir. Gönderilen olaylar:
  `store_click` (store), `cta_click`, `language_switch` (to_lang), `theme_toggle` (theme), `feature_view` (feature).

## İçerik

- Metinler: `src/i18n/content.json` (11 dil)
- Ekran görüntüleri: `public/shots/{dil}/{light,dark}/*.webp` (her dilde uygulamanın kendi metinleriyle)
- Paylaşım görselleri: `public/og/{dil}.png`
