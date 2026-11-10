/**
 * Telegram sayfası (6. gün) yardımcıları.
 * Mesaj metinleri sunucunun gerçek Telegram çıktısıdır (tasarım A, 11 dil): src/i18n/telegram-messages.json.
 * Metin kendi verimizdir; içinde yalnızca <b>, <i>, <blockquote> etiketleri bulunur.
 */
import data from '../i18n/telegram-messages.json';
import e2pos from '../i18n/telegram-e2.json';

export const TG_SHOT_VERSION = 'tg1';
export const tgData = (code: string) => (data as any)[code] as { sub: string; msgs: Record<string, { text: string; button: string | null }> };
export const e2Pos = (code: string) => (e2pos as any)[code] as { chat: number; mode: number; btn: number };

/** Mesaj balonu HTML'i. compact: yalnızca ilk iki satır (başlık ve alarm adı), saat ve düğme yok. */
export function msgHtml(m: { text: string; button: string | null }, time: string, compact = false): string {
  let t = m.text.replace(/<\/blockquote>\n/g, '</blockquote>');
  if (compact) t = t.split('\n').slice(0, 2).join('\n');
  let h = `<div class="tgb">${t}${compact ? '' : `<span class="tgt">${time}</span>`}</div>`;
  if (m.button && !compact) h += `<div class="tgk"><span>${m.button}</span></div>`;
  return h;
}

/** Alarm listesindeki dört kartın yeri (340 × 713 ekran, soldan sağa okunan dilde). Sıra: fiyat, RSI, hacim, tüm coinler. */
export const LIST_CARDS = [
  { m: '01', time: '14:32', x: 17, y: 163 },
  { m: '03', time: '15:00', x: 177, y: 163 },
  { m: '04', time: '16:15', x: 17, y: 322 },
  { m: '13', time: '17:30', x: 177, y: 322 },
];
export const CARD_W = 146, CARD_H = 145, SCREEN_W = 340, SCREEN_H = 713;
