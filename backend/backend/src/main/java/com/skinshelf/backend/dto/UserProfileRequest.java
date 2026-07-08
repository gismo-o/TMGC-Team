package com.skinshelf.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class UserProfileRequest {
    private Long userId; // Hangi kullanıcının profili olduğunu belirtmek için
    private String nickname;
    private String ageRange;
    private String experience;
    private String sensitivity;
    private String skinTypeGuess;
    private List<String> concerns;
    private List<String> lifestyleFactors;
    private String notifPref;
}