package com.rainbowforest.userservice.dto;

public class ProfilePersonalInfoRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String birthDate;
    private String gender;
    private String performedBy;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getBirthDate() { return birthDate; }
    public void setBirthDate(String birthDate) { this.birthDate = birthDate; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}
