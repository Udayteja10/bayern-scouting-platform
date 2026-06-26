package com.fcbayern.platform.dto;

import com.fcbayern.platform.entity.Injury;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InjuryDto {
    private Long id;
    private Long playerId;
    private String playerName;
    private String type;
    private String bodyPart;
    private Injury.InjurySeverity severity;
    private LocalDate startDate;
    private LocalDate expectedReturn;
    private Injury.InjuryStatus status;
    private String description;
}
