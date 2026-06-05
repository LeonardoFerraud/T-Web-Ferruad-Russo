package com.example.demo.dto;

public class RegisterRequest {
    private String username;
    private String password;
    private String role;
    private String teamName;

    public RegisterRequest() {
    }

    public RegisterRequest(String username, String password, String role, String teamName) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.teamName = teamName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }
}
