package com.skinshelf.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class IngredientAnalysisRequest {
    private String name;
    private String brand;
    private String category;
    private String description;
    private List<String> activeIngredients;
}
