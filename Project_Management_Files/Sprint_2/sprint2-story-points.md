# Sprint 2 Story Point Dagilimi

Sprint 2 puanlamasi, Sprint 1'den devreden backend/database borcunun kapatilmasi ve AI destekli servislerin gercek veriyle calisir hale getirilmesi hedefiyle yapildi.

## Toplam Puan

| Kapsam | Puan |
| --- | ---: |
| Sprint 2 hedefi | 130 SP |
| Tamamlanan | 130 SP |
| Kalan | 0 SP |

## Kart Bazli Dagilim

| Kart | Aciklama | Puan | Durum |
| --- | --- | ---: | --- |
| Authentication API | Register, login, `/auth/me`, JWT ve BCrypt akisi | 13 | Done |
| Profil ve onboarding DB entegrasyonu | Onboarding cilt verisinin Supabase `user_profiles` tablosuna yazilmasi | 13 | Done |
| Supabase/Flyway veri modeli | Core schema, migration config, urun/profil/asistan/cilt takip tablolari | 18 | Done |
| Urun CRUD servisleri | Dolap listeleme, ekleme, guncelleme, silme ve aktif/pasif kullanim | 13 | Done |
| Barkod ve acik urun verisi | Open Beauty Facts entegrasyonu ve kategori/icerik normalize akisi | 13 | Done |
| Gemini urun zenginlestirme | Eksik marka/urun bilgilerinin AI ile tamamlanmasi | 13 | Done |
| Shelly chat agent | Chat endpointi, guvenlik filtresi, son mesaj hafizasi ve yapili cevap | 18 | Done |
| Ingredient analyzer | Aktif icerik yorumlama, risk seviyesi ve guardrail uyarilari | 10 | Done |
| Rutin senkronizasyonu | Aktif urunlere gore gunluk/haftalik rutin planlama | 8 | Done |
| Cilt takibi | Fotograf notu, analiz kaydi ve haftalik ozet endpointleri | 13 | Done |
| Bildirim ve urun hatirlatmalari | Bildirim ekrani, urun SKT ve rutin takip sinyalleri | 5 | Done |
| Test ve dokumantasyon | Build, backend test, mimari ve sprint kanit dosyalari | 3 | Done |

## Puan Tamamlama Mantigi

Ornek bootcamp repolarinda puanlar genellikle sprint hedefi, tamamlanan is ve kalan is olarak aciklaniyor. Bu sprintte puanlar daha ayrintili kartlara bolundu; cunku Sprint 2'nin ana riski tek bir buyuk "backend entegrasyonu" basligi degil, mobil istemci, API, Supabase, Gemini ve rutin planlayici arasindaki sozlesmelerin birlikte calismasiydi.

Sprint sonunda tum kritik PBI'lar Done kolonuna alindi. Kalan is bir sonraki sprinte "teknik borc" olarak devredilmedi; Sprint 3 kapsaminda artik final demo, gelismis testler, deploy hazirligi ve son urun polish adimlari planlandi.

