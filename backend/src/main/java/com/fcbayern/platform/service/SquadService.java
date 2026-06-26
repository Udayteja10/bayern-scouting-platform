package com.fcbayern.platform.service;

import com.fcbayern.platform.dto.SquadMemberDto;
import com.fcbayern.platform.entity.Injury;
import com.fcbayern.platform.entity.SquadMember;
import com.fcbayern.platform.repository.ClubRepository;
import com.fcbayern.platform.repository.InjuryRepository;
import com.fcbayern.platform.repository.SquadMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SquadService {

    private final SquadMemberRepository squadMemberRepository;
    private final ClubRepository clubRepository;
    private final InjuryRepository injuryRepository;

    private static final Long BAYERN_SPORTMONKS_ID = 5L;

    public List<SquadMemberDto> getBayernSquad() {
        List<SquadMemberDto> list = new ArrayList<>();
        Set<Long> injuredPlayerIds = injuryRepository
            .findByStatus(Injury.InjuryStatus.ACTIVE)
            .stream().map(i -> i.getPlayer().getId()).collect(Collectors.toSet());

        clubRepository.findBySportmonksId(5L).ifPresent(club -> {
            squadMemberRepository.findActiveSquadWithPlayers(club.getId()).forEach(sm -> {
                SquadMemberDto dto = mapToDto(sm, injuredPlayerIds);
                dto.setTeamName("First Team");
                list.add(dto);
            });
        });

        clubRepository.findBySportmonksId(6L).ifPresent(club -> {
            squadMemberRepository.findActiveSquadWithPlayers(club.getId()).forEach(sm -> {
                SquadMemberDto dto = mapToDto(sm, injuredPlayerIds);
                dto.setTeamName("FC Bayern II");
                list.add(dto);
            });
        });

        return list;
    }

    public Map<String, List<SquadMemberDto>> getDepthChart() {
        List<SquadMemberDto> squad = getBayernSquad();
        return squad.stream().collect(Collectors.groupingBy(SquadMemberDto::getPositionCategory));
    }

    private SquadMemberDto mapToDto(SquadMember sm, Set<Long> injuredIds) {
        var player = sm.getPlayer();
        Integer age = null;
        if (player.getBirthDate() != null) {
            age = Period.between(player.getBirthDate(), LocalDate.now()).getYears();
        }
        return SquadMemberDto.builder()
            .id(sm.getId())
            .playerId(player.getId())
            .playerName(player.getName())
            .photoUrl(player.getPhotoUrl())
            .position(player.getPosition())
            .detailedPosition(player.getDetailedPosition())
            .positionCategory(sm.getPositionCategory())
            .jerseyNumber(sm.getJerseyNumber())
            .nationality(player.getNationality())
            .age(age)
            .preferredFoot(player.getPreferredFoot())
            .injured(injuredIds.contains(player.getId()))
            .build();
    }
}
