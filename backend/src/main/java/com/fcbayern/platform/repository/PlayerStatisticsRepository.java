package com.fcbayern.platform.repository;

import com.fcbayern.platform.entity.PlayerStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerStatisticsRepository extends JpaRepository<PlayerStatistics, Long> {
    Optional<PlayerStatistics> findByPlayerIdAndSeasonId(Long playerId, Long seasonId);
    List<PlayerStatistics> findByPlayerId(Long playerId);
}
