import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
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
                // Store user info in localStorage for simple session persistence on frontend
                localStorage.setItem('user', JSON.stringify({
                    username: data.username,
                    role: role,
                    teamName: teamName
                }));

                // Auto-add player to roster if role is PLAYER or GIOCATORE
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

                // Auto-add coach to roster if role is MANAGER, ALLENATORE or MISTER
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
                
                // Redirect to home
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
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button 
                        className="login-btn" 
                        style={{ background: 'rgba(255, 255, 255, 0.1)', flex: 1 }}
                        onClick={() => {
                            const teamName = 'Ospiti';
                            localStorage.setItem('user', JSON.stringify({ username: 'Giocatore Provvisorio', role: 'GIOCATORE', teamName: teamName }));
                            
                            // Auto-add Giocatore Provvisorio to roster
                            const rosterKey = `roster_data_${teamName}`;
                            const rosterSaved = localStorage.getItem(rosterKey);
                            let rosterObj = rosterSaved ? JSON.parse(rosterSaved) : { staff: [], portieri: [], difensori: [], centrocampisti: [], attaccanti: [] };
                            const exists = 
                                rosterObj.portieri.some((m: any) => m.name === 'Giocatore Provvisorio') ||
                                rosterObj.difensori.some((m: any) => m.name === 'Giocatore Provvisorio') ||
                                rosterObj.centrocampisti.some((m: any) => m.name === 'Giocatore Provvisorio') ||
                                rosterObj.attaccanti.some((m: any) => m.name === 'Giocatore Provvisorio');
                            if (!exists) {
                                rosterObj.attaccanti.push({
                                    id: 'db_Giocatore Provvisorio',
                                    name: 'Giocatore Provvisorio',
                                    goals: 0,
                                    assists: 0,
                                    appearances: 0
                                });
                                localStorage.setItem(rosterKey, JSON.stringify(rosterObj));
                            }
                            
                            navigate('/');
                        }}
                    >
                        Accedi come Giocatore
                    </button>
                    <button 
                        className="login-btn" 
                        style={{ background: 'rgba(255, 255, 255, 0.05)', flex: 1 }}
                        onClick={() => {
                            localStorage.setItem('user', JSON.stringify({ username: 'Ospite', role: 'GUEST', teamName: 'Ospiti' }));
                            navigate('/');
                        }}
                    >
                        Accedi come Ospite
                    </button>
                </div>
                
                <div className="login-footer">
                    <p>Non hai un account? <Link to="/register">Registrati qui</Link></p>
                    <p>Problemi di accesso? <a href="#">Contatta l'admin</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
