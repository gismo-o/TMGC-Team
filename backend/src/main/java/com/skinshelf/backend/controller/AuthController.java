package com.skinshelf.backend.controller;

import com.skinshelf.backend.dto.AuthResponse;
import com.skinshelf.backend.dto.LoginRequest;
import com.skinshelf.backend.dto.RegisterRequest;
import com.skinshelf.backend.dto.UserResponse;
import com.skinshelf.backend.entity.User;
import com.skinshelf.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(UserResponse.from(currentUser));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(@AuthenticationPrincipal User currentUser) {
        userService.deleteAccount(currentUser);
        return ResponseEntity.noContent().build();
    }
}
