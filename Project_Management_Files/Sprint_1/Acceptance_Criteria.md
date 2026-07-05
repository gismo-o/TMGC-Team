# Sprint 1 Acceptance Criteria

Sprint 1 kabul kriterleri, demo edilebilir mobil prototip ve Scrum kanitlari uzerinden degerlendirilmiştir.

| User Story / Is | Kabul Kriteri | Durum | Kanit |
| --- | --- | --- | --- |
| Kullanici uygulamaya baslayabilmeli | Login, Sign In ve Sign Up ekranlari goruntulenebilir olmali | Done | `src/screens/LoginScreen.tsx`, `SignInScreen.tsx`, `SignUpScreen.tsx` |
| Kullanici cilt profilini olusturabilmeli | 7 adimli onboarding; ad, yas, deneyim, cilt hissi, hedef, hassasiyet, mevcut rutin ve bildirim tercihlerini alabilmeli | Done | `OnboardingScreen.tsx`, `UserContext.tsx` |
| Kullanici urun dolabini gorebilmeli | Tum urunler rafli dolapta PNG obje olarak gorunmeli | Done | `HomeScreen.tsx` |
| Kullanici rutin planini gorebilmeli | Rutinim sekmesi dolaptaki urunlerden bugun ve haftalik sabah/aksam Shelly plani olusturmali | Done | `RoutineScreen.tsx`, `routinePlanner.ts` |
| Kullanici Shelly'ye soru sorabilmeli | Shelly ekrani urun/rutin/cilt degisimi odakli hizli aksiyonlar sunmali | Done | `AssistantScreen.tsx`, `shellyInsights.ts` |
| Kullanici urun detayini inceleyebilmeli | Urun detay modalinde aktif icerik, durum etiketi ve Shelly yorumu yer almali | Done | `ProductDetailScreen.tsx` |
| Kullanici urun ekleme akisina girebilmeli | Barkod ve fotograf modlari bulunan scanner ekrani olmali | Done | `ScannerScreen.tsx` |
| Barkod akisi veri kaynagina hazir olmali | Barkod girdisi servis katmanindan Open Beauty Facts lookup'a gidebilmeli | Done | `openBeautyFactsService.ts` |
| Kullanici taranan urunu onaylayabilmeli | ProductReview ekranina urun adi, marka, kategori ve rutin zamani tasinabilmeli | Done | `ProductReviewScreen.tsx` |
| Sprint puanlari gorulebilmeli | Sprint hedefi, tamamlanan ve kalan SP dokumante edilmeli | Done | `Sprint_Board/sprint1-story-points.md` |
| Scrum kanitlari gorulebilmeli | Daily scrum, board, burndown, review ve retrospective klasorleri baglanmali | Done | `Project_Management_Files/Sprint_1` |
| Teknik mimari aciklanmali | Mobil katmanlar ve Sprint 2 entegrasyon hedefleri diyagramla gosterilmeli | Done | `System_Design/skinshelf-technical-architecture.svg` |

## Sprint 1 Disinda Birakilan Kabul Kriterleri

| Is | Gerekce | Hedef Sprint |
| --- | --- | --- |
| Gercek auth backend entegrasyonu | Sprint 1 onceligi frontend prototip ve akisti | Sprint 2 |
| Kalici database kaydi | Backend ve veri modeli Sprint 2'de netlestirilecek | Sprint 2 |
| Gercek Gemini AI cevabi | Prompt, JSON sema ve backend proxy Sprint 2 kapsaminda | Sprint 2 |
| Bildirimler ve analiz gecmisi | Temel akistan sonra gelistirilecek ikincil moduller | Sprint 3 |
