package com.fcbayern.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SquadMemberDto {
    private Long id;
    private Long playerId;
    private String playerName;
    private String photoUrl;
    private String position;
    private String detailedPosition;
    private String positionCategory;
    private String jerseyNumber;
    private String nationality;
    private Integer age;
    private String preferredFoot;
    private Double averageRating;
    private Boolean injured;
    private String teamName;
}
