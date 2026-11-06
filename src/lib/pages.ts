/**
 * Rehber sayfalarının kaydı ve metin içi bağlantı işaretlemesi.
 * Metinlerde [görünen metin](bolum/sayfa) yazılır; ör. [fiyat alarmı](features/price-alerts) → /{dil}/features/price-alerts/.
 * Yeni bölüm (guides/, learn/) eklenince SECTIONS'a veri dosyasını ekle.
 */
import guides from '../i18n/alert-guides.json';
import coinGuides from '../i18n/coin-guides.json';
import rsiGuides from '../i18n/rsi-alerts.json';

export const SECTIONS: Record<string, any> = { features: guides, coins: coinGuides };

/** Sayfanın bağlantı adı (ilgili sayfalar kutusu ve arama için). */
export function pageLink(code: string, path: string): string | undefined {
  const [section, slug] = path.split('#')[0].split('/');
  if (section === 'features' && slug === 'rsi-alerts') return (rsiGuides as any)[code].link;
  return SECTIONS[section]?.[code]?.[slug]?.link;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LINK = /\[([^\]]+)\]\(([a-z-]+\/[a-z0-9-]+(?:#[a-z0-9-]+)?)\)/g;

/** Metni güvenli HTML'e çevirir; yalnız var olan sayfalara bağlantı verir (yoksa düz metin kalır). */
export function linkify(text: string, code: string): string {
  return esc(text).replace(LINK, (_m, label: string, target: string) => {
    if (!pageLink(code, target)) return label;
    const [p, hash] = target.split('#');
    return `<a class="inline-link" href="/${code}/${p}/${hash ? '#' + hash : ''}">${label}</a>`;
  });
}

/** İşaretlemeyi kaldırır (JSON-LD, meta ve arama için). */
export const plain = (text: string) => text.replace(LINK, '$1');
