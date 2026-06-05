package com.example.demo.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.model.PlayerStats;
import com.example.demo.repository.PlayerStatsRepository;

@Service
public class StatsService {
    private final PlayerStatsRepository repo;

    public StatsService(PlayerStatsRepository repo) {
        this.repo = repo;
    }

    public PlayerStats save(PlayerStats s) {
        return repo.save(s);
    }

    public Optional<PlayerStats> findByPlayerId(Long playerId) {
        return repo.findByPlayerId(playerId);
    }
}
