package com.disastermanagement.model;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Encapsulation: DisasterReport model with private fields and public getters/setters.
 */
public class DisasterReport {
    private String id;
    private String type;
    private String location;
    private String description;
    private String severity;
    private String reporterId;
    private LocalDateTime createdAt;

    public DisasterReport(String type, String location, String description, String severity, String reporterId) {
        this.id = UUID.randomUUID().toString();
        this.type = type;
        this.location = location;
        this.description = description;
        this.severity = severity;
        this.reporterId = reporterId;
        this.createdAt = LocalDateTime.now();
    }

    // Getters
    public String getId() { return id; }
    public String getType() { return type; }
    public String getLocation() { return location; }
    public String getDescription() { return description; }
    public String getSeverity() { return severity; }
    public String getReporterId() { return reporterId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
