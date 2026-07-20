package com.skinshelf.backend.dto;

import com.skinshelf.backend.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ProductResponse {
    private String id;
    private String name;
    private String brand;
    private String category;
    private String timeOfDay;
    private String imageUrl;
    private String cutoutImageUrl;
    private String description;
    private String expiryDate;
    private List<String> activeIngredients;
    private Boolean isFavorite;
    private Boolean isActive;

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                String.valueOf(product.getId()),
                product.getName(),
                product.getBrand(),
                product.getCategory(),
                product.getTimeOfDay(),
                product.getImageUrl() == null ? "" : product.getImageUrl(),
                product.getCutoutImageUrl(),
                product.getDescription() == null ? "" : product.getDescription(),
                product.getExpiryDate(),
                product.getActiveIngredients() == null ? List.of() : product.getActiveIngredients(),
                Boolean.TRUE.equals(product.getFavorite()),
                product.getIsActive() == null || product.getIsActive());
    }
}
