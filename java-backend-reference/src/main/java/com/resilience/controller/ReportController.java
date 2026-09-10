package com.resilience.controller;

import com.resilience.model.DisasterReport;
import com.resilience.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000") // Allow React Frontend to connect
public class ReportController {

    private final ReportService reportService;

    // Dependency Injection
    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // Endpoint to retrieve all reports
    @GetMapping
    public ResponseEntity<List<DisasterReport>> getAllReports() {
        List<DisasterReport> reports = reportService.getAllReports();
        return ResponseEntity.ok(reports);
    }

    // Endpoint to submit a new report
    @PostMapping
    public ResponseEntity<DisasterReport> submitReport(@RequestBody DisasterReport newReport) {
        DisasterReport savedReport = reportService.submitReport(newReport);
        return ResponseEntity.ok(savedReport);
    }
    
    // Endpoint to get a specific report
    @GetMapping("/{id}")
    public ResponseEntity<DisasterReport> getReportById(@PathVariable String id) {
        DisasterReport report = reportService.getReportById(id);
        if (report != null) {
            return ResponseEntity.ok(report);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
