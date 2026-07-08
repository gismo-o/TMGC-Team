package com.skinshelf.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // CSRF korumasını devre dışı bırak
                .cors(cors -> {
                }) // WebConfig'deki CORS ayarlarına izin ver
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // Şimdilik tüm isteklere şifresiz izin ver
                );
        return http.build();
    }
}