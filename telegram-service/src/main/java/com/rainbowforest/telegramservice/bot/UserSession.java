package com.rainbowforest.telegramservice.bot;

public class UserSession {
    private BotState state = BotState.NONE;
    private Long targetProductId;
    private Long targetVariantId;
    private Long targetSpecId;

    /** Lần cuối user tương tác (millis). Dùng cho cleanup session quá hạn. */
    private volatile long lastAccessedAt = System.currentTimeMillis();

    public BotState getState() { return state; }
    public void setState(BotState state) { this.state = state; touch(); }

    public Long getTargetProductId() { return targetProductId; }
    public void setTargetProductId(Long targetProductId) { this.targetProductId = targetProductId; touch(); }

    public Long getTargetVariantId() { return targetVariantId; }
    public void setTargetVariantId(Long targetVariantId) { this.targetVariantId = targetVariantId; touch(); }

    public Long getTargetSpecId() { return targetSpecId; }
    public void setTargetSpecId(Long targetSpecId) { this.targetSpecId = targetSpecId; touch(); }

    public long getLastAccessedAt() { return lastAccessedAt; }

    /** Cập nhật thời điểm truy cập - gọi khi user tương tác với bot. */
    public void touch() {
        this.lastAccessedAt = System.currentTimeMillis();
    }

    public void clear() {
        this.state = BotState.NONE;
        this.targetProductId = null;
        this.targetVariantId = null;
        this.targetSpecId = null;
        touch();
    }
}