package com.jinx.arsenaltracker;

public class PredictionRequest {

    private Long userId;
    private Long fixtureId;
    private Integer predHomeScore;
    private Integer predAwayScore;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getFixtureId() {
        return fixtureId;
    }

    public void setFixtureId(Long fixtureId) {
        this.fixtureId = fixtureId;
    }

    public Integer getPredHomeScore() {
        return predHomeScore;
    }

    public void setPredHomeScore(Integer predHomeScore) {
        this.predHomeScore = predHomeScore;
    }

    public Integer getPredAwayScore() {
        return predAwayScore;
    }

    public void setPredAwayScore(Integer predAwayScore) {
        this.predAwayScore = predAwayScore;
    }
}