/**
 * Dump (sert düşüş) alarmı sayfası (19. gün, C "Asansörler") yardımcıları. İstemci paketine de girer: JSON içe aktarmaz,
 * dil verisi sayfadan cfg ile gelir. Şablon adı, çip ve cümle uygulamanın metinlerinden (tp-app.json), push metinleri
 * sunucunun Domain/Localization dosyalarından (dp-app.json: Push.Event.RollingDown, Notification.CoinSummaryTitle/More).
 * Push gövdesi PushNotificationTextBuilder ve CoinSummaryTextBuilder ile aynı biçimde.
 */
import { fill } from './tp';
export { fill };
export type DpText = { name: string; chipRolling: string; topCoins: string; down: string; sumT: string; sumMore: string };
export const MINS = [5, 15, 60];
export const P_MIN = 1, P_MAX = 20;
/** Sahnedeki altı coin ve 5 dakikadaki düşüşleri; 15 ve 60 dakikada aynı coinler biraz daha derine iner. */
export const COINS: [string, number][] = [['BTC', 0.9], ['ETH', 1.8], ['SOL', 6.4], ['XRP', 3.1], ['AVAX', 5.3], ['DOGE', 2.4]];
const MUL: Record<number, number> = { 5: 1, 15: 1.35, 60: 1.9 };
export const drops = (m: number) => COINS.map(([s, d]) => ({ s, d: Math.round(d * MUL[m] * 10) / 10 }));
export const hits = (p: number, m: number) => drops(m).filter(c => c.d >= p).sort((a, b) => b.d - a.d);
/** Kat ölçeği: eşiğin altında biraz yer kalsın. */
export const depth = (p: number) => Math.max(10, p + 4);
export const pct = (loc: string, v: number) => new Intl.NumberFormat(loc, { style: 'percent', maximumFractionDigits: 1 }).format(Math.abs(v) / 100);
export const neg = (loc: string, v: number) => '-' + pct(loc, v);
export const minLabel = (T: DpText, m: number) => T.chipRolling.split('{operator}')[0].replace('{minutes}', String(m)).trim();
export const chip = (T: DpText, loc: string, p: number, m: number) => fill(T.chipRolling, { minutes: m, operator: '≤', percent: neg(loc, p) });
export const caption = (T: DpText, loc: string, p: number, m: number) => [T.name, fill(T.topCoins, { count: 100 }), chip(T, loc, p, m)].join(' · ');
/** İlk düşen coinin anlık push'u (başlık, gövde). */
export const push1 = (T: DpText, loc: string, c: { s: string; d: number }, m: number): [string, string] =>
  [fill(T.down, { 0: c.s, 1: pct(loc, c.d), 4: m }), `↓ ${neg(loc, c.d)}  │  Δ%·${m}m  ✓`];
/** Aynı dakikalarda düşen diğerleri: sessiz özet (en çok 3 coin + "+N coin daha"). */
export function pushN(T: DpText, loc: string, cs: { s: string; d: number }[]): [string, string] {
  const parts = cs.slice(0, 3).map(c => `${c.s} ${neg(loc, c.d)}`);
  if (cs.length > 3) parts.push(fill(T.sumMore, { 0: cs.length - 3 }));
  return [fill(T.sumT, { 0: T.name, 1: cs.length }), parts.join(' · ')];
}
