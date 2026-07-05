# Sprint 1 Test and Verification

Bu dosya Sprint 1 sonunda yapilan teknik ve manuel dogrulamalari listeler.

## Teknik Kontroller

| Kontrol | Komut / Yontem | Sonuc |
| --- | --- | --- |
| Dependency kurulumu | `npm install` | Gecti |
| TypeScript build kontrolu | `npm run build` | Gecti |
| Expo web smoke test | `npm run dev` ve `http://localhost:3000` | Gecti |
| Android emulator smoke test | `Medium_Phone` AVD, Expo Android bundle | Gecti |
| Git durumu | `git status --short` | Temiz |
| Barkod veri kaynagi testi | Open Beauty Facts API | Gecti |

## Barkod API Dogrulamasi

Test edilen barkod:

```text
3337875863377
```

Beklenen ve alinan sonuc:

- Marka: La Roche-Posay
- Urun: Effaclar duo+
- Icerik alani: Var
- Raf gorseli: Open Beauty Facts fotografi kullanilmaz; `productVisualCatalog` uzerinden lokal PNG/cutout veya kategori fallback PNG kullanilir.

Bu dogrulama, Sprint 2'de gercek kamera barkod okuyucu eklendiginde servis katmaninin kullanilabilir oldugunu gostermek icin yapilmistir.

## Manuel Frontend Kontrol Listesi

| Akis | Beklenen Davranis | Durum |
| --- | --- | --- |
| Login -> Sign In | Kullanici giris formuna gecebilir | Gecti |
| Login -> Sign Up | Kullanici hesap olusturma formuna gecebilir | Gecti |
| Sign Up -> Onboarding | Hesap olusturma akisi 7 adimli Shelly onboarding ekranina devam eder | Gecti |
| Profile -> Onboarding | Cilt profili duzenleme mevcut onboarding akisina gider | Gecti |
| Home / Dolabim | Tum urunler rafli dolapta PNG obje olarak gorunur | Gecti |
| Home / Product visual catalog | Cutout katalogda eslesen urun gercek PNG olarak, eslesmeyen urun kategori fallback PNG olarak gorunur | Gecti |
| Home shelf drag | Ayni raftaki urunler saga/sola suruklenerek siralanabilir | Gecti |
| Routine tab | Alt navigasyonda Rutinim sekmesi acilir | Gecti |
| Routine Shelly plan | Dolaptaki urunlerden bugun ve haftalik sabah/aksam plan olusur | Gecti |
| Routine weekly modal | Haftalik plan tam ekran acilir; bottom tab bar gorunmez | Gecti |
| Shelly assistant | Shelly ekraninda urun/rutin odakli hizli aksiyonlar ve mesaj alani gorunur | Gecti |
| Scanner | Barkod ve fotograf modlari arasinda gecis vardir | Gecti |
| Scanner -> ProductReview | Taranan urun review ekranina tasinir | Gecti |
| ProductReview edit | Marka, urun adi, kategori ve icerik etiketleri onaydan once duzenlenebilir | Gecti |
| ProductReview ingredient editor | Yeni icerik etiketi eklenebilir | Gecti |
| ProductReview -> Home | Urun dolaba eklenip ana ekrana donulebilir | Gecti |
| ProductDetail | Urun detay ve AI analiz prototipi secili urun verisiyle gorunur | Gecti |
| ProductDetail edit | Edit ikonu ProductReview duzenleme moduna gider | Gecti |
| Profile | Profil ve cikis aksiyonlari gorunur | Gecti |

## Bilinen Sinirlar

- Gercek cihaz kamera izni ve barkod okuyucu kutuphanesi Sprint 2 kapsamindadir.
- Backend auth ve kalici veri kaydi Sprint 2 kapsamindadir.
- Gemini AI cevabi ve gercek haftalik rutin motoru Sprint 2'de backend uzerinden entegre edilecektir.
- Bildirimler, analiz gecmisi ve gelismis takip ozeti Sprint 3 kapsamindadir.
