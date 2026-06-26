package com.fcbayern.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlayerDetailDto {
    private Long id;
    private Long sportmonksId;
    private String name;
    private String firstName;
    private String lastName;
    private String position;
    private String detailedPosition;
    private String nationality;
    private String secondNationality;
    private LocalDate birthDate;
    private Integer age;
    private String birthCountry;
    private String birthCity;
    private Integer height;
    private Integer weight;
    private String preferredFoot;
    private String jerseyNumber;
    private String photoUrl;
    private BigDecimal marketValue;
    private BigDecimal contractValue;
    private LocalDate contractExpiry;
    private String currentClubName;
    private Long currentClubId;
    private List<PlayerStatisticsDto> statistics;
    private List<InjuryDto> injuries;
    private List<TransferDto> transfers;
}
