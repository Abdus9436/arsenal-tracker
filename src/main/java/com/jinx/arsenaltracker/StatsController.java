package com.jinx.arsenaltracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
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

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private Map<String, Object> cachedStats = null;
    private LocalDateTime cacheTimestamp = null;
    private static final int CACHE_HOURS = 24;

    @GetMapping
    public Map<String, Object> getStats() {
        if (isCacheValid()) {
            return cachedStats;
        }
        return refreshCache();
    }

    @PostMapping("/refresh")
    public Map<String, Object> forceRefresh() {
        return refreshCache();
    }

    public void invalidateCache() {
        cachedStats = null;
        cacheTimestamp = null;
    }

    private boolean isCacheValid() {
        return cachedStats != null
                && cacheTimestamp != null
                && cacheTimestamp.plusHours(CACHE_HOURS).isAfter(LocalDateTime.now());
    }

    private Map<String, Object> refreshCache() {
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

            cachedStats = result;
            cacheTimestamp = LocalDateTime.now();
            System.out.println("Stats cache refreshed at " + cacheTimestamp);
            return cachedStats;

        } catch (Exception e) {
            if (cachedStats != null) {
                System.err.println("Stats refresh failed, serving stale cache: " + e.getMessage());
                return cachedStats;
            }
            throw new RuntimeException("Failed to fetch stats: " + e.getMessage());
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