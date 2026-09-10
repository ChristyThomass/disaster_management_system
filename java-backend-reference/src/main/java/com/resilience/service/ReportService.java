package com.resilience.service;

import com.resilience.model.DisasterReport;
import java.util.List;

public interface ReportService {
    /**
     * Saves a new disaster report to the database.
     * @param report The report object containing incident details.
     * @return The saved report instance.
     */
    DisasterReport submitReport(DisasterReport report);

    /**
     * Retrieves all active disaster reports.
     * @return A list of all reports.
     */
    List<DisasterReport> getAllReports();
    
    /**
     * Finds a specific report by its ID.
     * @param id The unique identifier of the report.
     * @return The found report, or null if not found.
     */
    DisasterReport getReportById(String id);
}
