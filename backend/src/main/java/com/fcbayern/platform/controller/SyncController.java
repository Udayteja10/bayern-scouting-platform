package com.fcbayern.platform.controller;

import com.fcbayern.platform.dto.SyncLogDto;
import com.fcbayern.platform.entity.SyncLog;
import com.fcbayern.platform.repository.SyncLogRepository;
import com.fcbayern.platform.service.SyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
public class SyncController {

    private final SyncService syncService;
    private final SyncLogRepository syncLogRepository;

    @PostMapping("/trigger")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','SPORTING_DIRECTOR')")
    public ResponseEntity<SyncLogDto> triggerSync(
        @RequestBody Map<String, String> body,
        Authentication authentication
    ) {
        String type = body.getOrDefault("type", "SQUAD");
        String triggeredBy = authentication.getName();

        SyncLog log = switch (type.toUpperCase()) {
            case "SQUAD" -> syncService.syncBayernSquad(triggeredBy);
            case "INJURIES" -> syncService.syncInjuries(triggeredBy);
            case "TRANSFERS" -> syncService.syncTransfers(triggeredBy);
            case "LEAGUE_PLAYERS" -> syncService.syncLeaguePlayers(triggeredBy);
            default -> throw new IllegalArgumentException("Unknown sync type: " + type);
        };
        return ResponseEntity.ok(toDto(log));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','SPORTING_DIRECTOR')")
    public ResponseEntity<Page<SyncLogDto>> getLogs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Page<SyncLogDto> result = syncLogRepository
            .findAllByOrderByStartedAtDesc(PageRequest.of(page, size))
            .map(this::toDto);
        return ResponseEntity.ok(result);
    }

    private SyncLogDto toDto(SyncLog log) {
        Long duration = null;
        if (log.getStartedAt() != null && log.getCompletedAt() != null) {
            duration = Duration.between(log.getStartedAt(), log.getCompletedAt()).getSeconds();
        }
        return SyncLogDto.builder()
            .id(log.getId())
            .syncType(log.getSyncType())
            .status(log.getStatus())
            .recordsSynced(log.getRecordsSynced())
            .recordsFailed(log.getRecordsFailed())
            .errorMessage(log.getErrorMessage())
            .startedAt(log.getStartedAt())
            .completedAt(log.getCompletedAt())
            .triggeredBy(log.getTriggeredBy())
            .durationSeconds(duration)
            .build();
    }
}
