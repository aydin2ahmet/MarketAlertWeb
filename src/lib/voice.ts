/**
 * Sesli kripto alarmı sayfası (5. gün) yardımcıları.
 * Cümle işaretlemesi: "[1|İlk 100 coinde] [2|RSI 30 altı] ve [3|hacim 2 katı] olunca [4|haber ver]".
 * Numara, alarmdaki alanı gösterir: 1 kapsam, 2 koşul 1, 3 koşul 2, 4 bildirim.
 */
const MARK = /\[(\d)\|([^\]]+)\]/g;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** İşaretli cümleyi renkli parçalara çevirir (güvenli HTML). */
export const markedHtml = (text: string) => esc(text).replace(MARK, (_m, n: string, part: string) => `<span class="vm vm${n}">${part}</span>`);

/** İşaretleri kaldırır (meta, arama, llms için). */
export const unmarked = (text: string) => text.replace(MARK, '$2');
