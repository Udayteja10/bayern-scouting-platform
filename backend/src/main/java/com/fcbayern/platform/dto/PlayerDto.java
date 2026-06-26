package com.fcbayern.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlayerDto {
    private Long id;
    private Long sportmonksId;
    private String name;
    private String position;
    private String detailedPosition;
    private String nationality;
    private LocalDate birthDate;
    private Integer age;
    private Integer height;
    private Integer weight;
    private String preferredFoot;
    private String jerseyNumber;
    private String photoUrl;
    private BigDecimal marketValue;
    private LocalDate contractExpiry;
    private String currentClubName;
    private Long currentClubId;
    private BigDecimal averageRating;
}
