package com.skinshelf.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class UserProfileRequest {
    private Long userId; // Hangi kullanıcının profili olduğunu belirtmek için
    private String displayName;
    private String nickname;
    private String ageRange;
    private String experienceLevel;
    private String experience;
    private String skinFeel;
    private String postWashFeel;
    private String mainGoal;
    private String productFitIntent;
    private String sensitivityLevel;
    private String sensitivity;
    private String reactionHistory;
    private List<String> currentRoutine;
    private List<String> recentActives;
    private List<String> trackingPreferences;
    private String skinTypeGuess;
    private String skinType;
    private List<String> concerns;
    private List<String> lifestyleFactors;
    private List<String> reminderPreferences;
    private String notifPref;
    private String gender;
    private Boolean isPregnant;
    private List<String> conditions;
    private List<String> allergens;
    private Boolean isOnboarded;
}
