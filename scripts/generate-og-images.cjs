/**
 * Sayfaya özel paylaşım görseli (og:image), tasarım A: açık zemin, sayfa başlığı solda, Zilbo sağda.
 * Kaynaklar: alert-guides.json (features/*), coin-guides.json (coins/*), rsi-alerts.json (features/rsi-alerts), threshold-report.json
 * (tools/threshold-report), her dilin h1'i. Eşik raporu ciddi bir rapor sayfasıdır (Ahmet, 2026-11-18): Zilbo yerine sağda sayfanın
 * cetvel grafiği (30/70 çizgileri, eşiği geçen ve yaklaşan coinler) çizilir.
 * Çıktı: public/og/{section}/{slug}/{lang}.jpg (1200×630). GuidePage dosya varsa bunu, yoksa genel /og/{lang}.png'yi kullanır.
 * Yeni sayfa eklenince yerelde çalıştır (CI'da çalışmaz, Playwright + Chromium ister):
 *   node scripts/generate-og-images.cjs            (hepsi)
 *   node scripts/generate-og-images.cjs ai-crypto-alert-assistant   (yalnız bir sayfa)
 * Japonca/Çince için sistemde WenQuanYi Zen Hei (ya da Noto Sans CJK) yazı tipi gerekir.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const R = path.resolve(__dirname, '..');
const FS = path.join(R, 'node_modules/@fontsource-variable');
const only = process.argv[2];
const read = p => JSON.parse(fs.readFileSync(path.join(R, p), 'utf8'));
const Z = read('public/zilbo/zilbo-ai.json');
const b64 = p => fs.readFileSync(p).toString('base64');
const font = (n, f) => `@font-face{font-family:'${n}';src:url(data:font/woff2;base64,${b64(path.join(FS, f))}) format('woff2');font-weight:100 900}`;
const FONTS = [
  ['SG', 'space-grotesk/files/space-grotesk-latin-wght-normal.woff2'], ['SG', 'space-grotesk/files/space-grotesk-latin-ext-wght-normal.woff2'],
  ['AR', 'noto-sans-arabic/files/noto-sans-arabic-arabic-wght-normal.woff2'], ['DV', 'noto-sans-devanagari/files/noto-sans-devanagari-devanagari-wght-normal.woff2'],
  ['JB', 'jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'], ['IN', 'inter/files/inter-latin-wght-normal.woff2'], ['IN', 'inter/files/inter-cyrillic-wght-normal.woff2'],
].map(([n, f]) => font(n, f)).join('');
const ICON = 'data:image/png;base64,' + b64(path.join(R, 'public/icons/icon-512.png'));
const CSS = `${FONTS}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden}
.A{position:relative;width:1200px;height:630px;overflow:hidden;font-family:IN,AR,DV,'WenQuanYi Zen Hei','Noto Sans CJK JP',sans-serif;color:#14171D;
background:#FAFAF6;background-image:linear-gradient(rgba(20,23,29,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(20,23,29,.05) 1px,transparent 1px);background-size:40px 40px}
.brand{position:absolute;top:44px;inset-inline-start:56px;display:flex;align-items:center;gap:14px;font:700 30px SG,sans-serif}
.brand img{width:56px;height:56px;border-radius:14px}
h1{position:absolute;top:150px;inset-inline-start:56px;width:600px;margin:0;font-family:SG,IN,AR,DV,'WenQuanYi Zen Hei','Noto Sans CJK JP',sans-serif;font-weight:700;letter-spacing:-.02em;line-height:1.1;text-wrap:balance}
[dir=rtl] h1,:lang(hi) h1,:lang(ja) h1,:lang(zh) h1{letter-spacing:0;line-height:1.3}
:lang(ja) h1,:lang(zh) h1{-webkit-text-stroke:1.6px #14171D}
.url{position:absolute;bottom:44px;inset-inline-start:56px;font:600 22px JB,monospace;color:#B26F00}
.disc{position:absolute;width:470px;height:470px;border-radius:50%;background:#FFE3AE;inset-inline-end:40px;top:90px}
.zb{position:absolute;width:480px;height:508px;inset-inline-end:36px;top:70px}
[dir=rtl] .rl{right:auto;left:48px}
.rl{position:absolute;right:48px;top:96px;width:470px;height:440px;border-radius:28px;background:#fff;box-shadow:0 18px 50px rgba(20,23,29,.10);border:1px solid rgba(20,23,29,.08);direction:ltr}
.rl i{position:absolute;display:block;font-style:normal}.rl .vl{top:24px;bottom:56px;width:0;border-left:2px dashed rgba(20,23,29,.28)}
.rl .bar{top:292px;height:10px;border-radius:5px}.rl .c{width:38px;height:38px;border-radius:50%;font:700 10px JB,monospace;color:#fff;display:grid;place-items:center}
.rl .c.g{width:26px;height:26px;opacity:.55;font-size:7px}.rl .n{font:700 14px JB,monospace;color:#14171D;width:60px;text-align:center}
.rl .tg{bottom:16px;padding:3px 10px;border-radius:6px;color:#fff;font:700 16px JB,monospace}`;
// Eşik raporu: Zilbo yerine sayfanın cetveli (sol 30 mavi, sağ 70 turuncu; sabit örnek değerler, ham fiyat yok).
const RULER = (() => {
  const x30 = 150, x70 = 340, h = [];
  h.push(`<i class="vl" style="left:${x30}px"></i><i class="vl" style="left:${x70}px"></i>`);
  h.push(`<i class="bar" style="left:24px;width:${x30 - 30}px;background:#2F6BED"></i><i class="bar" style="left:${x30 + 6}px;width:${x70 - x30 - 12}px;background:#EEF0F3"></i><i class="bar" style="left:${x70 + 6}px;width:${440 - x70}px;background:#E4600F"></i>`);
  const up = [['ZEC', 22.0, '#2E3A8C', x30 - 50, 230], ['INJ', 23.7, '#8A4B1F', x30 - 46, 166], ['SOL', 31.2, '#1F7A55', x30 + 8, 102], ['PEPE', 32.9, '#6B2C7A', x30 + 12, 38], ['DOGE', 72.4, '#C27A12', x70 + 10, 230]];
  for (const [t, v, c, x, y] of up) h.push(`<i class="n" style="left:${x - 11}px;top:${y - 20}px">${v.toFixed(1)}</i><i class="c" style="left:${x}px;top:${y}px;background:${c};box-shadow:0 0 0 3px #fff,0 0 0 5px ${x < x30 || x > x70 ? '#14171D' : 'transparent'}">${t}</i>`);
  const grey = ['BTC', 'ETH', 'XRP', 'BNB', 'ADA', 'LTC', 'SUI', 'TRX', 'LINK', 'AVAX', 'UNI', 'TAO'];
  grey.forEach((t, k) => h.push(`<i class="c g" style="left:${x30 + 14 + (k % 6) * 30}px;top:${318 + Math.floor(k / 6) * 30}px;background:#9AA1AC">${t}</i>`));
  h.push(`<i class="tg" style="left:${x30 - 18}px;background:#2F6BED">30</i><i class="tg" style="left:${x70 - 18}px;background:#E4600F">70</i>`);
  return `<div class="rl">${h.join('')}</div>`;
})();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const pages = [];
const AG = read('src/i18n/alert-guides.json'), CG = read('src/i18n/coin-guides.json'), RG = read('src/i18n/rsi-alerts.json'), TR = read('src/i18n/threshold-report.json');
for (const l of Object.keys(AG)) {
  for (const s of Object.keys(AG[l])) pages.push(['features', s, l, AG[l][s].h1]);
  for (const s of Object.keys(CG[l] || {})) pages.push(['coins', s, l, CG[l][s].h1]);
  if (RG[l]) pages.push(['features', 'rsi-alerts', l, RG[l].h1]);
  if (TR[l]) pages.push(['tools', 'threshold-report', l, TR[l].h1]);
}
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  let n = 0;
  for (const [sec, slug, l, h1] of pages) {
    if (only && slug !== only) continue;
    const html = `<html lang="${l}" dir="${l === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<svg width="0" height="0" style="position:absolute"><defs>${Z.defs}</defs></svg>
<div class="A"><div class="brand"><img src="${ICON}">MarketAlert</div><h1>${esc(h1)}</h1><div class="url">www.marketalertapp.com</div>${sec === 'tools' ? RULER : `<div class="disc"></div>
<svg class="zb" viewBox="-150 -290 300 318">${Z.el[12]}</svg>`}</div></body></html>`;
    await p.setContent(html);
    await p.evaluate(() => document.fonts.ready);
    // Başlık 64 px'ten başlar; url satırına (alt 540 px) değmeyene kadar küçülür.
    await p.evaluate(() => { const h = document.querySelector('h1'); let f = 64; h.style.fontSize = f + 'px'; while ((h.getBoundingClientRect().bottom > 540 || h.scrollWidth > h.clientWidth + 1) && f > 36) { f -= 2; h.style.fontSize = f + 'px'; } });
    const out = path.join(R, 'public/og', sec, slug, `${l}.jpg`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await p.screenshot({ path: out, type: 'jpeg', quality: 88 });
    n++;
  }
  await b.close();
  console.log(`${n} görsel yazıldı`);
})();
