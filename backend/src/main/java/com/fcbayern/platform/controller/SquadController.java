package com.fcbayern.platform.controller;

import com.fcbayern.platform.dto.SquadMemberDto;
import com.fcbayern.platform.service.SquadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/squad")
@RequiredArgsConstructor
public class SquadController {

    private final SquadService squadService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SquadMemberDto>> getSquad() {
        return ResponseEntity.ok(squadService.getBayernSquad());
    }

    @GetMapping("/depth-chart")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, List<SquadMemberDto>>> getDepthChart() {
        return ResponseEntity.ok(squadService.getDepthChart());
    }
}
