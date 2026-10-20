package com.rainbowforest.userservice.security;

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
 * Service mã hóa dữ liệu nhạy cảm ở cấp độ ứng dụng (Application-Level Field Encryption).
 * Sử dụng chuẩn mã hóa hiện đại và an toàn nhất hiện nay: AES-256-GCM (Galois/Counter Mode).
 * 
 * Ưu điểm của AES-GCM:
 * 1. Mã hóa xác thực (Authenticated Encryption with Associated Data - AEAD).
 * 2. Ngăn chặn triệt để tấn công sửa đổi / làm giả dữ liệu (tampering / bit-flipping).
 * 3. Mỗi lần mã hóa đều dùng IV/Nonce ngẫu nhiên mới, kết quả mã hóa không bao giờ lặp lại.
 */
@Component
public class CryptoEncryptionService {

    private static final Logger log = LoggerFactory.getLogger(CryptoEncryptionService.class);

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits chuẩn cho GCM
    private static final int GCM_TAG_LENGTH = 128; // 128 bits auth tag
    private static final String ENCRYPTED_PREFIX = "ENC:GCM:";

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${app.security.encryption-key:${JWT_SECRET:RainbowForestEcommerceDataEncryptionSecretKey2026_Secure32BytesRequired!}}")
    private String rawSecretKey;

    private static SecretKeySpec secretKeySpec;

    @PostConstruct
    public void init() {
        try {
            // Dùng SHA-256 để chuẩn hóa khóa thành 256 bits (32 bytes) cho AES-256
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha.digest(rawSecretKey.getBytes(StandardCharsets.UTF_8));
            secretKeySpec = new SecretKeySpec(keyBytes, ALGORITHM);
            log.info("CryptoEncryptionService đã khởi tạo thành công với chuẩn AES-256-GCM.");
        } catch (Exception e) {
            log.error("Không thể khởi tạo CryptoEncryptionService: ", e);
            throw new IllegalStateException("Lỗi khởi tạo AES-256: " + e.getMessage(), e);
        }
    }

    /**
     * Mã hóa chuỗi plaintext sang chuỗi Base64 có kèm IV và tiền tố nhận diện.
     */
    public static String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) {
            return plaintext;
        }
        // Tránh mã hóa kép nếu đã được mã hóa trước đó
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

            // Ghép IV (12 bytes) + CipherText
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return ENCRYPTED_PREFIX + Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            log.error("Lỗi khi mã hóa dữ liệu: {}", e.getMessage());
            return plaintext;
        }
    }

    /**
     * Giải mã chuỗi đã mã hóa bằng AES-256-GCM về dạng plaintext ban đầu.
     * Hỗ trợ tương thích ngược với dữ liệu cũ chưa mã hóa.
     */
    public static String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }
        // Nếu không có tiền tố ENC:GCM: thì là dữ liệu cũ chưa mã hóa (legacy) -> trả về trực tiếp
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
            log.error("Lỗi khi giải mã dữ liệu: {}", e.getMessage());
            return encryptedText;
        }
    }
}
