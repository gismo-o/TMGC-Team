package com.skinshelf.backend.repository;

import com.skinshelf.backend.entity.SkinLog;
import com.skinshelf.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SkinLogRepository extends JpaRepository<SkinLog, Long> {

    List<SkinLog> findTop30ByUserOrderByCreatedAtDesc(User user);

    List<SkinLog> findByUserAndCreatedAtAfterOrderByCreatedAtDesc(User user, LocalDateTime after);

    Optional<SkinLog> findByIdAndUser(Long id, User user);

    long deleteByUser(User user);
}
