package com.skinshelf.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.skinshelf.backend.dto.AssistantChatRequest;
import com.skinshelf.backend.dto.AssistantChatResponse;
import com.skinshelf.backend.dto.AssistantMessageResponse;
import com.skinshelf.backend.entity.AssistantMessage;
import com.skinshelf.backend.entity.Product;
import com.skinshelf.backend.entity.User;
import com.skinshelf.backend.entity.UserProfile;
import com.skinshelf.backend.repository.AssistantMessageRepository;
import com.skinshelf.backend.repository.ProductRepository;
import com.skinshelf.backend.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class AssistantService {

    private final AssistantMessageRepository assistantMessageRepository;
    private final GeminiApiClient geminiApiClient;
    private final ProductRepository productRepository;
    private final UserProfileRepository userProfileRepository;

    public AssistantService(
            AssistantMessageRepository assistantMessageRepository,
            GeminiApiClient geminiApiClient,
            ProductRepository productRepository,
            UserProfileRepository userProfileRepository) {
        this.assistantMessageRepository = assistantMessageRepository;
        this.geminiApiClient = geminiApiClient;
        this.productRepository = productRepository;
        this.userProfileRepository = userProfileRepository;
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
        if (geminiApiClient.isConfigured()) {
            var response = geminiApiClient.generateJson(buildGeminiPrompt(user, prompt))
                    .map(this::parseGeminiResponse);
            if (response.isPresent()) {
                return response.get();
            }
        }

        return buildFallbackResponse(prompt);
    }

    private AssistantChatResponse parseGeminiResponse(JsonNode json) {
        String intentType = json.path("intentType").asText("INFO").equals("ISSUE") ? "ISSUE" : "INFO";
        String detectedIssue = json.path("detectedIssue").isNull() ? null : json.path("detectedIssue").asText(null);
        String aiResponse = json.path("aiResponse").asText("").trim();

        if (aiResponse.isBlank()) {
            return buildFallbackResponse("rutin");
        }

        return new AssistantChatResponse(intentType, detectedIssue, aiResponse);
    }

    private String buildGeminiPrompt(User user, String prompt) {
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        List<Product> products = productRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return """
                SkinShelf uygulamasinda Turkce cilt bakim asistani olarak yanit ver.
                Tani koyma, kesin medikal iddia uretme, ciddi/kalici sorunlarda dermatologa yonlendir.
                Kullanicinin rafindaki urunleri ve profilini dikkate al.
                Cevabi yalnizca JSON olarak don:
                {
                  "intentType": "INFO|ISSUE",
                  "detectedIssue": "string veya null",
                  "aiResponse": "Turkce, kisa, uygulanabilir yanit"
                }

                Kullanici profili:
                - Cilt tipi: %s
                - Ana hedef: %s
                - Hassasiyet: %s

                Rafindaki urunler:
                %s

                Kullanici mesaji:
                %s
                """.formatted(
                profile == null ? "" : nullToEmpty(profile.getSkinTypeGuess()),
                profile == null ? "" : nullToEmpty(profile.getMainGoal()),
                profile == null ? "" : nullToEmpty(profile.getSensitivity()),
                products.stream()
                        .limit(12)
                        .map(product -> "- %s %s / %s / %s".formatted(
                                nullToEmpty(product.getBrand()),
                                nullToEmpty(product.getName()),
                                nullToEmpty(product.getCategory()),
                                product.getActiveIngredients() == null ? List.of() : product.getActiveIngredients()))
                        .toList(),
                prompt);
    }

    private AssistantChatResponse buildFallbackResponse(String prompt) {
        String normalized = prompt.toLowerCase(Locale.forLanguageTag("tr-TR"));

        if (normalized.contains("kızarıklık") || normalized.contains("tepki") || normalized.contains("kızardı")) {
            return new AssistantChatResponse(
                    "ISSUE",
                    "Kızarıklık",
                    "Cildinizdeki kızarıklığı algıladım. Bu durum geçici hassasiyet veya irritasyon işareti olabilir. Güvenli modda agresif aktifleri durdurup bariyer destekli, sade bir rutine geçmenizi öneririm.");
        }

        if (normalized.contains("birlikte kullanılır") || normalized.contains("içerik analizi") || normalized.contains("bu iki ürün")) {
            return new AssistantChatResponse(
                    "INFO",
                    null,
                    "Bu ürünleri birlikte kullanmadan önce aktif içerik yoğunluğunu kontrol etmek gerekir. Asit, retinoid veya benzoil peroksit gibi güçlü aktifler varsa aynı rutinde üst üste kullanmak yerine sabah/akşam veya farklı günlere ayırın.");
        }

        if (normalized.contains("rutin") || normalized.contains("ağır")) {
            return new AssistantChatResponse(
                    "INFO",
                    null,
                    "Rutininizi dengede tutmak için temizleyici, nemlendirici ve gündüz SPF temelini koruyun. Aktif içerikleri cilt toleransınıza göre haftaya yaymak genelde daha güvenlidir.");
        }

        return new AssistantChatResponse(
                "INFO",
                null,
                "Anladığım kadarıyla: " + prompt + ". Rafınızdaki ürünlere göre en güvenli yaklaşım rutini sade tutmak, yeni ürünleri tek tek eklemek ve beklenmeyen reaksiyonda aktifleri geçici olarak durdurmaktır.");
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
