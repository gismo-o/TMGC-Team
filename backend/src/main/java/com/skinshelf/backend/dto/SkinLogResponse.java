package com.skinshelf.backend.dto;

import com.skinshelf.backend.entity.SkinLog;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
@AllArgsConstructor
public class SkinLogResponse {
    private Long id;
    private String skinFeeling;
    private Boolean usedNewProduct;
    private String userNote;
    private String drynessLevel;
    private String rednessLevel;
    private String oilinessLevel;
    private String blemishLevel;
    private String irritationLevel;
    private String analysisJson;
    private String createdAt;

    public static SkinLogResponse from(SkinLog skinLog) {
        return new SkinLogResponse(
                skinLog.getId(),
                skinLog.getSkinFeeling(),
                skinLog.getUsedNewProduct(),
                skinLog.getUserNote(),
                skinLog.getDrynessLevel(),
                skinLog.getRednessLevel(),
                skinLog.getOilinessLevel(),
                skinLog.getBlemishLevel(),
                skinLog.getIrritationLevel(),
                skinLog.getAnalysisJson(),
                skinLog.getCreatedAt() == null ? null : skinLog.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
    }
}
