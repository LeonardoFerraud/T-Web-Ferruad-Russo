package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Formation;
import com.example.demo.service.FormationService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/formations")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FormationController {

    private final FormationService formationService;

    public FormationController(FormationService formationService) {
        this.formationService = formationService;
    }

    @PostMapping
    public ResponseEntity<?> saveFormation(@RequestBody Formation formation, HttpSession session) {
        String teamName = (String) session.getAttribute("teamName");
        if (teamName == null) return ResponseEntity.status(401).body("No team in session");
        formation.setTeamName(teamName);
        Formation saved = formationService.save(formation);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Formation>> listFormations(HttpSession session) {
        String teamName = (String) session.getAttribute("teamName");
        if (teamName == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(formationService.findByTeam(teamName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id, HttpSession session) {
        Formation f = formationService.findById(id);
        if (f == null) return ResponseEntity.status(404).body("Not found");
        return ResponseEntity.ok(f);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpSession session) {
        formationService.delete(id);
        return ResponseEntity.ok().build();
    }
}
