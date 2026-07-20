# Product Status ve Ekran Kanitlari

Sprint 2 sonunda urun, statik prototipten backend ve AI baglantili demo akislara gecti. Bu klasor ekran kanitlarinin hangi akislari gostermesi gerektigini ve mevcut kod karsiliklarini listeler.

## Gosterilmesi Gereken Ana Akislar

| Ekran/Akis | Sprint 2 degeri | Kod karsiligi |
| --- | --- | --- |
| Kayit ve onboarding | Kullanici ID'si ile profil verisinin Supabase'e yazilmasi | `SignUpScreen`, `OnboardingScreen`, `userService` |
| Dolabim | Backend'den gelen urunlerin raf gorunumunde listelenmesi | `HomeScreen`, `ProductContext` |
| Barkod / manuel urun ekleme | Open Beauty Facts ve AI enrichment fallback'i | `ScannerScreen`, `ProductReviewScreen`, `openBeautyFactsService` |
| Urun detayi | Aktif/pasif rutin kullanimi switch'i | `ProductDetailScreen`, `ProductService.java` |
| Rutinim | Dolaptaki aktif urunlere gore gunluk/haftalik rutin | `RoutineScreen`, `routinePlanner` |
| Shelly | Chat hafizasi ve dolap baglamiyla cevap | `AssistantScreen`, `AssistantService` |
| Cilt takibi | Fotograf notu, analiz ve haftalik ozet | `SkinTrackingScreen`, `SkinLogController` |
| Bildirimler | Rutin ve urun takip sinyalleri | `NotificationsScreen`, `notificationService` |

## README Gorsel Notu

Kok README'de Sprint 2 bolumu, eski veya kirik gorsel linklerine dayanmadan bu klasore ve teknik kanitlara baglanir. Ekip yeni emulator ekran goruntulerini aldiginda bu klasore eklenmesi onerilen dosya adlari:

- `android-login-onboarding.png`
- `android-dolabim-backend-shelf.png`
- `android-product-review-ai.png`
- `android-product-detail-active-toggle.png`
- `android-routine-weekly-plan.png`
- `android-shelly-memory-chat.png`
- `android-skin-tracking-summary.png`

