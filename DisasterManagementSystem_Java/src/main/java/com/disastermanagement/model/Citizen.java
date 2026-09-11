package com.disastermanagement.model;

public class Citizen extends User {
    public Citizen(String id, String fullName, String email, String phone, String district) {
        super(id, fullName, email, phone, district);
    }

    @Override
    public String getRoleName() {
        return "Civilian";
    }
}
