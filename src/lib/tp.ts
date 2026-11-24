/**
 * Hazır şablonlar sayfası (18. gün, C "Şablon otomatı") yardımcıları. Şablon adları, açıklamaları, cümleleri ve çipleri
 * uygulamanın kendi metinlerinden gelir (src/i18n/tp-app.json, kaynağı marketalertapp alertTemplateMessages.ts ve
 * sunucunun Domain/Localization push metinleri). Sunucu ilk kareyi çizer, istemci aynı işlevlerle oynatır.
 * Ekranlar scratch g18/capall18.js + img18.py.
 */
export const fill = (s: string, p: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k) => (k in p ? String(p[k]) : m));
import type app from '../i18n/tp-app.json';
export type TpApp = (typeof app)['tr'];
export type TpKey = 'pv' | 'os' | 'ec' | 'dh';
export const TP_KEYS: TpKey[] = ['pv', 'os', 'ec', 'dh'];
export const TF = ['15m', '1h', '4h', '1d'];
/** Kumanda: dört şablon ve her birinin tek değeri (uygulamadaki ayar sayfası kutucuğu, aynı sınırlar). */
export const KNOB: Record<TpKey, { app: string; min: number; max: number; step: number; def: number }> = {
  pv: { app: 'pumpVolume', min: 1, max: 20, step: 1, def: 5 },
  os: { app: 'oversold', min: 10, max: 35, step: 5, def: 30 },
  ec: { app: 'emaCross', min: 0, max: 3, step: 1, def: 2 },
  dh: { app: 'dayHigh', min: 0, max: 0, step: 0, def: 0 },
};
/** Otomatın rafları = uygulamadaki üç sekme; her rafta üç şablon. */
export const SHELVES: string[][] = [['priceAbove', 'pump', 'dayHigh'], ['oversold', 'emaCross', 'overbought'], ['pumpVolume', 'dump', 'rsiScan']];
export const ALL_TABS: string[][] = [['priceAbove', 'priceBelow', 'pump', 'pumpVolume', 'dump', 'coinRise', 'dayHigh'], ['oversold', 'overbought', 'emaCross', 'dropOversold'], ['pump', 'pumpVolume', 'dump', 'rsiScan']];
export const IC: Record<string, string> = {
  priceAbove: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  priceBelow: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>',
  pump: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  pumpVolume: '<path d="M3 13l5-5 4 3 7-7M14 4h5v5M5 21v-3M10 21v-5M15 21v-4M20 21v-6"/>',
  dump: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  coinRise: '<path d="M4 17l6-6 4 3 6-8M15 6h5v5"/>',
  dayHigh: '<path d="M3 19l6-8 4 4 5-9 3 4M5 5h14"/>',
  oversold: '<path d="M4 16a8 8 0 0 1 16 0"/><path d="M12 16 7.5 11.5"/><circle cx="12" cy="16" r="1.2"/>',
  overbought: '<path d="M4 16a8 8 0 0 1 16 0"/><path d="M12 16l4.5-4.5"/><circle cx="12" cy="16" r="1.2"/>',
  emaCross: '<path d="M3 17c5 0 7-10 18-10M3 9c6 0 9 6 18 6"/>',
  dropOversold: '<path d="M4 6l5 7 3-3 4 6"/><path d="M14 20a5 5 0 0 1 8 0"/>',
  rsiScan: '<circle cx="10" cy="10" r="6"/><path d="M15 15l5 5"/>',
};
export const icon = (k: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
const pct = (loc: string, v: number, signed = false) => (signed ? '+' : '') + new Intl.NumberFormat(loc, { style: 'percent', maximumFractionDigits: 1 }).format(v / 100);
const dec = (loc: string, v: number, d: number) => new Intl.NumberFormat(loc, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
/** Değerin kumandada görünen hâli. */
export const knobText = (A: TpApp, loc: string, k: TpKey, v: number) => k === 'pv' ? pct(loc, v) : k === 'os' ? String(v) : k === 'ec' ? TF[v] : '—';
/** Uygulamadaki dakika birimi ("5 dk", "5 min") çipin kalıbından alınır. */
export const minutes = (A: TpApp, m: number) => A.chipRolling.split('{operator}')[0].replace('{minutes}', String(m)).trim();
/** Kural çipleri, uygulamadaki gibi (kapsam çipi ayrı). */
export function chips(A: TpApp, loc: string, k: TpKey, v: number): string[] {
  if (k === 'pv') return [fill(A.chipRolling, { minutes: 5, operator: '≥', percent: '+' + pct(loc, v) }), fill(A.chipVolume, { multiplier: 3 })];
  if (k === 'os') return [`RSI(14) < ${v} · 1h`];
  if (k === 'ec') return [`EMA 20 ↗ EMA 50 · ${TF[v]}`];
  return [A.chipDayHigh];
}
export const scope = (A: TpApp, k: TpKey) => (k === 'pv' ? fill(A.topCoins, { count: 100 }) : 'BTC');
/** Ayar sayfasındaki düz cümle (uygulamanın cümlesi, uygulamanın parametreleri). */
export function sentence(A: TpApp, loc: string, k: TpKey, v: number) {
  const t = (A.tpl as any)[KNOB[k].app].s as string;
  const subject = k === 'pv' ? fill(A.subjectTop, { count: 100 }) : 'BTC';
  return fill(t, { subject, minutes: 5, percent: pct(loc, v), multiplier: 3, level: v, timeframe: k === 'ec' ? TF[v] : '1h', fast: 20, slow: 50, channel: A.push });
}
/** Kadranlar: uygulamadaki ayar kutucuklarının etiketi ve değeri. */
export function dials(A: TpApp, loc: string, k: TpKey, v: number): [string, string][] {
  if (k === 'pv') return [[A.rise, pct(loc, v)], [A.window, minutes(A, 5)]];
  if (k === 'os') return [[A.rsiBelow, String(v)], [A.tf, '1h']];
  if (k === 'ec') return [[A.tf, TF[v]]];
  return [];
}
/** Sunucunun push metni (PushNotificationTextBuilder): başlık + gövde. */
export function push(A: TpApp, loc: string, k: TpKey, v: number): [string, string] {
  const P = A.pushT as Record<string, string>;
  if (k === 'pv') { const c = v + 1.4; return [fill(P['Push.Event.RollingUp'], { 0: 'SOL', 1: pct(loc, c), 4: 5 }), `↑ ${pct(loc, c, true)} ∧ ${P['Push.Volume']} ${dec(loc, 4.8, 1)}M ≥ ${fill(P['Push.Average'], { 0: 3, 1: 20 })}`]; }
  if (k === 'os') return [fill(P['Push.Event.RsiBelow'], { 0: 'BTC', 1: v }), `RSI(14)·1h  ${dec(loc, v - 1.6, 1)}  │  < ${v}  ✓`];
  if (k === 'ec') return [fill(P['Push.Event.EmaCrossUp'], { 0: 'BTC', 2: 20, 3: 50 }), `EMA(20)·${TF[v]}  ${dec(loc, 91240.5, 1)}  │  ↗ EMA(50) ${dec(loc, 91180.2, 1)}  ✓`];
  return [fill(P['Push.Event.High24h'], { 0: 'BTC' }), `↑ ${dec(loc, 92410.5, 1)} $  │  ${P['Push.High24h']}  ✓`];
}
