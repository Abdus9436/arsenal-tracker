package com.jinx.arsenaltracker;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDate;

@Entity
public class Fixture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate matchDate;
    private String opponent;
    private String venue;
    private Integer actualHomeScore;
    private Integer actualAwayScore;
    private String source;


    public Fixture() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getMatchDate() {
        return matchDate;
    }

    public void setMatchDate(LocalDate matchDate) {
        this.matchDate = matchDate;
    }

    public String getOpponent() {
        return opponent;
    }

    public void setOpponent(String opponent) {
        this.opponent = opponent;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public Integer getActualHomeScore() {
        return actualHomeScore;
    }

    public void setActualHomeScore(Integer actualHomeScore) {
        this.actualHomeScore = actualHomeScore;
    }

    public Integer getActualAwayScore() {
        return actualAwayScore;
    }

    public void setActualAwayScore(Integer actualAwayScore) {
        this.actualAwayScore = actualAwayScore;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}