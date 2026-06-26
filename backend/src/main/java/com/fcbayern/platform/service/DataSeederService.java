package com.fcbayern.platform.service;

import com.fcbayern.platform.entity.*;
import com.fcbayern.platform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataSeederService {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final PasswordEncoder passwordEncoder;
    private final SyncService syncService;
    private final PlayerRepository playerRepository;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedData() {
        seedAdminUser();
        seedBayernClub();
        if (playerRepository.count() == 0) {
            log.info("🚀 Seeding initial squad via SyncService...");
            syncService.syncBayernSquad("SYSTEM");
            syncService.syncLeaguePlayers("SYSTEM");
        }
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .fullName("FC Bayern Administrator")
                    .role(Role.CLUB_OWNER)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("✅ Seeded admin user: {}", adminEmail);

            // Also seed one of each role for demo
            User sportingDir = User.builder()
                    .email("director@fcbayern.de")
                    .password(passwordEncoder.encode("Bayern2024!"))
                    .fullName("Thomas Müller (Sporting Director)")
                    .role(Role.SPORTING_DIRECTOR)
                    .active(true)
                    .build();
            userRepository.save(sportingDir);

            User analyst = User.builder()
                    .email("analyst@fcbayern.de")
                    .password(passwordEncoder.encode("Bayern2024!"))
                    .fullName("Scout Analyst")
                    .role(Role.RECRUITMENT_ANALYST)
                    .active(true)
                    .build();
            userRepository.save(analyst);

            User finance = User.builder()
                    .email("finance@fcbayern.de")
                    .password(passwordEncoder.encode("Bayern2024!"))
                    .fullName("Finance Manager")
                    .role(Role.FINANCE_MANAGER)
                    .active(true)
                    .build();
            userRepository.save(finance);

            log.info("✅ Seeded demo users for all roles");
        }
    }

    private void seedBayernClub() {
        // Germany
        seedClub(5L, "FC Bayern München", "Bayern", "Germany", 1900,
                "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/250px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png");
        seedClub(2001L, "Bayer 04 Leverkusen", "Leverkusen", "Germany", 1904,
                "https://cdn.sportmonks.com/images/soccer/teams/21/21.png");
        seedClub(2002L, "Borussia Dortmund", "Dortmund", "Germany", 1909,
                "https://cdn.sportmonks.com/images/soccer/teams/22/22.png");
        seedClub(2003L, "RB Leipzig", "Leipzig", "Germany", 2009,
                "https://cdn.sportmonks.com/images/soccer/teams/23/23.png");
        seedClub(2004L, "VfB Stuttgart", "Stuttgart", "Germany", 1893,
                "https://cdn.sportmonks.com/images/soccer/teams/24/24.png");
        seedClub(2005L, "Eintracht Frankfurt", "Frankfurt", "Germany", 1899,
                "https://cdn.sportmonks.com/images/soccer/teams/25/25.png");
        seedClub(2006L, "TSG 1899 Hoffenheim", "Hoffenheim", "Germany", 1899,
                "https://cdn.sportmonks.com/images/soccer/teams/26/26.png");
        seedClub(2007L, "SC Freiburg", "Freiburg", "Germany", 1904,
                "https://cdn.sportmonks.com/images/soccer/teams/27/27.png");
        seedClub(2008L, "SV Werder Bremen", "Bremen", "Germany", 1899,
                "https://cdn.sportmonks.com/images/soccer/teams/28/28.png");
        seedClub(2009L, "FC Augsburg", "Augsburg", "Germany", 1907,
                "https://cdn.sportmonks.com/images/soccer/teams/29/29.png");
        seedClub(2010L, "1. FC Heidenheim", "Heidenheim", "Germany", 1846,
                "https://cdn.sportmonks.com/images/soccer/teams/30/30.png");
        seedClub(2011L, "VfL Wolfsburg", "Wolfsburg", "Germany", 1945,
                "https://cdn.sportmonks.com/images/soccer/teams/31/31.png");
        seedClub(2012L, "Borussia Mönchengladbach", "Gladbach", "Germany", 1900,
                "https://cdn.sportmonks.com/images/soccer/teams/32/32.png");
        seedClub(2013L, "1. FSV Mainz 05", "Mainz", "Germany", 1905,
                "https://cdn.sportmonks.com/images/soccer/teams/33/33.png");
        seedClub(2014L, "1. FC Union Berlin", "Union Berlin", "Germany", 1966,
                "https://cdn.sportmonks.com/images/soccer/teams/34/34.png");
        seedClub(2015L, "VfL Bochum", "Bochum", "Germany", 1848,
                "https://cdn.sportmonks.com/images/soccer/teams/35/35.png");
        seedClub(2016L, "FC St. Pauli", "St. Pauli", "Germany", 1910,
                "https://cdn.sportmonks.com/images/soccer/teams/36/36.png");
        seedClub(2017L, "Holstein Kiel", "Kiel", "Germany", 1900,
                "https://cdn.sportmonks.com/images/soccer/teams/37/37.png");

        // England
        seedClub(15L, "Liverpool FC", "Liverpool", "England", 1892,
                "https://cdn.sportmonks.com/images/soccer/teams/15/15.png");
        seedClub(12L, "Fulham FC", "Fulham", "England", 1879,
                "https://cdn.sportmonks.com/images/soccer/teams/12/12.png");
        seedClub(13L, "Crystal Palace FC", "Crystal Palace", "England", 1905,
                "https://cdn.sportmonks.com/images/soccer/teams/13/13.png");
        seedClub(1001L, "Manchester City FC", "Man City", "England", 1880,
                "https://cdn.sportmonks.com/images/soccer/teams/1/1.png");
        seedClub(1002L, "Arsenal FC", "Arsenal", "England", 1886,
                "https://cdn.sportmonks.com/images/soccer/teams/2/2.png");
        seedClub(1003L, "Manchester United FC", "Man United", "England", 1878,
                "https://cdn.sportmonks.com/images/soccer/teams/3/3.png");
        seedClub(1004L, "Chelsea FC", "Chelsea", "England", 1905,
                "https://cdn.sportmonks.com/images/soccer/teams/4/4.png");
        seedClub(1005L, "Tottenham Hotspur FC", "Tottenham", "England", 1882,
                "https://cdn.sportmonks.com/images/soccer/teams/5/5.png");
        seedClub(1006L, "Newcastle United FC", "Newcastle", "England", 1892,
                "https://cdn.sportmonks.com/images/soccer/teams/6/6.png");
        seedClub(1007L, "Aston Villa FC", "Aston Villa", "England", 1874,
                "https://cdn.sportmonks.com/images/soccer/teams/7/7.png");
        seedClub(1008L, "West Ham United FC", "West Ham", "England", 1895,
                "https://cdn.sportmonks.com/images/soccer/teams/8/8.png");
        seedClub(1009L, "Brighton & Hove Albion FC", "Brighton", "England", 1901,
                "https://cdn.sportmonks.com/images/soccer/teams/9/9.png");
        seedClub(1010L, "Wolverhampton Wanderers FC", "Wolves", "England", 1877,
                "https://cdn.sportmonks.com/images/soccer/teams/10/10.png");
        seedClub(1011L, "Brentford FC", "Brentford", "England", 1889,
                "https://cdn.sportmonks.com/images/soccer/teams/11/11.png");
        seedClub(1012L, "Everton FC", "Everton", "England", 1878,
                "https://cdn.sportmonks.com/images/soccer/teams/12/12.png");
        seedClub(1013L, "Nottingham Forest FC", "Nottingham Forest", "England", 1865,
                "https://cdn.sportmonks.com/images/soccer/teams/13/13.png");
        seedClub(1014L, "AFC Bournemouth", "Bournemouth", "England", 1899,
                "https://cdn.sportmonks.com/images/soccer/teams/14/14.png");
        seedClub(1015L, "Leicester City FC", "Leicester", "England", 1884,
                "https://cdn.sportmonks.com/images/soccer/teams/15/15.png");
        seedClub(1016L, "Ipswich Town FC", "Ipswich", "England", 1878,
                "https://cdn.sportmonks.com/images/soccer/teams/16/16.png");
        seedClub(1017L, "Southampton FC", "Southampton", "England", 1885,
                "https://cdn.sportmonks.com/images/soccer/teams/17/17.png");

        // Spain
        seedClub(10L, "Real Madrid CF", "Real Madrid", "Spain", 1902,
                "https://cdn.sportmonks.com/images/soccer/teams/10/10.png");
        seedClub(3001L, "FC Barcelona", "Barcelona", "Spain", 1899,
                "https://cdn.sportmonks.com/images/soccer/teams/41/41.png");
        seedClub(3002L, "Atlético de Madrid", "Atletico Madrid", "Spain", 1903,
                "https://cdn.sportmonks.com/images/soccer/teams/42/42.png");
        seedClub(3003L, "Real Sociedad", "Real Sociedad", "Spain", 1909,
                "https://cdn.sportmonks.com/images/soccer/teams/43/43.png");
        seedClub(3004L, "Athletic Club", "Athletic Bilbao", "Spain", 1898,
                "https://cdn.sportmonks.com/images/soccer/teams/44/44.png");
        seedClub(3005L, "Girona FC", "Girona", "Spain", 1930,
                "https://cdn.sportmonks.com/images/soccer/teams/45/45.png");
        seedClub(3006L, "Real Betis", "Real Betis", "Spain", 1907,
                "https://cdn.sportmonks.com/images/soccer/teams/46/46.png");
        seedClub(3007L, "Villarreal CF", "Villarreal", "Spain", 1923,
                "https://cdn.sportmonks.com/images/soccer/teams/47/47.png");
        seedClub(3008L, "Valencia CF", "Valencia", "Spain", 1919,
                "https://cdn.sportmonks.com/images/soccer/teams/48/48.png");
        seedClub(3009L, "Sevilla FC", "Sevilla", "Spain", 1890,
                "https://cdn.sportmonks.com/images/soccer/teams/49/49.png");
        seedClub(3010L, "CA Osasuna", "Osasuna", "Spain", 1920,
                "https://cdn.sportmonks.com/images/soccer/teams/50/50.png");
        seedClub(3011L, "Getafe CF", "Getafe", "Spain", 1983,
                "https://cdn.sportmonks.com/images/soccer/teams/51/51.png");
        seedClub(3012L, "RC Celta de Vigo", "Celta Vigo", "Spain", 1923,
                "https://cdn.sportmonks.com/images/soccer/teams/52/52.png");
        seedClub(3013L, "RCD Mallorca", "Mallorca", "Spain", 1916,
                "https://cdn.sportmonks.com/images/soccer/teams/53/53.png");
        seedClub(3014L, "UD Las Palmas", "Las Palmas", "Spain", 1949,
                "https://cdn.sportmonks.com/images/soccer/teams/54/54.png");
        seedClub(3015L, "Deportivo Alavés", "Alaves", "Spain", 1921,
                "https://cdn.sportmonks.com/images/soccer/teams/55/55.png");
        seedClub(3016L, "CD Leganés", "Leganes", "Spain", 1928,
                "https://cdn.sportmonks.com/images/soccer/teams/56/56.png");
        seedClub(3017L, "Real Valladolid CF", "Valladolid", "Spain", 1928,
                "https://cdn.sportmonks.com/images/soccer/teams/57/57.png");
        seedClub(3018L, "RCD Espanyol", "Espanyol", "Spain", 1900,
                "https://cdn.sportmonks.com/images/soccer/teams/58/58.png");
        seedClub(3019L, "Rayo Vallecano", "Rayo Vallecano", "Spain", 1924,
                "https://cdn.sportmonks.com/images/soccer/teams/59/59.png");

        // Italy
        seedClub(11L, "SSC Napoli", "Napoli", "Italy", 1926,
                "https://cdn.sportmonks.com/images/soccer/teams/11/11.png");
        seedClub(4001L, "FC Internazionale Milano", "Inter", "Italy", 1908,
                "https://cdn.sportmonks.com/images/soccer/teams/61/61.png");
        seedClub(4002L, "AC Milan", "Milan", "Italy", 1899, "https://cdn.sportmonks.com/images/soccer/teams/62/62.png");
        seedClub(4003L, "Juventus FC", "Juventus", "Italy", 1897,
                "https://cdn.sportmonks.com/images/soccer/teams/63/63.png");
        seedClub(4004L, "Atalanta BC", "Atalanta", "Italy", 1907,
                "https://cdn.sportmonks.com/images/soccer/teams/64/64.png");
        seedClub(4005L, "Bologna FC 1909", "Bologna", "Italy", 1909,
                "https://cdn.sportmonks.com/images/soccer/teams/65/65.png");
        seedClub(4006L, "AS Roma", "Roma", "Italy", 1927, "https://cdn.sportmonks.com/images/soccer/teams/66/66.png");
        seedClub(4007L, "SS Lazio", "Lazio", "Italy", 1900, "https://cdn.sportmonks.com/images/soccer/teams/67/67.png");
        seedClub(4008L, "ACF Fiorentina", "Fiorentina", "Italy", 1926,
                "https://cdn.sportmonks.com/images/soccer/teams/68/68.png");
        seedClub(4009L, "Torino FC", "Torino", "Italy", 1906,
                "https://cdn.sportmonks.com/images/soccer/teams/69/69.png");
        seedClub(4010L, "Genoa CFC", "Genoa", "Italy", 1893,
                "https://cdn.sportmonks.com/images/soccer/teams/70/70.png");
        seedClub(4011L, "AC Monza", "Monza", "Italy", 1912, "https://cdn.sportmonks.com/images/soccer/teams/71/71.png");
        seedClub(4012L, "Hellas Verona FC", "Verona", "Italy", 1903,
                "https://cdn.sportmonks.com/images/soccer/teams/72/72.png");
        seedClub(4013L, "US Lecce", "Lecce", "Italy", 1908, "https://cdn.sportmonks.com/images/soccer/teams/73/73.png");
        seedClub(4014L, "Udinese Calcio", "Udinese", "Italy", 1896,
                "https://cdn.sportmonks.com/images/soccer/teams/74/74.png");
        seedClub(4015L, "Cagliari Calcio", "Cagliari", "Italy", 1920,
                "https://cdn.sportmonks.com/images/soccer/teams/75/75.png");
        seedClub(4016L, "Empoli FC", "Empoli", "Italy", 1920,
                "https://cdn.sportmonks.com/images/soccer/teams/76/76.png");
        seedClub(4017L, "Parma Calcio 1913", "Parma", "Italy", 1913,
                "https://cdn.sportmonks.com/images/soccer/teams/77/77.png");
        seedClub(4018L, "Como 1907", "Como", "Italy", 1907, "https://cdn.sportmonks.com/images/soccer/teams/78/78.png");
        seedClub(4019L, "Venezia FC", "Venezia", "Italy", 1907,
                "https://cdn.sportmonks.com/images/soccer/teams/79/79.png");

        // France
        seedClub(14L, "Paris Saint-Germain FC", "PSG", "France", 1970,
                "https://cdn.sportmonks.com/images/soccer/teams/14/14.png");
        seedClub(5001L, "AS Monaco FC", "Monaco", "France", 1924,
                "https://cdn.sportmonks.com/images/soccer/teams/81/81.png");
        seedClub(5002L, "Stade Brestois 29", "Brest", "France", 1950,
                "https://cdn.sportmonks.com/images/soccer/teams/82/82.png");
        seedClub(5003L, "Lille OSC", "Lille", "France", 1944,
                "https://cdn.sportmonks.com/images/soccer/teams/83/83.png");
        seedClub(5004L, "OGC Nice", "Nice", "France", 1904, "https://cdn.sportmonks.com/images/soccer/teams/84/84.png");
        seedClub(5005L, "RC Lens", "Lens", "France", 1906, "https://cdn.sportmonks.com/images/soccer/teams/85/85.png");
        seedClub(5006L, "Olympique Lyonnais", "Lyon", "France", 1950,
                "https://cdn.sportmonks.com/images/soccer/teams/86/86.png");
        seedClub(5007L, "Olympique de Marseille", "Marseille", "France", 1899,
                "https://cdn.sportmonks.com/images/soccer/teams/87/87.png");
        seedClub(5008L, "Stade de Reims", "Reims", "France", 1931,
                "https://cdn.sportmonks.com/images/soccer/teams/88/88.png");
        seedClub(5009L, "Stade Rennais FC", "Rennes", "France", 1901,
                "https://cdn.sportmonks.com/images/soccer/teams/89/89.png");
        seedClub(5010L, "Toulouse FC", "Toulouse", "France", 1937,
                "https://cdn.sportmonks.com/images/soccer/teams/90/90.png");
        seedClub(5011L, "Montpellier HSC", "Montpellier", "France", 1974,
                "https://cdn.sportmonks.com/images/soccer/teams/91/91.png");
        seedClub(5012L, "RC Strasbourg Alsace", "Strasbourg", "France", 1906,
                "https://cdn.sportmonks.com/images/soccer/teams/92/92.png");
        seedClub(5013L, "Le Havre AC", "Le Havre", "France", 1872,
                "https://cdn.sportmonks.com/images/soccer/teams/93/93.png");
        seedClub(5014L, "FC Nantes", "Nantes", "France", 1943,
                "https://cdn.sportmonks.com/images/soccer/teams/94/94.png");
        seedClub(5015L, "AJ Auxerre", "Auxerre", "France", 1905,
                "https://cdn.sportmonks.com/images/soccer/teams/95/95.png");
        seedClub(5016L, "Angers SCO", "Angers", "France", 1919,
                "https://cdn.sportmonks.com/images/soccer/teams/96/96.png");
        seedClub(5017L, "AS Saint-Étienne", "Saint-Etienne", "France", 1933,
                "https://cdn.sportmonks.com/images/soccer/teams/97/97.png");
    }

    private void seedClub(Long id, String name, String shortName, String country, int founded, String logo) {
        if (!clubRepository.existsBySportmonksId(id)) {
            Club club = Club.builder()
                    .sportmonksId(id)
                    .name(name)
                    .shortName(shortName)
                    .country(country)
                    .founded(founded)
                    .logoUrl(logo)
                    .build();
            clubRepository.save(club);
            log.info("✅ Seeded club record: {}", name);
        }
    }
}
