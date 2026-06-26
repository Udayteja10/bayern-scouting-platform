package com.fcbayern.platform.controller;

import com.fcbayern.platform.dto.ScoutingReportDto;
import com.fcbayern.platform.dto.ShortlistDto;
import com.fcbayern.platform.service.ScoutingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scouting")
@RequiredArgsConstructor
public class ScoutingController {

    private final ScoutingService scoutingService;

    // ─── Reports ──────────────────────────────────────────────────────────────

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','SPORTING_DIRECTOR','RECRUITMENT_ANALYST')")
    public ResponseEntity<Page<ScoutingReportDto>> getReports(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(scoutingService.getAllReports(page, size));
    }

    @GetMapping("/reports/{id}")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','SPORTING_DIRECTOR','RECRUITMENT_ANALYST')")
    public ResponseEntity<ScoutingReportDto> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(scoutingService.getReport(id));
    }

    @PostMapping("/reports")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','SPORTING_DIRECTOR','RECRUITMENT_ANALYST')")
    public ResponseEntity<ScoutingReportDto> createReport(
        @Valid @RequestBody ScoutingReportDto dto,
        Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(scoutingService.createReport(dto, authentication.getName()));
    }

    @DeleteMapping("/reports/{id}")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','SPORTING_DIRECTOR')")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        scoutingService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Shortlists ───────────────────────────────────────────────────────────

    @GetMapping("/shortlists")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','SPORTING_DIRECTOR','RECRUITMENT_ANALYST')")
    public ResponseEntity<List<ShortlistDto>> getShortlists() {
        return ResponseEntity.ok(scoutingService.getAllShortlists());
    }

    @PostMapping("/shortlists")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','SPORTING_DIRECTOR','RECRUITMENT_ANALYST')")
    public ResponseEntity<ShortlistDto> createShortlist(
        @RequestBody ShortlistDto dto,
        Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(scoutingService.createShortlist(dto, authentication.getName()));
    }

    @PostMapping("/shortlists/{shortlistId}/players/{playerId}")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','SPORTING_DIRECTOR','RECRUITMENT_ANALYST')")
    public ResponseEntity<ShortlistDto> addPlayer(
        @PathVariable Long shortlistId, @PathVariable Long playerId
    ) {
        return ResponseEntity.ok(scoutingService.addPlayerToShortlist(shortlistId, playerId));
    }

    @DeleteMapping("/shortlists/{shortlistId}/players/{playerId}")
    @PreAuthorize("hasAnyRole('CLUB_OWNER','SPORTING_DIRECTOR','RECRUITMENT_ANALYST')")
    public ResponseEntity<ShortlistDto> removePlayer(
        @PathVariable Long shortlistId, @PathVariable Long playerId
    ) {
        return ResponseEntity.ok(scoutingService.removePlayerFromShortlist(shortlistId, playerId));
    }
}
