package com.skinshelf.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssistantChatResponse {
    private String intentType;
    private String detectedIssue;
    private String aiResponse;
}
