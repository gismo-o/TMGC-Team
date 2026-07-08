package com.skinshelf.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Tüm API istekleri için geçerli
                .allowedOrigins("*") // Tüm adreslerden (localhost, mobil cihazlar vb.) gelen isteklere izin ver
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // İzin verilen HTTP metotları
                .allowedHeaders("*") // Tüm HTTP başlıklarına izin ver
                .maxAge(3600); // Ön istek (Preflight) önbellekleme süresi (1 saat)
    }
}