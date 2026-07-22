package com.jinx.arsenaltracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;


@RestController
@RequestMapping("/api/squad")
public class SquadController {

    @Autowired
    private AppConfigService appConfigService;

    private static final String SQUAD_URL =
            "https://v3.football.api-sports.io/players/squads?team=42";

    @Value("${api.football.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private List<Map<String, Object>> cachedSquad = null;
    private LocalDateTime cacheTimestamp = null;
    private static final int CACHE_HOURS = 24;

    @GetMapping
    public ResponseEntity<?> getSquad() {
        if (isCacheValid()) {
            return ResponseEntity.ok(cachedSquad);
        }
        return refreshCache();
    }

    private boolean isCacheValid() {
        return cachedSquad != null
                && cacheTimestamp != null
                && cacheTimestamp.plusHours(CACHE_HOURS).isAfter(LocalDateTime.now());
    }

    private ResponseEntity<?> refreshCache() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-apisports-key", apiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String url = appConfigService.get("squad_api_url",
                    "https://v3.football.api-sports.io/players/squads?team=42");

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode players = root.get("response").get(0).get("players");

            List<Map<String, Object>> squad = new ArrayList<>();

            for (JsonNode player : players) {
                Map<String, Object> p = new LinkedHashMap<>();
                p.put("id", player.get("id").asInt());
                p.put("name", player.get("name").asText());
                p.put("age", player.get("age").asInt());
                p.put("number", player.get("number").isNull() ? "" : player.get("number").asText());
                p.put("position", player.get("position").asText());
                p.put("photo", player.get("photo").asText());
                squad.add(p);
            }

            Map<String, Object> manager = new LinkedHashMap<>();
            manager.put("id", 0);
            manager.put("name", "Mikel Arteta");
            manager.put("age", 43);
            manager.put("number", "");
            manager.put("position", "Manager");
            manager.put("photo", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Mikel_Arteta_2021.png/500px-Mikel_Arteta_2021.png");
            squad.add(0, manager);

            squad.sort(Comparator.comparing(p -> positionOrder(p.get("position").toString())));

            cachedSquad = squad;
            cacheTimestamp = LocalDateTime.now();
            System.out.println("Squad cache refreshed: " + squad.size() + " players");
            return ResponseEntity.ok(cachedSquad);

        } catch (Exception e) {
            if (cachedSquad != null) return ResponseEntity.ok(cachedSquad);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch squad: " + e.getMessage()));
        }
    }

    private int positionOrder(String position) {
        return switch (position) {
            case "Manager" -> 0;
            case "Goalkeeper" -> 1;
            case "Defender" -> 2;
            case "Midfielder" -> 3;
            case "Attacker" -> 4;
            default -> 5;
        };
    }

    public void invalidateCache() {
        cachedSquad = null;
        cacheTimestamp = null;
    }
}