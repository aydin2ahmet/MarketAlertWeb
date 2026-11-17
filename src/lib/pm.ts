/** Pump alarmı sayfası (13. gün) yardımcıları: ekran adresleri ve radar. Ekranlar scratch g13/capall.js + img13.py. */
import sizes from '../i18n/pm-shots.json';
export const PM_SHOT_VERSION = 'pm1';
export const pmSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/pm-${k}.webp?v=${PM_SHOT_VERSION}`;
export const pmSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
/** Radardaki coinler: [sembol, açı (derece), ilk yüzde]. Sunucu çizimi ve JS aynı listeyi kullanır. */
export const PM_COINS: [string, number, number][] = [['SOL', 20, 8.4], ['PEPE', 50, 1.6], ['AVAX', 80, 2.4], ['DOGE', 110, 1.1], ['ARB', 140, 2.9], ['LINK', 170, 1.8], ['SUI', 200, .7], ['ADA', 230, 2.2], ['INJ', 260, 1.4], ['WIF', 290, 3.1], ['TIA', 320, .9], ['NEAR', 350, 2.6]];
/** Yüzde yazımı (site geneliyle aynı: Intl, Latin rakam). */
export const pmPct = (nf: string, v: number, signed: boolean, d = 1) => new Intl.NumberFormat(nf, { style: 'percent', minimumFractionDigits: d, maximumFractionDigits: d, signDisplay: signed ? 'always' : 'never' }).format(v / 100);
export const fill = (s: string, p: Record<string, string | number>) => Object.entries(p).reduce((a, [k, v]) => a.split(`{${k}}`).join(String(v)), s);
