package com.rainbowforest.userservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table (name = "users_details")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserDetails extends AuditableEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "first_name", nullable = false, length = 50)
    private String firstName;
    @Column (name = "last_name", nullable = false, length = 50)
    private String lastName;
    @Column (name = "avatar_url", length = 500)
    private String avatarUrl;
    @Column (name = "birth_date")
    private LocalDate birthDate;
    @Column (name = "gender", length = 20)
    private String gender;

    @OneToMany(mappedBy = "userDetails", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("isDefault DESC, id DESC")
    private List<UserAddress> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "userDetails", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt DESC, id DESC")
    private List<UserProfileChangeLog> changeLogs = new ArrayList<>();

    @OneToOne(mappedBy = "userDetails")
	@JsonIgnore 
    private User user;

	public UserDetails() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public List<UserAddress> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<UserAddress> addresses) {
        this.addresses = addresses != null ? addresses : new ArrayList<>();
        for (UserAddress a : this.addresses) {
            if (a != null) a.setUserDetails(this);
        }
    }

    public void addAddress(UserAddress address) {
        if (address == null) return;
        if (this.addresses == null) this.addresses = new ArrayList<>();
        address.setUserDetails(this);
        this.addresses.add(address);
    }

    @JsonProperty("address")
    public UserAddress getAddressForJson() {
        if (addresses == null || addresses.isEmpty()) {
            return null;
        }
        for (UserAddress a : addresses) {
            if (a != null && Boolean.TRUE.equals(a.getIsDefault())) {
                return a;
            }
        }
        return addresses.get(0);
    }

    @JsonProperty("changeLogs")
    public List<UserProfileChangeLog> getChangeLogs() {
        return changeLogs;
    }

    public void setChangeLogs(List<UserProfileChangeLog> changeLogs) {
        this.changeLogs = changeLogs;
    }

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
}
