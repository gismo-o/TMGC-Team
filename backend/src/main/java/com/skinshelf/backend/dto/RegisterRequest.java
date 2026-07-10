package com.skinshelf.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @Email(message = "Geçerli bir e-posta adresi girin.")
    @NotBlank(message = "E-posta zorunludur.")
    private String email;

    @NotBlank(message = "Şifre zorunludur.")
    @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır.")
    private String password;

    @NotBlank(message = "Ad zorunludur.")
    private String firstName;

    private String lastName;
}
