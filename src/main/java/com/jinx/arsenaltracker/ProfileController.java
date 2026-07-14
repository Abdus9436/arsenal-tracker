package com.jinx.arsenaltracker;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PredictionRepository predictionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }

    @GetMapping
    public ResponseEntity<?> getProfile() {
        User user = userRepository.findById(getCurrentUser().getId())
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "displayName", user.getDisplayName() != null ? user.getDisplayName() : "",
                "bio", user.getBio() != null ? user.getBio() : "",
                "profilePicture", user.getProfilePicture() != null ? user.getProfilePicture() : "",
                "initials", user.getInitials() != null ? user.getInitials() : ""
        ));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        User user = userRepository.findById(getCurrentUser().getId())
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));

        if (request.getDisplayName() != null && !request.getDisplayName().equals(user.getDisplayName())) {
            if (userRepository.findByDisplayName(request.getDisplayName()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Username already taken"));
            }
            user.setDisplayName(request.getDisplayName());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Email already in use"));
            }
            user.setEmail(request.getEmail());
        }

        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());

        if (request.getInitials() != null) {
            String initials = request.getInitials().trim();
            if (initials.length() > 2) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Initials must be 2 characters or fewer"));
            }
            user.setInitials(initials.toUpperCase());
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {
        User user = userRepository.findById(getCurrentUser().getId())
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Current password is incorrect"));
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "New password must be at least 6 characters"));
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(@RequestBody AccountDeleteRequest request) {
        User user = userRepository.findById(getCurrentUser().getId())
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Incorrect password"));
        }

        predictionRepository.deleteAll(predictionRepository.findByUserId(user.getId()));
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    @GetMapping("/public/{displayName}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String displayName) {
        User user = userRepository.findByDisplayName(displayName).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        return ResponseEntity.ok(Map.of(
                "displayName", user.getDisplayName() != null ? user.getDisplayName() : "",
                "bio", user.getBio() != null ? user.getBio() : "",
                "profilePicture", user.getProfilePicture() != null ? user.getProfilePicture() : "",
                "initials", user.getInitials() != null ? user.getInitials() : ""
        ));
    }
}