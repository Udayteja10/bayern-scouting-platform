package com.fcbayern.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "players")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long sportmonksId;

    @Column(nullable = false)
    private String name;

    private String firstName;
    private String lastName;
    private String displayName;

    @Column(nullable = false)
    private String position;       // e.g. Goalkeeper, Defender, Midfielder, Forward
    private String detailedPosition; // e.g. Centre-Back, Defensive Midfielder

    private String nationality;
    private String secondNationality;

    private LocalDate birthDate;
    private String birthCountry;
    private String birthCity;

    private Integer height;        // cm
    private Integer weight;        // kg
    private String preferredFoot;  // Left, Right, Both

    private String jerseyNumber;

    @Column(length = 1000)
    private String photoUrl;

    @Column(precision = 15, scale = 2)
    private BigDecimal marketValue; // EUR

    @Column(precision = 15, scale = 2)
    private BigDecimal contractValue;

    private LocalDate contractExpiry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_club_id")
    private Club currentClub;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
