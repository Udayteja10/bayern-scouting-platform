package com.fcbayern.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sportmonksId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_club_id")
    private Club fromClub;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_club_id")
    private Club toClub;

    @Column(precision = 15, scale = 2)
    private BigDecimal fee;        // EUR

    @Enumerated(EnumType.STRING)
    private TransferType type;     // PERMANENT, LOAN, FREE, RETURN_FROM_LOAN

    @Enumerated(EnumType.STRING)
    private TransferStatus status; // COMPLETED, RUMOUR, NEGOTIATING, FAILED

    private LocalDate transferDate;
    private LocalDate announcedDate;

    private String currency;
    private String source;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum TransferType {
        PERMANENT, LOAN, FREE, RETURN_FROM_LOAN
    }

    public enum TransferStatus {
        COMPLETED, RUMOUR, NEGOTIATING, FAILED
    }
}
