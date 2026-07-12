package com.skinshelf.backend.service;

import com.skinshelf.backend.entity.Product;
import com.skinshelf.backend.entity.SkinLog;
import com.skinshelf.backend.entity.UserProfile;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

/**
 * Shelly'nin merkezi system prompt'u, kullanıcı context'i ve mod algılama mantığı.
 * Her Gemini isteği bu servis üzerinden hazırlanır.
 */
@Service
public class ShellyPromptService {

    /** Shelly'nin yanıt modları. */
    public enum ShellyMode {
        PRODUCT_ANALYSIS,
        ROUTINE_CHECK,
        INGREDIENT_ANALYSIS,
        SKIN_REACTION,
        WEEKLY_PLAN,
        SKIN_PHOTO_ANALYSIS,
        GENERAL_CHAT
    }

    private final IngredientKnowledgeBase knowledgeBase;

    public ShellyPromptService(IngredientKnowledgeBase knowledgeBase) {
        this.knowledgeBase = knowledgeBase;
    }

    public static final String SYSTEM_PROMPT = """
            Sen SkinShelf uygulamasindaki Shelly adli yapay zeka cilt bakim asistanisin.
            Gorevin: kullanicinin cilt bakim urunlerini, iceriklerini, rutinini ve cilt hedefini yorumlamak.

            Kurallar:
            - Dermatolog degilsin, teshis koymazsin.
            - "Sende egzama var", "rozasea olmussun", "aknen var" gibi kesin hastalik cumleleri kurmazsin.
              Bunun yerine "kizariklik gorunumu", "kuruluk/pullanma gorunumu", "sivilce benzeri gorunum",
              "tahris ihtimali", "hassasiyet belirtisi olabilir" gibi gorunum dili kullanirsin.
            - Receteli ilac, antibiyotik, izotretinoin, tretinoin, kortizon vb. tedavi onermezsin.
            - Ciddi yanma, sislik, su toplama, acik yara, goz cevresi reaksiyon, enfeksiyon suphesi gibi
              durumlarda dermatologa veya saglik profesyoneline yonlendirirsin.
            - Cevaplarin kisa, samimi, guven veren ve uygulanabilir olsun. Korkutucu degil, yonlendirici konus.
            - Kesin ifadeler yerine "olabilir", "risk olusturabilir", "dikkat etmek iyi olur" gibi guvenli dil kullan.
            - Urunleri ilac gibi sunma. Urun onerirken marka dayatma; once icerik/kategori oner.
            - Aktif icerik cakismalarini kontrol et.
            - SPF eksikse ozellikle retinol, AHA/BHA ve C vitamini kullaniminda hatirlat.
            - Yanitini su mantikta kur: 1) kisa degerlendirme 2) neden 3) ne yapabilirsin 4) dikkat.
            - Turkce yanit ver.
            """;

    public String buildChatPrompt(
            ShellyMode mode,
            UserProfile profile,
            List<Product> products,
            List<SkinLog> recentLogs,
            String userMessage) {
        return SYSTEM_PROMPT
                + "\n" + knowledgeBase.asPromptSection()
                + "\n" + modeInstruction(mode)
                + "\nCevabi YALNIZCA su JSON semasiyla don:\n"
                + """
                {
                  "intentType": "INFO|ISSUE",
                  "detectedIssue": "string veya null",
                  "title": "Shelly'nin Yorumu",
                  "summary": "kisa degerlendirme",
                  "reason": "neden",
                  "suggestion": "ne yapabilirsin",
                  "warning": "dikkat (yoksa bos string)",
                  "riskLevel": "low|medium|high",
                  "tags": ["kisa etiketler"]
                }
                """
                + "\n" + buildUserContext(profile, products, recentLogs)
                + "\nKullanici mesaji:\n" + userMessage;
    }

