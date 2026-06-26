package com.fcbayern.platform.service;

import com.fcbayern.platform.dto.DashboardSummaryDto;
import com.fcbayern.platform.entity.Injury;
import com.fcbayern.platform.entity.SyncLog;
import com.fcbayern.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final SquadMemberRepository squadMemberRepository;
    private final InjuryRepository injuryRepository;
    private final TransferRepository transferRepository;
    private final ShortlistRepository shortlistRepository;
    private final ScoutingReportRepository reportRepository;
    private final ClubRepository clubRepository;
    private final SyncLogRepository syncLogRepository;

    private static final Long BAYERN_SPORTMONKS_ID = 5L;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    public DashboardSummaryDto getSummary() {
        int squadSize = clubRepository.findBySportmonksId(BAYERN_SPORTMONKS_ID)
            .map(club -> squadMemberRepository.findByClubIdAndActiveTrue(club.getId()).size())
            .orElse(0);

        long activeInjuries = injuryRepository.countByStatus(Injury.InjuryStatus.ACTIVE);
        long activeRumours = transferRepository.countByStatus(
            com.fcbayern.platform.entity.Transfer.TransferStatus.RUMOUR
        );
        long shortlists = shortlistRepository.findByActiveTrue().size();
        long reports = reportRepository.count();

        List<DashboardSummaryDto.AlertDto> alerts = buildAlerts();
        DashboardSummaryDto.SyncStatusDto syncStatus = buildSyncStatus();

        return DashboardSummaryDto.builder()
            .squadSize(squadSize)
            .activeInjuries((int) activeInjuries)
            .activeTransferRumours((int) activeRumours)
            .shortlistCount((int) shortlists)
            .scoutingReports((int) reports)
            .recentAlerts(alerts)
            .syncStatus(syncStatus)
            .build();
    }

    private List<DashboardSummaryDto.AlertDto> buildAlerts() {
        List<DashboardSummaryDto.AlertDto> alerts = new ArrayList<>();
        // Injury alerts
        injuryRepository.findByStatus(Injury.InjuryStatus.ACTIVE)
            .stream().limit(5).forEach(injury ->
                alerts.add(DashboardSummaryDto.AlertDto.builder()
                    .type("INJURY")
                    .severity(injury.getSeverity() != null &&
                        injury.getSeverity() == Injury.InjurySeverity.CRITICAL ? "HIGH" : "MEDIUM")
                    .message(injury.getType() + " — Expected return: " +
                        (injury.getExpectedReturn() != null ? injury.getExpectedReturn().toString() : "Unknown"))
                    .playerName(injury.getPlayer().getName())
                    .playerPhoto(injury.getPlayer().getPhotoUrl())
                    .build())
            );
        return alerts;
    }

    private DashboardSummaryDto.SyncStatusDto buildSyncStatus() {
        String squadSync = syncLogRepository.findFirstBySyncTypeOrderByStartedAtDesc("SQUAD")
            .filter(sl -> sl.getCompletedAt() != null)
            .map(sl -> sl.getCompletedAt().format(FMT)).orElse("Never");
        String injurySync = syncLogRepository.findFirstBySyncTypeOrderByStartedAtDesc("INJURIES")
            .filter(sl -> sl.getCompletedAt() != null)
            .map(sl -> sl.getCompletedAt().format(FMT)).orElse("Never");
        String transferSync = syncLogRepository.findFirstBySyncTypeOrderByStartedAtDesc("TRANSFERS")
            .filter(sl -> sl.getCompletedAt() != null)
            .map(sl -> sl.getCompletedAt().format(FMT)).orElse("Never");

        boolean allOk = !"Never".equals(squadSync);
        return DashboardSummaryDto.SyncStatusDto.builder()
            .lastSquadSync(squadSync)
            .lastInjurySync(injurySync)
            .lastTransferSync(transferSync)
            .overallStatus(allOk ? "HEALTHY" : "NEEDS_SYNC")
            .build();
    }
}
