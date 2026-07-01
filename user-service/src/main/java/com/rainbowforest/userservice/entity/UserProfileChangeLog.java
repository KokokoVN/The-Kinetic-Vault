package com.rainbowforest.userservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profile_change_logs")
public class UserProfileChangeLog extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_details_id", nullable = false)
    @JsonIgnore
    private UserDetails userDetails;

    @Column(name = "changed_field", length = 80)
    private String changedField;

    @Column(name = "old_value", length = 1000)
    private String oldValue;

    @Column(name = "new_value", length = 1000)
    private String newValue;

    @Column(name = "changed_at")
    private LocalDateTime changedAt;

    @Column(name = "changed_by", length = 128)
    private String changedBy;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserDetails getUserDetails() { return userDetails; }
    public void setUserDetails(UserDetails userDetails) { this.userDetails = userDetails; }
    public String getChangedField() { return changedField; }
    public void setChangedField(String changedField) { this.changedField = changedField; }
    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }
    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
}
