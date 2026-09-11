package com.disastermanagement.model;

import java.time.LocalDateTime;

public class SOSAlert {
    private String id;
    private String userId;
    private String fullName;
    private String phone;
    private double latitude;
    private double longitude;
    private String status;
    private LocalDateTime createdAt;

    public SOSAlert(String id, String userId, String fullName, String phone, double latitude, double longitude) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.phone = phone;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = "active";
        this.createdAt = LocalDateTime.now();
    }
    
    public String getFullName() { return fullName; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public String getStatus() { return status; }
}
