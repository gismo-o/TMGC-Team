package com.skinshelf.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssistantChatRequest {
    @NotBlank(message = "Mesaj boş olamaz.")
    @Size(max = 2000, message = "Mesaj 2000 karakteri geçemez.")
    private String message;
}
