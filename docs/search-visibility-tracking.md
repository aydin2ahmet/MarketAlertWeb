# Özellik rehberleri: görünürlük deneyi

Başlangıç: 30 Ekim 2026. Yeni sayfalar: `volume-spike-alerts`, `multi-condition-alerts`. Her biri mevcut 11 dilde yayınlanır. `rsi-alerts` karşılaştırma için izlenir.

## Seçim dayanağı

Bunlar ölçülmüş Google arama hacimleri değildir. Kullanıcıların birinci elden sorduğu sorular, ilgili arama sonuçları ve uygulamanın doğrulanmış özellikleri temel alınmıştır. Türkçe başlıkların birebir Google'a yazıldığı doğrulanmadı; İngilizce insan sorularındaki ihtiyacın yerelleştirilmiş karşılıklarıdır. Üst sıralama veya trafik garantisi verilmez.

- Birden fazla indikatörü tek alarmda birleştirme: [Multiple indicators in an alert?](https://www.reddit.com/r/TradingView/comments/lc9z6k/). Kullanıcı RSI ve MACD için AND/OR soruyor.
- Kod yazmadan RSI ve hareketli ortalamayı birleştirme: [Advanced alerts without coding?](https://www.reddit.com/r/TradingView/comments/12lty4f/advanced_alerts_without_coding/). Kullanıcı RSI ile fiyat/MA koşullarını birlikte istiyor. Eski tartışmadaki TradingView sınırlamaları güncel rakip özelliği gibi sunulmadı.
- Hacim artışı ve fiyat koşulu: [How do I create multiple Conditions for an alert?](https://www.reddit.com/r/TradingView/comments/wg7wnq/). Kullanıcı bağıl hacmi fiyat koşuluyla birleştirmek istiyor.
- Hacim sıçraması bildirimi: [Looking for a Volume Spike Indicator](https://www.reddit.com/r/TradingView/comments/1lqzmni/). Kullanıcı izleme listesinde anormal hacim uyarısı ve pozitif fiyat hareketiyle birleştirme istiyor. Bu örnek hisse piyasasına ait; Binance arama hacmi kanıtı sayılmadı.

Rakip örnekleri: [Indicalert](https://www.indicalert.com/features/indicator-alerts), [CoinBeacon çok koşullu alarmlar](https://coinbeacon.io/features/multi-condition-alerts), [CoinBeacon hacim alarmları](https://coinbeacon.io/volume-movers). Benzer sayfalar var; benzersizlik iddiası yapılmadı. MarketAlert sayfalarının odağı konuşarak/yazarak kurulum, somut komut, aynı coin üzerinde koşul değerlendirmesi ve bildirim kanalıdır.

## İzlenecek sorgu aileleri

| Sayfa | Türkçe adaylar | İngilizce adaylar |
| --- | --- | --- |
| volume-spike-alerts | Binance hacim alarmı; hacmi artan coinleri bildiren uygulama; hacim artışı Telegram bildirimi | Binance volume spike alerts; crypto volume alerts Telegram; volume spike notification app |
| multi-condition-alerts | RSI EMA birlikte alarm; çok koşullu kripto alarmı; kod yazmadan indikatör alarmı | RSI EMA alert; multi condition crypto alerts; indicator alerts without coding |
| rsi-alerts | tüm coinlerde RSI alarmı; Binance RSI tarama | RSI alerts all coins; Binance RSI scanner alerts |

Bunlar hedef hipotezleridir. Gerçek gösterim sorguları ortaya çıktıkça listeyi güncelle. Aynı ihtiyacı karşılayan yakın sorgular için ayrı, tekrarlayan sayfalar üretme.

## Ölçüm yöntemi

Search Console mülkü: `sc-domain:marketalertapp.com`. Arama türü: Web.

1. Önce dizin durumunu ve son taramayı kontrol et. Talep gönderildi ile dizine eklendi farklı durumlardır.
2. Sayfa filtresi: tam adres; ardından Sorgular tablosu. Dil adreslerini ayrı kaydet; Türkçede Türkiye filtresini ayrıca karşılaştır. Ülke/cihaz filtrelerini dönemler arasında değiştirme.
3. Gösterim, tıklama, TO ve ortalama konumu birlikte kaydet. TO = tıklama / gösterim. Gösterim yoksa TO ve konum için sayısal sonuç uydurma; “veri yok” yaz.
4. İlk dönemde son 7 gün, veri biriktikçe son 28 gün ve önceki eşit uzunluktaki dönem. Veri gecikmesini ve rapordaki son güncellemeyi kaydet. Çok az gösterimden başarı/başarısızlık sonucu çıkarma.
5. Sayfa toplamı ile sorgu satırları birebir örtüşmeyebilir; gizlenen düşük hacimli sorgular olabilir. Sorgu satırı yokluğu tek başına hiç gösterim olmadığı anlamına gelmez.
6. Ortalama konum sabit bir sıra değildir: rapor kapsamındaki gösterimlerin ortalamasıdır. Kendi yaptığımız tek Google aramasını kesin sıralama ölçümü sayma. [Google rapor açıklaması](https://support.google.com/webmasters/answer/7576553).

## Başlangıç kaydı

Önceki kontrolde (30 Ekim 2026), TR/EN ana sayfaları ve RSI rehberleri dizindeydi; mülkün son 24 saatlik raporunda 0 gösterim ve 0 tıklama görünüyordu. Bu, yeni sayfaların performans ölçümü değildir. Yeni sayfalara ait ilk rapor verisi henüz yok. İlk görünürlük, gösterim ve tıklama ayrı dönüm noktaları olarak izlenecek.

Her takipte tarih, rapor dönemi, sayfa, ülke/cihaz filtresi, dizin durumu, gösterim, tıklama, TO, ortalama konum ve öne çıkan sorguları bu sohbette raporla. Değişiklik gerekmiyorsa içerikleri veya dizin taleplerini tekrar tekrar değiştirme.
