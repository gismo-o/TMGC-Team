package com.skinshelf.backend.service;

import com.skinshelf.backend.dto.UserProfileRequest;
import com.skinshelf.backend.entity.User;
import com.skinshelf.backend.entity.UserProfile;
import com.skinshelf.backend.repository.UserRepository;
import com.skinshelf.backend.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public UserProfileService(UserProfileRepository userProfileRepository, UserRepository userRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    // Profil Oluşturma veya Güncelleme İşlemi
    public UserProfile saveOrUpdateProfile(UserProfileRequest request) {
        // Kullanıcının sistemde kayıtlı olup olmadığını kontrol ediyoruz
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        // Kullanıcının halihazırda bir profili var mı diye bakıyoruz
        UserProfile profile = userProfileRepository.findByUserId(request.getUserId())
                .orElse(new UserProfile()); // Yoksa yeni bir profil oluşturuyoruz

        // Bilgileri eşitliyoruz
        profile.setUser(user);
        profile.setNickname(request.getNickname());
        profile.setAgeRange(request.getAgeRange());
        profile.setExperience(request.getExperience());
        profile.setSensitivity(request.getSensitivity());
        profile.setSkinTypeGuess(request.getSkinTypeGuess());
        profile.setConcerns(request.getConcerns());
        profile.setLifestyleFactors(request.getLifestyleFactors());
        profile.setNotifPref(request.getNotifPref());

        return userProfileRepository.save(profile);
    }

    // Kullanıcıya ait cilt profilini getirme metodu
    public UserProfile getProfileByUserId(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Bu kullanıcıya ait bir cilt profili bulunamadı."));
    }
}