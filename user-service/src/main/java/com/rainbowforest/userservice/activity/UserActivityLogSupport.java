package com.rainbowforest.userservice.activity;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserAddress;
import com.rainbowforest.userservice.entity.UserDetails;
import com.rainbowforest.userservice.entity.UserProfileChangeLog;

import java.util.LinkedHashMap;
import java.util.Map;

public final class UserActivityLogSupport {

    private UserActivityLogSupport() {
    }

    /** Không chứa mật khẩu hay token. */
    public static Map<String, Object> detailAfterUser(User u) {
        Map<String, Object> after = new LinkedHashMap<>();
        after.put("userId", u.getId());
        after.put("userName", u.getUserName());
        after.put("activated", u.isActivated());

        if (u.getRole() != null) {
            after.put("roleName", u.getRole().getRoleName());
        }

        UserDetails d = u.getUserDetails();
        if (d != null) {
            after.put("email", u.getEmail());
            after.put("firstName", d.getFirstName());
            after.put("lastName", d.getLastName());
            after.put("phoneNumber", u.getPhoneNumber());
            after.put("avatarUrl", d.getAvatarUrl());
            after.put("birthDate", d.getBirthDate());
            after.put("gender", d.getGender());

            UserAddress a = d.getAddressForJson();
            if (a != null) {
                after.put("address", a.getFullAddress());
            }
        }

        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("resourceType", "User");
        detail.put("after", after);

        return detail;
    }

    public static Map<String, Object> detailForProfileChange(
            UserDetails details,
            UserProfileChangeLog log
    ) {
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("resourceType", "UserProfileChangeLog");

        Map<String, Object> after = new LinkedHashMap<>();
        after.put("userDetailsId", details != null ? details.getId() : null);
        after.put("changedField", log.getChangedField());
        after.put("oldValue", log.getOldValue());
        after.put("newValue", log.getNewValue());
        after.put("changedAt", log.getChangedAt());
        after.put("changedBy", log.getChangedBy());

        detail.put("after", after);

        return detail;
    }

    public static Map<String, Object> detailAfterAddress(
            Long userId,
            UserAddress address
    ) {
        Map<String, Object> after = new LinkedHashMap<>();
        after.put("userId", userId);
        after.put("addressId", address != null ? address.getId() : null);

        if (address != null) {
            after.put("provinceCode", address.getProvinceCode());
            after.put("provinceName", address.getProvinceName());

            // Đã bỏ districtCode và districtName

            after.put("wardCode", address.getWardCode());
            after.put("wardName", address.getWardName());
            after.put("streetLine", address.getStreetLine());
            after.put("fullAddress", address.getFullAddress());
            after.put("phoneNumber", address.getPhoneNumber());
            after.put("isDefault", Boolean.TRUE.equals(address.getIsDefault()));
        }

        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("resourceType", "UserAddress");
        detail.put("after", after);

        return detail;
    }

    public static Map<String, Object> detailBeforeAddressDelete(
            Long userId,
            Long addressId
    ) {
        Map<String, Object> before = new LinkedHashMap<>();
        before.put("userId", userId);
        before.put("addressId", addressId);

        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("resourceType", "UserAddress");
        detail.put("before", before);

        return detail;
    }
}