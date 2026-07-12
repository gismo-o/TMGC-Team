package com.skinshelf.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "skin_logs")
@Getter
@Setter
public class SkinLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Gizlilik: fotoğraf varsayılan olarak saklanmaz; yalnızca analiz sonucu tutulur. */
    @Column(name = "photo_url", length = 512)
    private String photoUrl;

    @Column(name = "skin_feeling", length = 64)
    private String skinFeeling;

    @Column(name = "used_new_product")
    private Boolean usedNewProduct;

    @Column(name = "user_note", columnDefinition = "text")
    private String userNote;

    @Column(name = "analysis_json", columnDefinition = "text")
    private String analysisJson;

    @Column(name = "dryness_level", length = 16)
    private String drynessLevel;

    @Column(name = "redness_level", length = 16)
    private String rednessLevel;

    @Column(name = "oiliness_level", length = 16)
    private String oilinessLevel;

    @Column(name = "blemish_level", length = 16)
    private String blemishLevel;

    @Column(name = "irritation_level", length = 16)
    private String irritationLevel;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
