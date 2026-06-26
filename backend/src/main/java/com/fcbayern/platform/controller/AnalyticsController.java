package com.fcbayern.platform.controller;

import com.fcbayern.platform.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/squad-strength")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnalyticsService.SquadStrengthResult> getSquadStrength() {
        return ResponseEntity.ok(analyticsService.computeSquadStrength());
    }

    @GetMapping("/age-curve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AnalyticsService.AgeCurvePoint>> getAgeCurve() {
        return ResponseEntity.ok(analyticsService.computeAgeCurve());
    }

    @GetMapping("/position-depth")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Integer>> getPositionDepth() {
        return ResponseEntity.ok(analyticsService.computePositionDepth());
    }

    @GetMapping("/injury-risk")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnalyticsService.InjuryRiskResult> getInjuryRisk() {
        return ResponseEntity.ok(analyticsService.computeInjuryRisk());
    }

    @GetMapping("/financial-health")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','FINANCE_MANAGER')")
    public ResponseEntity<AnalyticsService.FinancialHealthResult> getFinancialHealth() {
        return ResponseEntity.ok(analyticsService.computeFinancialHealth());
    }

    @GetMapping("/transfer-opportunities")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','SPORTING_DIRECTOR','RECRUITMENT_ANALYST')")
    public ResponseEntity<Map<String, Object>> getTransferOpportunities() {
        return ResponseEntity.ok(analyticsService.computeTransferOpportunities());
    }
}
