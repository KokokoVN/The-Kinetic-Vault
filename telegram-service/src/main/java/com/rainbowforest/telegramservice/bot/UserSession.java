package com.rainbowforest.telegramservice.bot;

public class UserSession {
    private BotState state = BotState.NONE;
    private Long targetProductId;
    private Long targetVariantId;
    private Long targetSpecId;

    public BotState getState() { return state; }
    public void setState(BotState state) { this.state = state; }

    public Long getTargetProductId() { return targetProductId; }
    public void setTargetProductId(Long targetProductId) { this.targetProductId = targetProductId; }

    public Long getTargetVariantId() { return targetVariantId; }
    public void setTargetVariantId(Long targetVariantId) { this.targetVariantId = targetVariantId; }

    public Long getTargetSpecId() { return targetSpecId; }
    public void setTargetSpecId(Long targetSpecId) { this.targetSpecId = targetSpecId; }
    
    public void clear() {
        this.state = BotState.NONE;
        this.targetProductId = null;
        this.targetVariantId = null;
        this.targetSpecId = null;
    }
}
