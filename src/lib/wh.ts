/** Webhook sayfası (20. gün) için istemcide de çalışan yardımcılar: örnek istek gövdesi ve gerçek HMAC-SHA256 imzası. */
export { fill } from './tp';
export const TS = '1795684512';
export const DEMO_KEY = 'zilba-gizli-anahtar';
export interface WhMsg { title: string; body: string }
/** System.Text.Json varsayılan kodlayıcısı gibi: ASCII dışı ve HTML'e duyarlı karakterler \uXXXX olarak kaçışlanır. */
export const netEscape = (json: string) => json.replace(/[^\x20-\x7E\n]|[<>&'+`]/g, c => '\\u' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'));
/** Sunucunun gönderdiği biçim (alarm-trigger-v1); kimlikler örnek, alan adları ve sırası gerçek (bir kısmı). */
export const bodyObj = (m: WhMsg) => ({
  Format: 'alarm-trigger-v1', DeliveryCount: 1, GeneratedAtUtc: '2026-11-26T09:15:00.4123456Z',
  Events: [{ NotificationDeliveryId: '7c1e2f90-4b1a-4d0e-9a51-2f6c8d3b7e14', AlertRuleId: 'b42a9d17-0c3e-4f86-b2d5-61e7a0c9f3d8', AlertTriggerHistoryId: '7c1e2f90-4b1a-4d0e-9a51-2f6c8d3b7e14', UserId: '5e0d8a33-91c2-47f0-8b6e-0d4f2a17c955', Symbol: 'BTCUSDT', TriggeredAtUtc: '2026-11-26T09:15:00.2110000Z', Message: { Title: m.title, Body: m.body } }],
});
/** Ham gövde (tek satır, imza bunun üzerinden). */
export const bodyOf = (m: WhMsg) => netEscape(JSON.stringify(bodyObj(m)));
/** Okunsun diye satırlara bölünmüş hâli (kaçışlar aynı). */
export const bodyPretty = (m: WhMsg) => netEscape(JSON.stringify(bodyObj(m), null, 2));
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
/** Tarayıcıda gerçek HMAC-SHA256 ("zaman damgası.gövde"); SubtleCrypto yoksa null. */
export async function hmacHex(key: string, msg: string): Promise<string | null> {
  try {
    const enc = new TextEncoder();
    const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return hex(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
  } catch { return null; }
}
export const short = (h: string) => h.slice(0, 10) + '…' + h.slice(-6);
