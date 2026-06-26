package com.fcbayern.platform.repository;

import com.fcbayern.platform.entity.SquadMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SquadMemberRepository extends JpaRepository<SquadMember, Long> {
    List<SquadMember> findByClubIdAndActiveTrue(Long clubId);
    Optional<SquadMember> findByPlayerIdAndClubIdAndSeasonId(Long playerId, Long clubId, Long seasonId);

    @Query("SELECT sm FROM SquadMember sm JOIN FETCH sm.player WHERE sm.club.id = :clubId AND sm.active = true ORDER BY sm.positionCategory, sm.jerseyNumber")
    List<SquadMember> findActiveSquadWithPlayers(@Param("clubId") Long clubId);
}
