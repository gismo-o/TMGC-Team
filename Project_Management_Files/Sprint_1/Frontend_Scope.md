# Sprint 1 Frontend Scope

Bu dosya Sprint 1 sonunda frontend tarafinda tamamlananlari ve sonraki sprintlerde gelistirilecek ekranlari netlestirir.

## Sprint 1'de Tamamlanan Ekranlar

| Ekran | Amaç | Durum |
| --- | --- | --- |
| Login | Ilk karsilama ve giris/kayit yonlendirmesi | Done |
| Sign In | E-posta/sifre ile giris prototipi | Done |
| Sign Up | Hesap olusturma prototipi | Done |
| Onboarding | Ad, yas araligi, deneyim, cilt hissi, hedef, hassasiyet, mevcut rutin ve bildirim tercihleri | Done |
| Home / Dolabim | Tum urunlerin rafli dolap gorunumunde listelendigi, cutout katalog/fallback PNG ve surukle-birak destekli envanter ekrani | Done |
| Routine / Rutinim | Dolaptaki urunlerden bugun ve haftalik sabah/aksam Shelly rutin plani olusturma | Done |
| Shelly | Urun/rutin uyumu, yeni urun, cilt tepkisi ve icerik analizi icin hizli aksiyonlu danisman ekrani | Done |
| Scanner | Barkod/fotograf tarama prototipi | Done |
| Product Review | Taranan urunu inceleme, marka/urun/kategori/icerik alanlarini duzenleme ve dolaba ekleme | Done |
| Product Detail | Urun icerik, aciklama, AI analiz prototipi ve duzenleme akisina gecis | Done |
| Profile | Kullanici profili ve ayar girisleri | Done |

## Sprint 2 Frontend Icin Gerekenler

Tam puana yaklasmak icin sonraki sprintte frontend tarafinda asagidaki isler oncelikli olmalidir:

- Gercek kamera ve barkod okuyucu entegrasyonu
- Urun duzenleme akisinda backend update endpointini kullanmak
- Open Beauty Facts icerik verisini normalize ederek AI analiz etiketleriyle eslestirmek
- Ekip tarafindan hazirlanan gercek urun cutout PNG katalogunu backend/database ile eslestirmek
- Backend hata durumlari icin toast/alert ve retry durumlari
- Auth token'a gore login/onboarding yonlendirmesi
- Open Beauty Facts'te bulunamayan urunler icin manuel urun giris formu
- AI analiz ve rutin sonucunun gercek Gemini/backend cevabiyla loading/error/success durumlari
- Shelly haftalik takip bildirimlerinin gercek notification altyapisina baglanmasi

## Sprint 3 Frontend Icin Gerekenler

- Analiz gecmisi ekrani
- Bildirim tercihleri ve urun bitis hatirlaticilari
- Rutin planlayici ekrani
- Favori urunler ve gelismis filtreler
- Final demo icin temiz bos durumlar ve hata ekranlari
- Mobil cihazda son gorsel testler
