package com.skinshelf.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.List;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    private String nickname;

    @Column(name = "age_range")
    private String ageRange;

    private String experience;

    private String sensitivity;

    @Column(name = "skin_type_guess")
    private String skinTypeGuess;

    // PostgreSQL'deki text[] array formatıyla eşleştiriyoruz
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "concerns")
    private List<String> concerns;

    // PostgreSQL'deki text[] array formatıyla eşleştiriyoruz
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "lifestyle_factors")
    private List<String> lifestyleFactors;

    @Column(name = "notif_pref")
    private String notifPref;
}