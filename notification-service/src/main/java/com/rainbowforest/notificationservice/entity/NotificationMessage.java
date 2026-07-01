package com.rainbowforest.notificationservice.entity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "notification_messages")
public class NotificationMessage extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "channel", length = 16)
    private String channel;

    @NotNull
    @Column(name = "recipient", length = 255)
    private String recipient;

    @Column(name = "subject", length = 255)
    private String subject;

    @Column(name = "body", length = 4000)
    private String body;

    @Column(name = "status", length = 32)
    private String status = "UNREAD";

    @Column(name = "source", length = 32)
    private String source = "SYSTEM";

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
