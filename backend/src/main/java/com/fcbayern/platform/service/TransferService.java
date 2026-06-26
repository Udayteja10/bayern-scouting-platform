package com.fcbayern.platform.service;

import com.fcbayern.platform.dto.TransferDto;
import com.fcbayern.platform.entity.Transfer;
import com.fcbayern.platform.repository.ClubRepository;
import com.fcbayern.platform.repository.TransferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransferService {

    private final TransferRepository transferRepository;
    private final ClubRepository clubRepository;

    private static final Long BAYERN_SPORTMONKS_ID = 5L;

    public Page<TransferDto> getBayernTransfers(int page, int size) {
        return clubRepository.findBySportmonksId(BAYERN_SPORTMONKS_ID)
            .map(club -> {
                Pageable pageable = PageRequest.of(page, size, Sort.by("transferDate").descending());
                return transferRepository.findByToClubIdOrFromClubId(club.getId(), club.getId(), pageable)
                    .map(this::toDto);
            })
            .orElse(Page.empty());
    }

    private TransferDto toDto(Transfer t) {
        return TransferDto.builder()
            .id(t.getId())
            .playerId(t.getPlayer().getId())
            .playerName(t.getPlayer().getName())
            .playerPhotoUrl(t.getPlayer().getPhotoUrl())
            .fromClubName(t.getFromClub() != null ? t.getFromClub().getName() : "Free Agent")
            .toClubName(t.getToClub() != null ? t.getToClub().getName() : "Unknown")
            .fee(t.getFee())
            .type(t.getType())
            .status(t.getStatus())
            .transferDate(t.getTransferDate())
            .position(t.getPlayer().getPosition())
            .build();
    }
}
