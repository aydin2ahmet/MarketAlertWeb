/**
 * /llms.txt ve /llms-full.txt üreticisi. İçerik elle yazılır: src/i18n/llms.json.
 * Kurallar docs/llms-kurallari.md. Kural bozulursa derleme hata verir ve site yayınlanmaz.
 */
import data from '../i18n/llms.json';
import { SECTIONS, pageLink } from './pages';
import { LOCALES, SITE, SOCIAL } from '../config';

type Block = { line: string; what: string; facts: string[]; example: string; faq: [string, string][] };
const D = data as unknown as { definition: string; facts: string[]; examples: [string, string][]; pages: Record<string, Block> };

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const BANNED: [RegExp, string][] = [
  [/\b\d+\s?ms\b/i, 'hız rakamı (ms)'],
  [/[$€£₺]|\b(usd|eur|try)\s?\d/i, 'fiyat'],
  [/\b(tradingview|coinmarketcap|coingecko|cryptocurrency alerting|coinstats|delta)\b/i, 'rakip adı'],
  [/notifications? (a|per) day|daily (notification )?limit/i, 'günlük bildirim sınırı'],
];

/** Sitedeki içerik sayfaları (bölüm/sayfa). Yeni bölüm SECTIONS'a eklenince buraya kendiliğinden girer. */
export function contentPages(): string[] {
  const out = ['features/rsi-alerts'];
  for (const [section, src] of Object.entries(SECTIONS)) for (const slug of Object.keys((src as any).en)) out.push(`${section}/${slug}`);
  return [...new Set(out)].sort();
}

const fail = (errs: string[]) => { if (errs.length) throw new Error('llms kuralları bozuldu (docs/llms-kurallari.md):\n- ' + errs.join('\n- ')); };

/** Sayfa listesiyle bloklar uyuşuyor mu (üretimden önce). */
function checkPages() {
  const errs: string[] = [];
  const pages = contentPages();
  for (const p of pages) if (!D.pages[p]) errs.push(`llms.json: "${p}" sayfasının bloğu yok`);
  for (const p of Object.keys(D.pages)) if (!pages.includes(p)) errs.push(`llms.json: "${p}" artık sitede yok, bloğunu sil`);
  fail(errs);
}

/** İçerik kuralları (üretilen metin üzerinde). */
function check(full: string, short: string) {
  const errs: string[] = [];
  if (D.facts.length > 12) errs.push(`Olgular en fazla 12 madde (${D.facts.length})`);
  if (D.examples.length > 8) errs.push(`Örnek kullanımlar en fazla 8 (${D.examples.length})`);
  for (const [p, b] of Object.entries(D.pages)) {
    const n = words([b.what, ...b.facts, b.example, ...b.faq.flat()].join(' '));
    if (n > 200) errs.push(`${p}: blok ${n} kelime (en fazla 200)`);
    if (b.facts.length < 3 || b.facts.length > 5) errs.push(`${p}: 3–5 olgu olmalı (${b.facts.length})`);
    if (b.faq.length > 3) errs.push(`${p}: en fazla 3 SSS`);
  }
  if (words(short) > 1500) errs.push(`llms.txt ${words(short)} kelime (en fazla 1500)`);
  for (const [re, why] of BANNED) for (const [name, txt] of [['llms.txt', short], ['llms-full.txt', full]]) {
    const m = txt.match(re);
    if (m) errs.push(`${name}: yasak içerik (${why}): "${m[0]}"`);
  }
  fail(errs);
}

const url = (p: string) => `${SITE}/en/${p}/`;
const title = (p: string) => pageLink('en', p) || p;

function buildShort(): string {
  const groups: Record<string, string> = { features: 'Feature guides', coins: 'Coin guides', guides: 'How-to guides', learn: 'Learn' };
  const bySection: Record<string, string[]> = {};
  for (const p of contentPages()) (bySection[p.split('/')[0]] ||= []).push(p);
  return [
    '# MarketAlert', '', `> ${D.definition}`, '',
    `Detailed notes for every page: ${SITE}/llms-full.txt`, '',
    '## Facts', ...D.facts.map(f => `- ${f}`), '',
    '## Example uses (what users say to the app)', ...D.examples.map(([s, n]) => `- "${s}" (${n})`), '',
    '## Pages', ...LOCALES.map(l => `- [${l.name}](${SITE}/${l.code}/)`), '',
    ...Object.entries(bySection).flatMap(([s, ps]) => [`## ${groups[s] || s} (English; each also exists in the 10 other languages)`, ...ps.map(p => `- [${title(p)}](${url(p)}): ${D.pages[p].line}`), '']),
    '## Official accounts', ...SOCIAL.map(s => `- [${s.name}](${s.url})`), '',
    '## Legal', `- [Privacy policy](${SITE}/en/legal/privacy/)`, `- [Terms of use](${SITE}/en/legal/terms/)`, '',
  ].join('\n');
}

function buildFull(): string {
  const parts = ['# MarketAlert – detailed notes', '', `> ${D.definition}`, '', `Summary and general facts: ${SITE}/llms.txt`, ''];
  for (const p of contentPages()) {
    const b = D.pages[p];
    parts.push(`## ${title(p)}`, `URL: ${url(p)}`, '', b.what, '', 'Facts:', ...b.facts.map(f => `- ${f}`), '', `Example: "${b.example}"`, '');
    if (b.faq.length) parts.push('FAQ:', ...b.faq.map(([q, a]) => `- ${q} ${a}`), '');
  }
  return parts.join('\n');
}

export function llmsFiles() {
  checkPages();
  const short = buildShort(), full = buildFull();
  check(full, short);
  return { short, full };
}
