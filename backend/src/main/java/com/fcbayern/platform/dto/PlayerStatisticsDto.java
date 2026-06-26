package com.fcbayern.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlayerStatisticsDto {
    private Long id;
    private String seasonName;
    private Integer appearances;
    private Integer minutesPlayed;
    private Integer goals;
    private Integer assists;
    private Integer yellowCards;
    private Integer redCards;
    private BigDecimal passAccuracy;
    private BigDecimal averageRating;
    private Integer saves;
    private Integer cleanSheets;
}
