package com.skinshelf.backend.repository;

import com.skinshelf.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Product> findByIdAndUserId(Long id, Long userId);

    long deleteByUserId(Long userId);
}
