package com.example.demo.controller;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // Standard Vite port
public class LoginController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
                // Login success: Set session
                session.setAttribute("user", user.getUsername());
                session.setAttribute("role", user.getRole());
                session.setAttribute("teamName", user.getTeamName());

                return ResponseEntity.ok(new AuthResponse(true, "Login effettuato con successo", user.getUsername(), user.getRole(), user.getTeamName()));
            }
        }

        return ResponseEntity.status(401).body(new AuthResponse(false, "Username o password errati"));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            return ResponseEntity.status(400).body(new AuthResponse(false, "Username già esistente"));
        }

        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        newUser.setRole(registerRequest.getRole() != null ? registerRequest.getRole().toUpperCase() : "USER");
        newUser.setTeamName(registerRequest.getTeamName());

        userRepository.save(newUser);

        return ResponseEntity.ok(new AuthResponse(true, "Registrazione effettuata con successo! Ora puoi accedere."));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(new AuthResponse(true, "Logout effettuato"));
    }

    @GetMapping("/check-session")
    public ResponseEntity<AuthResponse> checkSession(HttpSession session) {
        String username = (String) session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        String teamName = (String) session.getAttribute("teamName");
        
        if (username != null) {
            return ResponseEntity.ok(new AuthResponse(true, "Sessione attiva", username, role, teamName));
        }
        
        return ResponseEntity.status(401).body(new AuthResponse(false, "Sessione non valida"));
    }

    @GetMapping("/team-players")
    public ResponseEntity<java.util.List<User>> getTeamPlayers(HttpSession session) {
        String teamName = (String) session.getAttribute("teamName");
        if (teamName == null) {
            return ResponseEntity.status(400).body(null);
        }
        
        // Find users with role PLAYER or GIOCATORE in that team
        java.util.List<User> players = userRepository.findAll().stream()
            .filter(u -> teamName.equalsIgnoreCase(u.getTeamName()) && 
                         ("PLAYER".equalsIgnoreCase(u.getRole()) || "GIOCATORE".equalsIgnoreCase(u.getRole())))
            .toList();
            
        return ResponseEntity.ok(players);
    }

    @GetMapping("/team-staff")
    public ResponseEntity<java.util.List<User>> getTeamStaff(HttpSession session) {
        String teamName = (String) session.getAttribute("teamName");
        if (teamName == null) {
            return ResponseEntity.status(400).body(null);
        }
        
        // Find users with role MANAGER or ALLENATORE in that team
        java.util.List<User> staff = userRepository.findAll().stream()
            .filter(u -> teamName.equalsIgnoreCase(u.getTeamName()) && 
                         ("MANAGER".equalsIgnoreCase(u.getRole()) || "ALLENATORE".equalsIgnoreCase(u.getRole())))
            .toList();
            
        return ResponseEntity.ok(staff);
    }

    @DeleteMapping("/users/{username}")
    public ResponseEntity<AuthResponse> deleteUser(@PathVariable String username, HttpSession session) {
        String currentUsername = (String) session.getAttribute("user");
        String currentUserRole = (String) session.getAttribute("role");
        
        boolean isSelf = username.equalsIgnoreCase(currentUsername);
        boolean isCoach = "ALLENATORE".equalsIgnoreCase(currentUserRole) || "MANAGER".equalsIgnoreCase(currentUserRole);
        
        if (!isSelf && !isCoach) {
            return ResponseEntity.status(403).body(new AuthResponse(false, "Non autorizzato"));
        }
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            userRepository.delete(userOpt.get());
            if (isSelf) {
                session.invalidate();
            }
            return ResponseEntity.ok(new AuthResponse(true, "Utente eliminato con successo"));
        }
        return ResponseEntity.status(404).body(new AuthResponse(false, "Utente non trovato"));
    }
}
