package com.fcbayern.platform.repository;

import com.fcbayern.platform.entity.Transfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    Page<Transfer> findByToClubIdOrFromClubId(Long toClubId, Long fromClubId, Pageable pageable);
    List<Transfer> findByPlayerIdOrderByTransferDateDesc(Long playerId);
    long countByStatus(Transfer.TransferStatus status);
}
