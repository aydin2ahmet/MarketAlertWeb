/**
 * Site içi arama dizini. Her dil için /{dil}/search.json olarak yayınlanır.
 * Yeni sayfa türü (coins/, guides/, learn/) eklendiğinde buraya da kaynak ekle.
 */
import content from '../i18n/content.json';
import guides from '../i18n/alert-guides.json';
import coinGuides from '../i18n/coin-guides.json';
import { plain } from './pages';
import rsiGuides from '../i18n/rsi-alerts.json';
import documents from '../legal/documents.json';
import deletion from '../legal/account-deletion.json';

export interface SearchEntry { t: string; d: string; u: string; k: string; g: string }

const flat = (v: unknown): string => Array.isArray(v) ? v.map(flat).join(' ') : typeof v === 'string' ? plain(v) : '';

export function buildSearchIndex(code: string): SearchEntry[] {
  const t = (content as any)[code];
  const out: SearchEntry[] = [];
  const home = `/${code}/`;
  // Sayfa grupları: g = 'page' (rehber), 'feature' (ana sayfa bölümü), 'faq', 'legal'
  out.push({ t: 'MarketAlert', d: t.meta.desc, u: home, k: flat([t.heroTitle, t.heroTitleSecond, t.heroSub, t.markets]), g: 'feature' });
  const r = (rsiGuides as any)[code];
  out.push({ t: r.link, d: r.description, u: `${home}features/rsi-alerts/`, k: flat([r.title, r.h1, r.intro, r.faq?.map((q: string[]) => q[0]), r.steps]), g: 'page' });
  for (const [section, src] of [['features', guides], ['coins', coinGuides]] as [string, any][]) {
    for (const [slug, g] of Object.entries(src[code]) as [string, any][]) {
      out.push({ t: g.link, d: g.description, u: `${home}${section}/${slug}/`, k: flat([g.title, g.h1, g.intro, g.prompt, g.steps?.map((s: string[]) => s[0]), g.details?.map((s: string[]) => s[0]), g.faq?.map((q: string[]) => q[0])]), g: 'page' });
    }
  }
  for (const f of t.f) out.push({ t: f.t, d: f.d, u: `${home}#features`, k: flat([f.s, f.k]), g: 'feature' });
  out.push({ t: t.plansTitle, d: t.plansNote, u: `${home}#plans`, k: flat([t.nav[2], t.planRows]), g: 'feature' });
  for (const q of t.faq) out.push({ t: q[0], d: q[1], u: `${home}#faq`, k: t.nav[3], g: 'faq' });
  const d = (documents as any)[code];
  out.push({ t: d.privacy.title, d: d.privacy.intro ?? '', u: `${home}legal/privacy/`, k: '', g: 'legal' });
  out.push({ t: d.terms.title, d: d.terms.intro ?? '', u: `${home}legal/terms/`, k: '', g: 'legal' });
  const del = (deletion as any)[code];
  out.push({ t: del.title, d: del.intro, u: `${home}legal/delete-account/`, k: flat(del.steps), g: 'legal' });
  // Kısa açıklama yeter; uzun metin yalnızca anahtar kelime alanında.
  return out.map(e => ({ ...e, d: e.d.length > 160 ? e.d.slice(0, 157).trimEnd() + '…' : e.d }));
}
