package com.fcbayern.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "player_statistics", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"player_id", "season_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlayerStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    // Appearances
    private Integer appearances;
    private Integer startingXI;
    private Integer substituteIn;
    private Integer minutesPlayed;

    // Attack
    private Integer goals;
    private Integer assists;
    private Integer shots;
    private Integer shotsOnTarget;
    private Integer dribbles;
    private Integer dribblesSuccessful;

    // Passing
    private Integer passes;
    private Integer passesAccurate;
    @Column(precision = 5, scale = 2)
    private BigDecimal passAccuracy;
    private Integer keyPasses;
    private Integer crossesAccurate;

    // Defensive
    private Integer tackles;
    private Integer interceptions;
    private Integer clearances;
    private Integer blockedShots;

    // Discipline
    private Integer yellowCards;
    private Integer redCards;
    private Integer foulsCommitted;
    private Integer foulsDrawn;

    // Rating
    @Column(precision = 4, scale = 2)
    private BigDecimal averageRating;

    // Goalkeeper specific
    private Integer saves;
    private Integer goalsConceded;
    private Integer cleanSheets;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
