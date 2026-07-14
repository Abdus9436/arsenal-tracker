package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private PredictionRepository predictionRepository;

    @GetMapping
    public List<Map<String, Object>> getLeaderboard() {
        List<Object[]> results = predictionRepository.getLeaderboard();

        return results.stream()
                .map(row -> Map.of(
                        "displayName", row[0],
                        "totalPoints", row[1]
                ))
                .collect(Collectors.toList());
    }
}