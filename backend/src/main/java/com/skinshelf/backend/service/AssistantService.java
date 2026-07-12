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
        List<Product> products = productRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        if (geminiApiClient.isConfigured()) {
            UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
            List<SkinLog> recentLogs = skinLogRepository.findTop30ByUserOrderByCreatedAtDesc(user);

            String fullPrompt = shellyPromptService.buildChatPrompt(mode, profile, products, recentLogs, prompt);
            var json = geminiApiClient.generateJson(fullPrompt);
            if (json.isPresent()) {
                return parseGeminiResponse(json.get(), mode, products);
            }
        }

        return buildFallbackResponse(prompt, mode, products);
    }

    private AssistantChatResponse parseGeminiResponse(JsonNode json, ShellyMode mode, List<Product> products) {
        String intentType = json.path("intentType").asText("INFO").equals("ISSUE") ? "ISSUE" : "INFO";
        String detectedIssue = json.path("detectedIssue").isNull() ? null : blankToNull(json.path("detectedIssue").asText(null));
        String summary = json.path("summary").asText("").trim();
        String reason = json.path("reason").asText("").trim();
        String suggestion = json.path("suggestion").asText("").trim();
        String warning = json.path("warning").asText("").trim();
        String riskLevel = normalizeRisk(json.path("riskLevel").asText("low"));
        String title = json.path("title").asText("Shelly'nin Yorumu").trim();

        if (summary.isBlank()) {
            return buildFallbackResponse("rutin", mode, products);
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

    /** Cilt derdi türleri ve her biri için rafta aranacak destekleyici içerikler. */
    private record ConcernRule(
            String issueLabel,
            List<String> promptTerms,
            List<String> helpfulIngredients,
            String ingredientAdvice,
            String routineAdvice,
            String warning) {
    }

    private static final List<ConcernRule> CONCERN_RULES = List.of(
            new ConcernRule(
                    "Sivilce görünümü",
                    List.of("sivilce", "akne", "siyah nokta", "komedon", "gözenek tıkan"),
                    List.of("salicylic", "salisilik", "bha", "niacinamide", "niasinamid", "benzoyl", "benzoil",
                            "azelaic", "azelaik", "zinc", "çinko", "tea tree", "çay ağacı"),
                    "Sivilce benzeri görünüm için BHA (salisilik asit), niacinamide veya azelaik asit içeren bir ürün rutine eklenebilir.",
                    "Bölgeyi sıkmadan nazik temizleyici + hafif nemlendirici kullan; sabah SPF'i atlama. Aktifi haftada 2-3 gece bölgesel başlatmak daha güvenli.",
                    "Aynı gece retinol/peeling ile üst üste kullanma. Ağrılı, iltihaplı veya yaygınlaşan görünümde dermatoloğa danışmak daha güvenli olur."),
            new ConcernRule(
                    "Kuruluk görünümü",
                    List.of("kuru", "gergin", "pullan", "çatla"),
                    List.of("hyaluronic", "hyaluronik", "hiyalüronik", "ceramide", "seramid", "panthenol",
                            "glycerin", "gliserin", "squalane", "skualan", "urea"),
                    "Kuruluk hissi için hyaluronik asit, seramid veya panthenol içeren nem/bariyer destekli bir ürün iyi gelir.",
                    "Birkaç gün peeling ve güçlü aktiflere ara verip nemlendirici katmanını artır; temizleyicinin köpürtücü/sert olmadığından emin ol.",
                    "Pullanmayla birlikte şiddetli kaşıntı veya çatlama varsa dermatolog kontrolü daha güvenli."),
            new ConcernRule(
                    "Kızarıklık/tahriş görünümü",
                    List.of("kızar", "tahriş", "yandı", "yanıyor", "batma", "hassas", "tepki"),
                    List.of("centella", "cica", "madecassoside", "panthenol", "ceramide", "seramid", "allantoin",
                            "aloe", "oat", "yulaf"),
                    "Kızarıklık görünümünü yatıştırmak için centella (cica), panthenol veya seramid içerikli sakinleştirici bir ürün destek olur.",
                    "2-3 gün tüm aktifleri (retinol, asitler, C vitamini) durdur; sadece nazik temizleyici + yatıştırıcı nemlendirici + SPF kullan.",
                    "Şiddetli yanma, şişlik, su toplama veya göz çevresinde reaksiyon olursa ürünleri bırakıp dermatoloğa danış."),
            new ConcernRule(
                    "Yağlanma görünümü",
                    List.of("yağlan", "parla", "parlama", "sebum"),
                    List.of("niacinamide", "niasinamid", "salicylic", "salisilik", "bha", "zinc", "çinko", "clay", "kil"),
                    "Parlama/yağlanma görünümü için niacinamide veya BHA içeren bir ürün sebum dengesine destek olur.",
                    "Nemlendiriciyi atlamak yağlanmayı artırabilir; hafif, jel bazlı bir nemlendirici ve sabah SPF ile devam et.",
                    "Yağlanmayla birlikte ağrılı sivilce artışı olursa rutini sadeleştirip gözlemlemek iyi olur."));

    private AssistantChatResponse buildFallbackResponse(String prompt, ShellyMode mode, List<Product> products) {
        String normalized = prompt.toLowerCase(Locale.forLanguageTag("tr-TR"));

        // Önce cilt derdini yakala: rafındaki ürünlerden somut öneri kur.
        for (ConcernRule rule : CONCERN_RULES) {
            if (rule.promptTerms().stream().anyMatch(normalized::contains)) {
                return buildConcernResponse(rule, mode, products);
            }
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
                "Sorunu rafındaki ürünler üzerinden değerlendirdim. En güvenli yaklaşım rutini sade tutmak, "
                        + "yeni ürünleri tek tek eklemek ve beklenmeyen reaksiyonda aktifleri geçici olarak durdurmaktır.",
                mode.name(),
                "Shelly'nin Yorumu",
                "Sorunu rafındaki ürünler ve profilin üzerinden değerlendirdim.",
                "Yeni değişkenleri tek tek eklemek, olası tepkinin kaynağını ayırt etmeyi kolaylaştırır.",
                "Rutini sade tut; yeni ürünleri tek tek ekle ve cilt tepkisini gözlemle. Derdini biraz daha detaylı yazarsan (ör. \"yanaklarımda sivilce çıktı\") daha net öneri verebilirim.",
                "Beklenmeyen reaksiyonda aktifleri geçici olarak durdur.",
                "low",
                List.of("Genel"));
    }

    /** Rafta derde uygun ürünleri bulup somut kullanım önerisi kurar. */
    private AssistantChatResponse buildConcernResponse(ConcernRule rule, ShellyMode mode, List<Product> products) {
        List<Product> helpful = products.stream()
                .filter(product -> matchesAny(productSearchText(product), rule.helpfulIngredients()))
                .limit(3)
                .toList();

        String reason;
        String suggestion;
        if (helpful.isEmpty()) {
            reason = products.isEmpty()
                    ? "Rafında henüz kayıtlı ürün yok, bu yüzden içerik bazlı öneri veriyorum."
                    : "Rafındaki ürünlerde bu derde yönelik belirgin bir aktif içerik görünmüyor.";
            suggestion = rule.ingredientAdvice() + " " + rule.routineAdvice();
        } else {
            reason = "Rafında destek olabilecek ürünler var: " + helpful.stream()
                    .map(product -> product.getBrand() + " " + product.getName()
                            + (product.getActiveIngredients() == null || product.getActiveIngredients().isEmpty()
                                    ? ""
                                    : " (" + String.join(", ", product.getActiveIngredients()) + ")"))
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("");
            suggestion = "Bu ürünlerden biriyle başla; " + rule.routineAdvice();
        }

        boolean hasSpf = products.stream()
                .anyMatch(product -> matchesAny(productSearchText(product), List.of("spf", "güneş", "sunscreen")));
        if (!hasSpf) {
            suggestion += " Rafında güneş koruyucu görünmüyor; aktif içerik kullanırken sabah SPF önemli.";
        }

        return new AssistantChatResponse(
                "ISSUE",
                rule.issueLabel(),
                composePlainText(rule.issueLabel() + " için rafını kontrol ettim.", reason, suggestion, rule.warning()),
                mode.name(),
                "Shelly'nin Yorumu",
                rule.issueLabel() + " için rafını ve rutinini kontrol ettim.",
                reason,
                suggestion,
                rule.warning(),
                "medium",
                List.of(rule.issueLabel(), hasSpf ? "Rutin desteği" : "SPF gerekli"));
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
