package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Injury;
import com.example.demo.repository.InjuryRepository;

@RestController
@RequestMapping("/api/injuries")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class InjuryController {

    private final InjuryRepository repo;

    public InjuryController(InjuryRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<Injury> create(@RequestBody Injury injury) {
        return ResponseEntity.ok(repo.save(injury));
    }

    @GetMapping
    public ResponseEntity<List<Injury>> list() {
        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<List<Injury>> byPlayer(@PathVariable Long playerId) {
        return ResponseEntity.ok(repo.findByPlayerId(playerId));
    }
}
