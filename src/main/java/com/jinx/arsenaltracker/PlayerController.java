package com.jinx.arsenaltracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }

    private boolean isAdmin() {
        return Boolean.TRUE.equals(getCurrentUser().getIsAdmin());
    }

    @GetMapping
    public List<Player> getAllPlayers() {
        return playerRepository.findAllByOrderByPositionAscNameAsc();
    }

    @PostMapping
    public ResponseEntity<?> addPlayer(@RequestBody Player player) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Admin access required"));
        return ResponseEntity.ok(playerRepository.save(player));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlayer(@PathVariable Long id, @RequestBody Player updates) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Admin access required"));

        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Player not found"));

        if (updates.getName() != null) player.setName(updates.getName());
        if (updates.getPosition() != null) player.setPosition(updates.getPosition());
        if (updates.getNumber() != null) player.setNumber(updates.getNumber());
        if (updates.getAge() != null) player.setAge(updates.getAge());
        if (updates.getHeight() != null) player.setHeight(updates.getHeight());
        if (updates.getPhoto() != null) player.setPhoto(updates.getPhoto());

        return ResponseEntity.ok(playerRepository.save(player));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlayer(@PathVariable Long id) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Admin access required"));
        playerRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Player deleted"));
    }
}