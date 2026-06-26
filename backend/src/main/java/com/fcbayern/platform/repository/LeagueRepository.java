package com.fcbayern.platform.repository;

import com.fcbayern.platform.entity.League;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeagueRepository extends JpaRepository<League, Long> {
    Optional<League> findBySportmonksId(Long sportmonksId);
}
