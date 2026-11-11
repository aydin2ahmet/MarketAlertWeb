/**
 * MACD kesişim sayfası (7. gün) yardımcıları. Hem sayfa üretiminde (ilk görünüm) hem tarayıcıda (canlandırma) çalışır,
 * bu yüzden DOM kullanmaz; SVG'yi metin olarak üretir.
 * Mesaj şablonları sunucunun gerçek çıktısıdır (PushNotificationTextBuilder, TelegramAlertMessageBuilder):
 * src/i18n/macd-messages.json. Grafik verisi örnek bir BNB günlük serisidir: src/i18n/macd-series.json
 * (indeks i = 6 Ekim 2026 + i gün; 35 = 10 Kasım, aşağı kesişim; 8 = 14 Ekim, yukarı kesişim).
 */
import msgs from '../i18n/macd-messages.json';
import series from '../i18n/macd-series.json';

export type Dir = 'u' | 'd';
export interface Series { ohlc: number[][]; m: number[]; s: number[]; cross: number[][] }
export interface McLang {
  push: { u: string; d: string; signal: string };
  tg: { u: string; d: string; signal: string; price: string; button: string; market: string; tf: Record<string, string> };
  cond: { u: string; d: string };
  num: { dec: string; grp: string; indian: boolean; neg: string };
  dateLoc: string; close: string; closeH: number;
}
export const TFS = ['1m', '5m', '15m', '1h', '4h', '1d'];
export const SERIES = series as unknown as { down: Series; up: Series };
export const LAST = 35;
export const mcLang = (code: string) => (msgs as any)[code] as McLang;
export const SHEET_VERSION = 'mc1';
export const sheetSrc = (code: string, theme: 'light' | 'dark', dir: Dir, tf: string) => `/mc/${code}/${theme}/sh-${dir}-${tf}.webp?v=${SHEET_VERSION}`;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? String(v[k]) : m));

/** Sayı biçimi: .NET kültürüyle aynı ayraçlar. trim: "#,0.##" gibi sondaki sıfırları atar. */
export function num(L: McLang, v: number, dec: number, trim = false): string {
  let s = Math.abs(v).toFixed(dec);
  if (trim && dec) s = s.replace(/0+$/, '').replace(/\.$/, '');
  let [a, b] = s.split('.');
  a = L.num.indian ? a.replace(/(\d)(?=(\d\d)+\d$)/g, '$1' + L.num.grp) : a.replace(/\B(?=(\d{3})+(?!\d))/g, L.num.grp);
  return (v < 0 ? L.num.neg : '') + a + (b ? L.num.dec + b : '');
}
export function day(L: McLang, i: number): string {
  return new Intl.DateTimeFormat(L.dateLoc, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 9, 6 + i)));
}
/** Örnek değerler: aşağı yönde 10 Kasım kapanışı, yukarı yönde ayrı serinin son kapanışı. */
export const example = (dir: Dir) => { const S = dir === 'u' ? SERIES.up : SERIES.down; return { m: S.m[LAST], s: S.s[LAST], p: S.ohlc[LAST][3] }; };

export function pushText(L: McLang, dir: Dir, tf: string, m: number, s: number) {
  return {
    title: fill(L.push[dir], { 0: 'BNB' }),
    body: `MACD(12,26,9)·${tf} ${num(L, m, 2, true)} │ ${dir === 'u' ? '↗' : '↘'} ${L.push.signal} ${num(L, s, 2, true)} ✓`,
  };
}
export function pushHtml(L: McLang, dir: Dir, tf: string, m: number, s: number, time: string): string {
  const p = pushText(L, dir, tf, m, s);
  return `<img src="/icons/logo-96.png" alt="" width="38" height="38" loading="lazy"><div class="mcp-x"><div class="mcp-h"><b>MarketAlert</b><span>${time}</span></div><b class="mcp-t">${esc(p.title)}</b><span class="mcp-b" dir="ltr">${esc(p.body)}</span></div>`;
}
export function tgMsg(L: McLang, dir: Dir, tf: string, m: number, s: number, p: number) {
  const t = L.tg;
  return {
    text: `${dir === 'u' ? '🟢' : '🔴'} <b>${esc(fill(t[dir], { 0: 'BNB' }))}</b>\n<i>🔔 BNB MACD</i>\n<blockquote>MACD (12,26): <b>${num(L, m, 3)}</b>\n${esc(t.signal)} (9): <b>${num(L, s, 3)}</b>\n${esc(t.price)}: <b>${num(L, p, 2, true)}</b></blockquote>\n⏱ ${esc(t.tf[tf])} · ${esc(t.market)}`,
    button: t.button,
  };
}
export const condText = (L: McLang, dir: Dir, tf: string) => fill(L.cond[dir], { fast: 12, slow: 26, signal: 9, timeframe: tf });
/** Bildirim saati: günlük mumda kapanış saati, diğerlerinde örnek bir saat başı. */
export const notifyTime = (L: McLang, tf: string) => tf === '1d' ? `${String(L.closeH).padStart(2, '0')}:00` : '12:00';

