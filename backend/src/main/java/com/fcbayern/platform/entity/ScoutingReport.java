package com.fcbayern.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "scouting_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScoutingReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    // Ratings (1.0 - 10.0)
    @Column(precision = 3, scale = 1)
    private BigDecimal technicalRating;

    @Column(precision = 3, scale = 1)
    private BigDecimal physicalRating;

    @Column(precision = 3, scale = 1)
    private BigDecimal mentalRating;

    @Column(precision = 3, scale = 1)
    private BigDecimal tacticalRating;

    @Column(precision = 3, scale = 1)
    private BigDecimal overallRating;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    private Recommendation recommendation;

    private String matchObserved;
    private String observationDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Recommendation {
        STRONGLY_RECOMMEND, RECOMMEND, NEUTRAL, NOT_RECOMMEND, REJECT
    }
}
