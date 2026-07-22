package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScoringService {

    @Autowired
    private PredictionRepository predictionRepository;

    @Autowired
    private AppConfigService appConfigService;

    public void scoreFixture(Fixture fixture) {
        List<Prediction> predictions = predictionRepository.findByFixture(fixture);

        for (Prediction prediction : predictions) {
            int points = calculatePoints(prediction, fixture);
            prediction.setPointsEarned(points);
            predictionRepository.save(prediction);
        }
    }

    private int calculatePoints(Prediction prediction, Fixture fixture) {
        int predHome = prediction.getPredHomeScore();
        int predAway = prediction.getPredAwayScore();
        int actualHome = fixture.getActualHomeScore();
        int actualAway = fixture.getActualAwayScore();

        boolean exactMatch = (predHome == actualHome) && (predAway == actualAway);
        if (exactMatch) {
            return appConfigService.getInt("exact_score_points", 3);
        }

        String predictedOutcome = getOutcome(predHome, predAway);
        String actualOutcome = getOutcome(actualHome, actualAway);

        if (predictedOutcome.equals(actualOutcome)) {
            return appConfigService.getInt("correct_outcome_points", 1);
        }

        return 0;
    }

    private String getOutcome(int homeScore, int awayScore) {
        if (homeScore > awayScore) {
            return "HOME_WIN";
        } else if (awayScore > homeScore) {
            return "AWAY_WIN";
        } else {
            return "DRAW";
        }
    }

}