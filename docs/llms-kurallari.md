# llms.txt ve llms-full.txt kuralları

Yapay zekâ araçları için iki dosya: https://www.marketalertapp.com/llms.txt (kısa vitrin) ve
https://www.marketalertapp.com/llms-full.txt (sayfa sayfa ayrıntı). İkisi de derlemede
`src/i18n/llms.json` dosyasından üretilir (`src/lib/llms.ts`). Elle `public/` altına dosya konmaz.

## Düzen

**llms.txt** (en fazla 1.500 kelime), bu sırayla:
1. Tanım: tek paragraf (`definition`)
2. Olgular: ürün geneli, en fazla 12 madde (`facts`)
3. Örnek kullanımlar: tam alarm cümleleri, en fazla 8 (`examples`: [cümle, kısa not ve plan])
4. Sayfalar: dil ana sayfaları, ardından her içerik sayfası için tek satır (bağlantı + `line`)
5. Resmi hesaplar (`SOCIAL`, src/config.ts)
6. Yasal
7. llms-full.txt bağlantısı (en üstte)

**llms-full.txt**: her içerik sayfası için aynı kalıpta bir blok, en fazla 200 kelime:
- `what`: ne işe yarar, 2–3 cümle
- `facts`: o sayfaya özgü 3–5 olgu
- `example`: 1 tam alarm cümlesi
- `faq`: en fazla 3 soru-cevap (sayfanın SSS'sinden en öğretici olanlar)

## Yazı ekleme kuralları
- Yalnızca uygulamada şu an doğru olan olgular. Slogan, pazarlama cümlesi yok.
- Hız rakamı (ms), fiyat, rakip adı, günlük bildirim sınırı yok. Yapay zekâ alarmları kapatır, silmez.
- Sayfanın tüm metni, adım adım ekran tarifi girmez.
- Bir bilgi tek yerde: ürün geneli olgular `facts`'te, sayfaya özgü olanlar o sayfanın bloğunda.
- Dil İngilizce. Sayfa adı İngilizce rehberin `link` alanından gelir.

## Sayfa eklenince / düzenlenince / silinince
- **Eklenince:** `pages`'e `bolum/sayfa` anahtarıyla blok ekle (`line` + `what` + `facts` + `example` + `faq`).
  Yeni bir özellikse ana sayfa `facts` (content.json, 11 dil) ve gerekirse llms `facts` güncellenir.
- **Düzenlenince:** o sayfanın satırı ve bloğu yeniden okunur, değişen olgu düzeltilir.
- **Silinince:** blok silinir (satır kendiliğinden kalkar).
- **Ürün geneli değişiklik** (yeni koşul tipi, plan değişikliği, yeni kanal): `facts` güncellenir.

## Denetim (derleme hatası = site yayınlanmaz)
- Sitede bloğu olmayan içerik sayfası, ya da sitede olmayan bir sayfanın bloğu
- Kelime ve madde sınırları
- Yasak içerik kalıpları (ms, para birimi, rakip adları, günlük sınır, "delete")
