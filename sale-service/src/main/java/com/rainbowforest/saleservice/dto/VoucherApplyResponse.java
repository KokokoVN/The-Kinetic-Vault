package com.rainbowforest.saleservice.dto;

import java.math.BigDecimal;

/**
 * Kết quả trả về khi apply voucher.
 */
public class VoucherApplyResponse {
    private boolean valid;
    private String code;
    private String message;
    private BigDecimal discountAmount;
    private String discountType;
    private BigDecimal discountValue;

    public static VoucherApplyResponse ok(String code, BigDecimal discountAmount, String discountType, BigDecimal discountValue) {
        VoucherApplyResponse r = new VoucherApplyResponse();
        r.valid = true;
        r.code = code;
        r.discountAmount = discountAmount;
        r.discountType = discountType;
        r.discountValue = discountValue;
        return r;
    }

    public static VoucherApplyResponse error(String code, String message) {
        VoucherApplyResponse r = new VoucherApplyResponse();
        r.valid = false;
        r.code = code;
        r.message = message;
        return r;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }
    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
}
