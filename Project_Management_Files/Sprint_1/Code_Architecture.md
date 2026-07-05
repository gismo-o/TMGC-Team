# Sprint 1 Code Architecture

Bu dokuman, Sprint 1 sonunda mobil uygulama kodunun mimari duzenini ve Sprint 2 entegrasyonuna hazir noktalarini aciklar.

## Katmanlar

| Katman | Klasor / Dosya | Sorumluluk |
| --- | --- | --- |
| Navigation | `src/navigation/RootNavigator.tsx` | Stack ve bottom tab akisini yonetir. Login, onboarding, ana sekmeler, scanner, Shelly ve urun detay modallari burada baglanir. |
| Screens | `src/screens` | Kullanici arayuzu ekranlari. Her ekran kendi UI state'ini ve kullanici aksiyonlarini yonetir. |
| Context | `src/context` | Prototip seviyesinde global user/profile ve product shelf state'ini tutar. Backend gelince bu katman API yanitlariyla beslenecek. |
| Services | `src/services` | Auth, product, Open Beauty Facts, product visual catalog, routine planning ve Shelly yorum mantigini UI'dan ayirir. |
| Types | `src/types.ts` | Product, profile ve navigation tiplerini merkezi tutar. |
| Assets | `assets/products`, `assets/product-cutouts`, `assets/screenshots` | Raf gorselleri, urun cutout/fallback PNG'leri ve README kanit screenshotlari. |

## Sprint 1 Uygulanan Akislar

| Akis | Ilgili moduller | Not |
| --- | --- | --- |
| Login / Register | `LoginScreen`, `SignInScreen`, `SignUpScreen`, `authService` | Auth servisleri Sprint 2 backend endpointlerine baglanacak sekilde ayrildi. |
| Onboarding | `OnboardingScreen`, `UserContext` | Ad, yas araligi, deneyim, cilt hissi, hedef, hassasiyet, mevcut rutin ve bildirim tercihleri tek akista toplandi. |
| Dijital raf | `HomeScreen`, `ProductContext`, `productVisualCatalog` | Raf UI'i urun gorsellerini cutout katalogdan veya kategori fallback PNG'den secer. |
| Urun detay | `ProductDetailScreen`, `shellyInsights` | Urun durumlari ve Shelly yorumu detay ekraninda gosterilir; raf ekrani kalabalik tutulmaz. |
| Rutin planlama | `RoutineScreen`, `routinePlanner`, `shellyInsights` | Dolaptaki urunlerden bugun ve haftalik sabah/aksam plan olusturulur. |
| Shelly | `AssistantScreen`, `routinePlanner`, `shellyInsights` | Bos chatbot yerine urun/rutin odakli hizli aksiyonlar ve mesaj alani sunar. |
| Barkod veri plani | `openBeautyFactsService`, `productService`, `ProductReviewScreen` | Barkoddan urun bilgisi cekme ve kullanici onayli review akisi Sprint 2 entegrasyonuna hazirlandi. |

## Mimari Kararlar

- UI ekranlari dogrudan dis API detaylarini bilmez; urun verisi ve AI/rutin yorumu servis katmanindan gelir.
- `ProductContext` ve `UserContext` Sprint 1 icin lokal prototip state saglar; Sprint 2'de repository/API katmani ile degistirilebilir.
- `routinePlanner` retinol/peeling gibi guclu aktifleri ayni rutin gecesine koymayacak sekilde merkezi planlama mantigi tasir.
- Raf gorselleri urun bilgisinden ayridir. Barkod/acik veri kaynagi urun adini, marka ve icerigi getirir; gorsel katalog ekip tarafindan buyutulecek ayri bir kaynak olarak kalir.
- Shelly metinleri ve urun durumlari `shellyInsights` icinde toplandi; boylece UI'da sabit, tekrarli metin dagilimi azalir.

## Kod Degerlendirme Notu

Sprint 1 kodu demo edilebilir mobil prototip icin yeterli ayrima sahiptir. Ornek repolara gore ek avantaj olarak sadece Scrum kaniti degil, teknik mimari ve servis sinirlari da dokumante edilmistir. Sprint 2'de kalici veri, backend hata durumlari ve gercek AI cevabi eklendiginde mevcut `services` katmani genisletilerek UI ekranlari korunabilir.
