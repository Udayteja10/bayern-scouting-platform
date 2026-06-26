package com.fcbayern.platform.repository;

import com.fcbayern.platform.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeasonRepository extends JpaRepository<Season, Long> {
    Optional<Season> findBySportmonksId(Long sportmonksId);
    Optional<Season> findByCurrentTrue();
}
