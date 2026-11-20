/**
 * Bildirim geçmişi sayfası (16. gün, tasarım A "Posta kutusu", 2026-11-20) yardımcıları.
 * Gece boyunca çalan alarmlar zarf olur, Zilbo posta kutusuna atar; sabah zarflar Bildirimler listesi gibi dizilir.
 * Olay cümleleri uygulamanın notifications.event.* metinleridir (rehberde `nh.ev`). Ekranlar scratch g16/capall16.js + img16.py.
 */
import sizes from '../i18n/nh-shots.json';
export const NH_SHOT_VERSION = 'nh1';
export const nhSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/nh-${k}.webp?v=${NH_SHOT_VERSION}`;
export const nhSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
export const fill = (s: string, p: Record<string, string | number>) => Object.entries(p).reduce((a, [k, v]) => a.split(`{${k}}`).join(String(v)), s);
/** Uzakta kalınan saatlere göre olay saatleri: 23:00'ten başlar, olay sayısı süreyle artar (en çok ev.length). */
export const nhEvents = (h: number, max: number) => {
  const n = Math.min(max, Math.max(1, Math.round(h * .9)));
  return Array.from({ length: n }, (_, i) => {
    const t = 23 * 60 + Math.round(30 + (h * 60 - 50) * (i + .5) / n + ((i * 37) % 23) - 11);
    return { i, hm: `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` };
  });
};
