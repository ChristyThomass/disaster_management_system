package com.resilience.model;

import java.time.LocalDateTime;

public class DisasterReport {
    private String id;
    private String title;
    private String description;
    private String type;
    private String location;
    private String severity;
    private String reporterId;
    private String reporterName;
    private LocalDateTime createdAt;

    // Default Constructor
    public DisasterReport() {}

    // Parameterized Constructor
    public DisasterReport(String id, String title, String description, String type, 
                          String location, String severity, String reporterId, String reporterName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.location = location;
        this.severity = severity;
        this.reporterId = reporterId;
        this.reporterName = reporterName;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters (Encapsulation)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getReporterId() { return reporterId; }
    public void setReporterId(String reporterId) { this.reporterId = reporterId; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
