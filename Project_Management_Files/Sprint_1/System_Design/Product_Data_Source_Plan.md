# Sprint 1 Product Data Source Plan

SkinShelf'in ürün ekleme akışında barkod okutulduğunda ürün adı, marka, içerik listesi ve kategori bilgisinin otomatik doldurulması hedeflenmektedir. Sprint 1'de bu ihtiyaca uygun açık veri kaynağı araştırılmış ve mobil servis katmanında entegrasyon iskeleti hazırlanmıştır. Ürün görselleri ise açık kaynak ürün fotoğrafından bağımsız, ekip tarafından hazırlanacak PNG/cutout katalog veya backend database eşleşmesi üzerinden yönetilecektir.

## Seçilen Açık Veri Kaynağı

Birincil kaynak olarak Open Beauty Facts planlanmıştır.

- Kaynak: https://github.com/openfoodfacts/openbeautyfacts
- Web: https://world.openbeautyfacts.org
- API yaklaşımı: `GET /api/v2/product/{barcode}`
- Örnek alanlar: `product_name`, `brands`, `ingredients_text`, `categories_tags`

Open Beauty Facts, kozmetik ürünler için topluluk katkılı açık veri tabanı sunduğu için SkinShelf'in barkod ile ürün tanıma hedefiyle uyumludur.

## Sprint 1 Teknik Kararı

Sprint 1'de `src/services/openBeautyFactsService.ts` dosyası eklenmiştir. Bu servis barkoddan ürün verisi çekmeyi, gelen cevabı uygulamanın `ProductDraft` modeline çevirmeyi ve ürün inceleme ekranına aktarmayı hedefler.

Ürün raf görseli için ayrı bir katalog kararı alınmıştır:

- `src/services/productVisualCatalog.ts` marka + ürün adına göre lokal veya backend kaynaklı `cutoutImageUrl` eşleşmesi yapar.
- Eşleşme varsa raflarda gerçek ürün PNG/cutout gösterilir.
- Eşleşme yoksa kategori bazlı temsili PNG gösterilir.
- Sprint 1 demo kanıtında La Roche-Posay Effaclar K(+) için kullanıcı tarafından sağlanan ürün görseli arka plansız PNG cutout olarak eklenmiştir.

Kullanılan demo barkod:

```text
3337875863377
```

Bu barkod Open Beauty Facts üzerinde La Roche-Posay Effaclar Duo+ örneği olarak kullanılmaktadır. Scanner ekranındaki barkod demo akışı, bu gerçek açık veri kaynağı entegrasyonuna göre hazırlanmıştır.

## Planlanan Ürün Ekleme Akışı

1. Kullanıcı Scanner ekranında barkod okutmayı seçer.
2. Mobil uygulama barkodu `productService.scanProduct()` fonksiyonuna gönderir.
3. `openBeautyFactsService` Open Beauty Facts API'den ürün bilgilerini ister.
4. Ürün bulunursa marka, ürün adı, kategori ve içerik ProductReview ekranına otomatik taşınır.
5. `productVisualCatalog` ürün adı/marka eşleşmesine göre raf görseli için cutout PNG seçer.
6. Ürün bulunamazsa fotoğraf/etiket okuma akışına geçilir.
7. Kullanıcı gerekirse otomatik gelen bilgileri düzenler ve ürünü dolabına kaydeder.

## Fallback Stratejisi

Open Beauty Facts topluluk katkılı bir kaynak olduğu için her ürünün veya her ülke varyantının kayıtlı olması garanti değildir. Bu nedenle Sprint 2 için aşağıdaki fallback akışı planlanmıştır:

- Barkod bulunursa: ürün bilgisi Open Beauty Facts üzerinden otomatik doldurulur.
- Barkod bulunmazsa: kullanıcı ürün ön yüzü veya içerik etiketi fotoğrafı çeker.
- Fotoğraf OCR/Vision AI ile okunur.
- Gemini, marka/ürün adı/içerik metnini yapılandırılmış JSON'a dönüştürür.
- Kullanıcıya düzenlenebilir bir ProductReview ekranı gösterilir.
- Kullanıcı onayından sonra ürün dolaba kaydedilir.

## Riskler ve Önlemler

| Risk | Etki | Önlem |
| --- | --- | --- |
| Barkod Open Beauty Facts'te yok | Otomatik ürün doldurma başarısız olur | Fotoğraf/OCR ve manuel düzenleme fallback'i |
| İçerik listesi eksik veya farklı dilde | AI analizi zayıflayabilir | Kullanıcıdan içerik etiketi fotoğrafı isteme |
| Ürün kategorisi hatalı gelebilir | Rutin önerisi yanlış olabilir | Kategori alanını ProductReview ekranında düzenlenebilir tutma |
| İçerik listesi eksik veya hatalı gelebilir | AI uyumluluk analizi eksik kalabilir | İçerik etiketlerini ProductReview ekranında eklenebilir/silinebilir tutma |
| Ürünün gerçek PNG cutout görseli katalogda yok | Raflarda gerçek ürün yerine temsili şişe görünür | Ekip tarafından manuel cutout DB/katalog genişletme |
| Veri kaynağı çevrimdışı olabilir | Barkod akışı çalışmayabilir | Demo/fallback product response ve hata yönetimi |

## Sprint 2 Entegrasyon Hedefi

- Gerçek kamera barkod okuyucu entegrasyonu
- Open Beauty Facts endpoint'i için hata yönetimi
- Ürün cutout görsel katalog / database yönetimi
- Ürün bulunamama durumunda fotoğraf/OCR fallback'i
- Gemini ile içerik normalizasyonu
- Kullanıcı onayı sonrası backend/database kayıt akışı
