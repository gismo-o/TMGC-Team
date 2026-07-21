package com.skinshelf.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.skinshelf.backend.dto.AssistantChatRequest;
import com.skinshelf.backend.dto.AssistantChatResponse;
import com.skinshelf.backend.dto.AssistantMessageResponse;
import com.skinshelf.backend.entity.AssistantMessage;
import com.skinshelf.backend.entity.Product;
import com.skinshelf.backend.entity.SkinLog;
import com.skinshelf.backend.entity.User;
import com.skinshelf.backend.entity.UserProfile;
import com.skinshelf.backend.repository.AssistantMessageRepository;
import com.skinshelf.backend.repository.ProductRepository;
import com.skinshelf.backend.repository.SkinLogRepository;
import com.skinshelf.backend.repository.UserProfileRepository;
import com.skinshelf.backend.service.ShellyPromptService.ShellyMode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AssistantService {

    private final AssistantMessageRepository assistantMessageRepository;
    private final GeminiApiClient geminiApiClient;
    private final ProductRepository productRepository;
    private final UserProfileRepository userProfileRepository;
    private final SkinLogRepository skinLogRepository;
    private final ShellyPromptService shellyPromptService;
    private final SafetyGuard safetyGuard;
    private final IngredientKnowledgeBase knowledgeBase;

    public AssistantService(
            AssistantMessageRepository assistantMessageRepository,
            GeminiApiClient geminiApiClient,
            ProductRepository productRepository,
            UserProfileRepository userProfileRepository,
            SkinLogRepository skinLogRepository,
            ShellyPromptService shellyPromptService,
            SafetyGuard safetyGuard,
            IngredientKnowledgeBase knowledgeBase) {
        this.assistantMessageRepository = assistantMessageRepository;
        this.geminiApiClient = geminiApiClient;
        this.productRepository = productRepository;
        this.userProfileRepository = userProfileRepository;
        this.skinLogRepository = skinLogRepository;
        this.shellyPromptService = shellyPromptService;
        this.safetyGuard = safetyGuard;
        this.knowledgeBase = knowledgeBase;
    }

    public AssistantChatResponse chat(User user, AssistantChatRequest request) {
        String prompt = request.getMessage().trim();
        AssistantChatResponse response = buildResponse(user, prompt);

        AssistantMessage message = new AssistantMessage();
        message.setUser(user);
        message.setPrompt(prompt);
        message.setIntentType(response.getIntentType());
        message.setDetectedIssue(response.getDetectedIssue());
        message.setAiResponse(response.getAiResponse());
        assistantMessageRepository.save(message);

        return response;
    }

    @Transactional(readOnly = true)
    public List<AssistantMessageResponse> history(User user) {
        return assistantMessageRepository.findTop50ByUserOrderByCreatedAtDesc(user).stream()
                .sorted(Comparator.comparing(AssistantMessage::getCreatedAt))
                .map(AssistantMessageResponse::from)
                .toList();
    }

    private AssistantChatResponse buildResponse(User user, String prompt) {
        // GÜVENLİK FİLTRESİ: Acil durumlarda doğrudan yönlendir
        if (safetyGuard.isRisky(prompt)) {
            return new AssistantChatResponse(
                    "ISSUE",
                    "Riskli belirti",
                    SafetyGuard.SAFE_REFERRAL_MESSAGE,
                    ShellyMode.SKIN_REACTION.name(),
                    "Önce Güvenliğin",
                    SafetyGuard.SAFE_REFERRAL_MESSAGE,
                    "Tarif ettiğin belirti, uygulama üzerinden değerlendirilemeyecek kadar ciddi olabilir.",
                    "Ürün kullanımını durdur ve bir sağlık profesyoneline danış.",
                    "Belirtiler artarsa vakit kaybetme.",
                    "high",
                    List.of("Dermatolog", "Güvenlik"));
        }

        ShellyMode mode = shellyPromptService.detectMode(prompt);
        boolean rateLimited = false;

        if (geminiApiClient.isConfigured()) {
            UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);

            // Kullanıcının rafındaki en güncel 15 ürünü her zaman yapay zekaya besliyoruz!
            List<Product> products = productRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                    .limit(15)
                    .filter(p -> p.getIsActive() == null || p.getIsActive()) // SADECE AKTİF (is_active = true) ÜRÜNLERİ
                                                                             // AI'A GÖNDER!
                    .toList();

            List<SkinLog> recentLogs = skinLogRepository.findTop30ByUserOrderByCreatedAtDesc(user);

            // Sohbet geçmişini (hafıza) çekiyoruz
            List<AssistantMessage> recentChats = assistantMessageRepository.findTop50ByUserOrderByCreatedAtDesc(user);
            List<AssistantMessage> lastMessages = recentChats.stream()
                    .limit(6)
                    .sorted(Comparator.comparing(AssistantMessage::getCreatedAt))
                    .toList();

            String fullPrompt = shellyPromptService.buildChatPrompt(profile, products, recentLogs, lastMessages,
                    prompt);

            var result = geminiApiClient.generateJsonWithStatus(
                    fullPrompt, null, null, shellyPromptService.buildChatResponseSchema());
            if (result.json().isPresent()) {
                return parseGeminiResponse(result.json().get(), products);
            }
            rateLimited = result.isRateLimited();
        }

        List<Product> fallbackProducts = productRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        AssistantChatResponse fallback = buildFallbackResponse(prompt, mode, fallbackProducts);
        return rateLimited ? withBusyNotice(fallback) : fallback;
    }

    private static final String BUSY_NOTICE = "Shelly şu an çok yoğun; bu, rafına göre hazırlanmış hızlı bir ön değerlendirme. "
            + "Birazdan tekrar sorarsan daha detaylı yorum yapabilirim.";

    private AssistantChatResponse withBusyNotice(AssistantChatResponse fallback) {
        List<String> tags = new ArrayList<>();
        tags.add("Shelly yoğun");
        tags.addAll(fallback.getTags());

        return new AssistantChatResponse(
                fallback.getIntentType(),
                fallback.getDetectedIssue(),
                BUSY_NOTICE + "\n" + fallback.getAiResponse(),
                fallback.getMode(),
                fallback.getTitle(),
                BUSY_NOTICE + " " + fallback.getSummary(),
                fallback.getReason(),
                fallback.getSuggestion(),
                fallback.getWarning(),
                fallback.getRiskLevel(),
                tags);
    }

    private AssistantChatResponse parseGeminiResponse(JsonNode json, List<Product> products) {
        String intentType = json.path("intentType").asText("INFO").equals("ISSUE") ? "ISSUE" : "INFO";
        String detectedIssue = json.path("detectedIssue").isNull() ? null
                : blankToNull(json.path("detectedIssue").asText(null));
        String title = json.path("title").asText("Shelly'nin Yorumu").trim();
        String summary = json.path("summary").asText("").trim();
        String analysis = json.path("analysis").asText("").trim();

        String detectedMode = json.path("mode").asText("GENERAL_CHAT").toUpperCase(Locale.ROOT);

        // Önerilen ürünleri veritabanı ID'leri ile doğrularken, kontrol için bir
        // listeye de ekliyoruz
        List<Product> recommendedList = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        json.path("recommendedProducts").forEach(node -> {
            Long id = node.path("id").asLong();
            String reason = node.path("reason").asText("");
            products.stream()
                    .filter(p -> p.getId().equals(id))
                    .findFirst()
                    .ifPresent(p -> {
                        recommendations.add("Önerilen: " + p.getBrand() + " " + p.getName() + " -> " + reason);
                        recommendedList.add(p); // Doğrulanan ürünü güvenlik listesine ekle
                    });
        });

        List<String> avoids = new ArrayList<>();
        json.path("avoidProducts").forEach(node -> {
            Long id = node.path("id").asLong();
            String reason = node.path("reason").asText("");
            products.stream()
                    .filter(p -> p.getId().equals(id))
                    .findFirst()
                    .ifPresent(p -> avoids.add("Kaçın: " + p.getBrand() + " " + p.getName() + " -> " + reason));
        });

        List<String> followUps = new ArrayList<>();
        json.path("followUpQuestions").forEach(q -> {
            String question = q.asText("").trim();
            if (!question.isBlank() && followUps.size() < 3) {
                followUps.add(question);
            }
        });

        String warning = json.path("warning").asText("").trim();
        String riskLevel = normalizeRisk(json.path("riskLevel").asText("low"));

        boolean hasRetinoid = false;
        boolean hasAcidOrPeroxide = false;
        String clashingProductName = "";

        for (Product p : recommendedList) {
            if (p.getActiveIngredients() == null)
                continue;
            String ingredientsText = String.join(" ", p.getActiveIngredients())
                    .toLowerCase(Locale.forLanguageTag("tr-TR"));

            if (matchesAny(ingredientsText, List.of("retinol", "retinal", "retinoid", "tretinoin"))) {
                hasRetinoid = true;
            }
            if (matchesAny(ingredientsText, List.of("salicylic", "salisilik", "bha", "glycolic", "glikolik", "lactic",
                    "laktik", "benzoyl", "benzoil"))) {
                hasAcidOrPeroxide = true;
                clashingProductName = p.getBrand() + " " + p.getName();
            }
        }

        // Eğer yapay zekâ aynı anda hem retinol hem de asit/peroksit önerdiyse, cevabı
        // sabote edip düzeltiyoruz!
        if (hasRetinoid && hasAcidOrPeroxide) {
            warning = "Shelly Güvenlik Uyarısı: Önerilen ürünleriniz arasında Retinol ve güçlü aktifler (Asit/Akne ürünü: "
                    + clashingProductName
                    + ") bulunmaktadır. Cilt bariyerinizin zarar görmemesi için bu ürünleri kesinlikle aynı gece üst üste kullanmayın, farklı günlere dağıtın.";
            riskLevel = "medium";
            intentType = "ISSUE";
        }

        List<String> tags = new ArrayList<>();
        json.path("tags").forEach(tag -> {
            String value = tag.asText("").trim();
            if (!value.isBlank() && tags.size() < 5) {
                tags.add(value);
            }
        });

        StringBuilder fullAiResponse = new StringBuilder();
        fullAiResponse.append(summary).append("\n\nAnaliz:\n").append(analysis);
        if (!recommendations.isEmpty()) {
            fullAiResponse.append("\n\n👍 Önerilen Ürünler:\n").append(String.join("\n", recommendations));
        }
        if (!avoids.isEmpty()) {
            fullAiResponse.append("\n\n⚠️ Kaçınılması Gerekenler:\n").append(String.join("\n", avoids));
        }
        if (!followUps.isEmpty()) {
            fullAiResponse.append("\n\n💬 Shelly'nin Sorusu:\n").append(String.join("\n", followUps));
        }
        if (!warning.isBlank()) {
            fullAiResponse.append("\n\n⚠️ Uyarı:\n").append(warning);
        }

        return new AssistantChatResponse(
                intentType,
                detectedIssue,
                fullAiResponse.toString(),
                detectedMode,
                title,
                summary,
                blankToNull(analysis),
                blankToNull(String.join(", ", recommendations)),
                blankToNull(warning),
                riskLevel,
                tags);
    }

    private AssistantChatResponse buildFallbackResponse(String prompt, ShellyMode mode, List<Product> products) {
        String normalized = prompt.toLowerCase(Locale.forLanguageTag("tr-TR"));

        Map<String, List<String>> matchedRules = knowledgeBase.matchRules(normalized);
        if (mode == ShellyMode.INGREDIENT_ANALYSIS || !matchedRules.isEmpty()) {
            String rulesText = matchedRules.isEmpty()
                    ? "Asit, retinoid veya benzoil peroksit gibi güçlü aktifler varsa aynı rutinde üst üste kullanmak yerine sabah/akşam veya farklı günlere ayır."
                    : matchedRules.entrySet().stream()
                            .map(entry -> entry.getKey() + ": " + String.join(" ", entry.getValue()))
                            .reduce((a, b) -> a + " " + b)
                            .orElse("");
            return new AssistantChatResponse(
                    "INFO",
                    null,
                    "İçerik uyumu için önce aktif yoğunluğuna bakmak gerekir. " + rulesText,
                    mode.name(),
                    "İçerik Analizi",
                    "İçerikleri bilgi tabanımdaki kurallarla karşılaştırdım.",
                    rulesText,
                    "Güçlü aktifleri farklı zaman dilimlerine ayırıp toleransı kademeli test et.",
                    "Hassasiyet hissedersen kullanım sıklığını azalt.",
                    "low",
                    List.of("Aktif içerik"));
        }

        if (mode == ShellyMode.ROUTINE_CHECK || mode == ShellyMode.WEEKLY_PLAN
                || normalized.contains("rutin") || normalized.contains("ağır")) {
            return new AssistantChatResponse(
                    "INFO",
                    null,
                    "Rutinini dengede tutmak için temizleyici, nemlendirici ve gündüz SPF temelini koru. "
                            + "Aktif içerikleri cilt toleransına göre haftaya yaymak genelde daha güvenlidir.",
                    mode.name(),
                    "Rutin Kontrolü",
                    "Rutinin temel adımları üzerinden hızlı bir kontrol yaptım.",
                    "Aynı rutinde birden fazla güçlü aktif, tahriş ihtimalini artırabilir.",
                    "Temizleyici + nemlendirici + SPF temelini koru; aktifleri farklı günlere yay.",
                    "Retinol ve peeling gecelerini ayırmak iyi olur.",
                    "low",
                    List.of("Rutin", "SPF"));
        }

        return new AssistantChatResponse(
                "INFO",
                null,
                "Sorunu rafındaki ürünler üzerinden değerlendirdim. En güvenli yaklaşım rutini sade tutmak, "
                        + "yeni ürünleri tek tek eklemek ve beklenmeyen reaksiyonda aktifleri geçici olarak durdurmaktır.",
                mode.name(),
                "Shelly'nin Yorumu",
                "Sorunu rafındaki ürünler ve profilin üzerinden değerlendirdim.",
                "Yeni değişkenleri tek tek eklemek, olası tepkinin kaynağını ayırt etmeyi kolaylaştırır.",
                "Rutini sade tut; yeni ürünleri tek tek ekle ve cilt tepkisini gözlemle. Yapay zeka servisleri geçici olarak yoğun olduğundan statik modda yanıt veriyorum.",
                "Beklenmeyen reaksiyonda aktifleri geçici olarak durdur.",
                "low",
                List.of("Genel"));
    }

    private String productSearchText(Product product) {
        StringBuilder builder = new StringBuilder();
        builder.append(product.getBrand()).append(' ')
                .append(product.getName()).append(' ')
                .append(product.getCategory()).append(' ');
        if (product.getDescription() != null) {
            builder.append(product.getDescription()).append(' ');
        }
        if (product.getActiveIngredients() != null) {
            builder.append(String.join(" ", product.getActiveIngredients()));
        }
        return builder.toString().toLowerCase(Locale.forLanguageTag("tr-TR"));
    }

    private boolean matchesAny(String text, List<String> terms) {
        return terms.stream().anyMatch(text::contains);
    }

    private String normalizeRisk(String risk) {
        return switch (risk == null ? "" : risk.trim().toLowerCase(Locale.ROOT)) {
            case "high" -> "high";
            case "medium" -> "medium";
            default -> "low";
        };
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}