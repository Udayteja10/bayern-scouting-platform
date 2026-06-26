package com.fcbayern.platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Optional;

/**
 * Sportmonks Football API v3 client.
 * All public methods return raw JsonNode from the API.
 * The SyncService is responsible for mapping these to entities.
 *
 * API Documentation: https://docs.sportmonks.com/football/
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SportmonksService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.sportmonks.base-url}")
    private String baseUrl;

    @Value("${app.sportmonks.api-key}")
    private String apiKey;

    @Value("${app.sportmonks.bayern-team-id}")
    private Long bayernTeamId;

    @Value("${app.sportmonks.top-leagues}")
    private String topLeagueIds;

    // ─── Squad ────────────────────────────────────────────────────────────────

    public Optional<JsonNode> getBayernSquad() {
        try {
            log.info("Attempting to fetch FC Bayern Munich squad from Transfermarkt API...");
            String url = "https://transfermarkt-api.fly.dev/clubs/27/players";
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, null, String.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode playersArray = root.path("players");
                if (playersArray.isArray()) {
                    com.fasterxml.jackson.databind.node.ArrayNode array = objectMapper.createArrayNode();
                    for (JsonNode pNode : playersArray) {
                        try {
                            Long playerId = pNode.path("id").asLong();
                            JsonNode profileNode = null;
                            
                            // Only call profile endpoint if not in our static pre-cache
                            if (!TM_PROFILES.containsKey(playerId)) {
                                log.info("Fetching profile for player ID {} from Transfermarkt...", playerId);
                                String profileUrl = "https://transfermarkt-api.fly.dev/players/" + playerId + "/profile";
                                // Sleep 150ms to respect Transfermarkt API rate limits
                                Thread.sleep(150);
                                try {
                                    ResponseEntity<String> pResp = restTemplate.exchange(profileUrl, HttpMethod.GET, null, String.class);
                                    if (pResp.getStatusCode() == HttpStatus.OK && pResp.getBody() != null) {
                                        profileNode = objectMapper.readTree(pResp.getBody());
                                    }
                                } catch (Exception pe) {
                                    log.warn("Failed to fetch profile for player {}: {}", pNode.path("name").asText(), pe.getMessage());
                                }
                            }
                            
                            array.add(mapTransfermarktPlayer(pNode, profileNode, "first", 5L));
                        } catch (Exception e) {
                            log.warn("Error processing player node: {}", e.getMessage());
                        }
                    }
                    if (array.size() > 0) {
                        log.info("Successfully fetched and mapped {} players from Transfermarkt API", array.size());
                        return Optional.of(array);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Transfermarkt API squad fetch failed or rate limited: {}. Falling back to pre-compiled mock squad.", e.getMessage());
        }
        
        // Fallback to mock data
        return getMockData(baseUrl + "/teams/" + bayernTeamId);
    }

    public Optional<JsonNode> getTeamById(Long teamId) {
        String url = baseUrl + "/teams/" + teamId + "?include=players";
        return get(url);
    }

    // ─── Players ──────────────────────────────────────────────────────────────

    public Optional<JsonNode> getPlayerById(Long playerId) {
        String url = baseUrl + "/players/" + playerId + "?include=position;nationality;statistics;transfers;sidelined";
        return get(url);
    }

    public Optional<JsonNode> getPlayersByTeam(Long teamId) {
        String url = baseUrl + "/players/teams/" + teamId + "?include=position;nationality;statistics";
        return get(url);
    }

    public Optional<JsonNode> getPlayersByLeague(Long leagueId, int page) {
        String url = baseUrl + "/players/leagues/" + leagueId + "?include=position;nationality;statistics&page=" + page;
        return get(url);
    }

    // ─── Statistics ───────────────────────────────────────────────────────────

    public Optional<JsonNode> getPlayerStatisticsBySeason(Long playerId, Long seasonId) {
        String url = baseUrl + "/statistics/seasons/players/" + playerId + "?filters=seasonIds:" + seasonId;
        return get(url);
    }

    public Optional<JsonNode> getTeamStatisticsBySeason(Long teamId, Long seasonId) {
        String url = baseUrl + "/statistics/seasons/teams/" + teamId + "?filters=seasonIds:" + seasonId;
        return get(url);
    }

    // ─── Injuries ─────────────────────────────────────────────────────────────

    public Optional<JsonNode> getInjuriesByTeam(Long teamId) {
        String url = baseUrl + "/sidelined/teams/" + teamId;
        return get(url);
    }

    public Optional<JsonNode> getInjuriesByPlayer(Long playerId) {
        String url = baseUrl + "/sidelined/players/" + playerId;
        return get(url);
    }

    // ─── Transfers ────────────────────────────────────────────────────────────

    public Optional<JsonNode> getTransfersByTeam(Long teamId) {
        String url = baseUrl + "/transfers/teams/" + teamId + "?include=player;fromTeam;toTeam&sort=-transfer_date";
        return get(url);
    }

    public Optional<JsonNode> getLatestTransfers() {
        String url = baseUrl + "/transfers/latest?include=player;fromTeam;toTeam";
        return get(url);
    }

    // ─── Leagues & Seasons ────────────────────────────────────────────────────

    public Optional<JsonNode> getLeagueById(Long leagueId) {
        String url = baseUrl + "/leagues/" + leagueId;
        return get(url);
    }

    public Optional<JsonNode> getCurrentSeasonByLeague(Long leagueId) {
        String url = baseUrl + "/seasons/leagues/" + leagueId + "?filters=current:true";
        return get(url);
    }

    // ─── HTTP Helper ──────────────────────────────────────────────────────────

    private Optional<JsonNode> get(String url) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.contains("your_sportmonks_api_key")) {
            log.info("Sportmonks API key is placeholder/empty. Returning mock data for URL: {}", url);
            return getMockData(url);
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", apiKey);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.debug("Calling Sportmonks: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return Optional.of(root.path("data"));
            }
            return Optional.empty();

        } catch (HttpClientErrorException.TooManyRequests e) {
            log.warn("Sportmonks rate limit hit for URL: {}", url);
            return Optional.empty();
        } catch (HttpClientErrorException.Unauthorized e) {
            log.error("Sportmonks API key invalid or unauthorized: {}. Falling back to mock data.", url);
            return getMockData(url);
        } catch (HttpClientErrorException.Forbidden e) {
            log.warn("Sportmonks endpoint requires higher plan tier: {}. Falling back to mock data.", url);
            return getMockData(url);
        } catch (HttpClientErrorException e) {
            log.error("Sportmonks HTTP error {} for URL {}: {}. Falling back to mock data.", e.getStatusCode(), url, e.getMessage());
            return getMockData(url);
        } catch (Exception e) {
            log.error("Error calling Sportmonks API [{}]: {}. Falling back to mock data.", url, e.getMessage());
            return getMockData(url);
        }
    }

    private Optional<JsonNode> getMockData(String url) {
        try {
            if (url.contains("/sidelined/teams/5")) {
                com.fasterxml.jackson.databind.node.ArrayNode array = objectMapper.createArrayNode();
                array.add(createMockInjury(2001L, 1015L, "Hamstring Strain", "Strained hamstring, out for 3 weeks", "2026-06-10"));
                array.add(createMockInjury(2002L, 1009L, "Knee Injury", "Sprained knee ligament, recovering", "2026-06-18"));
                array.add(createMockInjury(2003L, 1001L, "Muscle Tear", "Calf muscle tear during training", "2026-06-20"));
                return Optional.of(array);
            } else if (url.contains("/transfers/teams/5")) {
                com.fasterxml.jackson.databind.node.ArrayNode array = objectMapper.createArrayNode();
                array.add(createMockTransfer(3001L, 1002L, 10L, 5L, "95000000", "2023-08-12"));
                array.add(createMockTransfer(3002L, 1008L, 11L, 5L, "50000000", "2023-07-18"));
                array.add(createMockTransfer(3003L, 1020L, 5L, 15L, "40000000", "2023-09-01"));
                array.add(createMockTransfer(3004L, 1021L, 5L, 14L, "45000000", "2023-07-10"));
                return Optional.of(array);
            } else if (url.contains("/teams/5")) {
                com.fasterxml.jackson.databind.node.ArrayNode array = objectMapper.createArrayNode();
                // 25/26 First Team Players
                array.add(createMockPlayer(1001L, "Manuel Neuer", "Manuel", "Neuer", "M. Neuer", "Goalkeeper", "Germany", 193, 93, "right", "1986-03-27", "2600000", "1", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Manuel_Neuer_2020.jpg/250px-Manuel_Neuer_2020.jpg", "first", 5L));
                array.add(createMockPlayer(1002L, "Harry Kane", "Harry", "Kane", "H. Kane", "Forward", "England", 188, 86, "right", "1993-07-28", "106700000", "9", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Harry_Kane_on_October_10%2C_2023.jpg/250px-Harry_Kane_on_October_10%2C_2023.jpg", "first", 5L));
                array.add(createMockPlayer(1003L, "Jamal Musiala", "Jamal", "Musiala", "J. Musiala", "Midfielder", "Germany", 184, 72, "right", "2003-02-26", "115000000", "10", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Jamal_Musiala_2022_%28cropped%29.jpg/250px-Jamal_Musiala_2022_%28cropped%29.jpg", "first", 5L));
                array.add(createMockPlayer(1004L, "Joshua Kimmich", "Joshua", "Kimmich", "J. Kimmich", "Midfielder", "Germany", 177, 75, "right", "1995-02-08", "42900000", "6", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Joshua_Kimmich_2020.jpg/250px-Joshua_Kimmich_2020.jpg", "first", 5L));
                array.add(createMockPlayer(1005L, "Serge Gnabry", "Serge", "Gnabry", "S. Gnabry", "Forward", "Germany", 176, 77, "right", "1995-07-14", "16100000", "7", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Serge_Gnabry_2020.jpg/250px-Serge_Gnabry_2020.jpg", "first", 5L));
                array.add(createMockPlayer(1006L, "Alphonso Davies", "Alphonso", "Davies", "A. Davies", "Defender", "Canada", 183, 77, "left", "2000-11-02", "45300000", "19", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Alphonso_Davies_2020.jpg/250px-Alphonso_Davies_2020.jpg", "first", 5L));
                array.add(createMockPlayer(1007L, "Dayot Upamecano", "Dayot", "Upamecano", "D. Upamecano", "Defender", "France", 186, 90, "right", "1998-10-27", "38900000", "2", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dayot_Upamecano_France_v_Senegal_16_June_2026-402.jpg/250px-Dayot_Upamecano_France_v_Senegal_16_June_2026-402.jpg", "first", 5L));
                array.add(createMockPlayer(1008L, "Min-Jae Kim", "Min-Jae", "Kim", "Min-Jae Kim", "Defender", "South Korea", 190, 88, "right", "1996-11-15", "28300000", "3", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/FC_Red_Bull_Salzburg_gegen_Bayern_M%C3%BCnchen_%282025-01-06_Testspiel%29_26.jpg/330px-FC_Red_Bull_Salzburg_gegen_Bayern_M%C3%BCnchen_%282025-01-06_Testspiel%29_26.jpg", "first", 5L));
                array.add(createMockPlayer(1010L, "Leon Goretzka", "Leon", "Goretzka", "L. Goretzka", "Midfielder", "Germany", 189, 82, "right", "1995-02-06", "10800000", "8", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Leon_Goretzka_2020.jpg/250px-Leon_Goretzka_2020.jpg", "first", 5L));
                array.add(createMockPlayer(1011L, "Thomas Müller", "Thomas", "Müller", "T. Müller", "Forward", "Germany", 185, 76, "right", "1989-09-13", "10000000", "25", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Thomas_M%C3%BCller_2022_%28cropped%29.jpg/250px-Thomas_M%C3%BCller_2022_%28cropped%29.jpg", "first", 5L));
                array.add(createMockPlayer(1012L, "Mathys Tel", "Mathys", "Tel", "M. Tel", "Forward", "France", 183, 77, "right", "2005-04-27", "40000000", "39", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/%D7%9E%D7%90%D7%AA%D7%99%D7%A1_%D7%AA%D7%9C.jpg/250px-%D7%9E%D7%90%D7%AA%D7%99%D7%A1_%D7%AA%D7%9C.jpg", "first", 5L));
                array.add(createMockPlayer(1013L, "Aleksandar Pavlović", "Aleksandar", "Pavlović", "A. Pavlović", "Midfielder", "Germany", 188, 78, "right", "2004-05-03", "51700000", "45", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_34.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_34.jpg", "first", 5L));
                array.add(createMockPlayer(1014L, "Konrad Laimer", "Konrad", "Laimer", "K. Laimer", "Midfielder", "Austria", 180, 72, "right", "1997-05-27", "33600000", "27", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2022-07-21_Fu%C3%9Fball%2C_M%C3%A4nner%2CFreundschaftsspiel%2C_RB_Leipzig_-_FC_Liverpool_1DX_2137_by_Stepro_%28cropped%29.jpg/250px-2022-07-21_Fu%C3%9Fball%2C_M%C3%A4nner%2CFreundschaftsspiel%2C_RB_Leipzig_-_FC_Liverpool_1DX_2137_by_Stepro_%28cropped%29.jpg", "first", 5L));
                array.add(createMockPlayer(1016L, "Raphaël Guerreiro", "Raphaël", "Guerreiro", "R. Guerreiro", "Midfielder", "Portugal", 170, 71, "left", "1993-12-22", "2400000", "22", "https://upload.wikimedia.org/wikipedia/commons/2/22/Rapha%C3%ABl_Guerreiro_WC2022.jpg", "first", 5L));
                array.add(createMockPlayer(1018L, "Daniel Peretz", "Daniel", "Peretz", "D. Peretz", "Goalkeeper", "Israel", 190, 82, "right", "2000-07-10", "3000000", "18", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Daniel_Peretz_2022_%28cropped%29.jpg/330px-Daniel_Peretz_2022_%28cropped%29.jpg", "first", 5L));
                array.add(createMockPlayer(1019L, "Sven Ulreich", "Sven", "Ulreich", "S. Ulreich", "Goalkeeper", "Germany", 192, 87, "right", "1988-08-03", "336400", "26", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Sven_Ulreich_2020.jpg/250px-Sven_Ulreich_2020.jpg", "first", 5L));
                
                // 25/26 New Arrivals
                array.add(createMockPlayer(1022L, "Michael Olise", "Michael", "Olise", "M. Olise", "Forward", "France", 184, 73, "left", "2001-12-12", "170600000", "17", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg/330px-Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg", "first", 5L));
                array.add(createMockPlayer(1023L, "João Palhinha", "João", "Palhinha", "J. Palhinha", "Midfielder", "Portugal", 190, 84, "right", "1995-07-09", "55000000", "16", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Joaopalhinha.jpg/330px-Joaopalhinha.jpg", "first", 5L));
                array.add(createMockPlayer(1024L, "Hiroki Ito", "Hiroki", "Ito", "H. Ito", "Defender", "Japan", 186, 81, "left", "1999-05-12", "19400000", "21", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Hiroki_Ito_VfB_Stuttgart.jpg/250px-Hiroki_Ito_VfB_Stuttgart.jpg", "first", 5L));
                array.add(createMockPlayer(1025L, "Josip Stanišić", "Josip", "Stanišić", "J. Stanišić", "Defender", "Croatia", 186, 80, "right", "2000-04-02", "39800000", "44", "https://upload.wikimedia.org/wikipedia/commons/6/64/Josip_Stani%C5%A1i%C4%87_during_an_Interview_in_2023.png", "first", 5L));
                array.add(createMockPlayer(1026L, "Sacha Boey", "Sacha", "Boey", "S. Boey", "Defender", "France", 178, 70, "right", "2000-09-13", "22000000", "23", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Lens_-_Dijon_%2821-02-2021%29_28.jpg/330px-Lens_-_Dijon_%2821-02-2021%29_28.jpg", "first", 5L));
                
                // Newly added 25/26 players from user request
                array.add(createMockPlayer(1027L, "Jonas Urbig", "Jonas", "Urbig", "J. Urbig", "Goalkeeper", "Germany", 189, 80, "right", "2003-08-08", "18800000", "40", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_14.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_14.jpg", "first", 5L));
                array.add(createMockPlayer(1028L, "Leon Klanac", "Leon", "Klanac", "L. Klanac", "Goalkeeper", "Germany", 185, 78, "right", "2007-03-01", "980700", "48", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_14.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_14.jpg", "first", 5L));
                array.add(createMockPlayer(1029L, "Jonathan Tah", "Jonathan", "Tah", "J. Tah", "Defender", "Germany", 194, 94, "right", "1996-02-11", "31300000", "4", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Jonathan_Tah_2019.jpg/250px-Jonathan_Tah_2019.jpg", "first", 5L));
                array.add(createMockPlayer(1030L, "Cassiano Kiala", "Cassiano", "Kiala", "C. Kiala", "Defender", "Germany", 185, 78, "right", "2009-01-01", "1900000", "30", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_05.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_05.jpg", "first", 5L));
                array.add(createMockPlayer(1031L, "Tom Bischof", "Tom", "Bischof", "T. Bischof", "Midfielder", "Germany", 176, 70, "left", "2005-06-28", "46800000", "20", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_45.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_45.jpg", "first", 5L));
                array.add(createMockPlayer(1032L, "Bara Ndiaye", "Bara", "Ndiaye", "B. Ndiaye", "Midfielder", "Senegal", 180, 72, "right", "2007-12-01", "1300000", "39", "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Bara_Ndiaye_France_v_Senegal_16_June_2026-305.jpg/250px-Bara_Ndiaye_France_v_Senegal_16_June_2026-305.jpg", "first", 5L));
                array.add(createMockPlayer(1033L, "Erblin Osmani", "Erblin", "Osmani", "E. Osmani", "Midfielder", "Germany", 180, 72, "right", "2008-01-01", "1800000", "38", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_34.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_34.jpg", "first", 5L));
                array.add(createMockPlayer(1034L, "David Santos Daiber", "David", "Daiber", "D. Daiber", "Midfielder", "Portugal", 185, 75, "right", "2006-11-20", "539100", "47", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Paul_wanner-1772636856_%28cropped%29.JPG/250px-Paul_wanner-1772636856_%28cropped%29.JPG", "first", 5L));
                array.add(createMockPlayer(1035L, "Lennart Karl", "Lennart", "Karl", "L. Karl", "Forward", "Germany", 168, 62, "left", "2008-05-31", "47000000", "42", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_45.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_45.jpg", "first", 5L));
                array.add(createMockPlayer(1036L, "Luis Díaz", "Luis", "Díaz", "L. Díaz", "Forward", "Colombia", 180, 73, "right", "1997-01-13", "89200000", "14", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_40_%28Luiz_D%C3%ADaz%29.jpg/330px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_40_%28Luiz_D%C3%ADaz%29.jpg", "first", 5L));
                array.add(createMockPlayer(1037L, "Bastian Assomo", "Bastian", "Assomo", "B. Assomo", "Forward", "Germany", 175, 68, "right", "2009-01-01", "0", "33", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Joao_Palhinha_2024.jpg/250px-Joao_Palhinha_2024.jpg", "first", 5L));
                array.add(createMockPlayer(1038L, "Wisdom Mike", "Wisdom", "Mike", "W. Mike", "Forward", "Germany", 180, 72, "right", "2008-01-01", "5700000", "36", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Serge_Gnabry_2020.jpg/250px-Serge_Gnabry_2020.jpg", "first", 5L));
                array.add(createMockPlayer(1039L, "Nicolas Jackson", "Nicolas", "Jackson", "N. Jackson", "Forward", "Senegal", 187, 78, "right", "2001-06-20", "44100000", "11", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Nicolas_Jackson_France_v_Senegal_16_June_2026-369_%28cropped%29.jpg/250px-Nicolas_Jackson_France_v_Senegal_16_June_2026-369_%28cropped%29.jpg", "first", 5L));

                // Academy / FC Bayern II Players
                array.add(createMockPlayer(1101L, "Ritzy Hülsmann", "Ritzy", "Hülsmann", "R. Hülsmann", "Goalkeeper", "Germany", 200, 91, "right", "2004-03-12", "500000", "12", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/20211012_AUT_U21_vs_FIN_U21_Nicolas_Kristof_1DX_1922.jpg/330px-20211012_AUT_U21_vs_FIN_U21_Nicolas_Kristof_1DX_1922.jpg", "academy", 6L));
                array.add(createMockPlayer(1102L, "Tarek Buchmann", "Tarek", "Buchmann", "T. Buchmann", "Defender", "Germany", 188, 83, "right", "2005-02-28", "1000000", "13", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Malick_Thiaw_2020.jpg/330px-Malick_Thiaw_2020.jpg", "academy", 6L));
                array.add(createMockPlayer(1103L, "Maximilian Hennig", "Maximilian", "Hennig", "M. Hennig", "Defender", "Germany", 178, 71, "left", "2006-10-12", "400000", "14", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Fikayo_Tomori_2019.jpg/250px-Fikayo_Tomori_2019.jpg", "academy", 6L));
                array.add(createMockPlayer(1104L, "Noel Aseko Nkili", "Noel", "Aseko Nkili", "N. Aseko Nkili", "Midfielder", "Germany", 178, 73, "right", "2005-10-22", "800000", "16", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Ridle_Baku_2020.jpg/250px-Ridle_Baku_2020.jpg", "academy", 6L));
                array.add(createMockPlayer(1105L, "Javier Fernández", "Javier", "Fernández", "J. Fernández", "Midfielder", "Spain", 180, 74, "right", "2006-11-28", "600000", "17", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Nico_Gonzalez_2020.jpg/250px-Nico_Gonzalez_2020.jpg", "academy", 6L));
                array.add(createMockPlayer(1106L, "Lovro Zvonarek", "Lovro", "Zvonarek", "L. Zvonarek", "Midfielder", "Croatia", 180, 72, "right", "2005-05-08", "1500000", "18", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Luka_Sucic_2020.jpg/250px-Luka_Sucic_2020.jpg", "academy", 6L));
                array.add(createMockPlayer(1107L, "Adin Licina", "Adin", "Licina", "A. Licina", "Midfielder", "Germany", 177, 70, "left", "2007-01-06", "500000", "20", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Sead_Kolasinac_2020.jpg/250px-Sead_Kolasinac_2020.jpg", "academy", 6L));
                array.add(createMockPlayer(1108L, "Jonathan Asp Jensen", "Jonathan", "Asp Jensen", "J. Asp Jensen", "Midfielder", "Denmark", 178, 71, "right", "2006-01-14", "800000", "21", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Rasmus_H%C3%B8jlund_2020.jpg/250px-Rasmus_H%C3%B8jlund_2020.jpg", "academy", 6L));
                
                return Optional.of(array);
            } else if (url.contains("/players/leagues/")) {
                try {
                    String sub = url.substring(url.indexOf("/players/leagues/") + "/players/leagues/".length());
                    if (sub.contains("?")) {
                        sub = sub.substring(0, sub.indexOf("?"));
                    }
                    Long leagueId = Long.parseLong(sub.trim());
                    return Optional.of(generateLeaguePlayers(leagueId));
                } catch (Exception e) {
                    log.error("Error parsing league id: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to generate mock data: {}", e.getMessage(), e);
        }
        return Optional.empty();
    }

    private com.fasterxml.jackson.databind.node.ObjectNode createMockPlayer(
        Long id, String name, String firstname, String lastname,
        String displayName, String positionName, String nationality, Integer height,
        Integer weight, String preferredFoot, String dob, String value, String jersey,
        String photoUrl, String teamType, Long teamId
    ) {
        com.fasterxml.jackson.databind.node.ObjectNode node = objectMapper.createObjectNode();
        node.put("id", id);
        node.put("name", name);
        node.put("firstname", firstname);
        node.put("lastname", lastname);
        node.put("display_name", displayName);
        node.put("nationality", nationality);
        node.put("image_path", photoUrl);
        node.put("height", height);
        node.put("weight", weight);
        node.put("preferred_foot", preferredFoot);
        node.put("date_of_birth", dob);
        node.put("market_value", value);
        node.put("jersey_number", jersey);
        node.put("team_type", teamType);
        node.put("team_id", teamId);

        com.fasterxml.jackson.databind.node.ObjectNode posNode = objectMapper.createObjectNode();
        posNode.put("name", positionName);
        node.set("position", posNode);

        return node;
    }

    private com.fasterxml.jackson.databind.node.ObjectNode createMockInjury(
        Long id, Long playerId, String type, String desc, String start
    ) {
        com.fasterxml.jackson.databind.node.ObjectNode node = objectMapper.createObjectNode();
        node.put("id", id);
        node.put("player_id", playerId);
        node.put("type", type);
        node.put("description", desc);
        node.put("starting_at", start);
        return node;
    }

    private com.fasterxml.jackson.databind.node.ObjectNode createMockTransfer(
        Long id, Long playerId, Long fromId, Long toId, String fee, String date
    ) {
        com.fasterxml.jackson.databind.node.ObjectNode node = objectMapper.createObjectNode();
        node.put("id", id);
        node.put("player_id", playerId);
        node.put("from_team_id", fromId);
        node.put("to_team_id", toId);
        node.put("amount", fee);
        node.put("date", date);
        return node;
    }

    private java.util.List<Long> getClubIdsForLeague(Long leagueId) {
        if (leagueId == 8L) { // EPL
            return java.util.List.of(15L, 12L, 13L, 1001L, 1002L, 1003L, 1004L, 1005L, 1006L, 1007L, 1008L, 1009L, 1010L, 1011L, 1012L, 1013L, 1014L, 1015L, 1016L, 1017L);
        } else if (leagueId == 72L) { // Bundesliga
            return java.util.List.of(5L, 2001L, 2002L, 2003L, 2004L, 2005L, 2006L, 2007L, 2008L, 2009L, 2010L, 2011L, 2012L, 2013L, 2014L, 2015L, 2016L, 2017L);
        } else if (leagueId == 301L) { // La Liga
            return java.util.List.of(10L, 3001L, 3002L, 3003L, 3004L, 3005L, 3006L, 3007L, 3008L, 3009L, 3010L, 3011L, 3012L, 3013L, 3014L, 3015L, 3016L, 3017L, 3018L, 3019L);
        } else if (leagueId == 82L) { // Serie A
            return java.util.List.of(11L, 4001L, 4002L, 4003L, 4004L, 4005L, 4006L, 4007L, 4008L, 4009L, 4010L, 4011L, 4012L, 4013L, 4014L, 4015L, 4016L, 4017L, 4018L, 4019L);
        } else if (leagueId == 564L) { // Ligue 1
            return java.util.List.of(14L, 5001L, 5002L, 5003L, 5004L, 5005L, 5006L, 5007L, 5008L, 5009L, 5010L, 5011L, 5012L, 5013L, 5014L, 5015L, 5016L, 5017L);
        }
        return java.util.Collections.emptyList();
    }

    private JsonNode generateLeaguePlayers(Long leagueId) {
        com.fasterxml.jackson.databind.node.ArrayNode array = objectMapper.createArrayNode();
        java.util.List<Long> clubIds = getClubIdsForLeague(leagueId);
        
        String defaultNat = switch (leagueId.intValue()) {
            case 8 -> "England";
            case 72 -> "Germany";
            case 301 -> "Spain";
            case 82 -> "Italy";
            case 564 -> "France";
            default -> "Germany";
        };

        String[] firstNames = switch (leagueId.intValue()) {
            case 8 -> new String[]{"John", "James", "Harry", "Marcus", "Declan", "Bukayo", "Jack", "Trent", "Jude", "Kyle", "Raheem", "Phil", "Mason", "Connor", "Jordan", "Luke"};
            case 72 -> new String[]{"Thomas", "Manuel", "Joshua", "Leon", "Serge", "Kai", "Ilkay", "Leroy", "Nico", "Florian", "Jamal", "Robin", "Marc", "Jonas", "David", "Emre"};
            case 301 -> new String[]{"Alvaro", "Pedri", "Gavi", "Rodri", "Ferran", "Dani", "Nico", "Aymeric", "Unai", "Alejandro", "Mikel", "Martin", "Isco", "Jordi", "Koke", "Inaki"};
            case 82 -> new String[]{"Giovanni", "Alessandro", "Nicolo", "Federico", "Gianluigi", "Ciro", "Lorenzo", "Giorgio", "Leonardo", "Manuel", "Giacomo", "Bryan", "Matteo", "Davide", "Gianluca", "Francesco"};
            case 564 -> new String[]{"Kylian", "Antoine", "Olivier", "Ousmane", "Kingsley", "Dayot", "Lucas", "Theo", "Aurelien", "Eduardo", "Adrien", "William", "Mike", "Benjamin", "Marcus", "Jules"};
            default -> new String[]{"Alex", "Chris", "Pat", "Sam", "Taylor", "Jordan", "Morgan", "Casey"};
        };

        String[] lastNames = switch (leagueId.intValue()) {
            case 8 -> new String[]{"Smith", "Jones", "Stones", "Walker", "Shaw", "Rice", "Kane", "Sterling", "Rashford", "Bellingham", "Foden", "Saka", "Mount", "Trippier", "Pickford", "Pope"};
            case 72 -> new String[]{"Müller", "Neuer", "Kimmich", "Goretzka", "Gnabry", "Sané", "Havertz", "Gündogan", "Wirtz", "Musiala", "Schlotterbeck", "Rüdiger", "Brandt", "Raum", "Ter Stegen", "Sule"};
            case 301 -> new String[]{"Morata", "Gonzalez", "Paez", "Hernandez", "Torres", "Olmo", "Williams", "Laporte", "Simon", "Balde", "Merino", "Zubimendi", "Alarcon", "Alba", "Resurreccion", "Garcia"};
            case 82 -> new String[]{"Di Lorenzo", "Bastoni", "Barella", "Chiesa", "Donnarumma", "Immobile", "Pellegrini", "Chiellini", "Bonucci", "Locatelli", "Raspadori", "Cristante", "Darmian", "Frattesi", "Mancini", "Acerbi"};
            case 564 -> new String[]{"Mbappé", "Griezmann", "Giroud", "Dembélé", "Coman", "Upamecano", "Hernandez", "Tchouaméni", "Camavinga", "Rabiot", "Saliba", "Maignan", "Pavard", "Thuram", "Koundé", "Konaté"};
            default -> new String[]{"Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez"};
        };

        String[] gkPhotos = new String[]{
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Manuel_Neuer_2020.jpg/250px-Manuel_Neuer_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Sven_Ulreich_2020.jpg/250px-Sven_Ulreich_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Daniel_Peretz_2022_%28cropped%29.jpg/330px-Daniel_Peretz_2022_%28cropped%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_14.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_14.jpg"
        };

        String[] defPhotos = new String[]{
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Alphonso_Davies_2020.jpg/250px-Alphonso_Davies_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Dayot_Upamecano_2020.jpg/250px-Dayot_Upamecano_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/FC_Red_Bull_Salzburg_gegen_Bayern_M%C3%BCnchen_%282025-01-06_Testspiel%29_26.jpg/330px-FC_Red_Bull_Salzburg_gegen_Bayern_M%C3%BCnchen_%282025-01-06_Testspiel%29_26.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Jonathan_Tah_2019.jpg/250px-Jonathan_Tah_2019.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Hiroki_Ito_VfB_Stuttgart.jpg/250px-Hiroki_Ito_VfB_Stuttgart.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Lens_-_Dijon_%2821-02-2021%29_28.jpg/330px-Lens_-_Dijon_%2821-02-2021%29_28.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/6/64/Josip_Stani%C5%A1i%C4%87_during_an_Interview_in_2023.png"
        };

        String[] midPhotos = new String[]{
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Jamal_Musiala_2022_%28cropped%29.jpg/250px-Jamal_Musiala_2022_%28cropped%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Joshua_Kimmich_2020.jpg/250px-Joshua_Kimmich_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Leon_Goretzka_2020.jpg/250px-Leon_Goretzka_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_34.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_34.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2022-07-21_Fu%C3%9Fball%2C_M%C3%A4nner%2CFreundschaftsspiel%2C_RB_Leipzig_-_FC_Liverpool_1DX_2137_by_Stepro_%28cropped%29.jpg/250px-2022-07-21_Fu%C3%9Fball%2C_M%C3%A4nner%2CFreundschaftsspiel%2C_RB_Leipzig_-_FC_Liverpool_1DX_2137_by_Stepro_%28cropped%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Rapha%C3%ABl_Guerreiro_WC2022.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Ryan_Gravenberch_2021.jpg/250px-Ryan_Gravenberch_2021.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Paul_wanner-1772636856_%28cropped%29.JPG/330px-Paul_wanner-1772636856_%28cropped%29.JPG"
        };

        String[] fwdPhotos = new String[]{
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Harry_Kane_on_October_10%2C_2023.jpg/250px-Harry_Kane_on_October_10%2C_2023.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Serge_Gnabry_2020.jpg/250px-Serge_Gnabry_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/FC_Red_Bull_Salzburg_gegen_Bayern_M%C3%BCnchen_%282025-01-06_Testspiel%29_19.jpg/250px-FC_Red_Bull_Salzburg_gegen_Bayern_M%C3%BCnchen_%282025-01-06_Testspiel%29_19.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/%D7%9E%D7%90%D7%AA%D7%99%D7%A1_%D7%AA%D7%9C.jpg/250px-%D7%9E%D7%90%D7%AA%D7%99%D7%A1_%D7%AA%D7%9C.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg/330px-Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_40_%28Luiz_D%C3%ADaz%29.jpg/330px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_40_%28Luiz_D%C3%ADaz%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Nicolas_Jackson_France_v_Senegal_16_June_2026-369_%28cropped%29.jpg/250px-Nicolas_Jackson_France_v_Senegal_16_June_2026-369_%28cropped%29.jpg"
        };

        long playerIdCounter = leagueId * 100000;
        for (Long clubId : clubIds) {
            if (clubId == 5L) {
                continue;
            }

            java.util.Random rand = new java.util.Random(clubId);
            
            for (int pIdx = 0; pIdx < 8; pIdx++) {
                String position;
                String photo;
                long baseVal;

                if (pIdx == 0) {
                    position = "Goalkeeper";
                    photo = gkPhotos[rand.nextInt(gkPhotos.length)];
                    baseVal = 2000000L + rand.nextInt(20000000);
                } else if (pIdx <= 3) {
                    position = "Defender";
                    photo = defPhotos[rand.nextInt(defPhotos.length)];
                    baseVal = 5000000L + rand.nextInt(45000000);
                } else if (pIdx <= 5) {
                    position = "Midfielder";
                    photo = midPhotos[rand.nextInt(midPhotos.length)];
                    baseVal = 8000000L + rand.nextInt(70000000);
                } else {
                    position = "Forward";
                    photo = fwdPhotos[rand.nextInt(fwdPhotos.length)];
                    baseVal = 10000000L + rand.nextInt(90000000);
                }

                if (clubId == 10L || clubId == 14L || clubId == 15L || clubId == 1001L || clubId == 1002L || clubId == 3001L || clubId == 4001L || clubId == 4003L) {
                    baseVal = (long) (baseVal * 1.5);
                }

                String fn = firstNames[rand.nextInt(firstNames.length)];
                String ln = lastNames[rand.nextInt(lastNames.length)];
                String name = fn + " " + ln;
                String displayName = fn.charAt(0) + ". " + ln;
                int height = 170 + rand.nextInt(25);
                int weight = 60 + rand.nextInt(30);
                String foot = rand.nextBoolean() ? "right" : "left";
                
                int age = 18 + rand.nextInt(18);
                String dob = (2026 - age) + "-05-12";

                String jersey = String.valueOf(1 + rand.nextInt(99));
                long id = playerIdCounter++;

                array.add(createMockPlayer(id, name, fn, ln, displayName, position, defaultNat, height, weight, foot, dob, String.valueOf(baseVal), jersey, photo, "league", clubId));
            }
        }

        return array;
    }

    public String getTopLeagueIds() {
        return topLeagueIds;
    }

    private com.fasterxml.jackson.databind.node.ObjectNode mapTransfermarktPlayer(JsonNode pNode, JsonNode profileNode, String teamType, Long teamId) {
        Long id = pNode.path("id").asLong();
        String name = pNode.path("name").asText();
        
        String firstname = "";
        String lastname = "";
        if (name.contains(" ")) {
            firstname = name.substring(0, name.indexOf(" "));
            lastname = name.substring(name.indexOf(" ") + 1);
        } else {
            firstname = name;
            lastname = "";
        }
        
        String displayName = name;
        String position = pNode.path("position").asText("Unknown");
        
        String nationality = "Germany";
        JsonNode natArray = pNode.path("nationality");
        if (natArray.isArray() && natArray.size() > 0) {
            nationality = natArray.get(0).asText();
        }
        
        Integer height = pNode.path("height").asInt(180);
        Integer weight = 75;
        String preferredFoot = pNode.path("foot").asText("right");
        String dob = pNode.path("dateOfBirth").asText("1995-01-01");
        
        long mv = pNode.path("marketValue").asLong(0);
        String value = String.valueOf(mv);
        
        String jersey = "";
        String photoUrl = "";
        
        PlayerProfile staticProfile = TM_PROFILES.get(id);
        if (staticProfile != null) {
            photoUrl = staticProfile.getImageUrl();
            jersey = staticProfile.getShirtNumber();
        } else if (profileNode != null) {
            photoUrl = profileNode.path("imageUrl").asText();
            String jerseyRaw = profileNode.path("shirtNumber").asText();
            if (jerseyRaw.startsWith("#")) {
                jersey = jerseyRaw.substring(1);
            } else {
                jersey = jerseyRaw;
            }
        }
        
        if (jersey.isEmpty()) {
            jersey = "25";
        }
        if (photoUrl.isEmpty()) {
            photoUrl = "https://ui-avatars.com/api/?name=" + name + "&background=DC052D&color=fff";
        }

        return createMockPlayer(id, name, firstname, lastname, displayName, position, nationality, height, weight, preferredFoot, dob, value, jersey, photoUrl, teamType, teamId);
    }

    public Long getBayernTeamId() {
        return bayernTeamId;
    }

    // ─── Static Player Profile Pre-cache for TM ───────────────────────────────

    public static class PlayerProfile {
        private final String imageUrl;
        private final String shirtNumber;
        
        public PlayerProfile(String imageUrl, String shirtNumber) {
            this.imageUrl = imageUrl;
            this.shirtNumber = shirtNumber;
        }
        
        public String getImageUrl() { return imageUrl; }
        public String getShirtNumber() { return shirtNumber; }
    }

    private static final java.util.Map<Long, PlayerProfile> TM_PROFILES = new java.util.HashMap<>();
    static {
        // Goalkeepers
        TM_PROFILES.put(607720L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_14.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_14.jpg", "40")); // Jonas Urbig
        TM_PROFILES.put(17259L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Manuel_Neuer_2020.jpg/250px-Manuel_Neuer_2020.jpg", "1")); // Manuel Neuer
        TM_PROFILES.put(40680L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Sven_Ulreich_Training_2017-03_FC_Bayern_Muenchen-3.jpg/250px-Sven_Ulreich_Training_2017-03_FC_Bayern_Muenchen-3.jpg", "26")); // Sven Ulreich
        TM_PROFILES.put(1009439L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_14.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_14.jpg", "48")); // Leon Klanac
        
        // Defenders
        TM_PROFILES.put(344695L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dayot_Upamecano_France_v_Senegal_16_June_2026-402.jpg/250px-Dayot_Upamecano_France_v_Senegal_16_June_2026-402.jpg", "2")); // Dayot Upamecano
        TM_PROFILES.put(196357L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Jonathan_Tah_2019.jpg/250px-Jonathan_Tah_2019.jpg", "4")); // Jonathan Tah
        TM_PROFILES.put(503482L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/FC_Red_Bull_Salzburg_gegen_Bayern_M%C3%BCnchen_%282025-01-06_Testspiel%29_26.jpg/330px-FC_Red_Bull_Salzburg_gegen_Bayern_M%C3%BCnchen_%282025-01-06_Testspiel%29_26.jpg", "3")); // Min-jae Kim
        TM_PROFILES.put(353892L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Hiroki_Ito_VfB_Stuttgart.jpg/250px-Hiroki_Ito_VfB_Stuttgart.jpg", "21")); // Hiroki Ito
        TM_PROFILES.put(424204L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Alphonso_Davies_in_2022.jpg/250px-Alphonso_Davies_in_2022.jpg", "19")); // Alphonso Davies
        TM_PROFILES.put(170986L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/2/22/Rapha%C3%ABl_Guerreiro_WC2022.jpg", "22")); // Raphaël Guerreiro
        TM_PROFILES.put(483046L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/6/64/Josip_Stani%C5%A1i%C4%87_during_an_Interview_in_2023.png", "44")); // Josip Stanisic
        TM_PROFILES.put(223967L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2022-07-21_Fu%C3%9Fball%2C_M%C3%A4nner%2CFreundschaftsspiel%2C_RB_Leipzig_-_FC_Liverpool_1DX_2137_by_Stepro_%28cropped%29.jpg/250px-2022-07-21_Fu%C3%9Fball%2C_M%C3%A4nner%2CFreundschaftsspiel%2C_RB_Leipzig_-_FC_Liverpool_1DX_2137_by_Stepro_%28cropped%29.jpg", "27")); // Konrad Laimer
        
        // Midfielders
        TM_PROFILES.put(792380L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_34.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_34.jpg", "45")); // Aleksandar Pavlovic
        TM_PROFILES.put(161056L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Joshua_Kimmich_Training_2018-05-08_FC_Bayern_Muenchen-1.jpg/250px-Joshua_Kimmich_Training_2018-05-08_FC_Bayern_Muenchen-1.jpg", "6")); // Joshua Kimmich
        TM_PROFILES.put(1118495L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Paul_wanner-1772636856_%28cropped%29.JPG/250px-Paul_wanner-1772636856_%28cropped%29.JPG", "47")); // David Santos Daiber
        TM_PROFILES.put(822959L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_45.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_45.jpg", "20")); // Tom Bischof
        TM_PROFILES.put(153084L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Leon_Goretzka_Training_2019-04-10_FC_Bayern_Muenchen-5.jpg/250px-Leon_Goretzka_Training_2019-04-10_FC_Bayern_Muenchen-5.jpg", "8")); // Leon Goretzka
        TM_PROFILES.put(1497653L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Bara_Ndiaye_France_v_Senegal_16_June_2026-305.jpg/250px-Bara_Ndiaye_France_v_Senegal_16_June_2026-305.jpg", "39")); // Bara Sapoko Ndiaye
        TM_PROFILES.put(580195L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Jamal_Musiala_2022_%28cropped%29.jpg/250px-Jamal_Musiala_2022_%28cropped%29.jpg", "10")); // Jamal Musiala
        TM_PROFILES.put(1075147L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_45.jpg/250px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_45.jpg", "42")); // Lennart Karl
        
        // Forwards
        TM_PROFILES.put(480692L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_40_%28Luiz_D%C3%ADaz%29.jpg/330px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_40_%28Luiz_D%C3%ADaz%29.jpg", "14")); // Luis Díaz
        TM_PROFILES.put(566723L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg/330px-Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg", "17")); // Michael Olise
        TM_PROFILES.put(159471L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Serge_Gnabry_WC2022.jpg/250px-Serge_Gnabry_WC2022.jpg", "7")); // Serge Gnabry
        TM_PROFILES.put(132098L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Harry_Kane_on_October_10%2C_2023.jpg/250px-Harry_Kane_on_October_10%2C_2023.jpg", "9")); // Harry Kane
        TM_PROFILES.put(776890L, new PlayerProfile("https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Nicolas_Jackson_France_v_Senegal_16_June_2026-369_%28cropped%29.jpg/250px-Nicolas_Jackson_France_v_Senegal_16_June_2026-369_%28cropped%29.jpg", "11")); // Nicolas Jackson
    }
}
