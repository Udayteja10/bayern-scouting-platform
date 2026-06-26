package com.fcbayern.platform.controller;

import com.fcbayern.platform.dto.TransferDto;
import com.fcbayern.platform.service.TransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<TransferDto>> getTransfers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(transferService.getBayernTransfers(page, size));
    }
}
