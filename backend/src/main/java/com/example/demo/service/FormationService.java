package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Formation;
import com.example.demo.repository.FormationRepository;

@Service
public class FormationService {
    private final FormationRepository formationRepository;

    public FormationService(FormationRepository formationRepository) {
        this.formationRepository = formationRepository;
    }

    public Formation save(Formation f) {
        return formationRepository.save(f);
    }

    public List<Formation> findByTeam(String teamName) {
        return formationRepository.findByTeamNameOrderByMatchDateAsc(teamName);
    }

    public Formation findById(Long id) {
        return formationRepository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        formationRepository.deleteById(id);
    }
}
