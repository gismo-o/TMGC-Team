package com.skinshelf.backend.service;

import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Shelly'nin aktif içerik bilgi tabanı.
 * Gemini prompt'una doğrulanmış kurallar olarak eklenir; fallback yanıtlarında da kullanılır.
 */
@Component
public class IngredientKnowledgeBase {

    public record IngredientRule(String name, List<String> aliases, List<String> facts) {
        boolean matches(String text) {
            String lower = text.toLowerCase(Locale.forLanguageTag("tr-TR"));
            if (lower.contains(name.toLowerCase(Locale.forLanguageTag("tr-TR")))) {
                return true;
            }
            return aliases.stream().anyMatch(alias -> lower.contains(alias.toLowerCase(Locale.forLanguageTag("tr-TR"))));
        }
    }

    private static final List<IngredientRule> RULES = List.of(
            new IngredientRule("retinol", List.of("retinal", "retinoid"), List.of(
                    "Gece kullanılır.",
                    "AHA/BHA ile aynı gece kullanmak tahriş riskini artırır.",
                    "Kullanım döneminde gündüz SPF önemlidir.",
                    "Yeni başlayanlarda haftada 1-2 gece gibi düşük sıklık önerilir.")),
            new IngredientRule("AHA", List.of("glycolic", "glikolik", "lactic", "laktik", "mandelic"), List.of(
                    "Cilt dokusu ve leke görünümü için kullanılır.",
                    "Hassas ciltte tahriş riski vardır.",
                    "Kullanım döneminde SPF önemlidir.",
                    "Retinol ile aynı gece önerilmez.")),
            new IngredientRule("BHA", List.of("salicylic", "salisilik"), List.of(
                    "Yağlanma, siyah nokta ve sivilce benzeri görünüm için kullanılır.",
                    "Kuruluk yapabilir.",
                    "Retinol veya AHA ile aynı rutinde dikkatli olunmalıdır.")),
            new IngredientRule("C vitamini", List.of("vitamin c", "ascorbic", "askorbik"), List.of(
                    "Sabah kullanılabilir.",
                    "SPF ile iyi eşleşir.",
                    "Hassas ciltte iritasyon yapabilir.")),
            new IngredientRule("niacinamide", List.of("niasinamid"), List.of(
                    "Bariyer, yağ dengesi ve kızarıklık görünümü için destekleyicidir.",
                    "Çoğu içerikle uyumludur.")),
            new IngredientRule("hyaluronic acid", List.of("hyaluronik", "hiyalüronik"), List.of(
                    "Nem desteği sağlar.",
                    "Üzerine nemlendirici ile kapatılması önerilir.")),
            new IngredientRule("ceramide", List.of("panthenol", "centella", "madecassoside", "cica"), List.of(
                    "Bariyer destekleyicidir.",
                    "Hassas ciltler için iyi seçeneklerdir.")),
            new IngredientRule("benzoyl peroxide", List.of("benzoil peroksit"), List.of(
                    "Sivilce benzeri görünüm için kullanılır.",
                    "Kurutucu olabilir.",
                    "Retinol ile birlikte kullanırken dikkat edilmelidir.")),
            new IngredientRule("fragrance", List.of("parfum", "parfüm"), List.of(
                    "Hassas ciltte reaksiyon riski oluşturabilir.")),
            new IngredientRule("alcohol denat", List.of("denatured alcohol"), List.of(
                    "Hassas veya kuru ciltte kurutucu olabilir.")));

    /** Bilgi tabanının tamamını prompt'a eklenecek metin olarak döner. */
    public String asPromptSection() {
        StringBuilder builder = new StringBuilder("Aktif icerik kurallari (dogrulanmis bilgi tabani):\n");
        for (IngredientRule rule : RULES) {
            builder.append("- ").append(rule.name()).append(": ")
                    .append(String.join(" ", rule.facts())).append('\n');
        }
        return builder.toString();
    }

    /** Verilen metinde geçen içeriklere ait kuralları döner (fallback yanıtları için). */
    public Map<String, List<String>> matchRules(String text) {
        Map<String, List<String>> matched = new LinkedHashMap<>();
        if (text == null || text.isBlank()) {
            return matched;
        }
        for (IngredientRule rule : RULES) {
            if (rule.matches(text)) {
                matched.put(rule.name(), rule.facts());
            }
        }
        return matched;
    }
}
