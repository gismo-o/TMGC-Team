package com.skinshelf.backend.controller;

import com.skinshelf.backend.dto.SkinAnalysisRequest;
import com.skinshelf.backend.dto.SkinAnalysisResponse;
import com.skinshelf.backend.dto.SkinLogResponse;
import com.skinshelf.backend.dto.SkinWeeklySummaryResponse;
import com.skinshelf.backend.entity.User;
import com.skinshelf.backend.service.SkinAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skin-logs")
public class SkinLogController {

    private final SkinAnalysisService skinAnalysisService;

    public SkinLogController(SkinAnalysisService skinAnalysisService) {
        this.skinAnalysisService = skinAnalysisService;
    }

    /** Fotoğraf + günlük formunu analiz eder ve sonucu kaydeder. */
    @PostMapping("/analyze")
    public ResponseEntity<SkinAnalysisResponse> analyze(
            @AuthenticationPrincipal User currentUser,
            @RequestBody SkinAnalysisRequest request) {
        return ResponseEntity.ok(skinAnalysisService.analyzeAndSave(currentUser, request));
    }

    @GetMapping
    public ResponseEntity<List<SkinLogResponse>> list(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(skinAnalysisService.listLogs(currentUser));
    }

    @GetMapping("/summary/weekly")
    public ResponseEntity<SkinWeeklySummaryResponse> weeklySummary(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(skinAnalysisService.weeklySummary(currentUser));
    }

    @DeleteMapping("/{logId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long logId) {
        skinAnalysisService.deleteLog(currentUser, logId);
        return ResponseEntity.noContent().build();
    }
}
