package com.rainbowforest.orderservice.feignclient;

public class UserClientResponse {
    private Long id;
    private String userName;
    private String email;
    private String phoneNumber;
    private UserDetailsResponse userDetails;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public UserDetailsResponse getUserDetails() {
        return userDetails;
    }

    public void setUserDetails(UserDetailsResponse userDetails) {
        this.userDetails = userDetails;
    }

    public static class UserDetailsResponse {
        private String phoneNumber;

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }
    }
}
