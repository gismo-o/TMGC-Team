package com.skinshelf.backend.repository;

import com.skinshelf.backend.entity.AssistantMessage;
import com.skinshelf.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssistantMessageRepository extends JpaRepository<AssistantMessage, Long> {

    List<AssistantMessage> findTop50ByUserOrderByCreatedAtDesc(User user);

    long deleteByUser(User user);
}
