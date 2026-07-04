# 🌿 TGC-Team

> **YZTA Bootcamp 2026 Projesi**
>
> Yapay zekâ destekli kişiselleştirilmiş cilt bakım asistanı geliştirmeyi amaçlayan mobil uygulama projesi.

# 📌 Ürün Bilgileri

---

## Ürün İsmi : **SkinShelf**

---

## 👥 Takım Elemanları

| İsim                 | Rol           |
| -------------------- | ------------- |
| **Tuba Köten**       | Scrum Master  |
| **Gizem İlayda Koz** | Product Owner |
| **Ceren Sivri**      | Developer     |

---

# 📖 Ürün Açıklaması

Kullanıcıların sahip olduğu cilt bakım ürünlerini tek bir platform üzerinden yönetebilmelerini sağlayan, yapay zekâ destekli analizler ile daha bilinçli cilt bakım kararları almalarına yardımcı olan bir mobil uygulamadır. Kullanıcılar sahip oldukları ürünleri marka, içerik ve ürün bilgileriyle sisteme ekleyebilir; uygulama ise bu bilgileri kullanıcının cilt tipi, cilt hassasiyetleri ve bakım hedefleriyle birlikte değerlendirerek kişiselleştirilmiş sabah ve gece bakım rutinleri oluşturur. Ayrıca ürünlerin içerik uyumluluğunu analiz eder, birlikte kullanılması önerilmeyen kombinasyonlar için uyarılar sunar ve eksik aktif içeriklere göre yeni ürün önerilerinde bulunur. Kullanıcının rutin kullanım alışkanlıklarını zamanla öğrenerek önerilerini sürekli geliştirir ve ürünler tükenmeden önce hatırlatma bildirimleri göndererek cilt bakım sürecinin daha düzenli ve etkili bir şekilde yönetilmesini sağlar.

Uygulama;

- 🧴 Ürün içeriklerini analiz eder.
- 🤝 Ürünlerin birlikte kullanım uyumluluğunu değerlendirir.
- ✨ Kullanıcının cilt tipine uygun bakım rutini oluşturur.
- 🧠 Kullanım alışkanlıklarını öğrenerek önerilerini zamanla kişiselleştirir.
- 🔔 Ürünler tükenmeden önce hatırlatma bildirimleri gönderir.

Amacı, kullanıcıların cilt bakım süreçlerini daha bilinçli, güvenli ve kişiselleştirilmiş hale getirmektir.

---

# 🚀 Ürün Özellikleri

## 🤖 Yapay Zekâ Özellikleri

- İçerik (Ingredient) analizi
- Ürün uyumluluk analizi
- Cilt tipine özel sabah rutini oluşturma
- Cilt tipine özel gece rutini oluşturma
- Yapay zekâ destekli ürün önerileri
- Yapay zekâ sohbet asistanı
- Kullanım alışkanlıklarına göre kişiselleştirilmiş öneriler

---

## 📱 Uygulama Özellikleri

- Cilt profili oluşturma
- Kişisel ürün dolabı
- Ürün ekleme, düzenleme ve silme
- Geçmiş analizleri görüntüleme
- Bakım rutini yönetimi
- Ürün tükenme hatırlatmaları
- Günlük bakım bildirimleri

---

## ⭐ Opsiyonel Özellikler

- Yüz analizi
- Cilt gelişiminin dönemsel takibi
- AI destekli fotoğraf analizi
- Barkod ile ürün ekleme
- QR kod ile ürün ekleme
- Favori ürünler
- Çoklu dil desteği
- Topluluk bölümü

---

# 🎯 Hedef Kitle

Bu proje aşağıdaki kullanıcı gruplarına yönelik geliştirilmektedir:

- Cilt bakımına ilgi duyan bireyler
- Birden fazla cilt bakım ürünü kullanan kullanıcılar
- Ürün içeriklerini bilinçli şekilde analiz etmek isteyen kişiler
- Cilt tipine uygun bakım rutini oluşturmak isteyen kullanıcılar
- Cilt bakımına yeni başlayan bireyler
- Yoğun yaşam temposu nedeniyle bakım rutinlerini düzenli takip etmek isteyen kullanıcılar
- Yapay zekâ destekli kişiselleştirilmiş bakım deneyimi arayan kullanıcılar

