package com.skinshelf.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AssistantChatResponse {
    private String intentType;
    private String detectedIssue;
    /** Düz metin yanıt (geriye dönük uyumluluk + sohbet balonu). */
    private String aiResponse;

    // Yapılandırılmış Shelly yanıtı
    private String mode;
    private String title;
    private String summary;
    private String reason;
    private String suggestion;
    private String warning;
    private String riskLevel;
    private List<String> tags;

    public static AssistantChatResponse legacy(String intentType, String detectedIssue, String aiResponse) {
        return new AssistantChatResponse(
                intentType,
                detectedIssue,
                aiResponse,
                "GENERAL_CHAT",
                "Shelly'nin Yorumu",
                aiResponse,
                null,
                null,
                null,
                "low",
                List.of());
    }
}
