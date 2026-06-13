import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SharedPages.css';
import './Rosa.css';

interface SuspendedPlayer {
    id: string;
    name: string;
    reason: string;
    duration: number; // Giornate/Giorni
    isWarning: boolean;
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

function Squalifiche() {
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

    // Stato per i giocatori squalificati
    const [suspendedPlayers, setSuspendedPlayers] = useState<SuspendedPlayer[]>(() => {
        const saved = localStorage.getItem(`suspended_data_${teamKey}`);
        if (saved) {
            try {
                const players: SuspendedPlayer[] = JSON.parse(saved);
                const now = new Date().getTime();
                
                // Filtra le squalifiche scadute
                return players.filter(p => {
                    if (p.isWarning) return true; // I diffidati non scadono automaticamente per tempo
                    if (!p.startDate) return true; // Retrocompatibilità

                    const start = new Date(p.startDate).getTime();
                    const durationMs = p.duration * 24 * 60 * 60 * 1000;
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

    // Persistenza squalifiche
    useEffect(() => {
        localStorage.setItem(`suspended_data_${teamKey}`, JSON.stringify(suspendedPlayers));
    }, [suspendedPlayers, teamKey]);

    // Stati per il modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState('');
    const [isWarning, setIsWarning] = useState(false);

    const handleAddSqualifica = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!roster || !selectedPlayerId) return;

        // Trova il nome del giocatore selezionato
        const allPlayers = [
            ...roster.portieri,
            ...roster.difensori,
            ...roster.centrocampisti,
            ...roster.attaccanti
        ];
        const player = allPlayers.find(p => p.id === selectedPlayerId);
        
        if (!player) return;

        const newSqualifica: SuspendedPlayer = {
            id: Date.now().toString(),
            name: player.name,
            reason: reason,
            duration: parseInt(duration) || 0,
            isWarning: isWarning,
            startDate: new Date().toISOString()
        };

        setSuspendedPlayers(prev => [...prev, newSqualifica]);
        
        // Reset e chiusura
        setIsModalOpen(false);
        setSelectedPlayerId('');
        setReason('');
        setDuration('');
        setIsWarning(false);
    };

    const removeSqualifica = (id: string) => {
        setSuspendedPlayers(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="shared-page-container">
            <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>Squalifiche</h1>
            
            <div className="shared-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, border: 'none', padding: 0 }}>Giocatori Squalificati e Diffidati</h2>
                    <button 
                        className="btn-submit" 
                        style={{ width: 'auto', padding: '8px 16px', flex: 'none' }}
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Aggiungi
                    </button>
                </div>

                <div className="info-list">
                    {suspendedPlayers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                            Nessun giocatore squalificato o diffidato al momento.
                        </div>
                    ) : (
                        suspendedPlayers.map(player => (
                            <div key={player.id} className="info-item" style={{ position: 'relative' }}>
                                <button 
                                    onClick={() => removeSqualifica(player.id)}
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
                                    <span className="item-subtitle">{player.reason}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                    <span className={`status-badge ${player.isWarning ? 'status-warning' : 'status-danger'}`}>
                                        {player.isWarning ? 'Diffidato' : 'Squalificato'}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Sanzione: {player.duration} {player.duration === 1 ? 'giornata' : 'giornate'}</span>
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
                            <h3>Nuova Squalifica</h3>
                            <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">&times;</button>
                        </div>
                        <form onSubmit={handleAddSqualifica} className="rosa-form">
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
                                <label>Motivo</label>
                                <input 
                                    type="text" 
                                    placeholder="Es: Somma di ammonizioni" 
                                    value={reason} 
                                    onChange={e => setReason(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div>
                                <label>Durata (giornate/giorni)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    placeholder="Es: 2" 
                                    value={duration} 
                                    onChange={e => setDuration(e.target.value)} 
                                    required={!isWarning}
                                    disabled={isWarning}
                                />
                            </div>

                            <div style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                <input 
                                    type="checkbox" 
                                    id="isWarning"
                                    checked={isWarning} 
                                    onChange={e => setIsWarning(e.target.checked)}
                                    style={{ width: 'auto' }}
                                />
                                <label htmlFor="isWarning" style={{ cursor: 'pointer' }}>Diffidato (Checkbox non spuntata = Squalificato)</label>
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

export default Squalifiche;
