package com.fcbayern.platform.service;

import com.fcbayern.platform.entity.Injury;
import com.fcbayern.platform.entity.SquadMember;
import com.fcbayern.platform.repository.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final SquadMemberRepository squadMemberRepository;
    private final ClubRepository clubRepository;
    private final PlayerStatisticsRepository statsRepository;
    private final InjuryRepository injuryRepository;
    private final TransferRepository transferRepository;

    private static final Long BAYERN_SPORTMONKS_ID = 5L;

    // ─── Squad Strength Score ─────────────────────────────────────────────────

    public SquadStrengthResult computeSquadStrength() {
        return clubRepository.findBySportmonksId(BAYERN_SPORTMONKS_ID).map(club -> {
            List<SquadMember> squad = squadMemberRepository.findActiveSquadWithPlayers(club.getId());
            long total = squad.size();
            if (total == 0) return SquadStrengthResult.empty();

            // Positional distribution scores
            long gk = squad.stream().filter(sm -> "GK".equals(sm.getPositionCategory())).count();
            long def = squad.stream().filter(sm -> "DEF".equals(sm.getPositionCategory())).count();
            long mid = squad.stream().filter(sm -> "MID".equals(sm.getPositionCategory())).count();
            long fwd = squad.stream().filter(sm -> "FWD".equals(sm.getPositionCategory())).count();

            double depthScore = Math.min(100.0, (gk * 15 + def * 10 + mid * 8 + fwd * 10));
            double sizeScore = Math.min(100.0, total * 3.5);

            // Age balance (ideal peak 23-29)
            double ageScore = squad.stream()
                .filter(sm -> sm.getPlayer().getBirthDate() != null)
                .mapToInt(sm -> {
                    int age = Period.between(sm.getPlayer().getBirthDate(), LocalDate.now()).getYears();
                    if (age >= 23 && age <= 29) return 100;
                    if (age >= 20 && age <= 32) return 70;
                    return 40;
                })
                .average().orElse(50);

            double overall = (depthScore * 0.3 + sizeScore * 0.3 + ageScore * 0.4);

            return SquadStrengthResult.builder()
                .overallScore(Math.round(overall * 10.0) / 10.0)
                .depthScore(Math.round(depthScore * 10.0) / 10.0)
                .ageBalanceScore(Math.round(ageScore * 10.0) / 10.0)
                .squadSize((int) total)
                .gkCount((int) gk)
                .defCount((int) def)
                .midCount((int) mid)
                .fwdCount((int) fwd)
                .build();
        }).orElse(SquadStrengthResult.empty());
    }

    // ─── Age Curve Analysis ───────────────────────────────────────────────────

    public List<AgeCurvePoint> computeAgeCurve() {
        return clubRepository.findBySportmonksId(BAYERN_SPORTMONKS_ID).map(club -> {
            List<SquadMember> squad = squadMemberRepository.findActiveSquadWithPlayers(club.getId());
            Map<Integer, Long> ageGroups = squad.stream()
                .filter(sm -> sm.getPlayer().getBirthDate() != null)
                .collect(Collectors.groupingBy(
                    sm -> Period.between(sm.getPlayer().getBirthDate(), LocalDate.now()).getYears(),
                    Collectors.counting()
                ));
            return ageGroups.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new AgeCurvePoint(e.getKey(), e.getValue().intValue()))
                .collect(Collectors.toList());
        }).orElse(Collections.emptyList());
    }

    // ─── Position Depth Analysis ──────────────────────────────────────────────

    public Map<String, Integer> computePositionDepth() {
        return clubRepository.findBySportmonksId(BAYERN_SPORTMONKS_ID).map(club -> {
            List<SquadMember> squad = squadMemberRepository.findActiveSquadWithPlayers(club.getId());
            return squad.stream().collect(Collectors.groupingBy(
                sm -> sm.getPositionCategory() != null ? sm.getPositionCategory() : "UNKNOWN",
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
        }).orElse(Collections.emptyMap());
    }

    // ─── Injury Risk Analysis ─────────────────────────────────────────────────

    public InjuryRiskResult computeInjuryRisk() {
        return clubRepository.findBySportmonksId(BAYERN_SPORTMONKS_ID).map(club -> {
            long activeInjuries = injuryRepository.countByStatus(Injury.InjuryStatus.ACTIVE);
            List<Injury> bayernInjuries = injuryRepository.findByPlayerCurrentClubId(club.getId());
            long squadSize = squadMemberRepository.findByClubIdAndActiveTrue(club.getId()).size();

            double injuryRate = squadSize > 0 ? ((double) activeInjuries / squadSize) * 100 : 0;
            String riskLevel = injuryRate > 30 ? "HIGH" : injuryRate > 15 ? "MEDIUM" : "LOW";

            Map<String, Long> injuriesByType = bayernInjuries.stream()
                .collect(Collectors.groupingBy(
                    i -> i.getType() != null ? i.getType() : "Unknown",
                    Collectors.counting()
                ));

            return InjuryRiskResult.builder()
                .activeInjuries((int) activeInjuries)
                .injuryRate(Math.round(injuryRate * 10.0) / 10.0)
                .riskLevel(riskLevel)
                .injuriesByType(injuriesByType)
                .build();
        }).orElse(InjuryRiskResult.builder().riskLevel("UNKNOWN").build());
    }

    // ─── Financial Health Score ───────────────────────────────────────────────

    public FinancialHealthResult computeFinancialHealth() {
        return clubRepository.findBySportmonksId(BAYERN_SPORTMONKS_ID).map(club -> {
            List<SquadMember> squad = squadMemberRepository.findActiveSquadWithPlayers(club.getId());

            double totalMarketValue = squad.stream()
                .filter(sm -> sm.getPlayer().getMarketValue() != null)
                .mapToDouble(sm -> sm.getPlayer().getMarketValue().doubleValue())
                .sum();

            long expiringContracts = squad.stream()
                .filter(sm -> sm.getPlayer().getContractExpiry() != null
                    && sm.getPlayer().getContractExpiry().isBefore(LocalDate.now().plusYears(1)))
                .count();

            long transfersIn = transferRepository.findAll().stream()
                .filter(t -> t.getToClub() != null && t.getToClub().getId().equals(club.getId()))
                .count();
            long transfersOut = transferRepository.findAll().stream()
                .filter(t -> t.getFromClub() != null && t.getFromClub().getId().equals(club.getId()))
                .count();

            BigDecimal totalSpend = transferRepository.findAll().stream()
                .filter(t -> t.getToClub() != null && t.getToClub().getId().equals(club.getId()) && t.getFee() != null)
                .map(com.fcbayern.platform.entity.Transfer::getFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            return FinancialHealthResult.builder()
                .totalSquadMarketValue(totalMarketValue)
                .expiringContracts((int) expiringContracts)
                .totalTransferSpend(totalSpend)
                .transfersIn((int) transfersIn)
                .transfersOut((int) transfersOut)
                .financialHealthScore(calculateFinancialScore(totalMarketValue, expiringContracts))
                .build();
        }).orElse(FinancialHealthResult.builder().build());
    }

    private double calculateFinancialScore(double marketValue, long expiringContracts) {
        double score = 70.0;
        if (marketValue > 500_000_000) score += 20;
        else if (marketValue > 200_000_000) score += 10;
        score -= expiringContracts * 3;
        return Math.max(0, Math.min(100, score));
    }

    // ─── Transfer Opportunity Analysis ────────────────────────────────────────

    public Map<String, Object> computeTransferOpportunities() {
        Map<String, Object> result = new LinkedHashMap<>();
        clubRepository.findBySportmonksId(BAYERN_SPORTMONKS_ID).ifPresent(club -> {
            List<SquadMember> squad = squadMemberRepository.findActiveSquadWithPlayers(club.getId());

            Map<String, Integer> positionDepth = squad.stream()
                .collect(Collectors.groupingBy(
                    sm -> sm.getPositionCategory() != null ? sm.getPositionCategory() : "UNKNOWN",
                    Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

            List<String> weakPositions = positionDepth.entrySet().stream()
                .filter(e -> e.getValue() < 3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

            result.put("weakPositions", weakPositions);
            result.put("positionDepth", positionDepth);
            result.put("recommendedSignings", weakPositions.size());
        });
        return result;
    }

    // ─── Result DTOs ──────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SquadStrengthResult {
        private double overallScore;
        private double depthScore;
        private double ageBalanceScore;
        private int squadSize;
        private int gkCount;
        private int defCount;
        private int midCount;
        private int fwdCount;

        public static SquadStrengthResult empty() {
            return new SquadStrengthResult(0, 0, 0, 0, 0, 0, 0, 0);
        }
    }

    @Data @AllArgsConstructor
    public static class AgeCurvePoint {
        private int age;
        private int count;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class InjuryRiskResult {
        private int activeInjuries;
        private double injuryRate;
        private String riskLevel;
        private Map<String, Long> injuriesByType;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FinancialHealthResult {
        private double totalSquadMarketValue;
        private int expiringContracts;
        private BigDecimal totalTransferSpend;
        private int transfersIn;
        private int transfersOut;
        private double financialHealthScore;
    }
}
