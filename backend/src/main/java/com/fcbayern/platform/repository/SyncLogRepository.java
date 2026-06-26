package com.fcbayern.platform.repository;

import com.fcbayern.platform.entity.SyncLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SyncLogRepository extends JpaRepository<SyncLog, Long> {
    Page<SyncLog> findAllByOrderByStartedAtDesc(Pageable pageable);
    Optional<SyncLog> findFirstBySyncTypeOrderByStartedAtDesc(String syncType);
}
