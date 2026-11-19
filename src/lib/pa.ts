/**
 * Fiyat ve ortalama sayfası (15. gün, O2-B "Güneşin izi" + O3 ip) yardımcıları.
 * Benzetim: kapanışlar ortalamanın iki yanında gezinir, ortalama kapanışları yavaşça izler (kısa periyot daha hızlı).
 * Sunucu ilk kareyi aynı tohumla çizer; JS yoksa sahne bu karede durur. Ekranlar scratch g15/capall15.js + img15.py.
 */
import sizes from '../i18n/pa-shots.json';
import { num, emLang } from './ema';
export { num, emLang };
export type PaNum = { dec: string; grp: string; indian: boolean; neg: string };
/** Sayı yazımı istemcide de aynı (src/lib/ema.ts num ile birebir). */
export const pnum = (N: PaNum, v: number, d = 1) => { let [a, b] = Math.abs(v).toFixed(d).split('.'); a = N.indian ? a.replace(/(\d)(?=(\d\d)+\d$)/g, '$1' + N.grp) : a.replace(/\B(?=(\d{3})+(?!\d))/g, N.grp); return (v < 0 ? N.neg : '') + a + (b ? N.dec + b : ''); };
export const PA_SHOT_VERSION = 'pa1';
export const paSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/pa-${k}.webp?v=${PA_SHOT_VERSION}`;
export const paSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
export const fill = (s: string, p: Record<string, string | number>) => Object.entries(p).reduce((a, [k, v]) => a.split(`{${k}}`).join(String(v)), s);
export const TF = ['1m', '5m', '15m', '1h', '4h', '1d'];
export const PER = [20, 50, 100, 200];
/** Uygulamadaki yön değerleri: 3 üstüne çıkarsa, 4 altına inerse, 1 üstündeyse, 2 altındaysa. */
export const DIRS = [3, 4, 1, 2] as const;
export const OP: Record<number, string> = { 1: '>', 2: '<', 3: '↗', 4: '↘' };
export interface PaSim { c: number[]; m: number[]; k: number; rnd: () => number }
const mulberry = (a: number) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export const paStep = (s: PaSim, p = 200, sma = false) => {
  const al = 2 / (({ 20: 4, 50: 7, 100: 10, 200: 14 } as Record<number, number>)[p] + 1) * (sma ? .8 : 1);
  const pm = s.m[s.m.length - 1], pc = s.c[s.c.length - 1]; s.k++;
  const side = Math.floor(s.k / 6) % 2 ? 1 : -1;
  const tgt = pm + side * (260 + s.rnd() * 200);
  const nc = pc + (tgt - pc) * .42 + (s.rnd() - .5) * 160;
  s.c.push(nc); s.m.push(pm + al * (nc - pm)); s.c.shift(); s.m.shift();
  return s;
};
export const paSim = (seed = 15, n = 12): PaSim => {
  const s: PaSim = { c: Array(n).fill(66700), m: Array(n).fill(66900), k: 0, rnd: mulberry(seed) };
  for (let i = 0; i < n + 8; i++) paStep(s);
  s.k = 2; return s;
};
/** Seçilen yönde bu kapanış alarmı çaldırır mı? Durum yönlerinde (1, 2) alarm kurulunca zaten doğruysa ilk kapanışta çalar. */
export const paHit = (dir: number, s: PaSim, st: { armed: boolean }) => {
  const n = s.c.length, c = s.c[n - 1], m = s.m[n - 1], pc = s.c[n - 2], pm = s.m[n - 2];
  if (dir === 3) return pc <= pm && c > m;
  if (dir === 4) return pc >= pm && c < m;
  const now = dir === 1 ? c > m : c < m;
  if (now && st.armed) { st.armed = false; return true; }
  if (!now) st.armed = true;
  return false;
};
/** Sahne geometrisi: güneş (son kapanış) sx konumunda; sırt ve iz geçmiş mumları soldan sx'e kadar çizer. */
export const paGeom = (s: PaSim, W: number, H: number) => {
  const N = s.m.length, sx = W * (W < 700 ? .5 : .52);
  const all = [...s.c, ...s.m], lo = Math.min(...all) - 120, hi = Math.max(...all) + 120;
  const Y = (v: number) => H * (.15 + .58 * (1 - (v - lo) / (hi - lo)));
  const X = (i: number) => sx * (i / (N - 1));
  const sm = (arr: number[]) => { let d = `M${X(0).toFixed(1)} ${Y(arr[0]).toFixed(1)}`; for (let i = 1; i < arr.length; i++) { const x0 = X(i - 1), x1 = X(i), y0 = Y(arr[i - 1]), y1 = Y(arr[i]), xm = ((x0 + x1) / 2).toFixed(1); d += ` C${xm} ${y0.toFixed(1)} ${xm} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`; } return d; };
  const ridge = sm(s.m), ym = Y(s.m[N - 1]), yc = Y(s.c[N - 1]);
  return {
    sx, ym, yc, X, Y,
    ridge, fill: `${ridge} L${sx.toFixed(1)} ${ym.toFixed(1)} L${W} ${ym.toFixed(1)} L${W} ${H} L0 ${H}Z`, fut: `M${sx.toFixed(1)} ${ym.toFixed(1)} L${W} ${ym.toFixed(1)}`,
    trail: s.c.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' '),
    dots: s.c.slice(0, -1).map((v, i) => ({ x: X(i), y: Y(v), r: 3 + i / N * 3, o: .35 + .6 * i / N })),
    mdots: s.m.map((v, i) => ({ x: X(i), y: Y(v) })).filter((_, i) => i % 2 === 0),
    up: s.c[N - 1] > s.m[N - 1], pct: (s.c[N - 1] / s.m[N - 1] - 1) * 100,
  };
};
