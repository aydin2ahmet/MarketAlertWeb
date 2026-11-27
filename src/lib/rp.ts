/**
 * Tekrarlayan alarmlar sayfası (21. gün, A "Kum saati") yardımcıları. İstemci paketine de girer: JSON içe aktarmaz, dil verisi sayfadan cfg ile gelir.
 * Örnek gün: BTC RSI(14) 15m bir günde 70'i 9 kez yukarı keser. Tekrar aralıkları uygulamadaki seçeneklerle aynı (15 dk, 1 saat, 4 saat, 1 gün);
 * sunucu gibi davranır: bildirimden sonra aralık bitene kadar gelen geçişler gönderilmez, sonradan da gönderilmez. "Bir kez"de ilk bildirim alarmı kapatır.
 * Push başlığı sunucunun Push.Event.RsiAbove metni, gövdesi PushNotificationTextBuilder'ın simge satırı ("RSI(14)·15m  70,4  │  > 70  ✓").
 */
import { fill } from './tp';
export { fill };
/** Geçiş dakikaları (00:00'dan). */
export const X = [75, 105, 180, 510, 540, 585, 780, 810, 1320];
/** -1 = bir kez; diğerleri dakika. */
export const CD = [-1, 15, 60, 240, 1440];
export type Pt = { x: number; s: 'ok' | 'mute' | 'off'; end?: number };
export function plan(mi: number): Pt[] {
  const cd = CD[mi]; let last = -1e9, done = false;
  return X.map(x => {
    if (cd < 0) { if (done) return { x, s: 'off' }; done = true; return { x, s: 'ok', end: x }; }
    if (x >= last + cd) { last = x; return { x, s: 'ok', end: x + cd }; }
    return { x, s: 'mute' };
  });
}
export const cnt = (P: Pt[]) => ({ ok: P.filter(p => p.s === 'ok').length, mute: P.filter(p => p.s === 'mute').length });
export const hm = (m: number) => String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(Math.round(m) % 60).padStart(2, '0');
export const rsi = (m: number) => { let v = 61.5 + 1.6 * Math.sin(m / 97) + 1.1 * Math.sin(m / 31); for (const x of X) { const d = m - (x + 8); v += 13.6 * Math.exp(-d * d / 128); } return v; };
/** Grafik ölçüleri (viewBox birimleri). */
export const CW = 900, CH = 200;
export const cx = (m: number) => m / 1440 * CW;
export const cy = (v: number) => CH - ((v - 50) / 30) * CH;
export const rsiPath = () => { let d = ''; for (let m = 0; m <= 1440; m += 5) d += (m ? 'L' : 'M') + cx(m).toFixed(1) + ' ' + cy(rsi(m)).toFixed(1); return d; };
/** Geçiş anındaki RSI (bildirimde görünen değer), 70'in hemen üstü. */
export const rsiAt = (x: number) => Math.min(71.4, Math.max(70.1, rsi(x + 1)));
export type RpText = { modes: string[]; cap0: string; capN: string; tally: string; title: string };
export const caption = (T: RpText, mi: number) => { const c = cnt(plan(mi)); return mi === 0 ? T.cap0 : fill(T.capN, { w: T.modes[mi], n: X.length, ok: c.ok, mute: c.mute }); };
export const tally = (T: RpText, ok: number, mute: number) => fill(T.tally, { ok, mute });
export const pushBody = (loc: string, x: number) => `RSI(14)·15m  ${new Intl.NumberFormat(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rsiAt(x))}  │  > 70  ✓`;
