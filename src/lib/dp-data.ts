/** Sunucu tarafı veriler (istemci paketine girmesin): uygulama ve sunucu metinleri, ekran ölçüleri. */
import sizes from '../i18n/dp-shots.json';
import app from '../i18n/tp-app.json';
import srv from '../i18n/dp-app.json';
import type { DpText } from './dp';
export const DP_SHOT_VERSION = 'dp1';
export const dpSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/dp-${k}.webp?v=${DP_SHOT_VERSION}`;
export const dpSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
export const dpApp = (code: string) => (app as any)[code];
export function dpText(code: string): DpText {
  const A = (app as any)[code], S = (srv as any)[code];
  return { name: A.tpl.dump.n, chipRolling: A.chipRolling, topCoins: A.topCoins, down: S.down, sumT: S.sumT, sumMore: S.sumMore };
}
