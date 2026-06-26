package com.fcbayern.platform.repository;

import com.fcbayern.platform.entity.Player;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    Optional<Player> findBySportmonksId(Long sportmonksId);
    boolean existsBySportmonksId(Long sportmonksId);

    @Query("""
        SELECT p FROM Player p
        WHERE p.active = true
          AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')))
          AND (:position IS NULL OR p.position = :position)
          AND (:nationality IS NULL OR p.nationality = :nationality)
          AND (:clubId IS NULL OR p.currentClub.id = :clubId)
    """)
    Page<Player> search(
        @Param("name") String name,
        @Param("position") String position,
        @Param("nationality") String nationality,
        @Param("clubId") Long clubId,
        Pageable pageable
    );
}