export interface ChartOpts {
  W?: number; H: number; from?: number; to?: number; upto?: number; price?: boolean; ov?: boolean; pB?: number; xl?: boolean;
  tags?: boolean; short?: boolean; cross?: number[][]; vline?: boolean; pulse?: boolean; xtag?: (i: number, d: number) => string | null;
  labels: { macd: string; signal: string; macdShort: string; signalShort: string }; day: (i: number) => string; openLabel?: string;
}
/** Mum + MACD/sinyal grafiği (SVG içeriği). Etiketler kesişimden uzakta, çizgiler arasının en açık olduğu yerde durur. */
export function chartSvg(S: Series, o: ChartOpts): string {
  const W = o.W ?? 360, H = o.H, N = S.ohlc.length;
  const a = o.from ?? 0, b = o.to ?? N - 1, upto = Math.min(o.upto ?? b, b), n = b - a + 1;
  const px = o.price !== false, ov = !!o.ov;
  const pT = 6, pB = ov ? H - 26 : px ? (o.pB ?? 150) : 0, mT = ov ? 20 : px ? pB + 20 : 8, mB = ov ? H - 40 : H - (o.xl === false ? 6 : 22);
  const L0 = 4, Rr = W - (px && !ov ? 44 : 6), st = (Rr - L0) / n, X = (i: number) => L0 + st * (i - a) + st / 2;
  const f1 = (v: number) => v.toFixed(1);
  const sl = S.ohlc.slice(a, b + 1), hi = Math.max(...sl.map(c => c[1])), lo = Math.min(...sl.map(c => c[2]));
  const Yp = (v: number) => pT + (hi - v) / (hi - lo) * (pB - pT);
  const mv = [...S.m.slice(a, b + 1), ...S.s.slice(a, b + 1)], mh = Math.max(...mv), ml = Math.min(...mv), pad = (mh - ml) * .12;
  const Ym = (v: number) => mT + (mh + pad - v) / (mh - ml + 2 * pad) * (mB - mT);
  const tag = (x: number, y: number, txt: string, cls: string, anchor = 'end') => {
    const w = [...txt].length * 6.3 + 12, x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
    return `<g class="tg1 ${cls}"><rect x="${f1(x0)}" y="${f1(y - 9)}" width="${f1(w)}" height="18" rx="9"/><text x="${f1(x0 + w / 2)}" y="${f1(y + 3.6)}" text-anchor="middle">${esc(txt)}</text></g>`;
  };
  let base = '', gc = '', gm = '', gs = '', gx = '';
  if (px && !ov) {
    for (let k = 0; k < 3; k++) { const v = lo + (hi - lo) * (k + .5) / 3; base += `<line x1="${L0}" x2="${f1(Rr)}" y1="${f1(Yp(v))}" y2="${f1(Yp(v))}" class="gl" stroke-dasharray="2 4"/><text x="${W - 2}" y="${f1(Yp(v) + 3.5)}" text-anchor="end" class="ax">${Math.round(v)}</text>`; }
    base += `<line x1="${L0}" x2="${W - 2}" y1="${pB + 10}" y2="${pB + 10}" class="gl"/><text x="${L0}" y="${mT + 4}" class="pl">MACD</text>`;
  }
  if (o.xl !== false) for (let i = a; i <= b; i++) { if ((i - a) % 7 === 0 || i === b) { if (i !== b && b - i < 4) continue; base += `<text x="${f1(X(i))}" y="${H - 6}" text-anchor="middle" class="ax">${esc(o.day(i))}</text>`; } }
  if (px) for (let i = a; i <= upto; i++) {
    const [op, h, l, c] = S.ohlc[i], cl = c >= op ? 'cu' : 'cd', y1 = Yp(Math.max(op, c)), y2 = Yp(Math.min(op, c));
    gc += `<line x1="${f1(X(i))}" x2="${f1(X(i))}" y1="${f1(Yp(h))}" y2="${f1(Yp(l))}" class="${cl} wk"/><rect x="${f1(X(i) - st * .32)}" y="${f1(y1)}" width="${f1(st * .64)}" height="${f1(Math.max(1.2, y2 - y1))}" rx="1" class="${cl}"/>`;
  }
  const path = (arr: number[]) => { let d = ''; for (let i = a; i <= upto; i++) d += (i === a ? 'M' : 'L') + f1(X(i)) + ' ' + f1(Ym(arr[i])); return d; };
  if (upto > a) { gs += `<path d="${path(S.s)}" class="sl"/>`; gm += `<path d="${path(S.m)}" class="ml"/>`; }
  if (o.tags !== false && upto > a) {
    let li = upto;
    if (upto - a >= 12) { let best = -1; for (let i = Math.round(a + (upto - a) * .4); i <= upto - 5; i++) { const g = Math.abs(Ym(S.m[i]) - Ym(S.s[i])); if (g > best) { best = g; li = i; } } }
    const ym = Ym(S.m[li]), ys = Ym(S.s[li]), up = ym < ys, cl = (v: number) => Math.max(mT + 9, Math.min(mB - 9, v));
    const t1 = cl(up ? ym - 13 : ym + 13), t2 = cl(up ? ys + 13 : ys - 13);
    const xa = li === upto ? (px && !ov ? W - 2 : X(upto) - 6) : X(li), an = li === upto ? 'end' : 'middle';
    if (li !== upto) { gm += `<circle cx="${f1(X(li))}" cy="${f1(ym)}" r="2.6" class="dm"/>`; gs += `<circle cx="${f1(X(li))}" cy="${f1(ys)}" r="2.4" class="ds"/>`; }
    gm += tag(xa, t1, o.short ? o.labels.macdShort : o.labels.macd, 'tm', an);
    gs += tag(xa, t2, o.short ? o.labels.signalShort : o.labels.signal, 'ts', an);
  }
  for (const [i, d] of (o.cross || []).filter(c => c[0] <= upto && c[0] >= a)) {
    const cls = d === 1 ? 'u' : 'd', y = (Ym(S.m[i]) + Ym(S.m[i - 1])) / 2;
    if (o.vline !== false) gx += `<line x1="${f1(X(i))}" x2="${f1(X(i))}" y1="${px ? pT : mT}" y2="${f1(mB)}" class="vx"/>`;
    if (o.pulse) gx += `<circle cx="${f1(X(i))}" cy="${f1(y)}" r="6" class="pz ${cls}"/>`;
    gx += `<circle cx="${f1(X(i))}" cy="${f1(y)}" r="5" class="xr ${cls}"/>`;
    const xt = o.xtag && o.xtag(i, d);
    if (xt) { const right = i > a + n * .6; gx += tag(X(i) + (right ? -8 : 8), px ? (Yp(S.ohlc[i][3]) < (pT + pB) / 2 ? pB - 8 : pT + 12) : mT + 8, xt, 'tx', right ? 'end' : 'start'); }
  }
  if (o.openLabel) { const x = X(b); gx += `<rect x="${f1(x - 11)}" y="4" width="22" height="${H - 32}" rx="6" class="oc"/><text x="${f1(x - 15)}" y="16" text-anchor="end" class="ax oct">${esc(o.openLabel)}</text>`; }
  return `${base}<g${ov ? ' opacity=".28"' : ''}>${gc}</g><g>${gm}</g><g>${gs}</g><g>${gx}</g>`;
}
