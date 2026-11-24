import { LOCALES, STORE } from '../config';

/**
 * Google Play adresi: uygulama dili (hl) ve Play Console "Edinme" raporu için UTM'li referrer.
 * Sayfa = campaign, düğmenin yeri = content, dil = term. STORE.play boşsa boş döner.
 */
export function playLink(code: string, pathname: string, place: string): string {
  if (!STORE.play) return '';
  const appLocale = LOCALES.find(l => l.code === code)?.app ?? 'en';
  const page = pathname.split('/').filter(Boolean).slice(1).join('_') || 'home';
  const utm = `utm_source=marketalertapp.com&utm_medium=website&utm_campaign=${page}&utm_content=${place}&utm_term=${code}`;
  return `${STORE.play}${STORE.play.includes('?') ? '&' : '?'}hl=${appLocale}&referrer=${encodeURIComponent(utm)}`;
}
