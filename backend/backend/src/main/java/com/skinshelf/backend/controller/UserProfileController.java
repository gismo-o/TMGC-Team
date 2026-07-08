package com.skinshelf.backend.controller;

import com.skinshelf.backend.dto.UserProfileRequest;
import com.skinshelf.backend.entity.UserProfile;
import com.skinshelf.backend.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "*") // Mobil ve web platformlarından erişim için CORS'u açıyoruz
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    // Onboarding verilerini veritabanına kaydetmek için POST isteği
    @PostMapping("/save")
    public ResponseEntity<?> saveProfile(@RequestBody UserProfileRequest request) {
        try {
            UserProfile savedProfile = userProfileService.saveOrUpdateProfile(request);
            // İlişki döngüsünü engellemek için geri dönen nesneden kullanıcı şifresini
            // siliyoruz
            if (savedProfile.getUser() != null) {
                savedProfile.getUser().setPassword(null);
            }
            return ResponseEntity.ok(savedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Belirli bir kullanıcıya ait cilt profilini getirmek için GET isteği
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getProfileByUserId(@PathVariable Long userId) {
        try {
            UserProfile profile = userProfileService.getProfileByUserId(userId);
            if (profile.getUser() != null) {
                profile.getUser().setPassword(null);
            }
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}