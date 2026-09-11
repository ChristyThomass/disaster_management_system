package com.disastermanagement.service;

import com.disastermanagement.model.DisasterReport;
import java.util.List;

/**
 * Abstraction: Interface for disaster reporting logic.
 */
public interface DisasterService {
    boolean submitReport(DisasterReport report);
    List<DisasterReport> getActiveReports();
}
