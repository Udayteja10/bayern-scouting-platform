package com.fcbayern.platform.dto;

import com.fcbayern.platform.entity.SyncLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SyncLogDto {
    private Long id;
    private String syncType;
    private SyncLog.SyncStatus status;
    private Integer recordsSynced;
    private Integer recordsFailed;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String triggeredBy;
    private Long durationSeconds;
}