---

# 🎯 Proje Amacı

Kullanıcıların sahip oldukları cilt bakım ürünlerini daha bilinçli kullanmalarını sağlamak, ürün içeriklerini yapay zekâ ile analiz etmek, kişiye özel bakım rutinleri oluşturmak ve cilt bakım sürecini daha kolay, güvenli ve etkili hale getirmektir.

# 🧩 Sistem Tasarımı

## UML Diyagramı

Uygulamanın veri modelini ve sınıflar arası ilişkileri gösteren UML class diyagramı, mevcut kod tabanı (`src/types.ts`, `src/context/*`, `src/services/*`) esas alınarak oluşturulmuştur.

<img width="1104" height="826" alt="Ekran Resmi 2026-07-04 10 29 26" src="https://github.com/user-attachments/assets/151e7fe6-f745-4e2b-83cf-d3812bad9bce" />

**Mevcut varlıklar (kodda uygulanmış):**
- `User` — kimlik doğrulama bilgisi (`authService`)
- `UserProfile` — cilt tipi, hassasiyetler, onboarding durumu (`UserContext`)
- `Product` — dolaptaki ürün bilgisi (`ProductContext`, `productService`)

**Planlanan varlıklar (Sprint 2–3 kapsamında, henüz kodda yok):** `Routine`, `SkinAnalysis`, `ProgressEntry`. Diyagramda bunlar kesikli çizgiyle gösterilmiştir; geliştirildikçe diyagram güncellenmelidir.

## Akış Şemaları (Flow Charts)

Uygulamanın temel kullanıcı akışları, `RootNavigator.tsx` ve ekranlardaki `navigate()` / `replace()` çağrıları esas alınarak çıkarılmıştır — yani şema kod ile birebir doğrulanmıştır.

<img width="1104" height="750" alt="Ekran Resmi 2026-07-04 10 30 11" src="https://github.com/user-attachments/assets/336c95cc-b0e5-4f4b-9801-77939c22e647" />

**Kapsanan akışlar:**
1. **Kimlik Doğrulama & Onboarding** — Login → SignIn/SignUp → SkinType → SkinConditions → MainTabs
2. **Ürün Tarama & Dolaba Ekleme** — Home → Scanner (Barkod | Fotoğraf) → `productService.scanProduct()` → ProductReview → MainTabs; ayrıca Home → ProductDetail
3. **Profil Düzenleme & Çıkış** — Profile → Login (çıkış) veya Profile → SkinType → SkinConditions → MainTabs (cilt tipini düzenleme)

> Not: `Routine`, `SkinAnalysis`, `ProgressEntry` ekranları henüz kodda olmadığı için bu şemaya dahil edilmedi. Sprint 2–3'te bu ekranlar geliştirildiğinde şema güncellenmelidir.


## 📌 Sprint - 1

### Sprint 1 Kapsamında Tamamlananlar

- **Mobil İskelet ve Mimari:** React Native, Expo (SDK 54) ve TypeScript ortamı başarıyla ayağa kaldırıldı. Projenin ölçeklenebilir olması adına `src/` altında `screens`, `navigation`, `services` ve `context` katmanları oluşturuldu.
- **UI/UX Tasarımı ve Ekran Geliştirmeleri:** Kullanıcı deneyimini (UX) ön planda tutan modern, temiz ve tutarlı bir arayüz dili oluşturularak uygulamanın tüm ana akış tasarımları tamamlandı.
- **Kritik Hata Çözümleri:** Form ekranlarında klavye odaklanma problemleri (`keyboardShouldPersistTaps`) ve butonların üst üste binerek tıklama kaçırma sorunları (`pointerEvents`) tamamen optimize edildi.

