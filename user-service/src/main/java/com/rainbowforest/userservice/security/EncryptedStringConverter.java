package com.rainbowforest.userservice.security;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

/**
 * JPA AttributeConverter tự động mã hóa dữ liệu nhạy cảm trước khi ghi xuống Database
 * và tự động giải mã khi đọc dữ liệu lên Java Entity.
 * 
 * Hoạt động hoàn toàn trong suốt (transparent):
 * - Không ảnh hưởng đến Business Logic / Service / Controller hiện tại.
 * - Dưới Database (MySQL), dữ liệu được lưu dưới dạng chuỗi băm mã hóa AES-256-GCM không thể đọc được.
 * - Dữ liệu cũ chưa mã hóa vẫn tự động đọc bình thường (backward compatible).
 */
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return CryptoEncryptionService.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return CryptoEncryptionService.decrypt(dbData);
    }
}
