package com.fcbayern.platform.repository;

import com.fcbayern.platform.entity.Injury;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InjuryRepository extends JpaRepository<Injury, Long> {
    List<Injury> findByPlayerIdOrderByStartDateDesc(Long playerId);
    List<Injury> findByStatus(Injury.InjuryStatus status);
    List<Injury> findByPlayerCurrentClubId(Long clubId);
    long countByStatus(Injury.InjuryStatus status);
}
