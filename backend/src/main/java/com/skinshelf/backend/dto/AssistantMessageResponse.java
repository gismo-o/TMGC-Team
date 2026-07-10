package com.skinshelf.backend.dto;

import com.skinshelf.backend.entity.AssistantMessage;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AssistantMessageResponse {
    private Long id;
    private String prompt;
    private String intentType;
    private String detectedIssue;
    private String aiResponse;
    private LocalDateTime createdAt;

    public static AssistantMessageResponse from(AssistantMessage message) {
        return new AssistantMessageResponse(
                message.getId(),
                message.getPrompt(),
                message.getIntentType(),
                message.getDetectedIssue(),
                message.getAiResponse(),
                message.getCreatedAt());
    }
}
