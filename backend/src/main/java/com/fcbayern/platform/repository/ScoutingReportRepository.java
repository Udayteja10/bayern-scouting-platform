package com.fcbayern.platform.repository;

import com.fcbayern.platform.entity.ScoutingReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoutingReportRepository extends JpaRepository<ScoutingReport, Long> {
    Page<ScoutingReport> findByCreatedById(Long userId, Pageable pageable);
    List<ScoutingReport> findByPlayerId(Long playerId);
    Page<ScoutingReport> findAll(Pageable pageable);
}

