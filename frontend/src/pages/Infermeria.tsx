import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SharedPages.css';
import './Rosa.css';

interface InjuredPlayer {
    id: string;
    name: string;
    injury: string;
    recoveryTime: number; // Giorni
    status: 'danger' | 'warning' | 'info';
    startDate: string; // ISO String
}

interface Member {
    id: string;
    name: string;
    number?: string;
    role?: string;
}

interface RosterState {
    staff: Member[];
    portieri: Member[];
    difensori: Member[];
    centrocampisti: Member[];
    attaccanti: Member[];
}

function Infermeria() {
    const navigate = useNavigate();

    const getTeamKey = () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                return parsed.teamName || 'default';
            } catch {
                return 'default';
            }
        }
        return 'default';
    };

    const teamKey = getTeamKey();

    // Stato per i giocatori infortunati
    const [injuredPlayers, setInjuredPlayers] = useState<InjuredPlayer[]>(() => {
        const saved = localStorage.getItem(`injured_data_${teamKey}`);
        if (saved) {
            try {
                const players: InjuredPlayer[] = JSON.parse(saved);
                const now = new Date().getTime();
                
                // Filtra gli infortuni scaduti
                return players.filter(p => {
                    const start = new Date(p.startDate).getTime();
                    const durationMs = p.recoveryTime * 24 * 60 * 60 * 1000;
                    return (start + durationMs) > now;
                });
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    // Caricamento della rosa per il dropdown
    const [roster, setRoster] = useState<RosterState | null>(null);
    
    useEffect(() => {
        const savedRoster = localStorage.getItem(`roster_data_${teamKey}`);
        if (savedRoster) {
            try {
                setRoster(JSON.parse(savedRoster));
            } catch (e) {
                console.error("Errore nel caricamento della rosa", e);
            }
        }
    }, [teamKey]);

    // Persistenza infortuni
    useEffect(() => {
        localStorage.setItem(`injured_data_${teamKey}`, JSON.stringify(injuredPlayers));
    }, [injuredPlayers, teamKey]);

    // Stati per il modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    const [injury, setInjury] = useState('');
    const [recoveryTime, setRecoveryTime] = useState('');
    const [status, setStatus] = useState<'danger' | 'warning' | 'info'>('warning');

    const handleAddInfortunio = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!roster || !selectedPlayerId) return;

        const allPlayers = [
            ...roster.portieri,
            ...roster.difensori,
            ...roster.centrocampisti,
            ...roster.attaccanti
        ];
        const player = allPlayers.find(p => p.id === selectedPlayerId);
        
        if (!player) return;

        const newInfortunio: InjuredPlayer = {
            id: Date.now().toString(),
            name: player.name,
            injury: injury,
            recoveryTime: parseInt(recoveryTime) || 0,
            status: status,
            startDate: new Date().toISOString()
        };

        setInjuredPlayers(prev => [...prev, newInfortunio]);
        
        // Reset e chiusura
        setIsModalOpen(false);
        setSelectedPlayerId('');
        setInjury('');
        setRecoveryTime('');
        setStatus('warning');
    };

    const removeInfortunio = (id: string) => {
        setInjuredPlayers(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="shared-page-container">
            <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>Infermeria</h1>
            
            <div className="shared-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, border: 'none', padding: 0 }}>Stato Infortunati</h2>
                    <button 
                        className="btn-submit" 
                        style={{ width: 'auto', padding: '8px 16px', flex: 'none' }}
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Aggiungi
                    </button>
                </div>

                <div className="info-list">
                    {injuredPlayers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                            Nessun giocatore in infermeria al momento.
                        </div>
                    ) : (
                        injuredPlayers.map(player => (
                            <div key={player.id} className="info-item" style={{ position: 'relative' }}>
                                <button 
                                    onClick={() => removeInfortunio(player.id)}
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
                                        zIndex: 2
                                    }}
                                    title="Rimuovi"
                                >
                                    ✕
                                </button>
                                <div className="item-main">
                                    <span className="item-title">{player.name}</span>
                                    <span className="item-subtitle">{player.injury}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                    <span className={`status-badge status-${player.status}`}>
                                        {player.status === 'danger' ? 'Grave' : player.status === 'warning' ? 'Moderato' : 'Lieve'}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Recupero: {player.recoveryTime} {player.recoveryTime === 1 ? 'giorno' : 'giorni'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button className="nav-btn" style={{ width: 'auto', marginTop: '20px' }} onClick={() => navigate('/')}>
                ← Torna alla Home
            </button>

            {/* Modal per l'aggiunta */}
            {isModalOpen && (
                <div className="rosa-modal-overlay">
                    <div className="rosa-modal">
                        <div className="rosa-modal-header">
                            <h3>Nuovo Infortunio</h3>
                            <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">&times;</button>
                        </div>
                        <form onSubmit={handleAddInfortunio} className="rosa-form">
                            <div>
                                <label>Giocatore</label>
                                <select 
                                    value={selectedPlayerId} 
                                    onChange={e => setSelectedPlayerId(e.target.value)}
                                    required
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="" style={{ background: '#1a1a1a' }}>Seleziona un giocatore...</option>
                                    {roster ? (
                                        <>
                                            <optgroup label="Portieri" style={{ background: '#1a1a1a' }}>
                                                {roster.portieri.map(p => <option key={p.id} value={p.id} style={{ background: '#1a1a1a' }}>{p.name}</option>)}
                                            </optgroup>
                                            <optgroup label="Difensori" style={{ background: '#1a1a1a' }}>
                                                {roster.difensori.map(p => <option key={p.id} value={p.id} style={{ background: '#1a1a1a' }}>{p.name}</option>)}
                                            </optgroup>
                                            <optgroup label="Centrocampisti" style={{ background: '#1a1a1a' }}>
                                                {roster.centrocampisti.map(p => <option key={p.id} value={p.id} style={{ background: '#1a1a1a' }}>{p.name}</option>)}
                                            </optgroup>
                                            <optgroup label="Attaccanti" style={{ background: '#1a1a1a' }}>
                                                {roster.attaccanti.map(p => <option key={p.id} value={p.id} style={{ background: '#1a1a1a' }}>{p.name}</option>)}
                                            </optgroup>
                                        </>
                                    ) : null}
                                </select>
                            </div>

                            <div>
                                <label>Infortunio</label>
                                <input 
                                    type="text" 
                                    placeholder="Es: Distorsione alla caviglia" 
                                    value={injury} 
                                    onChange={e => setInjury(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div>
                                <label>Tempo di recupero (giorni)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    placeholder="Es: 5" 
                                    value={recoveryTime} 
                                    onChange={e => setRecoveryTime(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div>
                                <label>Gravità</label>
                                <select 
                                    value={status} 
                                    onChange={e => setStatus(e.target.value as any)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="info" style={{ background: '#1a1a1a' }}>Lieve</option>
                                    <option value="warning" style={{ background: '#1a1a1a' }}>Moderato</option>
                                    <option value="danger" style={{ background: '#1a1a1a' }}>Grave</option>
                                </select>
                            </div>
                            
                            <div className="rosa-form-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">
                                    Annulla
                                </button>
                                <button type="submit" className="btn-submit">
                                    Salva
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Infermeria;
