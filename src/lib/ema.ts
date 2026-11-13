/**
 * EMA kesişim sayfası (9. gün) yardımcıları. Sayfa üretiminde ve tarayıcıda aynı kod çalışır; DOM kullanmaz.
 * Kural sunucuyla aynı: yalnızca kapanmış mumlar; önceki (hızlı − yavaş) ≤ 0 ve şimdiki > 0 ise yukarı kesişim,
 * tersi aşağı kesişim. Mesaj şablonları sunucunun gerçek çıktısıdır (PushNotificationTextBuilder,
 * TelegramAlertMessageBuilder): src/i18n/ema-messages.json. Grafik verisi sabit tohumla üretilen örnek seridir.
 */
import msgs from '../i18n/ema-messages.json';

export type Dir = 'u' | 'd';
export interface EmNum { dec: string; grp: string; indian: boolean; neg: string }
export interface EmLang {
  push: Record<Dir, string>;
  tg: Record<Dir, string> & { fast: string; slow: string; price: string; button: string; market: string; tf: Record<string, string> };
  cond: Record<Dir, string>; live: string; pct: string; num: EmNum; off: number; tz: string;
}
export const emLang = (code: string) => (msgs as any)[code] as EmLang;
export const SHOT_VERSION = 'em1';
export const shotSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/em-${k}.webp?v=${SHOT_VERSION}`;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? String(v[k]) : m));

export function num(N: EmNum, v: number, dec: number): string {
  let [a, b] = Math.abs(v).toFixed(dec).split('.');
  a = N.indian ? a.replace(/(\d)(?=(\d\d)+\d$)/g, '$1' + N.grp) : a.replace(/\B(?=(\d{3})+(?!\d))/g, N.grp);
  return (v < 0 ? N.neg : '') + a + (b ? N.dec + b : '');
}
export const pct = (L: EmLang, v: number) => fill(L.pct, { v: num(L.num, v, 1) });

/** Örnek değerler (BTC, 1h): hızlı EMA 9, yavaş EMA 21, fiyat. */
export const VAL: Record<Dir, [number, number, number]> = { u: [71240.5, 71198.2, 71312.4], d: [69802.1, 69880.4, 69744.8] };

export function pushHtml(L: EmLang, dir: Dir, tf: string, time: string): string {
  const [f, s] = VAL[dir];
  const title = fill(L.push[dir], { 0: 'BTC', 1: 'EMA', 2: 9, 3: 21 });
  const body = `EMA(9)·${tf}  ${num(L.num, f, 1)}  │  ${dir === 'u' ? '↗' : '↘'} EMA(21) ${num(L.num, s, 1)}  ✓`;
  return `<img src="/icons/logo-96.png" alt="" width="38" height="38" loading="lazy"><div class="mcp-x"><div class="mcp-h"><b>MarketAlert</b><span>${esc(time)}</span></div><b class="mcp-t">${esc(title)}</b><span class="mcp-b" dir="ltr">${esc(body)}</span></div>`;
}
export function tgMsg(L: EmLang, dir: Dir, tf: string) {
  const t = L.tg, [f, s, p] = VAL[dir];
  return {
    text: `${dir === 'u' ? '🟢' : '🔴'} <b>${esc(fill(t[dir], { 0: 'BTC', 1: 'EMA 9', 2: 'EMA 21' }))}</b>\n<i>🔔 BTC EMA 9/21</i>\n<blockquote>${esc(t.fast)} EMA 9: <b>${num(L.num, f, 1)}</b>\n${esc(t.slow)} EMA 21: <b>${num(L.num, s, 1)}</b>\n${esc(t.price)}: <b>${num(L.num, p, 1)}</b></blockquote>\n⏱ ${esc(t.tf[tf])} · ${esc(t.market)}`,
    button: t.button,
  };
}
export const condText = (L: EmLang, dir: Dir, tf: string) => fill(L.cond[dir], { ma: 'EMA', fast: 9, slow: 21, timeframe: tf });

/* ---------- örnek seri ---------- */
interface Candle { o: number; h: number; l: number; c: number }
function rnd(seed: number) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function makeCandles(seed: number, n: number, base: number, vol: number, wave: number): Candle[] {
  const r = rnd(seed); let p = base; const o: Candle[] = [];
  for (let i = 0; i < n; i++) {
    const d = (r() - .5) * vol + Math.sin(i / wave) * vol * .32, op = p, cl = p * (1 + d);
    o.push({ o: op, c: cl, h: Math.max(op, cl) * (1 + r() * vol * .35), l: Math.min(op, cl) * (1 - r() * vol * .35) }); p = cl;
  }
  return o;
}
function ema(a: number[], n: number): (number | null)[] {
  const k = 2 / (n + 1), o: (number | null)[] = []; let e: number | null = null;
  for (let i = 0; i < a.length; i++) {
    if (i < n - 1) { o.push(null); continue; }
    e = e === null ? a.slice(0, n).reduce((x, y) => x + y, 0) / n : a[i] * k + e * (1 - k);
    o.push(e);
  }
  return o;
}
export const CS = makeCandles(7, 260, 68400, .011, 9);
const CL = CS.map(c => c.c);
export const E9 = ema(CL, 9), E21 = ema(CL, 21);
/** Kesişimler: [mum, yön]. */
export const XS: [number, Dir][] = (() => {
  const o: [number, Dir][] = [];
  for (let i = 31; i < CL.length; i++) {
    const p = E9[i - 1]! - E21[i - 1]!, c = E9[i]! - E21[i]!;
    if (p <= 0 && c > 0) o.push([i, 'u']); else if (p >= 0 && c < 0) o.push([i, 'd']);
  }
  return o;
})();
export const crossAt = (dir: Dir) => XS.filter(x => x[1] === dir && x[0] > 100)[0][0];

const f1 = (v: number) => Math.round(v * 10) / 10;
/** Mini grafik: mumlar, iki EMA, aradaki dolgu, kesişim halkası. */
export function miniSvg(dir: Dir, W: number, H: number): string {
  const ci = crossAt(dir), from = ci - 14, to = ci + 4, pad = [14, 10, 10, 10];
  const n = to - from + 1, cw = (W - pad[1] - pad[3]) / n, X = (i: number) => f1(pad[3] + (i - from + .5) * cw);
  const vals: number[] = [];
  for (let i = from; i <= to; i++) vals.push(CS[i].h, CS[i].l, E9[i]!, E21[i]!);
  const mn = Math.min(...vals), mx = Math.max(...vals), Y = (v: number) => f1(pad[0] + (mx - v) / (mx - mn || 1) * (H - pad[0] - pad[2]));
  let h = '';
  for (let k = 1; k < 4; k++) { const y = f1(pad[0] + k * (H - pad[0] - pad[2]) / 4); h += `<line class="gl" x1="${pad[3]}" x2="${W - pad[1]}" y1="${y}" y2="${y}"/>`; }
  for (let i = from; i <= to; i++) {
    const c = CS[i], up = c.c >= c.o;
    h += `<g class="kc"><line class="wk" x1="${X(i)}" x2="${X(i)}" y1="${Y(c.h)}" y2="${Y(c.l)}"/><rect class="${up ? 'cu' : 'cd'}" x="${f1(X(i) - cw * .32)}" width="${f1(cw * .64)}" y="${Y(Math.max(c.o, c.c))}" height="${f1(Math.max(1, Math.abs(Y(c.o) - Y(c.c))))}" rx="1"/></g>`;
  }
  for (let i = from + 1; i <= to; i++) {
    const u = (E9[i]! + E9[i - 1]!) > (E21[i]! + E21[i - 1]!);
    h += `<path class="${u ? 'fu' : 'fd'}" d="M${X(i - 1)} ${Y(E9[i - 1]!)}L${X(i)} ${Y(E9[i]!)}L${X(i)} ${Y(E21[i]!)}L${X(i - 1)} ${Y(E21[i - 1]!)}Z"/>`;
  }
  const line = (a: (number | null)[]) => { let d = ''; for (let i = from; i <= to; i++) d += `${i === from ? 'M' : 'L'}${X(i)} ${Y(a[i]!)}`; return d; };
  h += `<path class="sl" d="${line(E21)}"/><path class="fa" d="${line(E9)}"/>`;
  h += `<circle class="ring ${dir}" cx="${X(ci)}" cy="${Y(E9[ci]!)}" r="6"/><circle class="pz ${dir}" cx="${X(ci)}" cy="${Y(E9[ci]!)}" r="6"/>`;
  return h;
}

/* ---------- gün şeridi (ne zaman bildirim gelir) ---------- */
export const TFD = ['15m', '1h', '4h', '1d'];
const MIN: Record<string, number> = { '15m': 15, '1h': 60, '4h': 240, '1d': 1440 };
/** Kesişim anı: 13:47 (yerel gösterim saati). */
export const X0 = 13 * 60 + 47;
export const hm = (m: number) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
/** Günü mum bloklarına böler: [başlangıç, bitiş, kesişimi içeriyor mu]. off: 4h ve 1d mumlarının gösterilen saatteki kayması. */
export function blocks(tf: string, off: number): [number, number, boolean][] {
  const m = MIN[tf], o = tf === '4h' || tf === '1d' ? off : 0, out: [number, number, boolean][] = [];
  if (tf === '1d') return [[0, 1440, true]];
  for (let s = o - m * Math.ceil(o / m); s < 1440; s += m) { const a = Math.max(0, s), b = Math.min(1440, s + m); if (b > a) out.push([a, b, X0 >= s && X0 < s + m]); }
  return out;
}
export function closeAt(tf: string, off: number) { const m = MIN[tf], o = tf === '4h' || tf === '1d' ? off : 0; return Math.ceil((X0 - o + 1) / m) * m + o; }
export const perDay = (tf: string) => Math.round(1440 / MIN[tf]);
export function dayRow(tf: string, off: number): string {
  const bl = blocks(tf, off);
  return `<div class="em-row${bl.length > 40 ? ' dense' : ''}" style="grid-template-columns:${bl.map(b => (b[1] - b[0]) + 'fr').join(' ')}">${bl.map(b => `<span${b[2] ? ' class="x"' : ''}></span>`).join('')}</div>`;
}
export function daySentence(T: { s: string; sDay: string }, L: EmLang, tf: string): string {
  const c = closeAt(tf, L.off);
  return fill(tf === '1d' ? T.sDay : T.s, { x: hm(X0), tf, close: hm(c), tz: L.tz, n: perDay(tf) });
}
