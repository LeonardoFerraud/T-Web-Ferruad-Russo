import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [teamName, setTeamName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Le password non corrispondono');
            return;
        }

        if (!teamName.trim()) {
            setError('Il nome della squadra è obbligatorio');
            return;
        }

        setLoading(true);

        //registrazione nuovi utenti
        try {
            const response = await fetch('http://localhost:8080/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role, teamName }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Registrazione completata! Reindirizzamento al login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Errore durante la registrazione');
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
                <h2>Registrazione Nuovo Utente</h2>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message" style={{ color: '#4caf50', marginBottom: '15px' }}>{success}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Scegli un username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="teamName">Nome Squadra</label>
                        <input
                            type="text"
                            id="teamName"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Inserisci il nome della tua squadra"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Ruolo</label>
                        <select 
                            id="role" 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                background: 'rgba(255, 255, 255, 0.05)', 
                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                borderRadius: '8px', 
                                color: 'white' 
                            }}
                        >
                            <option value="USER" style={{ color: 'black' }}>User (Semplice Utente)</option>
                            <option value="PLAYER" style={{ color: 'black' }}>Player (Giocatore)</option>
                            <option value="MISTER" style={{ color: 'black' }}>Mister</option>
                            <option value="MANAGER" style={{ color: 'black' }}>Manager (Allenatore/Dirigente)</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Crea una password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Conferma Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ripeti la password"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Registrazione in corso...' : 'Registrati'}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>Hai già un account? <Link to="/login">Accedi qui</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
