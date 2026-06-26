package com.fcbayern.platform.service;

import com.fcbayern.platform.dto.*;
import com.fcbayern.platform.entity.*;
import com.fcbayern.platform.exception.ResourceNotFoundException;
import com.fcbayern.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoutingService {

    private final ScoutingReportRepository reportRepository;
    private final ShortlistRepository shortlistRepository;
    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;

    // ─── Scouting Reports ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ScoutingReportDto> getAllReports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return reportRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public ScoutingReportDto getReport(Long id) {
        return reportRepository.findById(id)
            .map(this::toDto)
            .orElseThrow(() -> new ResourceNotFoundException("ScoutingReport", id));
    }

    @Transactional
    public ScoutingReportDto createReport(ScoutingReportDto dto, String userEmail) {
        Player player = playerRepository.findById(dto.getPlayerId())
            .orElseThrow(() -> new ResourceNotFoundException("Player", dto.getPlayerId()));
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        BigDecimal overall = dto.getTechnicalRating()
            .add(dto.getPhysicalRating())
            .add(dto.getMentalRating())
            .add(dto.getTacticalRating())
            .divide(BigDecimal.valueOf(4), 1, java.math.RoundingMode.HALF_UP);

        ScoutingReport report = ScoutingReport.builder()
            .player(player)
            .createdBy(user)
            .technicalRating(dto.getTechnicalRating())
            .physicalRating(dto.getPhysicalRating())
            .mentalRating(dto.getMentalRating())
            .tacticalRating(dto.getTacticalRating())
            .overallRating(overall)
            .strengths(dto.getStrengths())
            .weaknesses(dto.getWeaknesses())
            .notes(dto.getNotes())
            .recommendation(dto.getRecommendation())
            .matchObserved(dto.getMatchObserved())
            .observationDate(dto.getObservationDate())
            .build();
        return toDto(reportRepository.save(report));
    }

    @Transactional
    public void deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new ResourceNotFoundException("ScoutingReport", id);
        }
        reportRepository.deleteById(id);
    }

    // ─── Shortlists ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ShortlistDto> getAllShortlists() {
        return shortlistRepository.findByActiveTrue().stream()
            .map(this::toShortlistDto).collect(Collectors.toList());
    }

    @Transactional
    public ShortlistDto createShortlist(ShortlistDto dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        Shortlist sl = Shortlist.builder()
            .name(dto.getName())
            .description(dto.getDescription())
            .category(dto.getCategory())
            .createdBy(user)
            .active(true)
            .build();
        return toShortlistDto(shortlistRepository.save(sl));
    }

    @Transactional
    public ShortlistDto addPlayerToShortlist(Long shortlistId, Long playerId) {
        Shortlist sl = shortlistRepository.findById(shortlistId)
            .orElseThrow(() -> new ResourceNotFoundException("Shortlist", shortlistId));
        Player player = playerRepository.findById(playerId)
            .orElseThrow(() -> new ResourceNotFoundException("Player", playerId));
        sl.getPlayers().add(player);
        return toShortlistDto(shortlistRepository.save(sl));
    }

    @Transactional
    public ShortlistDto removePlayerFromShortlist(Long shortlistId, Long playerId) {
        Shortlist sl = shortlistRepository.findById(shortlistId)
            .orElseThrow(() -> new ResourceNotFoundException("Shortlist", shortlistId));
        sl.getPlayers().removeIf(p -> p.getId().equals(playerId));
        return toShortlistDto(shortlistRepository.save(sl));
    }

    // ─── Mapping ──────────────────────────────────────────────────────────────

    private ScoutingReportDto toDto(ScoutingReport r) {
        return ScoutingReportDto.builder()
            .id(r.getId())
            .playerId(r.getPlayer().getId())
            .playerName(r.getPlayer().getName())
            .playerPhoto(r.getPlayer().getPhotoUrl())
            .playerPosition(r.getPlayer().getPosition())
            .createdById(r.getCreatedBy().getId())
            .createdByName(r.getCreatedBy().getFullName())
            .technicalRating(r.getTechnicalRating())
            .physicalRating(r.getPhysicalRating())
            .mentalRating(r.getMentalRating())
            .tacticalRating(r.getTacticalRating())
            .overallRating(r.getOverallRating())
            .strengths(r.getStrengths())
            .weaknesses(r.getWeaknesses())
            .notes(r.getNotes())
            .recommendation(r.getRecommendation())
            .matchObserved(r.getMatchObserved())
            .observationDate(r.getObservationDate())
            .createdAt(r.getCreatedAt())
            .build();
    }

    private ShortlistDto toShortlistDto(Shortlist sl) {
        return ShortlistDto.builder()
            .id(sl.getId())
            .name(sl.getName())
            .description(sl.getDescription())
            .category(sl.getCategory())
            .createdByName(sl.getCreatedBy().getFullName())
            .playerCount(sl.getPlayers().size())
            .createdAt(sl.getCreatedAt())
            .build();
    }
}
