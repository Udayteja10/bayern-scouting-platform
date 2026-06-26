package com.fcbayern.platform.dto;

import com.fcbayern.platform.entity.Transfer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TransferDto {
    private Long id;
    private Long playerId;
    private String playerName;
    private String playerPhotoUrl;
    private String fromClubName;
    private String toClubName;
    private BigDecimal fee;
    private Transfer.TransferType type;
    private Transfer.TransferStatus status;
    private LocalDate transferDate;
    private String position;
}
