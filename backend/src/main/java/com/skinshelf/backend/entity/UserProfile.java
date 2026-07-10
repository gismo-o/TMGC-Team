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

    @Column(name = "skin_feel")
    private String skinFeel;

    @Column(name = "post_wash_feel")
    private String postWashFeel;

    private String experience;

    private String sensitivity;

    @Column(name = "skin_type_guess")
    private String skinTypeGuess;

    @Column(name = "main_goal")
    private String mainGoal;

    @Column(name = "product_fit_intent")
    private String productFitIntent;

    @Column(name = "reaction_history")
    private String reactionHistory;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "current_routine")
    private List<String> currentRoutine;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "recent_actives")
    private List<String> recentActives;

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

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "reminder_preferences")
    private List<String> reminderPreferences;

    private String gender;

    @Column(name = "is_pregnant")
    private Boolean pregnant;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "conditions")
    private List<String> conditions;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "allergens")
    private List<String> allergens;

    @Column(name = "is_onboarded")
    private Boolean onboarded;
}
