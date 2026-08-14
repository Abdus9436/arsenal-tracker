package com.jinx.arsenaltracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private static final int ARSENAL_ID = 57;
    private static final String STANDINGS_URL =
            "https://api.football-data.org/v4/competitions/PL/standings?season=";

    @Value("${football.api.key}")
    private String apiKey;

    @Autowired
    private AppConfigService appConfigService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public Map<String, Object> getStats() {
        String cached = appConfigService.get("stats_cache", "");
        if (!cached.isEmpty()) {
            try {
                return objectMapper.readValue(cached,
                        objectMapper.getTypeFactory().constructMapType(
                                HashMap.class, String.class, Object.class));
            } catch (Exception e) {
                System.err.println("Failed to parse cached stats: " + e.getMessage());
            }
        }
        return refreshStats();
    }

    @PostMapping("/refresh")
    public Map<String, Object> forceRefresh() {
        return refreshStats();
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void scheduledRefresh() {
        System.out.println("Scheduled stats refresh starting...");
        refreshStats();
    }

    public void invalidateCache() {
        appConfigService.set("stats_cache", "");
    }

    public Map<String, Object> refreshStats() {
        try {
            String season = fetchBestSeason();
            JsonNode root = fetchStandings(season);
            JsonNode standings = root.get("standings");

            Map<String, Object> total = extractArsenalRow(standings, "TOTAL");
            Map<String, Object> home = extractArsenalRow(standings, "HOME");
            Map<String, Object> away = extractArsenalRow(standings, "AWAY");

            Map<String, Object> result = new HashMap<>();
            result.put("season", season.equals("2026") ? "2026/27" : "2025/26");
            result.put("total", total);
            result.put("home", home);
            result.put("away", away);

            String json = objectMapper.writeValueAsString(result);
            appConfigService.set("stats_cache", json);
            System.out.println("Stats refreshed and stored in DB.");
            return result;

        } catch (Exception e) {
            System.err.println("Stats refresh failed: " + e.getMessage());
            String cached = appConfigService.get("stats_cache", "");
            if (!cached.isEmpty()) {
                try {
                    return objectMapper.readValue(cached,
                            objectMapper.getTypeFactory().constructMapType(
                                    HashMap.class, String.class, Object.class));
                } catch (Exception ex) {
                    throw new RuntimeException("Stats unavailable");
                }
            }
            throw new RuntimeException("Stats unavailable: " + e.getMessage());
        }
    }

    private String fetchBestSeason() throws Exception {
        JsonNode root = fetchStandings("2026");
        JsonNode table = root.get("standings").get(0).get("table");
        for (JsonNode row : table) {
            if (row.get("team").get("id").asInt() == ARSENAL_ID) {
                if (row.get("playedGames").asInt() > 0) {
                    return "2026";
                }
            }
        }
        return "2025";
    }

    private JsonNode fetchStandings(String season) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Auth-Token", apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                STANDINGS_URL + season, HttpMethod.GET, entity, String.class);

        return objectMapper.readTree(response.getBody());
    }

    private Map<String, Object> extractArsenalRow(JsonNode standings, String type) {
        for (JsonNode standing : standings) {
            if (!standing.get("type").asText().equals(type)) continue;

            for (JsonNode row : standing.get("table")) {
                if (row.get("team").get("id").asInt() != ARSENAL_ID) continue;

                Map<String, Object> data = new HashMap<>();
                data.put("position", row.get("position").asInt());
                data.put("playedGames", row.get("playedGames").asInt());
                data.put("won", row.get("won").asInt());
                data.put("draw", row.get("draw").asInt());
                data.put("lost", row.get("lost").asInt());
                data.put("points", row.get("points").asInt());
                data.put("goalsFor", row.get("goalsFor").asInt());
                data.put("goalsAgainst", row.get("goalsAgainst").asInt());
                data.put("goalDifference", row.get("goalDifference").asInt());
                data.put("form", row.get("form").asText());
                return data;
            }
        }
        return new HashMap<>();
    }
}