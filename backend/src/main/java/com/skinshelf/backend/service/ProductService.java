package com.skinshelf.backend.service;

import com.skinshelf.backend.dto.ProductRequest;
import com.skinshelf.backend.dto.ProductResponse;
import com.skinshelf.backend.entity.Product;
import com.skinshelf.backend.entity.User;
import com.skinshelf.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> getProducts(User user) {
        return productRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(ProductResponse::from)
                .toList();
    }

    public ProductResponse addProduct(User user, ProductRequest request) {
        Product product = new Product();
        product.setUser(user);
        applyRequest(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    public ProductResponse updateProduct(User user, Long productId, ProductRequest request) {
        Product product = productRepository.findByIdAndUserId(productId, user.getId())
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı."));
        applyRequest(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    public void deleteProduct(User user, Long productId) {
        Product product = productRepository.findByIdAndUserId(productId, user.getId())
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı."));
        productRepository.delete(product);
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.getName().trim());
        product.setBrand(request.getBrand().trim());
        product.setCategory(request.getCategory().trim());
        product.setTimeOfDay(request.getTimeOfDay().trim());
        product.setImageUrl(blankToNull(request.getImageUrl()));
        product.setCutoutImageUrl(blankToNull(request.getCutoutImageUrl()));
        product.setDescription(blankToNull(request.getDescription()));
        product.setExpiryDate(blankToNull(request.getExpiryDate()));
        product.setActiveIngredients(request.getActiveIngredients() == null ? List.of() : request.getActiveIngredients());
        product.setFavorite(Boolean.TRUE.equals(request.getIsFavorite()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
