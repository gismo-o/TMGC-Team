package com.skinshelf.backend.repository;

import com.skinshelf.backend.entity.AssistantMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssistantMessageRepository extends JpaRepository<AssistantMessage, Long> {
}
