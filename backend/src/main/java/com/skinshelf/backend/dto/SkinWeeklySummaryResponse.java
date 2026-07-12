package com.skinshelf.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class SkinWeeklySummaryResponse {
    private int logCount;
    /** dryness / redness / oiliness / blemish -> increased|decreased|stable|unknown */
    private Map<String, String> trends;
    private List<String> newProducts;
    private String shellyComment;
}
