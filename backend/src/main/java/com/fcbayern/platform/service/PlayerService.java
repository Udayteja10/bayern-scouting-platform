package com.fcbayern.platform.service;

import com.fcbayern.platform.dto.*;
import com.fcbayern.platform.entity.Player;
import com.fcbayern.platform.exception.ResourceNotFoundException;
import com.fcbayern.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final PlayerStatisticsRepository statsRepository;
    private final InjuryRepository injuryRepository;
    private final TransferRepository transferRepository;

    public Page<PlayerDto> searchPlayers(String name, String position, String nationality,
                                         Long clubId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name"));
        Page<Player> players = playerRepository.search(name, position, nationality, clubId, pageable);
        return players.map(this::toDto);
    }

    public PlayerDetailDto getPlayerDetail(Long id) {
        Player player = playerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Player", id));

        List<PlayerStatisticsDto> stats = statsRepository.findByPlayerId(id)
            .stream().map(this::toStatsDto).collect(Collectors.toList());

        List<InjuryDto> injuries = injuryRepository.findByPlayerIdOrderByStartDateDesc(id)
            .stream().map(this::toInjuryDto).collect(Collectors.toList());

        List<TransferDto> transfers = transferRepository.findByPlayerIdOrderByTransferDateDesc(id)
            .stream().map(this::toTransferDto).collect(Collectors.toList());

        return PlayerDetailDto.builder()
            .id(player.getId())
            .sportmonksId(player.getSportmonksId())
            .name(player.getName())
            .firstName(player.getFirstName())
            .lastName(player.getLastName())
            .position(player.getPosition())
            .detailedPosition(player.getDetailedPosition())
            .nationality(player.getNationality())
            .secondNationality(player.getSecondNationality())
            .birthDate(player.getBirthDate())
            .age(player.getBirthDate() != null ? Period.between(player.getBirthDate(), LocalDate.now()).getYears() : null)
            .birthCountry(player.getBirthCountry())
            .birthCity(player.getBirthCity())
            .height(player.getHeight())
            .weight(player.getWeight())
            .preferredFoot(player.getPreferredFoot())
            .jerseyNumber(player.getJerseyNumber())
            .photoUrl(player.getPhotoUrl())
            .marketValue(player.getMarketValue())
            .contractValue(player.getContractValue())
            .contractExpiry(player.getContractExpiry())
            .currentClubName(player.getCurrentClub() != null ? player.getCurrentClub().getName() : null)
            .currentClubId(player.getCurrentClub() != null ? player.getCurrentClub().getId() : null)
            .statistics(stats)
            .injuries(injuries)
            .transfers(transfers)
            .build();
    }

    private PlayerDto toDto(Player p) {
        return PlayerDto.builder()
            .id(p.getId())
            .sportmonksId(p.getSportmonksId())
            .name(p.getName())
            .position(p.getPosition())
            .detailedPosition(p.getDetailedPosition())
            .nationality(p.getNationality())
            .birthDate(p.getBirthDate())
            .age(p.getBirthDate() != null ? Period.between(p.getBirthDate(), LocalDate.now()).getYears() : null)
            .height(p.getHeight())
            .weight(p.getWeight())
            .preferredFoot(p.getPreferredFoot())
            .jerseyNumber(p.getJerseyNumber())
            .photoUrl(p.getPhotoUrl())
            .marketValue(p.getMarketValue())
            .contractExpiry(p.getContractExpiry())
            .currentClubName(p.getCurrentClub() != null ? p.getCurrentClub().getName() : null)
            .currentClubId(p.getCurrentClub() != null ? p.getCurrentClub().getId() : null)
            .build();
    }

    private PlayerStatisticsDto toStatsDto(com.fcbayern.platform.entity.PlayerStatistics s) {
        return PlayerStatisticsDto.builder()
            .id(s.getId())
            .seasonName(s.getSeason() != null ? s.getSeason().getName() : "N/A")
            .appearances(s.getAppearances())
            .minutesPlayed(s.getMinutesPlayed())
            .goals(s.getGoals())
            .assists(s.getAssists())
            .yellowCards(s.getYellowCards())
            .redCards(s.getRedCards())
            .passAccuracy(s.getPassAccuracy())
            .averageRating(s.getAverageRating())
            .saves(s.getSaves())
            .cleanSheets(s.getCleanSheets())
            .build();
    }

    private InjuryDto toInjuryDto(com.fcbayern.platform.entity.Injury i) {
        return InjuryDto.builder()
            .id(i.getId())
            .playerId(i.getPlayer().getId())
            .playerName(i.getPlayer().getName())
            .type(i.getType())
            .bodyPart(i.getBodyPart())
            .severity(i.getSeverity())
            .startDate(i.getStartDate())
            .expectedReturn(i.getExpectedReturn())
            .status(i.getStatus())
            .description(i.getDescription())
            .build();
    }

    private TransferDto toTransferDto(com.fcbayern.platform.entity.Transfer t) {
        return TransferDto.builder()
            .id(t.getId())
            .playerId(t.getPlayer().getId())
            .playerName(t.getPlayer().getName())
            .fromClubName(t.getFromClub() != null ? t.getFromClub().getName() : "Unknown")
            .toClubName(t.getToClub() != null ? t.getToClub().getName() : "Unknown")
            .fee(t.getFee())
            .type(t.getType())
            .status(t.getStatus())
            .transferDate(t.getTransferDate())
            .position(t.getPlayer().getPosition())
            .build();
    }
}
