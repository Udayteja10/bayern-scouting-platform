package com.fcbayern.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardSummaryDto {
    private Integer squadSize;
    private Integer activeInjuries;
    private Integer activeTransferRumours;
    private Integer shortlistCount;
    private Integer scoutingReports;
    private Double squadAverageAge;
    private Double squadAverageRating;
    private List<AlertDto> recentAlerts;
    private SyncStatusDto syncStatus;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AlertDto {
        private String type;    // INJURY, CONTRACT_EXPIRY, TRANSFER
        private String severity; // HIGH, MEDIUM, LOW
        private String message;
        private String playerName;
        private String playerPhoto;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SyncStatusDto {
        private String lastSquadSync;
        private String lastInjurySync;
        private String lastTransferSync;
        private String overallStatus;
    }
}
