package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Injury;

@Repository
public interface InjuryRepository extends JpaRepository<Injury, Long> {
    List<Injury> findByPlayerId(Long playerId);
}
