package com.jinx.arsenaltracker;

import jakarta.persistence.*;

@Entity
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "fixture_id"})
})
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "fixture_id")
    private Fixture fixture;

    private Integer predHomeScore;
    private Integer predAwayScore;
    private Integer pointsEarned;

    public Prediction() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Fixture getFixture() {
        return fixture;
    }

    public void setFixture(Fixture fixture) {
        this.fixture = fixture;
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

    public Integer getPointsEarned() {
        return pointsEarned;
    }

    public void setPointsEarned(Integer pointsEarned) {
        this.pointsEarned = pointsEarned;
    }
}