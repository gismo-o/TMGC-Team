package com.skinshelf.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_assistant_messages")
@Getter
@Setter
public class AssistantMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "text")
    private String prompt;

    @Column(name = "intent_type", nullable = false, length = 32)
    private String intentType;

    @Column(name = "detected_issue")
    private String detectedIssue;

    @Column(name = "ai_response", nullable = false, columnDefinition = "text")
    private String aiResponse;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
