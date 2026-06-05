package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            createUser("allenatore1", "pass123", "ALLENATORE", "Juventus");
            createUser("manager1", "pass123", "MANAGER", "Juventus");
            createUser("giocatore1", "pass123", "GIOCATORE", "Juventus");
            createUser("giocatore2", "pass123", "GIOCATORE", "Juventus");
            createUser("ospite", "pass123", "GUEST", "Ospiti");
        }
    }

    private void createUser(String username, String password, String role, String teamName) {
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setTeamName(teamName);
        userRepository.save(user);
    }
}
