package com.fcbayern.platform.repository;

import com.fcbayern.platform.entity.Shortlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShortlistRepository extends JpaRepository<Shortlist, Long> {
    List<Shortlist> findByCreatedByIdAndActiveTrue(Long userId);
    List<Shortlist> findByActiveTrue();
}
