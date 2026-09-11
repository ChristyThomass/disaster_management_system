package com.disastermanagement.repository;

import com.disastermanagement.database.DatabaseConnection;
import com.disastermanagement.model.DisasterReport;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class DisasterRepository {

    public boolean saveReport(DisasterReport report) {
        String query = "INSERT INTO disaster_reports (id, disaster_type, location, description, severity, reporter_id) VALUES (?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
             
            stmt.setString(1, report.getId());
            stmt.setString(2, report.getType());
            stmt.setString(3, report.getLocation());
            stmt.setString(4, report.getDescription());
            stmt.setString(5, report.getSeverity());
            stmt.setString(6, report.getReporterId());
            
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Failed to save disaster report: " + e.getMessage());
            return false;
        }
    }

    public List<DisasterReport> getAllReports() {
        List<DisasterReport> reports = new ArrayList<>();
        // In a real implementation, you would query the database here.
        // For demonstration, returning an empty list if DB is not connected.
        return reports;
    }
}
