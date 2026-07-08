package com.skinshelf.backend.repository;

import com.skinshelf.backend.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    // Belirli bir kullanıcı ID'sine sahip cilt profilini getiren metot
    Optional<UserProfile> findByUserId(Long userId);
}