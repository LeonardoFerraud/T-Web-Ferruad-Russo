import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SharedPages.css';
import './Rosa.css';

interface SuspendedPlayer {
    id: string;
    name: string;
}

const STORAGE_KEY = 'suspended_players';

function Squalifiche() {
    const navigate = useNavigate();
    const [suspendedPlayers, setSuspendedPlayers] = useState<SuspendedPlayer[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(suspendedPlayers));
    }, [suspendedPlayers]);
    const [name, setName] = useState('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!name.trim()) return;

        const newEntry: SuspendedPlayer = {
            id: Date.now().toString(),
            name: name.trim(),
        };

        setSuspendedPlayers(prev => [...prev, newEntry]);
        setName('');
    };

    const removeEntry = (id: string) => {
        setSuspendedPlayers(prev => prev.filter(player => player.id !== id));
    };

    return (
        <div className="shared-page-container">
            <h1>Squalifiche</h1>

            <div className="shared-card">
                <h2>Giocatori Squalificati</h2>

                <form className="rosa-form" onSubmit={handleSubmit}>
                    <div>
                        <label>Nome giocatore</label>
                        <input
                            type="text"
                            placeholder="Inserisci nome"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="rosa-form-actions">
                        <button type="submit" className="btn-submit">Aggiungi</button>
                    </div>
                </form>

                <div className="info-list">
                    {suspendedPlayers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                            Nessun giocatore squalificato al momento.
                        </div>
                    ) : (
                        suspendedPlayers.map(player => (
                            <div key={player.id} className="info-item" style={{ position: 'relative' }}>
                                <button
                                    onClick={() => removeEntry(player.id)}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        zIndex: 2,
                                    }}
                                    title="Rimuovi"
                                >
                                    ✕
                                </button>

                                <div className="item-main">
                                    <span className="item-title">{player.name}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button className="nav-btn" style={{ width: 'auto', marginTop: '20px' }} onClick={() => navigate('/')}>
                Torna alla Home
            </button>
        </div>
    );
}

export default Squalifiche;