# Test ve Dogrulama

Bu dosya Sprint 2 sonunda calistirilmesi gereken dogrulama komutlarini ve beklenen kapsami kaydeder. Komutlar son degisikliklerden sonra tekrar calistirilir ve sonuc bu dosyada guncellenir.

## Frontend TypeScript Build

```bash
npm run build
```

Son sonuc: Passed. TypeScript derlemesi hata vermeden tamamlandi.

## Backend Unit/Context Testleri

```bash
cd backend
JAVA_HOME=$(/usr/libexec/java_home -v 24) ./mvnw test
```

Son sonuc: Passed. `BackendApplicationTests` calisti; 1 test, 0 failure, 0 error.

## API Smoke Test

```bash
npm run smoke:api
```

Not: Bu komut Supabase uzerinde test kullanicisi, test urunu ve test mesajlari olusturur. Bu nedenle otomatik olarak calistirilmeden once ekip tarafindan test verisi yazma onayi verilmelidir.

Son sonuc: Calistirilmadi. Komut canli Supabase veritabanina test kaydi yazdigi icin ekip onayi olmadan otomatik kosulmadi.

## Son Dogrulama

| Tarih | Komut | Sonuc |
| --- | --- | --- |
| 20 Temmuz 2026 | `npm run build` | Passed |
| 20 Temmuz 2026 | `JAVA_HOME=$(/usr/libexec/java_home -v 24) ./mvnw test` | Passed |
| 20 Temmuz 2026 | `npm run smoke:api` | Not run: Supabase'e test verisi yazar |

## Dogrulanan Kapsam

| Kapsam | Dogrulama |
| --- | --- |
| TypeScript sozlesmeleri | `npm run build` |
| Backend context ve servis baglantilari | `./mvnw test` |
| Auth/Product/Assistant uctan uca API akisi | `npm run smoke:api` |
| Secret guvenligi | `application.properties` Git disinda, `.example` Git icinde |
| Scrum kanit yapisi | `Project_Management_Files/Sprint_2` alt klasorleri |