    public String buildSkinPhotoPrompt(
            UserProfile profile,
            List<Product> products,
            List<SkinLog> recentLogs,
            String skinFeeling,
            Boolean usedNewProduct,
            String userNote) {
        return SYSTEM_PROMPT
                + "\n" + knowledgeBase.asPromptSection()
                + "\n" + modeInstruction(ShellyMode.SKIN_PHOTO_ANALYSIS)
                + "\nCevabi YALNIZCA su JSON semasiyla don:\n"
                + """
                {
                  "title": "Shelly'nin Cilt Yorumu",
                  "summary": "kisa ve kisisel yorum",
                  "visibleChanges": {
                    "redness": "low|medium|high|unknown",
                    "dryness": "low|medium|high|unknown",
                    "oiliness": "low|medium|high|unknown",
                    "blemishAppearance": "low|medium|high|unknown",
                    "irritationAppearance": "low|medium|high|unknown"
                  },
                  "routineConnection": "rutin ve urunlerle olasi baglanti (kesin konusma)",
                  "suggestion": "bugunku oneri",
                  "warning": "dikkat notu",
                  "riskLevel": "low|medium|high",
                  "tags": ["kisa etiketler"]
                }
                """
                + "\n" + buildUserContext(profile, products, recentLogs)
                + "\nBugunku gunluk:\n"
                + "- Cilt hissi: " + value(skinFeeling) + "\n"
                + "- Son 24 saatte yeni urun: " + (Boolean.TRUE.equals(usedNewProduct) ? "Evet" : "Hayir") + "\n"
                + "- Kullanici notu: " + value(userNote) + "\n"
                + "\nFotograftaki cilt gorunumunu degerlendir. Teshis koyma; yalnizca gorunum dili kullan.";
    }

    public ShellyMode detectMode(String message) {
        String normalized = message == null ? "" : message.toLowerCase(Locale.forLanguageTag("tr-TR"));

        if (containsAny(normalized, "tepki", "kızardı", "kızarıklık", "yandı", "sivilce çıktı", "pullan", "kaşın")) {
            return ShellyMode.SKIN_REACTION;
        }
        if (containsAny(normalized, "birlikte kullanılır", "içerik analizi", "içerik listesi", "inci", "bu iki ürün")) {
            return ShellyMode.INGREDIENT_ANALYSIS;
        }
        if (containsAny(normalized, "haftalık plan", "haftalık rutin", "haftaya yay")) {
            return ShellyMode.WEEKLY_PLAN;
        }
        if (containsAny(normalized, "yeni ürün", "eklediğim ürün", "bu ürün", "uygun mu")) {
            return ShellyMode.PRODUCT_ANALYSIS;
        }
        if (containsAny(normalized, "rutin", "sabah", "akşam", "sıra", "ağır mı")) {
            return ShellyMode.ROUTINE_CHECK;
        }
        return ShellyMode.GENERAL_CHAT;
    }

    private String modeInstruction(ShellyMode mode) {
        return switch (mode) {
            case PRODUCT_ANALYSIS -> "Mod: PRODUCT_ANALYSIS. Kullanicinin sordugu urunun rafiyla ve cilt hedefiyle uyumuna odaklan; kullanim zamani ve olasi cakismalari belirt.";
            case ROUTINE_CHECK -> "Mod: ROUTINE_CHECK. Sabah/aksam rutin sirasini, adim yogunlugunu ve SPF durumunu degerlendir; gerekiyorsa sadelestirme oner.";
            case INGREDIENT_ANALYSIS -> "Mod: INGREDIENT_ANALYSIS. Icerik listesini bilgi tabanindaki kurallarla karsilastir; cakisma ve eslesmeleri acikca yaz.";
            case SKIN_REACTION -> "Mod: SKIN_REACTION. Olasi tetikleyicileri rutin ve son urunlerle iliskilendir; sakinlestirici sade bir plan oner; intentType'i ISSUE yap ve detectedIssue alanini doldur.";
            case WEEKLY_PLAN -> "Mod: WEEKLY_PLAN. Aktif icerikleri haftaya dengeli yay; retinol ve peeling gecelerini ayir; SPF hatirlat.";
            case SKIN_PHOTO_ANALYSIS -> "Mod: SKIN_PHOTO_ANALYSIS. Fotograftaki gorunumu yalnizca gorunum diliyle degerlendir; rutin ve son cilt kayitlariyla olasi baglantiyi kur; kesin konusma.";
            case GENERAL_CHAT -> "Mod: GENERAL_CHAT. Genel cilt bakim sorusunu kullanicinin profili ve rafi baglaminda yanitla.";
        };
    }

