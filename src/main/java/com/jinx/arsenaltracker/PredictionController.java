package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @Autowired
    private PredictionRepository predictionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FixtureRepository fixtureRepository;

    @PostMapping
    public ResponseEntity<?> createPrediction(@RequestBody PredictionRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Fixture fixture = fixtureRepository.findById(request.getFixtureId())
                .orElseThrow(() -> new NoSuchElementException("Fixture not found"));

        if (predictionRepository.existsByUserIdAndFixtureId(request.getUserId(), request.getFixtureId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "You have already predicted for this fixture"));
        }

        if (fixture.getMatchTime() != null) {
            java.time.LocalDateTime kickoff = java.time.LocalDateTime.of(
                    fixture.getMatchDate(), fixture.getMatchTime());

            if (java.time.LocalDateTime.now().isAfter(kickoff)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Prediction window closed — match has already started"));
            }
        }

        Prediction prediction = new Prediction();
        prediction.setUser(user);
        prediction.setFixture(fixture);
        prediction.setPredHomeScore(request.getPredHomeScore());
        prediction.setPredAwayScore(request.getPredAwayScore());

        Prediction saved = predictionRepository.save(prediction);
        return ResponseEntity.ok(new PredictionResponse(saved));
    }

    @GetMapping
    public List<PredictionResponse> getAllPredictions() {
        return predictionRepository.findAll()
                .stream()
                .map(PredictionResponse::new)
                .collect(java.util.stream.Collectors.toList());
    }

}