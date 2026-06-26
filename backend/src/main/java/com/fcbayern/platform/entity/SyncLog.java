package com.fcbayern.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sync_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String syncType; // SQUAD, LEAGUE_PLAYERS, INJURIES, TRANSFERS

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SyncStatus status;

    private Integer recordsSynced;
    private Integer recordsFailed;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private String triggeredBy; // SCHEDULER or USER_EMAIL

    public enum SyncStatus {
        RUNNING, SUCCESS, PARTIAL, FAILED
    }
}
