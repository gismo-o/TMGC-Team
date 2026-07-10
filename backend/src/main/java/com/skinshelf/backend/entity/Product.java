package com.skinshelf.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_products")
@Getter
@Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String category;

    @Column(name = "time_of_day", nullable = false)
    private String timeOfDay;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "cutout_image_url")
    private String cutoutImageUrl;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "expiry_date")
    private String expiryDate;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "active_ingredients")
    private List<String> activeIngredients;

    @Column(name = "is_favorite")
    private Boolean favorite;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
