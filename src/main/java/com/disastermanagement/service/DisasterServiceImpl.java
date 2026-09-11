package com.disastermanagement.service;

import com.disastermanagement.model.DisasterReport;
import com.disastermanagement.repository.DisasterRepository;
import java.util.List;

public class DisasterServiceImpl implements DisasterService {

    private DisasterRepository repository;

    public DisasterServiceImpl() {
        this.repository = new DisasterRepository();
    }

    @Override
    public boolean submitReport(DisasterReport report) {
        if (report == null || report.getType().isEmpty() || report.getLocation().isEmpty()) {
            throw new IllegalArgumentException("Report fields cannot be empty.");
        }
        return repository.saveReport(report);
    }

    @Override
    public List<DisasterReport> getActiveReports() {
        return repository.getAllReports();
    }
}
