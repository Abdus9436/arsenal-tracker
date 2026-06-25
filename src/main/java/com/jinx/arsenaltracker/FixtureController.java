package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fixtures")
public class FixtureController {

    @Autowired
    private FixtureRepository fixtureRepository;

    @PostMapping
    public Fixture createFixture(@RequestBody Fixture fixture) {
        return fixtureRepository.save(fixture);
    }

    @GetMapping
    public List<Fixture> getAllFixtures() {
        return fixtureRepository.findAll();
    }

}