    /** Kullanıcı context'ini prompt'a eklenecek okunabilir JSON benzeri blok olarak hazırlar. */
    public String buildUserContext(UserProfile profile, List<Product> products, List<SkinLog> recentLogs) {
        StringBuilder builder = new StringBuilder("Kullanici context'i:\n");

        builder.append("userProfile:\n");
        if (profile == null) {
            builder.append("- (profil bulunamadi)\n");
        } else {
            builder.append("- skinType: ").append(value(profile.getSkinTypeGuess())).append('\n');
            builder.append("- sensitivityLevel: ").append(value(profile.getSensitivity())).append('\n');
            builder.append("- mainGoal: ").append(value(profile.getMainGoal())).append('\n');
            builder.append("- experienceLevel: ").append(value(profile.getExperience())).append('\n');
            builder.append("- ageRange: ").append(value(profile.getAgeRange())).append('\n');
            builder.append("- reactionHistory: ").append(value(profile.getReactionHistory())).append('\n');
        }

        builder.append("userProducts:\n");
        if (products == null || products.isEmpty()) {
            builder.append("- (raf bos)\n");
        } else {
            products.stream().limit(15).forEach(product -> builder
                    .append("- ").append(value(product.getBrand())).append(' ').append(value(product.getName()))
                    .append(" | kategori: ").append(value(product.getCategory()))
                    .append(" | kullanim: ").append(value(product.getTimeOfDay()))
                    .append(" | icerikler: ").append(product.getActiveIngredients() == null ? "[]" : product.getActiveIngredients())
                    .append('\n'));
        }

        builder.append("routines:\n");
        builder.append("- sabah: ").append(routineSteps(products, "morning")).append('\n');
        builder.append("- aksam: ").append(routineSteps(products, "evening")).append('\n');

        builder.append("recentSkinLogs:\n");
        if (recentLogs == null || recentLogs.isEmpty()) {
            builder.append("- (kayit yok)\n");
        } else {
            recentLogs.stream().limit(7).forEach(skinLog -> builder
                    .append("- ").append(skinLog.getCreatedAt() == null ? "" : skinLog.getCreatedAt().toLocalDate())
                    .append(" | his: ").append(value(skinLog.getSkinFeeling()))
                    .append(" | kuruluk: ").append(value(skinLog.getDrynessLevel()))
                    .append(" | kizariklik: ").append(value(skinLog.getRednessLevel()))
                    .append(" | yaglanma: ").append(value(skinLog.getOilinessLevel()))
                    .append(" | sivilce: ").append(value(skinLog.getBlemishLevel()))
                    .append(" | not: ").append(value(skinLog.getUserNote()))
                    .append('\n'));
        }

        return builder.toString();
    }

    private String routineSteps(List<Product> products, String slot) {
        if (products == null || products.isEmpty()) {
            return "[]";
        }
        List<String> steps = products.stream()
                .filter(product -> slot.equals(product.getTimeOfDay()) || "both".equals(product.getTimeOfDay()))
                .limit(10)
                .map(product -> value(product.getCategory()) + " (" + value(product.getName()) + ")")
                .toList();
        return steps.isEmpty() ? "[]" : String.join(" -> ", steps);
    }

    private boolean containsAny(String text, String... terms) {
        for (String term : terms) {
            if (text.contains(term)) {
                return true;
            }
        }
        return false;
    }

    private String value(String value) {
        return value == null || value.isBlank() ? "-" : value.trim();
    }
}
