# Sprint Review ve Retrospective

## Sprint Review

Sprint sonunda ekip; mobil prototipin gercek backend, Supabase ve Gemini servisleriyle calisir hale geldigini degerlendirdi.

### Tamamlanan Basliklar

- Spring Boot backend ve Supabase PostgreSQL baglantisi kuruldu.
- Auth, profile, product, assistant ve skin tracking endpointleri tamamlandi.
- Mobil uygulama register/login sonrasi token ile protected endpointlere baglandi.
- Onboarding sonucundaki cilt profili backend'e kaydedildi.
- Dolaptaki urunlerin kalici saklanmasi ve aktif/pasif rutin kullanimi eklendi.
- Shelly sohbet hafizasi ve yapili cevap akisi eklendi.
- Barkod ile urun bulma ve eksik veri icin AI zenginlestirme akisi hazirlandi.
- Cilt fotograf/not takip akisi backend tarafinda modellenip ekrana baglandi.

### Review Katilimcilari

- Tuba Koten
- Gizem Ilayda Koz
- Ceren Sivri

## Retrospective

### Iyi Gidenler

- Backend ve mobil katmanlar arasi sozlesme netlestikce entegrasyon hizi artti.
- Supabase migrationlari sayesinde veritabani degisiklikleri tekrar edilebilir hale geldi.
- Shelly'nin sadece chat degil, dolap ve rutin baglamiyla cevap vermesi urun degerini guclendirdi.
- Open Beauty Facts ve Gemini fallback birlikteligini kurmak barkod riskini azaltti.

### Zorlayanlar

- Gemini kota sinirlari test sirasinda gecici cevap/fallback ihtiyacini ortaya cikardi.
- Mobil state ile backend verisinin senkron kalmasi icin ProductContext ve useFocusEffect akislarinin dikkatli kurulmasi gerekti.
- Supabase baglanti ve migration ayarlari, local secret dosyalarinin Git disinda tutulmasini zorunlu kildi.

### Sonraki Aksiyonlar

- Sprint 3'te final demo akisi icin emulator ekran goruntuleri ve video linki tamamlanacak.
- API smoke testi kontrollu test kullanicisiyle calistirilip sonuc dosyasi eklenecek.
- Shelly cevaplari daha fazla gercek urun verisiyle zenginlestirilecek.
- UI polish, erisim kolayligi ve final sunum hazirligi tamamlanacak.

