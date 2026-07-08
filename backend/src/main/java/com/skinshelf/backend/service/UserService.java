package com.skinshelf.backend.service;

import com.skinshelf.backend.dto.LoginRequest;
import com.skinshelf.backend.dto.RegisterRequest;
import com.skinshelf.backend.entity.User;
import com.skinshelf.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Kayıt Metodu
    public User register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Bu e-posta adresi zaten kullanımda.");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // Şimdilik düz metin olarak kaydediyoruz
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        return userRepository.save(user);
    }

    // Giriş Metodu
    public User login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("E-posta veya şifre hatalı."));

        // Şifre kontrolü
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("E-posta veya şifre hatalı.");
        }

        return user;
    }
}