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

@Entity
@Table(name = "user_addresses")
public class UserAddress extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "province_code", length = 20)
    private String provinceCode;

    @Column(name = "province_name", length = 120)
    private String provinceName;

    @Column(name = "recipient_name", length = 120)
    private String recipientName;

    @Column(name = "ward_code", length = 20)
    private String wardCode;

    @Column(name = "ward_name", length = 120)
    private String wardName;

    @Column(name = "street_line", length = 255)
    private String streetLine;

    @Column(name = "full_address", length = 500)
    private String fullAddress;

    /** SĐT liên hệ theo từng địa chỉ (khác SĐT tài khoản nếu cần). */
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_details_id", nullable = false)
    @JsonIgnore
    private UserDetails userDetails;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    public String getProvinceCode() { return provinceCode; }
    public void setProvinceCode(String provinceCode) { this.provinceCode = provinceCode; }
    public String getProvinceName() { return provinceName; }
    public void setProvinceName(String provinceName) { this.provinceName = provinceName; }
    public String getWardCode() { return wardCode; }
    public void setWardCode(String wardCode) { this.wardCode = wardCode; }
    public String getWardName() { return wardName; }
    public void setWardName(String wardName) { this.wardName = wardName; }
    public String getStreetLine() { return streetLine; }
    public void setStreetLine(String streetLine) { this.streetLine = streetLine; }
    public String getFullAddress() { return fullAddress; }
    public void setFullAddress(String fullAddress) { this.fullAddress = fullAddress; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean aDefault) { isDefault = aDefault; }
    public UserDetails getUserDetails() { return userDetails; }
    public void setUserDetails(UserDetails userDetails) { this.userDetails = userDetails; }
}
