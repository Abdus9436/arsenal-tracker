package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fixtures")
public class FixtureController {

    @Autowired
    private FixtureRepository fixtureRepository;

    @Autowired
    private ScoringService scoringService;

    @PostMapping
    public Fixture createFixture(@RequestBody Fixture fixture) {
        return fixtureRepository.save(fixture);
    }

    @GetMapping
    public List<Fixture> getAllFixtures() {
        return fixtureRepository.findAll();
    }

    @PutMapping("/{id}/result")
    public Fixture updateResult(@PathVariable Long id, @RequestBody FixtureResultRequest request) {
        Fixture fixture = fixtureRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Fixture not found"));

        fixture.setActualHomeScore(request.getActualHomeScore());
        fixture.setActualAwayScore(request.getActualAwayScore());

        Fixture saved = fixtureRepository.save(fixture);

        scoringService.scoreFixture(saved);

        return saved;
    }

}