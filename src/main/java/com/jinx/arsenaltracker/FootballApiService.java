package com.jinx.arsenaltracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class FootballApiService {

    private static final String API_URL_2025 =
            "https://api.football-data.org/v4/teams/57/matches?season=2025";
    private static final String API_URL_2026 =
            "https://api.football-data.org/v4/teams/57/matches?season=2026";
    private static final int ARSENAL_ID = 57;

    @Value("${football.api.key}")
    private String apiKey;

    @Autowired
    private FixtureRepository fixtureRepository;

    @Autowired
    private ScoringService scoringService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Scheduled(fixedDelay = 900000)
    public void syncFixtures() {
        try {
            List<Fixture> pending = fixtureRepository.findFixturesExpectingResults(LocalDateTime.now());
            boolean anyPending = !pending.isEmpty();

            boolean noneYetInDb = fixtureRepository.count() == 0;

            if (!anyPending && !noneYetInDb) {
                return;
            }

            fetchAndSync();

        } catch (Exception e) {
            System.err.println("Sync check error: " + e.getMessage());
        }
    }

    public void fetchAndSync() {
        try {
            fetchSeason(API_URL_2025);
            fetchSeason(API_URL_2026);
            System.out.println("Fixtures synced successfully.");
        } catch (Exception e) {
            System.err.println("Failed to sync fixtures: " + e.getMessage());
        }
    }

    private void fetchSeason(String url) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Auth-Token", apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode matches = root.get("matches");
            for (JsonNode match : matches) {
                processMatch(match);
            }
        } catch (Exception e) {
            System.err.println("Failed to parse response from " + url + ": " + e.getMessage());
        }
    }

    private void processMatch(JsonNode match) {
        try {
            int matchId = match.get("id").asInt();
            String status = match.get("status").asText();

            if (status.equals("FINISHED")) {
                return;
            }

            JsonNode homeTeam = match.get("homeTeam");
            JsonNode awayTeam = match.get("awayTeam");
            int homeTeamId = homeTeam.get("id").asInt();

            boolean arsenalIsHome = homeTeamId == ARSENAL_ID;
            String opponent = arsenalIsHome
                    ? awayTeam.get("shortName").asText()
                    : homeTeam.get("shortName").asText();
            String venue = arsenalIsHome ? "Emirates Stadium" : "Away";
            String competition = match.get("competition").get("name").asText();
            String stage = match.get("stage").asText();
            String stageLabel = formatStage(stage);
            String fullOpponent = competition + " — " + stageLabel + " — " + opponent;

            String utcDate = match.get("utcDate").asText();
            OffsetDateTime dateTime = OffsetDateTime.parse(utcDate);
            LocalDate matchDate = dateTime.toLocalDate();
            LocalTime matchTime = dateTime.toLocalTime();

            String externalId = "api-" + matchId;
            Fixture existing = fixtureRepository.findBySource(externalId).orElse(null);

            boolean knockout = !stage.equals("REGULAR_SEASON") && !stage.equals("LEAGUE_STAGE");

            if (existing == null) {
                Fixture fixture = new Fixture();
                fixture.setOpponent(fullOpponent);
                fixture.setVenue(venue);
                fixture.setMatchDate(matchDate);
                fixture.setMatchTime(matchTime);
                fixture.setSource(externalId);
                fixture.setIsKnockout(knockout);
                fixtureRepository.save(fixture);
            }

        } catch (Exception e) {
            System.err.println("Failed to process match: " + e.getMessage());
        }
    }

    private String formatStage(String stage) {
        return switch (stage) {
            case "REGULAR_SEASON" -> "Matchday";
            case "LEAGUE_STAGE" -> "League Stage";
            case "LAST_16" -> "Round of 16";
            case "QUARTER_FINALS" -> "Quarter Final";
            case "SEMI_FINALS" -> "Semi Final";
            case "FINAL" -> "Final";
            default -> stage;
        };
    }
}