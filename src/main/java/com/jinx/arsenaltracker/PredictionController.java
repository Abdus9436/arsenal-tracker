package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public PredictionResponse createPrediction(@RequestBody PredictionRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Fixture fixture = fixtureRepository.findById(request.getFixtureId())
                .orElseThrow(() -> new NoSuchElementException("Fixture not found"));

        Prediction prediction = new Prediction();
        prediction.setUser(user);
        prediction.setFixture(fixture);
        prediction.setPredHomeScore(request.getPredHomeScore());
        prediction.setPredAwayScore(request.getPredAwayScore());

        Prediction saved = predictionRepository.save(prediction);
        return new PredictionResponse(saved);
    }

    @GetMapping
    public List<PredictionResponse> getAllPredictions() {
        return predictionRepository.findAll()
                .stream()
                .map(PredictionResponse::new)
                .collect(java.util.stream.Collectors.toList());
    }

}