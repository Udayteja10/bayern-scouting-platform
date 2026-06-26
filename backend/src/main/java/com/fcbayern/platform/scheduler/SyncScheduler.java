package com.fcbayern.platform.scheduler;

import com.fcbayern.platform.service.SyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SyncScheduler {

    private final SyncService syncService;

    /**
     * Daily at 3:00 AM — Bayern squad + stats
     */
    @Scheduled(cron = "${app.sync.squad-cron}")
    public void scheduledSquadSync() {
        log.info("🔄 [SCHEDULER] Starting Bayern squad sync...");
        syncService.syncBayernSquad("SCHEDULER");
        log.info("✅ [SCHEDULER] Bayern squad sync complete");
    }

    /**
     * Every Monday at 4:00 AM — Top 5 league players
     */
    @Scheduled(cron = "${app.sync.league-players-cron}")
    public void scheduledLeaguePlayersSync() {
        log.info("🔄 [SCHEDULER] Starting league players sync...");
        syncService.syncLeaguePlayers("SCHEDULER");
        log.info("✅ [SCHEDULER] League players sync complete");
    }

    /**
     * Every 6 hours — Injury updates
     */
    @Scheduled(cron = "${app.sync.injury-cron}")
    public void scheduledInjurySync() {
        log.info("🔄 [SCHEDULER] Starting injury sync...");
        syncService.syncInjuries("SCHEDULER");
        log.info("✅ [SCHEDULER] Injury sync complete");
    }

    /**
     * Daily at 8:00 AM — Transfer updates
     */
    @Scheduled(cron = "${app.sync.transfer-cron}")
    public void scheduledTransferSync() {
        log.info("🔄 [SCHEDULER] Starting transfer sync...");
        syncService.syncTransfers("SCHEDULER");
        log.info("✅ [SCHEDULER] Transfer sync complete");
    }
}
