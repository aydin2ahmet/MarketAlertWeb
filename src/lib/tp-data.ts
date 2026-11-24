/** Sunucu tarafı veriler (istemci paketine girmesin): uygulama metinleri ve ekran ölçüleri. */
import sizes from '../i18n/tp-shots.json';
import app from '../i18n/tp-app.json';
import type { TpApp } from './tp';
export const TP_SHOT_VERSION = 'tp1';
export const tpSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/tp-${k}.webp?v=${TP_SHOT_VERSION}`;
export const tpSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
export const tpApp = (code: string) => (app as any)[code] as TpApp;
