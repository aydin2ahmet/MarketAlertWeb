/** Ethereum sayfası (12. gün) yardımcıları: ekran adresleri ve gerçek push metni. Ekranlar scratch g12/pg/cap12.js + img12.py. */
import sizes from '../i18n/et-shots.json';
import { fuNum } from './fu';
export const ET_SHOT_VERSION = 'et1';
export const etSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/et-${k}.webp?v=${ET_SHOT_VERSION}`;
export const etSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
export const etNum = fuNum;
/** Push.Event.PriceBelow / PriceAbove ve gövde (PushNotificationTextBuilder): "↓ 2.998,4 $  │  < 3.000 $  ✓". */
export const etPush = (et: any, dir: 'dn' | 'up') => dir === 'dn'
  ? [et.below.replace('{0}', 'ETH').replace('{1}', fuNum(et.sep, 3000)), `↓ ${fuNum(et.sep, 2998.4, 1)} $  │  < ${fuNum(et.sep, 3000)} $  ✓`]
  : [et.above.replace('{0}', 'ETH').replace('{1}', fuNum(et.sep, 3500)), `↑ ${fuNum(et.sep, 3501.7, 1)} $  │  > ${fuNum(et.sep, 3500)} $  ✓`];
