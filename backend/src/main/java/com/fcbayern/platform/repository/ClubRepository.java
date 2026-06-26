package com.fcbayern.platform.repository;

import com.fcbayern.platform.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    Optional<Club> findBySportmonksId(Long sportmonksId);
    boolean existsBySportmonksId(Long sportmonksId);
}
