package com.disastermanagement.model;

public class Admin extends User {
    public Admin(String id, String fullName, String email, String phone, String district) {
        super(id, fullName, email, phone, district);
    }

    @Override
    public String getRoleName() {
        return "Administrator";
    }
    
    public void generateSystemReport() {
        System.out.println("Generating secure admin system report...");
    }
}
