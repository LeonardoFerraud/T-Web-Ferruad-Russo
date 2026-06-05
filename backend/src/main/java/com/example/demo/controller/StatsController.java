package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.PlayerStats;
import com.example.demo.service.StatsService;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<?> getPlayerStats(@PathVariable Long playerId) {
        return statsService.findByPlayerId(playerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/player/{playerId}")
    public ResponseEntity<?> saveOrUpdate(@PathVariable Long playerId, @RequestBody PlayerStats stats) {
        stats.setPlayerId(playerId);
        PlayerStats saved = statsService.save(stats);
        return ResponseEntity.ok(saved);
    }
}
