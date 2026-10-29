/** Sitenin sabitleri. Mağaza adresleri yayın öncesi doldurulmalı. */
export const SITE = 'https://www.marketalertapp.com';
export const UPDATED = '2026-10-29';

/** Uygulamanın 11 dili; sıra uygulamadaki dil listesiyle aynı. */
export const LOCALES = [
  { code: 'tr', hreflang: 'tr', name: 'Türkçe', app: 'tr', dir: 'ltr' },
  { code: 'en', hreflang: 'en', name: 'English', app: 'en', dir: 'ltr' },
  { code: 'zh', hreflang: 'zh-Hans', name: '中文', app: 'zh', dir: 'ltr' },
  { code: 'es', hreflang: 'es', name: 'Español', app: 'es', dir: 'ltr' },
  { code: 'hi', hreflang: 'hi', name: 'हिन्दी', app: 'hi', dir: 'ltr' },
  { code: 'ar', hreflang: 'ar', name: 'العربية', app: 'ar', dir: 'rtl' },
  { code: 'pt-br', hreflang: 'pt-BR', name: 'Português', app: 'pt', dir: 'ltr' },
  { code: 'fr', hreflang: 'fr', name: 'Français', app: 'fr', dir: 'ltr' },
  { code: 'ru', hreflang: 'ru', name: 'Русский', app: 'ru', dir: 'ltr' },
  { code: 'de', hreflang: 'de', name: 'Deutsch', app: 'de', dir: 'ltr' },
  { code: 'ja', hreflang: 'ja', name: '日本語', app: 'ja', dir: 'ltr' },
] as const;
export type LocaleCode = (typeof LOCALES)[number]['code'];

/**
 * Uygulama henüz mağazalarda değil: boş adres "Yakında" rozeti gösterir.
 * Yayına çıkınca doldur. Play: https://play.google.com/store/apps/details?id=com.marketalertapp
 */
export const STORE = {
  appStore: '',
  play: '',
};

/** Google Analytics 4 ölçüm kimliği (G-XXXXXXXXXX). Boşken Analytics ve çerez bandı yüklenmez. */
export const GA_ID = 'G-8QXDNRJWRG';

/** Yasal belgeler bu sitede: /xx/legal/privacy/ ve /xx/legal/terms/. */
export const legalUrl = (doc: 'privacy' | 'terms', code: string) => `/${code}/legal/${doc}/`;

/** Hesap silme talepleri için e-posta (Google Play zorunluluğu). Boşken "uygulamaya erişemiyorsan" bölümü gizlenir. */
export const SUPPORT_EMAIL = '';
