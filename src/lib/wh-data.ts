/** Sunucu tarafı veriler (istemci paketine girmesin): sunucunun push başlığı, ekran ölçüleri, derlemede hesaplanan imza. */
import { createHmac } from 'node:crypto';
import sizes from '../i18n/wh-shots.json';
import srv from '../i18n/wh-app.json';
import { fill } from './tp';
import { bodyOf, TS, DEMO_KEY, type WhMsg } from './wh';
export const WH_SHOT_VERSION = 'wh1';
export const whSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/wh-${k}.webp?v=${WH_SHOT_VERSION}`;
export const whSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
/** Örnek alarm: BTC 70.000 üstüne çıktı; başlık sunucunun Push.Event.PriceAbove metni, gövde push simge satırı. */
export function whMsg(code: string, loc: string): WhMsg {
  const n = (v: number, d = 0) => new Intl.NumberFormat(loc, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  return { title: fill((srv as any)[code].above, { 0: 'BTC', 1: n(70000) }), body: `↑ ${n(70012.4, 1)} $  │  > ${n(70000)} $  ✓` };
}
export const signOf = (m: WhMsg, key = DEMO_KEY) => createHmac('sha256', key).update(TS + '.' + bodyOf(m)).digest('hex');
