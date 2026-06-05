-- Creazione delle tabelle di supporto per ruoli e squadre
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(100)
);

-- Creazione della tabella utenti con relazioni esplicite sui nomi di ruolo e squadra
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    team_name VARCHAR(100),
    CONSTRAINT fk_users_roles FOREIGN KEY(role) REFERENCES roles(name),
    CONSTRAINT fk_users_teams FOREIGN KEY(team_name) REFERENCES teams(name)
);

-- Tabelle esistenti del dominio già gestite dal codice
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    team_name VARCHAR(100),
    CONSTRAINT fk_players_teams FOREIGN KEY(team_name) REFERENCES teams(name)
);

CREATE TABLE IF NOT EXISTS player_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    matches_played INT DEFAULT 0,
    minutes INT DEFAULT 0,
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    CONSTRAINT fk_player_stats_player FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS injuries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    description VARCHAR(255),
    CONSTRAINT fk_injuries_player FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS formations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100),
    opponent VARCHAR(255),
    match_date VARCHAR(50),
    payload TEXT,
    CONSTRAINT fk_formations_teams FOREIGN KEY(team_name) REFERENCES teams(name)
);
