package com.skinshelf.backend.repository;

import com.skinshelf.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // E-posta adresine göre kullanıcı arama metodu
    Optional<User> findByEmail(String email);
}