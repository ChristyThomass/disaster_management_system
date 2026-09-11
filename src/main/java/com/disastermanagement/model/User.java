package com.disastermanagement.model;

/**
 * Abstraction and Encapsulation: Abstract base class for all system users.
 */
public abstract class User {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String district;

    public User(String id, String fullName, String email, String phone, String district) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.district = district;
    }

    public abstract String getRoleName();

    public String getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getDistrict() { return district; }
}
