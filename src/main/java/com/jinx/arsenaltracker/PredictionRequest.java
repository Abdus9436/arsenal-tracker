package com.jinx.arsenaltracker;

public class PredictionRequest {

    private Long userId;
    private Long fixtureId;
    private Integer predHomeScore;
    private Integer predAwayScore;
    private Integer predPenaltiesHome;
    private Integer predPenaltiesAway;

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

    public Integer getPredPenaltiesHome() {
        return predPenaltiesHome;
    }

    public void setPredPenaltiesHome(Integer predPenaltiesHome) {
        this.predPenaltiesHome = predPenaltiesHome;
    }

    public Integer getPredPenaltiesAway() {
        return predPenaltiesAway;
    }

    public void setPredPenaltiesAway(Integer predPenaltiesAway) {
        this.predPenaltiesAway = predPenaltiesAway;
    }
}