**Backlog düzeni ve Story seçimleri:** Backlog'umuz story bazında düzenlenmiştir. Notion üzerindeki Product Backlog'da 22 kart bulunmaktadır: User Story & Analiz, UI/UX Tasarımı, Authentication, Cilt Profili Modülü, Ürün Yönetimi, Ingredient Analyzer Agent, Compatibility Checker Agent, Recommendation Agent, Routine Planner Agent, AI Chat, Analiz Sonucu, Geçmiş Analizler, Bildirimler, Backend, Database, AI Servisleri, Mobil, Deployment, Test, Dokümantasyon, Sunum, Opsiyonel Özellikler.


---

### Uygulama Ekranları ve Akış Açıklamaları

Uygulamanın arayüz mimarisi ve kullanıcı akışları mantıksal modüllere ayrılarak geliştirilmiştir:

#### 1. Giriş ve Hesap Oluşturma Akışı

Kullanıcıların uygulamaya güvenli bir şekilde dahil olmasını, cilt tipi ve özel hassasiyetlerini (alerjenler, özel durumlar) belirleyerek kişiselleştirilmiş bir deneyim başlatmasını sağlayan onboarding adımlarıdır.

<img src="assets/screenshots/giris.png" width="200"> <img src="assets/screenshots/hesap_olustur.png" width="200"> <img src="assets/screenshots/cilt_tip.png" width="200">
<img src="assets/screenshots/giris2.png" width="200"> <img src="assets/screenshots/ozel_durum.png" width="200"> <img src="assets/screenshots/ozel_durum2.png" width="200">

- **Açıklama:** Kullanıcı kayıt aşamasında sadece temel bilgilerini değil; hamilelik, emzirme veya belirli içerik hassasiyetlerini (parfüm, alkol vb.) sisteme işleyerek yapay zeka analiz motoruna temel girdi sağlar.

---

#### 2. Yapay Zeka (AI) Analiz ve Tarama Akışı

Kullanıcıların kamera veya galeri aracılığıyla cilt fotoğraflarını yükledikleri ya da kozmetik ürün barkodlarını taratarak Gemini 2.5 Flash motoru üzerinden içerik analizi aldıkları merkez modüldür.

|                     AI Cilt Analizi                      |                    Barkod Tarayıcı                    |                     Fotoğraf Çekim                      |
| :------------------------------------------------------: | :---------------------------------------------------: | :-----------------------------------------------------: |
| <img src="assets/screenshots/ai_analiz.png" width="200"> | <img src="assets/screenshots/barkod.png" width="200"> | <img src="assets/screenshots/foto_cek.png" width="200"> |

- **Açıklama:** Canlı kamera entegrasyonu ve tarama animasyonları ile desteklenen bu modül, kullanıcının anlık girdi göndermesini kolaylaştıracak şekilde tasarlanmıştır.

---

#### 3. Dijital Dolap ve Ürün Yönetimi Akışı

Kullanıcıların ellerindeki kozmetik ürünleri dijital ortama aktardıkları, rutinlerini yönettikleri ve ürünlerin detaylı içerik analiz raporlarını inceledikleri yönetim panelidir.

|                   Dijital Dolabım                    |                    Ürün Detay & Analiz                     |                   Ürün Ekleme (Arama)                    |                     Ürün Detay Girişi                     |
| :--------------------------------------------------: | :--------------------------------------------------------: | :------------------------------------------------------: | :-------------------------------------------------------: |
| <img src="assets/screenshots/dolab.png" width="180"> | <img src="assets/screenshots/dolab_detay.png" width="180"> | <img src="assets/screenshots/urun_ekle.png" width="180"> | <img src="assets/screenshots/urun_ekle2.png" width="180"> |

- **Açıklama:** Kullanıcılar dolaplarındaki ürünlerin içeriklerinin kendi cilt tiplerine (Örn: Niasinamid %10 + Çinko %1) uygun olup olmadığını, komedojenik risk durumlarını ve özel hassasiyetleriyle çakışıp çakışmadığını görebilirler.

---

#### 4. Profil ve Ayarlar

|                                   Kullanıcı Profili                                   |
| :-----------------------------------------------------------------------------------: |
|                 <img src="assets/screenshots/profil.png" width="200">                 |
| Cilt profili güncellenmesi, hesap ayarları ve bildirim yönetiminin yapıldığı alandır. |

---
