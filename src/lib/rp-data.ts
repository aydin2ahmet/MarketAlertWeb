/** Sunucu tarafı veriler (istemci paketine girmesin): sunucunun push başlığı ve ekran ölçüleri. */
import sizes from '../i18n/rp-shots.json';
import srv from '../i18n/rp-app.json';
import { fill } from './tp';
export const RP_SHOT_VERSION = 'rp1';
export const rpSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/rp-${k}.webp?v=${RP_SHOT_VERSION}`;
export const rpSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
/** Push başlığı: Push.Event.RsiAbove ("BTC RSI 70 üstüne çıktı"). */
export const rpTitle = (code: string) => fill((srv as any)[code].rsiAbove, { 0: 'BTC', 1: '70' });
