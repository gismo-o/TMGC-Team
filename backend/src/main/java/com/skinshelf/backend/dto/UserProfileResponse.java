package com.skinshelf.backend.dto;

import com.skinshelf.backend.entity.UserProfile;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class UserProfileResponse {
    private String displayName;
    private String ageRange;
    private String experienceLevel;
    private String skinFeel;
    private String postWashFeel;
    private String mainGoal;
    private String productFitIntent;
    private String sensitivityLevel;
    private String reactionHistory;
    private List<String> currentRoutine;
    private List<String> recentActives;
    private List<String> trackingPreferences;
    private List<String> reminderPreferences;
    private String skinType;
    private String gender;
    private Boolean isPregnant;
    private List<String> conditions;
    private List<String> allergens;
    private Boolean isOnboarded;

    public static UserProfileResponse from(UserProfile profile) {
        return new UserProfileResponse(
                profile.getNickname(),
                profile.getAgeRange(),
                profile.getExperience(),
                profile.getSkinFeel(),
                profile.getPostWashFeel(),
                profile.getMainGoal(),
                profile.getProductFitIntent(),
                profile.getSensitivity(),
                profile.getReactionHistory(),
                emptyIfNull(profile.getCurrentRoutine()),
                emptyIfNull(profile.getRecentActives()),
                emptyIfNull(profile.getLifestyleFactors()),
                emptyIfNull(profile.getReminderPreferences()),
                profile.getSkinTypeGuess() == null ? "" : profile.getSkinTypeGuess(),
                profile.getGender(),
                Boolean.TRUE.equals(profile.getPregnant()),
                emptyIfNull(profile.getConditions()),
                emptyIfNull(profile.getAllergens()),
                Boolean.TRUE.equals(profile.getOnboarded()));
    }

    private static List<String> emptyIfNull(List<String> value) {
        return value == null ? List.of() : value;
    }
}
