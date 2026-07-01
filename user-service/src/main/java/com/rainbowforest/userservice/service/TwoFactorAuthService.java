package com.rainbowforest.userservice.service;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class TwoFactorAuthService {

    public String generateNewSecret() {
        SecretGenerator generator = new DefaultSecretGenerator();
        return generator.generate();
    }

    public String generateQrCodeImageUri(String secret, String email) {
        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer("RainbowForest")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        return "otpauth://totp/RainbowForest:" + email + "?secret=" + secret + "&issuer=RainbowForest";
    }

    public boolean isOtpValid(String secret, String code) {
        TimeProvider timeProvider = new SystemTimeProvider();
        DefaultCodeVerifier verifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), timeProvider);
        verifier.setAllowedTimePeriodDiscrepancy(5); // Allow +/- 2.5 minutes of clock drift
        return verifier.isValidCode(secret, code);
    }
}
