# Sprint 1 AI Service Plan

SkinShelf'in yapay zeka kapsamı Sprint 1'de ürün deneyimi ve ekran akışları üzerinden tasarlanmıştır. Gerçek servis entegrasyonu Sprint 2 kapsamına ayrılmıştır.

## Hedef AI Modülleri

| Modül | Amaç | Girdi | Çıktı |
| --- | --- | --- | --- |
| Ingredient Analyzer Agent | Ürün içeriklerini analiz etmek | Ürün adı, marka, içerik listesi veya fotoğraf | Aktif içerikler, riskler, kısa açıklama |
| Compatibility Checker Agent | Ürünlerin birlikte kullanım uyumluluğunu kontrol etmek | Kullanıcının dolabındaki ürünler ve aktif içerikler | Uyumsuz kombinasyon uyarıları |
| Routine Planner Agent | Sabah/gece bakım rutini oluşturmak | Cilt tipi, hassasiyetler, ürün listesi | Sıralı rutin önerisi |
| Recommendation Agent | Eksik aktif içerik veya ürün önerisi yapmak | Cilt hedefi, mevcut ürünler, analiz sonucu | Ürün/aktif içerik önerileri |
| AI Chat Assistant | Kullanıcının bakım sorularını yanıtlamak | Kullanıcı sorusu ve profil bağlamı | Kişiselleştirilmiş yanıt |

## Planlanan Teknik Akış

1. Mobil uygulama kullanıcıdan ürün bilgisi, barkod veya fotoğraf girdisi alır.
2. `productService` bu girdiyi backend API'ye gönderir.
3. Backend, gerekli doğrulama ve veri temizleme işlemini yapar.
4. Backend, Gemini API modeline yapılandırılmış prompt gönderir.
5. AI cevabı normalize edilir ve mobil uygulamaya JSON formatında döndürülür.
6. Mobil uygulama analiz sonucunu ProductReview ve ProductDetail ekranlarında gösterir.
7. Kullanıcı isterse ürünü dijital dolabına kaydeder.

## Sprint 1 Kapsamı

- AI analiz ekran akışı tasarlandı.
- Scanner, ProductReview ve ProductDetail ekranları üzerinden AI deneyimi temsil edildi.
- Servis katmanı gerçek backend'e bağlanabilecek şekilde ayrıldı.
- Demo veriyle arayüz davranışı doğrulandı.

## Sprint 2 Kapsamı

- Backend API endpointlerinin hazırlanması
- Gemini API entegrasyonu
- Ürün içerik analiz promptlarının yazılması
- AI cevabı için JSON şema belirlenmesi
- Hata yönetimi ve fallback cevapları
- Analiz sonuçlarının kalıcı veri katmanına kaydedilmesi
