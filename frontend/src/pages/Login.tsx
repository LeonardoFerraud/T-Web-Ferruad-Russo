import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
    //stati locali
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const teamName = data.teamName || 'default';
                const role = data.role?.toUpperCase();
                // salvare gli utenti in localStorage per la persistenza del frontend
                localStorage.setItem('user', JSON.stringify({
                    username: data.username,
                    role: role,
                    teamName: teamName
                }));

                // Se nuovo login come giocatore aggiungi al roster
                if (role === 'PLAYER' || role === 'GIOCATORE') {
                    const rosterKey = `roster_data_${teamName}`;
                    const rosterSaved = localStorage.getItem(rosterKey);
                    let rosterObj = rosterSaved ? JSON.parse(rosterSaved) : { staff: [], portieri: [], difensori: [], centrocampisti: [], attaccanti: [] };
                    const exists = 
                        rosterObj.portieri.some((m: any) => m.name === data.username) ||
                        rosterObj.difensori.some((m: any) => m.name === data.username) ||
                        rosterObj.centrocampisti.some((m: any) => m.name === data.username) ||
                        rosterObj.attaccanti.some((m: any) => m.name === data.username);
                    if (!exists) {
                        rosterObj.attaccanti.push({
                            id: 'db_' + data.username,
                            name: data.username,
                            goals: 0,
                            assists: 0,
                            appearances: 0
                        });
                        localStorage.setItem(rosterKey, JSON.stringify(rosterObj));
                    }
                }

                // aggiungere allenatore al roster
                if (role === 'MANAGER' || role === 'ALLENATORE' || role === 'MISTER') {
                    const rosterKey = `roster_data_${teamName}`;
                    const rosterSaved = localStorage.getItem(rosterKey);
                    let rosterObj = rosterSaved ? JSON.parse(rosterSaved) : { staff: [], portieri: [], difensori: [], centrocampisti: [], attaccanti: [] };
                    const exists = rosterObj.staff.some((m: any) => m.name === data.username);
                    if (!exists) {
                        rosterObj.staff.push({
                            id: 'db_' + data.username,
                            name: data.username,
                            role: 'Allenatore',
                            goals: 0,
                            assists: 0,
                            appearances: 0
                        });
                        localStorage.setItem(rosterKey, JSON.stringify(rosterObj));
                    }
                }
                
                // rimanda alla home
                navigate('/');
            } else {
                setError(data.message || 'Errore durante il login');
            }
        } catch (err) {
            setError('Impossibile connettersi al server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Area Riservata</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Inserisci username"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Inserisci password"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Accesso in corso...' : 'Accedi'}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>Non hai un account? <Link to="/register">Registrati qui</Link></p>
                    <p>Problemi di accesso? <a href="#">Contatta l'admin</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
