package com.example.demo.dto;

public class AuthResponse {
    private boolean success;
    private String message;
    private String username;
    private String role;
    private String teamName;

    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponse(boolean success, String message, String username, String role, String teamName) {
        this.success = success;
        this.message = message;
        this.username = username;
        this.role = role;
        this.teamName = teamName;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public String getTeamName() {
        return teamName;
    }
}
