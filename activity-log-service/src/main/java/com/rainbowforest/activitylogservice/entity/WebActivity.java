package com.rainbowforest.activitylogservice.entity;

import javax.persistence.*;

@Entity
@Table(name = "web_activities")
public class WebActivity extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_user_id", length = 64)
    private String actorUserId;

    @Column(name = "actor_username", length = 128)
    private String actorUsername;

    @Column(name = "action", length = 128)
    private String action;

    @Column(name = "resource_type", length = 64)
    private String resourceType;

    @Column(name = "resource_id", length = 64)
    private String resourceId;

    @Column(name = "http_method", length = 16)
    private String httpMethod;

    @Column(name = "request_path", length = 512)
    private String requestPath;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "detail_json", length = 4000)
    private String detailJson;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActorUserId() {
        return actorUserId;
    }

    public void setActorUserId(String actorUserId) {
        this.actorUserId = actorUserId;
    }

    public String getActorUsername() {
        return actorUsername;
    }

    public void setActorUsername(String actorUsername) {
        this.actorUsername = actorUsername;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }

    public String getRequestPath() {
        return requestPath;
    }

    public void setRequestPath(String requestPath) {
        this.requestPath = requestPath;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getDetailJson() {
        return detailJson;
    }

    public void setDetailJson(String detailJson) {
        this.detailJson = detailJson;
    }
}
