package com.skinshelf.backend.service;

import com.skinshelf.backend.dto.AssistantChatRequest;
import com.skinshelf.backend.dto.AssistantChatResponse;
import com.skinshelf.backend.entity.AssistantMessage;
import com.skinshelf.backend.entity.User;
import com.skinshelf.backend.repository.AssistantMessageRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AssistantService {

    private final AssistantMessageRepository assistantMessageRepository;

    public AssistantService(AssistantMessageRepository assistantMessageRepository) {
        this.assistantMessageRepository = assistantMessageRepository;
    }

    public AssistantChatResponse chat(User user, AssistantChatRequest request) {
        String prompt = request.getMessage().trim();
        AssistantChatResponse response = buildResponse(prompt);

        AssistantMessage message = new AssistantMessage();
        message.setUser(user);
        message.setPrompt(prompt);
        message.setIntentType(response.getIntentType());
        message.setDetectedIssue(response.getDetectedIssue());
        message.setAiResponse(response.getAiResponse());
        assistantMessageRepository.save(message);

        return response;
    }

    private AssistantChatResponse buildResponse(String prompt) {
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
}
