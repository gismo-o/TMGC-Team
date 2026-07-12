package com.skinshelf.backend.controller;

import com.skinshelf.backend.dto.UserProfileRequest;
import com.skinshelf.backend.dto.UserProfileResponse;
import com.skinshelf.backend.entity.User;
import com.skinshelf.backend.service.UserProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userProfileService.getProfile(currentUser));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UserProfileRequest request) {
        return ResponseEntity.ok(userProfileService.saveOrUpdateProfile(currentUser, request));
    }

    // Onboarding verilerini veritabanına kaydetmek için POST isteği
    @PostMapping("/save")
    public ResponseEntity<UserProfileResponse> saveProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UserProfileRequest request) {
        return ResponseEntity.ok(userProfileService.saveOrUpdateProfile(currentUser, request));
    }

    // Belirli bir kullanıcıya ait cilt profilini getirmek için GET isteği
    @GetMapping("/user/{userId}")
    public ResponseEntity<UserProfileResponse> getProfileByUserId(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long userId) {
        if (!currentUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(userProfileService.getProfile(currentUser));
    }
}
