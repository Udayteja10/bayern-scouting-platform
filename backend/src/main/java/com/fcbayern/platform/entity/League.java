package com.fcbayern.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "leagues")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class League {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long sportmonksId;

    @Column(nullable = false)
    private String name;

    private String country;
    private String type;
    private String logoUrl;
    private boolean active;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
