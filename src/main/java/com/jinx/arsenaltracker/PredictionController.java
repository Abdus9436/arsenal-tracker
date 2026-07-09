package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private FixtureRepository fixtureRepository;

    @PostMapping
    public ResponseEntity<?> createPrediction(@RequestBody PredictionRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Fixture fixture = fixtureRepository.findById(request.getFixtureId())
                .orElseThrow(() -> new NoSuchElementException("Fixture not found"));

        if (predictionRepository.existsByUserIdAndFixtureId(currentUser.getId(), request.getFixtureId())) {
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
        prediction.setUser(currentUser);
        prediction.setFixture(fixture);
        prediction.setPredHomeScore(request.getPredHomeScore());
        prediction.setPredAwayScore(request.getPredAwayScore());
        prediction.setPredPenaltiesHome(request.getPredPenaltiesHome());
        prediction.setPredPenaltiesAway(request.getPredPenaltiesAway());

        Prediction saved = predictionRepository.save(prediction);
        return ResponseEntity.ok(new PredictionResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePrediction(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Prediction prediction = predictionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Prediction not found"));

        if (!prediction.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only delete your own predictions"));
        }

        if (prediction.getFixture().getMatchTime() != null) {
            java.time.LocalDateTime kickoff = java.time.LocalDateTime.of(
                    prediction.getFixture().getMatchDate(),
                    prediction.getFixture().getMatchTime());
            if (java.time.LocalDateTime.now().isAfter(kickoff)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Cannot delete prediction after match has started"));
            }
        }

        predictionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Prediction deleted"));
    }

    @GetMapping
    public List<PredictionResponse> getAllPredictions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        return predictionRepository.findByUserId(currentUser.getId())
                .stream()
                .map(PredictionResponse::new)
                .collect(java.util.stream.Collectors.toList());
    }

}