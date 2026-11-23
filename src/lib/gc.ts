/**
 * Golden cross / death cross sayfası (17. gün, B "Tahterevalli") yardımcıları.
 * Örnek seri: 560 mumluk, rejimli rastgele yürüyüş; SMA 50 ve SMA 200 gerçekten hesaplanır, kesişmeler kapanışla bulunur
 * (önceki mumda fark <= 0, bu mumda > 0 ise yukarı kesişim; aşağısı tersi). Sunucu son kareyi çizer, istemci aynı seriyi oynatır.
 * Ekranlar scratch g17/capall17.js + img17.py.
 */
import sizes from '../i18n/gc-shots.json';
export const GC_SHOT_VERSION = 'gc1';
export const gcSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/gc-${k}.webp?v=${GC_SHOT_VERSION}`;
export const gcSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
export const fill = (s: string, p: Record<string, string | number>) => Object.entries(p).reduce((a, [k, v]) => a.split(`{${k}}`).join(String(v)), s);
export type Dir = 'u' | 'd';
export const COINS: Record<string, { p0: number; seed: number }> = { BTC: { p0: 88000, seed: 7 }, ETH: { p0: 2600, seed: 21 }, SOL: { p0: 120, seed: 42 } };
export interface GcSeries { P: number[]; A: number[]; B: number[]; X: { i: number; dir: Dir }[]; lo: number; hi: number; n: number }
const rng = (s: number) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
export function gcSeries(coin: string, tf: string): GcSeries {
  const c = COINS[coin], r = rng(c.seed + (tf === '4h' ? 100 : 0)), N = 560, p: number[] = [];
  let v = c.p0;
  const dr = (i: number) => i < 190 ? -.0011 : i < 330 ? .0034 : i < 470 ? -.0030 : .0026;
  for (let i = 0; i < N; i++) { v *= Math.exp(dr(i) + (r() - .5) * .045); p.push(v); }
  const sma = (n: number) => { const o: number[] = []; let s = 0; for (let i = 0; i < N; i++) { s += p[i]; if (i >= n) s -= p[i - n]; o.push(s / n); } return o; };
  const s50 = sma(50), s200 = sma(200), off = 200;
  const P = p.slice(off), A = s50.slice(off), B = s200.slice(off), X: { i: number; dir: Dir }[] = [];
  for (let i = 1; i < A.length; i++) { const a = A[i - 1] - B[i - 1], b = A[i] - B[i]; if (a <= 0 && b > 0) X.push({ i, dir: 'u' }); if (a >= 0 && b < 0) X.push({ i, dir: 'd' }); }
  return { P, A, B, X, lo: Math.min(...P, ...B) * .97, hi: Math.max(...P, ...B) * 1.03, n: P.length };
}
export const W = 1000, H = 300;
export const sx = (i: number, d: GcSeries) => i / (d.n - 1) * W;
export const sy = (v: number, d: GcSeries) => H - (v - d.lo) / (d.hi - d.lo) * H;
export const gcPath = (arr: number[], d: GcSeries) => arr.map((v, i) => (i ? 'L' : 'M') + sx(i, d).toFixed(1) + ' ' + sy(v, d).toFixed(1)).join('');
/** Tahtanın eğimi: SMA 50 ile SMA 200 arasındaki fark (oran) kadar; SMA 50 üstteyse Zilbe'nin ucu (sol) yukarıda. */
export const tilt = (d: GcSeries, i: number) => Math.max(-14, Math.min(14, (d.A[i] - d.B[i]) / d.B[i] * 160));
/** Grafiğin son mumunun tarihi (örnek): 1d günlük, 4h dört saatlik. */
export const dateOf = (i: number, n: number, tf: string) => new Date(Date.UTC(2026, 10, 23) - (n - 1 - i) * (tf === '4h' ? 4 * 3600e3 : 864e5));
export const dateLocale = (hreflang: string) => (hreflang === 'ar' || hreflang === 'hi' ? `${hreflang}-u-nu-latn` : hreflang);
export const fmtDate = (dt: Date, tf: string, loc: string) => new Intl.DateTimeFormat(loc, tf === '4h' ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' } : { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(dt);
/** Bildirim örnek değerleri (BTC, 1d): hızlı SMA 50, yavaş SMA 200, fiyat. */
export const VAL: Record<Dir, [number, number, number]> = { u: [96420.5, 96180.2, 97150.0], d: [88210.4, 88450.7, 86900.3] };
