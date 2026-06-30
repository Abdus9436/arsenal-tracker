package com.jinx.arsenaltracker;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByFixture(Fixture fixture);
}