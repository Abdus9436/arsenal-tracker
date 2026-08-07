package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/squad")
public class SquadController {

    @Autowired
    private PlayerRepository playerRepository;

    @GetMapping
    public ResponseEntity<?> getSquad() {
        List<Player> players = playerRepository.findAllByOrderByPositionAscNameAsc();
        return ResponseEntity.ok(players);
    }

    public void invalidateCache() {
        // no-op — DB is always fresh, no cache needed
    }
}