package com.rainbowforest.orderservice.security;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

/**
 * JPA AttributeConverter tự động mã hóa / giải mã địa chỉ giao hàng nhạy cảm của khách hàng trong đơn hàng.
 */
@Converter
public class OrderEncryptedStringConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return OrderCryptoEncryptionService.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return OrderCryptoEncryptionService.decrypt(dbData);
    }
}
