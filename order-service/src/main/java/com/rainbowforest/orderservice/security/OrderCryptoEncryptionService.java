package com.rainbowforest.orderservice.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service mã hóa dữ liệu nhạy cảm AES-256-GCM cho order-service.
 */
@Component
public class OrderCryptoEncryptionService {

    private static final Logger log = LoggerFactory.getLogger(OrderCryptoEncryptionService.class);

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    private static final String ENCRYPTED_PREFIX = "ENC:GCM:";

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${app.security.encryption-key:${JWT_SECRET:RainbowForestEcommerceOrderDataEncryptionSecretKey2026_Secure32Bytes!}}")
    private String rawSecretKey;

    private static SecretKeySpec secretKeySpec;

    @PostConstruct
    public void init() {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha.digest(rawSecretKey.getBytes(StandardCharsets.UTF_8));
            secretKeySpec = new SecretKeySpec(keyBytes, ALGORITHM);
            log.info("OrderCryptoEncryptionService đã khởi tạo thành công với AES-256-GCM.");
        } catch (Exception e) {
            log.error("Không thể khởi tạo OrderCryptoEncryptionService: ", e);
            throw new IllegalStateException("Lỗi khởi tạo AES-256: " + e.getMessage(), e);
        }
    }

    public static String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) {
            return plaintext;
        }
        if (plaintext.startsWith(ENCRYPTED_PREFIX)) {
            return plaintext;
        }
        if (secretKeySpec == null) {
            return plaintext;
        }
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            SECURE_RANDOM.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, spec);

            byte[] cipherText = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return ENCRYPTED_PREFIX + Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            log.error("Lỗi khi mã hóa dữ liệu order: {}", e.getMessage());
            return plaintext;
        }
    }

    public static String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }
        if (!encryptedText.startsWith(ENCRYPTED_PREFIX)) {
            return encryptedText;
        }
        if (secretKeySpec == null) {
            return encryptedText;
        }
        try {
            String base64Payload = encryptedText.substring(ENCRYPTED_PREFIX.length());
            byte[] decoded = Base64.getDecoder().decode(base64Payload);

            if (decoded.length < GCM_IV_LENGTH) {
                return encryptedText;
            }

            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, spec);

            byte[] plainBytes = cipher.doFinal(cipherText);
            return new String(plainBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Lỗi khi giải mã dữ liệu order: {}", e.getMessage());
            return encryptedText;
        }
    }
}
