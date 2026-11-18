/** RSI 70/30 sayfası (14. gün, R3 sarkaç saati) yardımcıları: ekran adresleri, sayı yazımı, yay çizimi. Ekranlar scratch g14/capall.js + img14.py. */
import sizes from '../i18n/ro-shots.json';
export const RO_SHOT_VERSION = 'ro1';
export const roSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/ro-${k}.webp?v=${RO_SHOT_VERSION}`;
export const roSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
/** Ondalık RSI yazımı (Intl, Latin rakam). */
export const roNum = (nf: string, v: number) => new Intl.NumberFormat(nf, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
export const fill = (s: string, p: Record<string, string | number>) => Object.entries(p).reduce((a, [k, v]) => a.split(`{${k}}`).join(String(v)), s);
/** Yay: merkez (0,220), yarıçap 260; RSI 0 solda, 100 sağda. */
export const roPt = (x: number, r = 260) => { const a = Math.PI * (1 - x / 100); return [Math.cos(a) * r, 220 - Math.sin(a) * r]; };
export const roArc = (a: number, b: number) => { const [x1, y1] = roPt(a), [x2, y2] = roPt(b); return `M${x1.toFixed(1)} ${y1.toFixed(1)} A260 260 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
/** Sarkaç açısı (derece): 50 dik, 0 ve 100 ±45°. */
export const roAng = (x: number) => -(x - 50) * .9;
export const roPush = (m: 'os' | 'ob') => m === 'os' ? 'pushBelow' : 'pushAbove';
