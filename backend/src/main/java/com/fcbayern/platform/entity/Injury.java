package com.fcbayern.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "injuries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Injury {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @Column(nullable = false)
    private String type;           // e.g. "Muscle Injury", "Knee Injury"

    private String bodyPart;       // e.g. "Left Knee", "Hamstring"

    @Enumerated(EnumType.STRING)
    private InjurySeverity severity; // MINOR, MODERATE, MAJOR, CRITICAL

    private LocalDate startDate;
    private LocalDate expectedReturn;
    private LocalDate actualReturn;

    @Enumerated(EnumType.STRING)
    private InjuryStatus status;   // ACTIVE, RECOVERED, UNKNOWN

    private String description;

    private Long sportmonksId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum InjurySeverity {
        MINOR, MODERATE, MAJOR, CRITICAL
    }

    public enum InjuryStatus {
        ACTIVE, RECOVERED, UNKNOWN
    }
}
