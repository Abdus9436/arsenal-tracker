package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AppConfigRepository appConfigRepository;

    @Autowired
    private AppConfigService appConfigService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PredictionRepository predictionRepository;

    @Autowired
    private FootballApiService footballApiService;

    @Autowired
    private StatsController statsController;

    @Autowired
    private SquadController squadController;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Admin access required"));
    }

    @GetMapping("/configs")
    public ResponseEntity<?> getConfigs() {
        if (!Boolean.TRUE.equals(getCurrentUser().getIsAdmin())) return unauthorized();
        return ResponseEntity.ok(appConfigRepository.findAll());
    }

    @PutMapping("/configs/{key}")
    public ResponseEntity<?> updateConfig(@PathVariable String key,
                                          @RequestBody Map<String, String> body) {
        if (!Boolean.TRUE.equals(getCurrentUser().getIsAdmin())) return unauthorized();
        appConfigService.set(key, body.get("value"));

        if (key.equals("current_season") || key.equals("fixture_api_url")) {
            footballApiService.fetchAndSync();
        }
        if (key.equals("exact_score_points") || key.equals("correct_outcome_points")) {
            statsController.invalidateCache();
        }

        return ResponseEntity.ok(Map.of("message", "Config updated"));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        if (!Boolean.TRUE.equals(getCurrentUser().getIsAdmin())) return unauthorized();
        return ResponseEntity.ok(
                userRepository.findAll().stream().map(u -> Map.of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "displayName", u.getDisplayName() != null ? u.getDisplayName() : "",
                        "isAdmin", Boolean.TRUE.equals(u.getIsAdmin()),
                        "isBanned", Boolean.TRUE.equals(u.getIsBanned())
                )).toList()
        );
    }

    @PutMapping("/users/{id}/promote")
    public ResponseEntity<?> promoteUser(@PathVariable Long id) {
        if (!Boolean.TRUE.equals(getCurrentUser().getIsAdmin())) return unauthorized();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        user.setIsAdmin(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User promoted to admin"));
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<?> banUser(@PathVariable Long id) {
        if (!Boolean.TRUE.equals(getCurrentUser().getIsAdmin())) return unauthorized();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        user.setIsBanned(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User banned"));
    }

    @PutMapping("/users/{id}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable Long id) {
        if (!Boolean.TRUE.equals(getCurrentUser().getIsAdmin())) return unauthorized();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        user.setIsBanned(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User unbanned"));
    }

    @PostMapping("/sync")
    public ResponseEntity<?> triggerSync() {
        if (!Boolean.TRUE.equals(getCurrentUser().getIsAdmin())) return unauthorized();
        footballApiService.fetchAndSync();
        statsController.invalidateCache();
        squadController.invalidateCache();
        return ResponseEntity.ok(Map.of("message", "Fixtures synced, stats and squad cache cleared"));
    }

    @GetMapping("/announcement")
    public ResponseEntity<?> getAnnouncement() {
        String value = appConfigService.get("app_announcement", "");
        return ResponseEntity.ok(Map.of("message", value));
    }

    @GetMapping("/scoring-rules")
    public ResponseEntity<?> getScoringRules() {
        return ResponseEntity.ok(Map.of(
                "exactScorePoints", appConfigService.getInt("exact_score_points", 3),
                "correctOutcomePoints", appConfigService.getInt("correct_outcome_points", 1)
        ));
    }
}