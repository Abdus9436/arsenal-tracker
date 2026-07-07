package com.jinx.arsenaltracker;

public class PredictionResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private Long fixtureId;
    private String fixtureOpponent;
    private Integer predHomeScore;
    private Integer predAwayScore;
    private Integer pointsEarned;
    private Integer predPenaltiesHome;
    private Integer predPenaltiesAway;

    public PredictionResponse(Prediction prediction) {
        this.id = prediction.getId();
        this.userId = prediction.getUser().getId();
        this.userEmail = prediction.getUser().getEmail();
        this.fixtureId = prediction.getFixture().getId();
        this.fixtureOpponent = prediction.getFixture().getOpponent();
        this.predHomeScore = prediction.getPredHomeScore();
        this.predAwayScore = prediction.getPredAwayScore();
        this.pointsEarned = prediction.getPointsEarned();
        this.predPenaltiesHome = prediction.getPredPenaltiesHome();
        this.predPenaltiesAway = prediction.getPredPenaltiesAway();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public Long getFixtureId() {
        return fixtureId;
    }

    public String getFixtureOpponent() {
        return fixtureOpponent;
    }

    public Integer getPredHomeScore() {
        return predHomeScore;
    }

    public Integer getPredAwayScore() {
        return predAwayScore;
    }

    public Integer getPointsEarned() {
        return pointsEarned;
    }

    public Integer getPredPenaltiesHome() {
        return predPenaltiesHome;
    }

    public Integer getPredPenaltiesAway() {
        return predPenaltiesAway;
    }
}