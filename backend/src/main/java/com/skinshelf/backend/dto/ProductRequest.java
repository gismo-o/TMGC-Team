package com.skinshelf.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty; // GÜNCELLEME: Jackson import edildi
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductRequest {
    @NotBlank(message = "Ürün adı zorunludur.")
    private String name;

    @NotBlank(message = "Marka zorunludur.")
    private String brand;

    @NotBlank(message = "Kategori zorunludur.")
    private String category;

    @NotBlank(message = "Kullanım zamanı zorunludur.")
    private String timeOfDay;

    private String imageUrl;
    private String cutoutImageUrl;
    private String description;
    private String expiryDate;
    private List<String> activeIngredients;
    private Boolean isFavorite;

    // GÜNCELLEME: Jackson'ın isimlendirme hatasını engellemek için doğrudan
    // bağladık
    @JsonProperty("is_active")
    private Boolean isActive;
}