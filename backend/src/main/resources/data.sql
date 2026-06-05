-- Inserimento di dati di supporto e utenti di prova
-- ATTENZIONE: In un'app reale, le password devono essere hashate (es. con BCrypt) prima di essere salvate!
-- Password: password123 (hash BCrypt d'esempio)
MERGE INTO roles (name, description) 
KEY(name) 
VALUES 
('USER', 'Utente standard'),
('ADMIN', 'Amministratore');

MERGE INTO teams (name, city) 
KEY(name) 
VALUES 
('Team A', 'Milano'),
('Team B', 'Roma');

MERGE INTO users (username, password_hash, role, team_name) 
KEY(username) 
VALUES 
('testuser', '$2a$10$8.UnVuG9UMJomxe9137M3uwm8T59D3o.Y/m7Y9U/Y3fT./T.Y/m7Y', 'USER', 'Team A'),
('admin', '$2a$10$8.UnVuG9UMJomxe9137M3uwm8T59D3o.Y/m7Y9U/Y3fT./T.Y/m7Y', 'ADMIN', NULL);
