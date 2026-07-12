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
        // Güvenlik filtresi: riskli semptomlarda model yanıtını beklemeden yönlendir.
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

        if (geminiApiClient.isConfigured()) {
            UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
            List<Product> products = productRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            List<SkinLog> recentLogs = skinLogRepository.findTop30ByUserOrderByCreatedAtDesc(user);

            String fullPrompt = shellyPromptService.buildChatPrompt(mode, profile, products, recentLogs, prompt);
            var json = geminiApiClient.generateJson(fullPrompt);
            if (json.isPresent()) {
                return parseGeminiResponse(json.get(), mode);
            }
        }

        return buildFallbackResponse(prompt, mode);
    }

    private AssistantChatResponse parseGeminiResponse(JsonNode json, ShellyMode mode) {
        String intentType = json.path("intentType").asText("INFO").equals("ISSUE") ? "ISSUE" : "INFO";
        String detectedIssue = json.path("detectedIssue").isNull() ? null : blankToNull(json.path("detectedIssue").asText(null));
        String summary = json.path("summary").asText("").trim();
        String reason = json.path("reason").asText("").trim();
        String suggestion = json.path("suggestion").asText("").trim();
        String warning = json.path("warning").asText("").trim();
        String riskLevel = normalizeRisk(json.path("riskLevel").asText("low"));
        String title = json.path("title").asText("Shelly'nin Yorumu").trim();

        if (summary.isBlank()) {
            return buildFallbackResponse("rutin", mode);
        }

        List<String> tags = new ArrayList<>();
        json.path("tags").forEach(tag -> {
            String value = tag.asText("").trim();
            if (!value.isBlank() && tags.size() < 5) {
                tags.add(value);
            }
        });

        String aiResponse = composePlainText(summary, reason, suggestion, warning);

        return new AssistantChatResponse(
                intentType,
                detectedIssue,
                aiResponse,
                mode.name(),
                title,
                summary,
                blankToNull(reason),
                blankToNull(suggestion),
                blankToNull(warning),
                riskLevel,
                tags);
    }

    private String composePlainText(String summary, String reason, String suggestion, String warning) {
        StringBuilder builder = new StringBuilder(summary);
        if (!reason.isBlank()) {
            builder.append('\n').append(reason);
        }
        if (!suggestion.isBlank()) {
            builder.append('\n').append(suggestion);
        }
        if (!warning.isBlank()) {
            builder.append('\n').append(warning);
        }
        return builder.toString();
    }

    private AssistantChatResponse buildFallbackResponse(String prompt, ShellyMode mode) {
        String normalized = prompt.toLowerCase(Locale.forLanguageTag("tr-TR"));

        if (mode == ShellyMode.SKIN_REACTION
                || normalized.contains("kızarıklık") || normalized.contains("tepki") || normalized.contains("kızardı")) {
            return new AssistantChatResponse(
                    "ISSUE",
                    "Kızarıklık",
                    "Cildindeki kızarıklık görünümünü algıladım. Bu geçici hassasiyet veya tahriş ihtimali olabilir. "
                            + "Güvenli modda agresif aktifleri durdurup bariyer destekli, sade bir rutine geçmeni öneririm.",
                    mode.name(),
                    "Shelly'nin Yorumu",
                    "Cildinde kızarıklık görünümü ve hassasiyet belirtisi olabilir.",
                    "Aktif içerikler (retinol, asitler) veya yeni bir ürün geçici tahriş ihtimali oluşturmuş olabilir.",
                    "Birkaç gün rutini sade tut: nazik temizleyici, bariyer destekli nemlendirici ve gündüz SPF.",
                    "Şiddetli yanma, şişlik veya su toplama olursa dermatoloğa danışman daha güvenli olur.",
                    "medium",
                    List.of("Hassasiyet", "Bariyer desteği"));
        }

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
                "Anladığım kadarıyla: " + prompt + ". Rafındaki ürünlere göre en güvenli yaklaşım rutini sade tutmak, "
                        + "yeni ürünleri tek tek eklemek ve beklenmeyen reaksiyonda aktifleri geçici olarak durdurmaktır.",
                mode.name(),
                "Shelly'nin Yorumu",
                "Sorunu rafındaki ürünler ve profilin üzerinden değerlendirdim.",
                "Yeni değişkenleri tek tek eklemek, olası tepkinin kaynağını ayırt etmeyi kolaylaştırır.",
                "Rutini sade tut; yeni ürünleri tek tek ekle ve cilt tepkisini gözlemle.",
                "Beklenmeyen reaksiyonda aktifleri geçici olarak durdur.",
                "low",
                List.of("Genel"));
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
