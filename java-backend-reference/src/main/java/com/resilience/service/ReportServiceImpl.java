package com.resilience.service;

import com.resilience.model.DisasterReport;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReportServiceImpl implements ReportService {

    // Simulating a database using an in-memory list for this example
    private final List<DisasterReport> database = new ArrayList<>();

    @Override
    public DisasterReport submitReport(DisasterReport report) {
        // Generate a unique ID if one doesn't exist
        if (report.getId() == null || report.getId().isEmpty()) {
            report.setId(UUID.randomUUID().toString());
        }
        
        // Add to "database"
        database.add(report);
        
        System.out.println("New report logged via Java OOP Service: " + report.getTitle());
        return report;
    }

    @Override
    public List<DisasterReport> getAllReports() {
        return new ArrayList<>(database); // Return a copy to maintain encapsulation
    }

    @Override
    public DisasterReport getReportById(String id) {
        Optional<DisasterReport> found = database.stream()
                .filter(report -> report.getId().equals(id))
                .findFirst();
                
        return found.orElse(null);
    }
}
