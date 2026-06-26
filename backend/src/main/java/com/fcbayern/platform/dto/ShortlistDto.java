package com.fcbayern.platform.dto;

import com.fcbayern.platform.entity.Shortlist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ShortlistDto {
    private Long id;
    private String name;
    private String description;
    private Shortlist.ShortlistCategory category;
    private String createdByName;
    private List<PlayerDto> players;
    private Integer playerCount;
    private LocalDateTime createdAt;
}
