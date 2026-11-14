/** Yapay zekâ asistanı sayfası (10. gün) yardımcıları: ekran adresleri ve ölçüleri. Ekranlar scratch g10p/cap10.js + img10.py. */
import sizes from '../i18n/ai-shots.json';
export const AI_SHOT_VERSION = 'ai1';
export const AI_EX = ['rsihac', 'pump', 'btc100', 'eth1', 'zirve', 'golden'];
export const aiSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/ai-${k}.webp?v=${AI_SHOT_VERSION}`;
export const aiSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
export const fillQ = (t: string, q: string) => t.replace('{q}', q);
