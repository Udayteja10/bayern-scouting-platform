package com.fcbayern.platform.dto;

import com.fcbayern.platform.entity.ScoutingReport;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ScoutingReportDto {
    private Long id;
    private Long playerId;
    private String playerName;
    private String playerPhoto;
    private String playerPosition;
    private Long createdById;
    private String createdByName;

    @NotNull @DecimalMin("1.0") @DecimalMax("10.0")
    private BigDecimal technicalRating;
    @NotNull @DecimalMin("1.0") @DecimalMax("10.0")
    private BigDecimal physicalRating;
    @NotNull @DecimalMin("1.0") @DecimalMax("10.0")
    private BigDecimal mentalRating;
    @NotNull @DecimalMin("1.0") @DecimalMax("10.0")
    private BigDecimal tacticalRating;
    private BigDecimal overallRating;

    private String strengths;
    private String weaknesses;
    private String notes;
    private ScoutingReport.Recommendation recommendation;
    private String matchObserved;
    private String observationDate;
    private LocalDateTime createdAt;
}
