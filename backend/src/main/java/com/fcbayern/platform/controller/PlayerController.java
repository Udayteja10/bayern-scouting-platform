package com.fcbayern.platform.controller;

import com.fcbayern.platform.dto.PlayerDetailDto;
import com.fcbayern.platform.dto.PlayerDto;
import com.fcbayern.platform.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<PlayerDto>> searchPlayers(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String position,
        @RequestParam(required = false) String nationality,
        @RequestParam(required = false) Long clubId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(playerService.searchPlayers(name, position, nationality, clubId, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PlayerDetailDto> getPlayer(@PathVariable Long id) {
        return ResponseEntity.ok(playerService.getPlayerDetail(id));
    }
}
