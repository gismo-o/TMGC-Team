package com.skinshelf.backend.service;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

/**
 * Riskli semptomları algılar ve Shelly'nin medikal öneri vermeden
 * profesyonele yönlendirmesini garanti eder.
 */
@Component
public class SafetyGuard {

    public static final String SAFE_REFERRAL_MESSAGE =
            "Bu durum profesyonel değerlendirme gerektirebilir. Ürünü kullanmayı bırakıp "
                    + "dermatoloğa veya bir sağlık profesyoneline danışman daha güvenli olur. "
                    + "Bu süreçte rutinini sade tutman (nazik temizleyici + nemlendirici) cildini yormaz.";

    private static final List<String> RISKY_TERMS = List.of(
            "şiddetli yanma",
            "şişlik",
            "su toplama",
            "açık yara",
            "kanama",
            "enfeksiyon",
            "iltihap",
            "göz çevresi reaksiyon",
            "gözüm şişti",
            "nefes darlığı",
            "yüzüm şişti",
            "alerji",
            "dayanılmaz ağrı");

    public boolean isRisky(String message) {
        if (message == null || message.isBlank()) {
            return false;
        }
        String normalized = message.toLowerCase(Locale.forLanguageTag("tr-TR"));
        return RISKY_TERMS.stream().anyMatch(normalized::contains);
    }
}
