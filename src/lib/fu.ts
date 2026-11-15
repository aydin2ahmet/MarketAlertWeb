/** Binance Vadeli sayfası (11. gün) yardımcıları: ekran adresleri, sayı biçimi, bildirim başlığı. Ekranlar scratch g11/cap11.js + img11.py. */
import sizes from '../i18n/fu-shots.json';
export const FU_SHOT_VERSION = 'fu1';
export const fuSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/fu-${k}.webp?v=${FU_SHOT_VERSION}`;
export const fuSize = (code: string, theme: 'light' | 'dark', k: string) => (sizes as any)[code][theme][k] as [number, number];
/** Sunucudaki PushNotificationTextBuilder.FormatPrice ile aynı: binlik ve ondalık ayırıcı dile göre (fu.sep). */
export const fuNum = (sep: string[], v: number, dec = 0) => {
  const [i, f] = v.toFixed(dec).split('.');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, sep[0]) + (f ? sep[1] + f : '');
};
/** NotificationMarketLabel: Spot USDT'de yalnız coin, diğerlerinde "COIN/QUOTE" ve vadelide tür kelimesi. */
export const fuPair = (fu: any, coin: string, market: 0 | 1 | 2 | 3) => market === 0 ? coin : market === 1 ? `${coin}/USDC` : `${coin}/${market === 2 ? 'USDT' : 'USDC'} ${fu.fut}`;
export const fuPush = (fu: any, coin: string, market: 0 | 1 | 2 | 3, target: number) => fu.push.replace('{0}', fuPair(fu, coin, market)).replace('{1}', fuNum(fu.sep, target));
