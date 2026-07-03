package com.jinx.arsenaltracker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByFixture(Fixture fixture);

    boolean existsByUserIdAndFixtureId(Long userId, Long fixtureId);

    @Query("SELECT COALESCE(p.user.displayName, p.user.email), SUM(p.pointsEarned) FROM Prediction p WHERE p.pointsEarned IS NOT NULL GROUP BY p.user.email ORDER BY SUM(p.pointsEarned) DESC")
    List<Object[]> getLeaderboard();
}