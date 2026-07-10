package com.skinshelf.backend.service;

import com.skinshelf.backend.dto.UserProfileRequest;
import com.skinshelf.backend.dto.UserProfileResponse;
import com.skinshelf.backend.entity.User;
import com.skinshelf.backend.entity.UserProfile;
import com.skinshelf.backend.repository.UserRepository;
import com.skinshelf.backend.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public UserProfileService(UserProfileRepository userProfileRepository, UserRepository userRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    // Profil Oluşturma veya Güncelleme İşlemi
    public UserProfileResponse saveOrUpdateProfile(User user, UserProfileRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElse(new UserProfile());

        applyRequest(profile, user, request);
        return UserProfileResponse.from(userProfileRepository.save(profile));
    }

    // Eski endpoint ile geriye uyumluluk için tutuldu.
    public UserProfile saveOrUpdateProfile(UserProfileRequest request) {
        // Kullanıcının sistemde kayıtlı olup olmadığını kontrol ediyoruz
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        // Kullanıcının halihazırda bir profili var mı diye bakıyoruz
        UserProfile profile = userProfileRepository.findByUserId(request.getUserId())
                .orElse(new UserProfile()); // Yoksa yeni bir profil oluşturuyoruz

        applyRequest(profile, user, request);

        return userProfileRepository.save(profile);
    }

    public UserProfileResponse getProfile(User user) {
        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyProfile(user));
        return UserProfileResponse.from(profile);
    }

    // Kullanıcıya ait cilt profilini getirme metodu
    public UserProfile getProfileByUserId(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Bu kullanıcıya ait bir cilt profili bulunamadı."));
    }

    private UserProfile createEmptyProfile(User user) {
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setNickname(fullName(user));
        profile.setSkinTypeGuess("");
        profile.setPregnant(false);
        profile.setOnboarded(false);
        return userProfileRepository.save(profile);
    }

    private void applyRequest(UserProfile profile, User user, UserProfileRequest request) {
        profile.setUser(user);
        profile.setNickname(firstNonBlank(request.getDisplayName(), request.getNickname(), profile.getNickname(), fullName(user)));
        profile.setAgeRange(firstNonBlank(request.getAgeRange(), profile.getAgeRange()));
        profile.setExperience(firstNonBlank(request.getExperienceLevel(), request.getExperience(), profile.getExperience()));
        profile.setSensitivity(firstNonBlank(request.getSensitivityLevel(), request.getSensitivity(), profile.getSensitivity()));
        profile.setSkinTypeGuess(firstNonBlank(request.getSkinType(), request.getSkinTypeGuess(), profile.getSkinTypeGuess(), ""));
        profile.setSkinFeel(firstNonBlank(request.getSkinFeel(), profile.getSkinFeel()));
        profile.setPostWashFeel(firstNonBlank(request.getPostWashFeel(), profile.getPostWashFeel()));
        profile.setMainGoal(firstNonBlank(request.getMainGoal(), firstItem(request.getConcerns()), profile.getMainGoal()));
        profile.setProductFitIntent(firstNonBlank(request.getProductFitIntent(), profile.getProductFitIntent()));
        profile.setReactionHistory(firstNonBlank(request.getReactionHistory(), profile.getReactionHistory()));
        profile.setCurrentRoutine(firstNonNull(request.getCurrentRoutine(), profile.getCurrentRoutine()));
        profile.setRecentActives(firstNonNull(request.getRecentActives(), profile.getRecentActives()));
        profile.setConcerns(firstNonNull(request.getConcerns(), profile.getConcerns()));
        profile.setLifestyleFactors(firstNonNull(request.getTrackingPreferences(), request.getLifestyleFactors(), profile.getLifestyleFactors()));
        profile.setReminderPreferences(firstNonNull(request.getReminderPreferences(), profile.getReminderPreferences()));
        profile.setNotifPref(firstNonBlank(request.getNotifPref(), join(request.getReminderPreferences()), profile.getNotifPref()));
        profile.setGender(firstNonBlank(request.getGender(), profile.getGender()));
        profile.setPregnant(request.getIsPregnant() == null ? profile.getPregnant() : request.getIsPregnant());
        profile.setConditions(firstNonNull(request.getConditions(), profile.getConditions()));
        profile.setAllergens(firstNonNull(request.getAllergens(), profile.getAllergens()));
        profile.setOnboarded(request.getIsOnboarded() == null ? profile.getOnboarded() : request.getIsOnboarded());
    }

    @SafeVarargs
    private final <T> T firstNonNull(T... values) {
        for (T value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private String firstItem(List<String> values) {
        return values == null || values.isEmpty() ? null : values.get(0);
    }

    private String join(List<String> values) {
        return values == null ? null : String.join(", ", values);
    }

    private String fullName(User user) {
        return firstNonBlank((user.getFirstName() + " " + (user.getLastName() == null ? "" : user.getLastName())).trim(),
                user.getEmail());
    }
}
