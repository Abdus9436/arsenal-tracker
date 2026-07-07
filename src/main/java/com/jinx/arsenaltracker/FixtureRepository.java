package com.jinx.arsenaltracker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FixtureRepository extends JpaRepository<Fixture, Long> {
    Optional<Fixture> findBySource(String source);

    @Query("SELECT f FROM Fixture f WHERE f.matchDate IS NOT NULL AND f.matchTime IS NOT NULL AND FUNCTION('TIMESTAMP', f.matchDate, f.matchTime) < :now AND f.actualHomeScore IS NULL AND f.source LIKE 'api-%'")
    List<Fixture> findFixturesExpectingResults(@Param("now") LocalDateTime now);
}