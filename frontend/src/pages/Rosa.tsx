import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerAvatar from '../components/PlayerAvatar';
import './Rosa.css';

interface Member {
    id: string;
    name: string;
    number?: string;
    role?: string;
    birthDate?: string;
    goals: number;
    assists: number;
    appearances: number;
    weight?: number;
    height?: number;
}

interface RosterState {
    staff: Member[];
    portieri: Member[];
    difensori: Member[];
    centrocampisti: Member[];
    attaccanti: Member[];
}

const initialRoster: RosterState = {
    staff: [
        { id: 's1', name: 'Allenatore Principale', role: 'Mister', goals: 0, assists: 0, appearances: 0 },
        { id: 's2', name: 'Collaboratore 1', role: 'Vice', goals: 0, assists: 0, appearances: 0 }
    ],
    portieri: [
        { id: 'p1', name: 'Portiere 1', number: '1', goals: 0, assists: 1, appearances: 10 }
    ],
    difensori: [
        { id: 'd1', name: 'Difensore 1', number: '2', goals: 2, assists: 3, appearances: 15 },
        { id: 'd2', name: 'Difensore 2', number: '3', goals: 0, assists: 1, appearances: 12 }
    ],
    centrocampisti: [
        { id: 'c1', name: 'Centrocampista 1', number: '8', goals: 5, assists: 8, appearances: 18 }
    ],
    attaccanti: [
        { id: 'a1', name: 'Attaccante 1', number: '9', goals: 12, assists: 4, appearances: 17 }
    ]
};

type TabKey = 'all' | keyof RosterState;

function Rosa() {
    const navigate = useNavigate();
    const [isCoach] = useState(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                const role = parsed.role?.toUpperCase();
                return role === 'ALLENATORE' || role === 'MANAGER';
            } catch {
                return false;
            }
        }
        return false;
    });

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

    const [roster, setRoster] = useState<RosterState>(() => {
        const teamKey = getTeamKey();
        const saved = localStorage.getItem(`roster_data_${teamKey}`);
        return saved ? JSON.parse(saved) : initialRoster;
    });

    useEffect(() => {
        const teamKey = getTeamKey();
        localStorage.setItem(`roster_data_${teamKey}`, JSON.stringify(roster));
    }, [roster]);

    useEffect(() => {
        // Fetch registered players for the team from database
        fetch('http://localhost:8080/api/team-players', { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then((dbPlayers: any[]) => {
                if (!dbPlayers || dbPlayers.length === 0) return;
                
                setRoster(prev => {
                    const newState = { ...prev };
                    let updated = false;
                    
                    dbPlayers.forEach(p => {
                        const username = p.username;
                        
                        // Check if this player is already in any of our roster categories
                        const exists = 
                            newState.portieri.some(m => m.name === username) ||
                            newState.difensori.some(m => m.name === username) ||
                            newState.centrocampisti.some(m => m.name === username) ||
                            newState.attaccanti.some(m => m.name === username);
                            
                        if (!exists) {
                            // Automatically add to default category 'attaccanti'
                            const newPlayer: Member = {
                                id: 'db_' + username,
                                name: username,
                                goals: 0,
                                assists: 0,
                                appearances: 0
                            };
                            newState.attaccanti = [...newState.attaccanti, newPlayer];
                            updated = true;
                        }
                    });
                    
                    return updated ? newState : prev;
                });
            })
            .catch(err => {
                console.log("Errore nel recupero dei giocatori dal database", err);
            });

        // Fetch registered staff for the team from database
        fetch('http://localhost:8080/api/team-staff', { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then((dbStaff: any[]) => {
                if (!dbStaff || dbStaff.length === 0) return;
                
                setRoster(prev => {
                    const newState = { ...prev };
                    let updated = false;
                    
                    dbStaff.forEach(s => {
                        const username = s.username;
                        
                        // Check if this staff member is already in staff category
                        const exists = newState.staff.some(m => m.name === username);
                            
                        if (!exists) {
                            // Automatically add to staff category
                            const newStaff: Member = {
                                id: 'db_' + username,
                                name: username,
                                role: 'Allenatore',
                                goals: 0,
                                assists: 0,
                                appearances: 0
                            };
                            newState.staff = [...newState.staff, newStaff];
                            updated = true;
                        }
                    });
                    
                    return updated ? newState : prev;
                });
            })
            .catch(err => {
                console.log("Errore nel recupero dello staff dal database", err);
            });
    }, []);

    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [modalCategory, setModalCategory] = useState<keyof RosterState>('portieri');
    const [originalCategory, setOriginalCategory] = useState<keyof RosterState | null>(null);
    
    const [formData, setFormData] = useState({
        name: '', number: '', role: '', birthDate: '', goals: 0, assists: 0, appearances: 0, weight: 0, height: 0
    });

    const calculateAge = (birthDate?: string) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const getMemberStats = (member: Member) => {
        const statsKeys = [];
        if (member.id) statsKeys.push(`stats_${member.id}`);
        if (member.name) statsKeys.push(`stats_${member.name}`);

        let matchHistory: any[] | null = null;
        for (const key of statsKeys) {
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.matchHistory && Array.isArray(parsed.matchHistory)) {
                        matchHistory = parsed.matchHistory;
                        break;
                    }
                } catch (e) {
                    console.error("Error parsing player stats", e);
                }
            }
        }

        if (matchHistory) {
            return matchHistory.reduce((acc: any, curr: any) => ({
                goals: acc.goals + (curr.goals || 0),
                assists: acc.assists + (curr.assists || 0),
                appearances: acc.appearances + 1
            }), { goals: 0, assists: 0, appearances: 0 });
        }

        return {
            goals: member?.goals || 0,
            assists: member?.assists || 0,
            appearances: member?.appearances || 0
        };
    };

    const openModal = (category: keyof RosterState, member?: Member) => {
        if (!isCoach) return;
        setModalCategory(category);
        setOriginalCategory(category);
        if (member) {
            setEditingMemberId(member.id);
            setFormData({
                name: member.name,
                number: member.number || '',
                role: member.role || '',
                birthDate: member.birthDate || '',
                goals: member.goals,
                assists: member.assists,
                appearances: member.appearances,
                weight: member.weight || 0,
                height: member.height || 0
            });
        } else {
            setEditingMemberId(null);
            setFormData({ name: '', number: '', role: '', birthDate: '', goals: 0, assists: 0, appearances: 0, weight: 0, height: 0 });
        }
        setIsModalOpen(true);
    };

    const handleSaveMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        const memberData: Member = {
            id: editingMemberId || Date.now().toString(),
            ...formData,
            number: modalCategory !== 'staff' ? formData.number : undefined,
            role: modalCategory === 'staff' ? formData.role : undefined,
        };

        setRoster(prev => {
            const newState = { ...prev };
            if (editingMemberId && originalCategory && originalCategory !== modalCategory) {
                newState[originalCategory] = newState[originalCategory].filter(m => m.id !== editingMemberId);
                newState[modalCategory] = [...newState[modalCategory], memberData];
            } else if (editingMemberId) {
                newState[modalCategory] = newState[modalCategory].map(m => m.id === editingMemberId ? memberData : m);
            } else {
                newState[modalCategory] = [...newState[modalCategory], memberData];
            }
            return newState;
        });
        
        setSelectedMemberId(memberData.id); // Select the newly edited/added member
        setIsModalOpen(false);
    };

    const removeMember = (category: keyof RosterState, id: string) => {
        if (window.confirm('Sei sicuro di voler rimuovere questo membro?')) {
            if (id.startsWith('db_')) {
                const username = id.substring(3);
                fetch(`http://localhost:8080/api/users/${username}`, { 
                    method: 'DELETE',
                    credentials: 'include' 
                })
                .then(res => {
                    if (!res.ok) {
                        console.error("Impossibile eliminare l'utente dal database");
                    }
                })
                .catch(err => console.error(err));
            }
            
            setRoster(prev => ({ ...prev, [category]: prev[category].filter(m => m.id !== id) }));
            if (selectedMemberId === id) setSelectedMemberId(null);
        }
    };

    const sections: { key: keyof RosterState, title: string, short: string }[] = [
        { key: 'staff', title: 'Allenatore e Collaboratori', short: 'Staff' },
        { key: 'portieri', title: 'Portieri', short: 'POR' },
        { key: 'difensori', title: 'Difensori', short: 'DIF' },
        { key: 'centrocampisti', title: 'Centrocampisti', short: 'CEN' },
        { key: 'attaccanti', title: 'Attaccanti', short: 'ATT' },
    ];

    // Derived state for the list
    const displayedMembers = useMemo(() => {
        let members: (Member & { category: keyof RosterState, categoryName: string })[] = [];
        
        if (activeTab === 'all') {
            sections.forEach(sec => {
                roster[sec.key].forEach(m => {
                    members.push({ ...m, category: sec.key, categoryName: sec.short });
                });
            });
        } else {
            const sec = sections.find(s => s.key === activeTab);
            if (sec) {
                roster[activeTab].forEach(m => {
                    members.push({ ...m, category: activeTab, categoryName: sec.short });
                });
            }
        }
        
        return members;
    }, [roster, activeTab]);

    const selectedMemberFull = useMemo(() => {
        if (!selectedMemberId) return null;
        for (const m of displayedMembers) {
            if (m.id === selectedMemberId) return m;
        }
        return null;
    }, [selectedMemberId, displayedMembers]);

    // Set first member as selected when changing tabs if none is selected
    useEffect(() => {
        if (displayedMembers.length > 0 && (!selectedMemberId || !displayedMembers.find(m => m.id === selectedMemberId))) {
            setSelectedMemberId(displayedMembers[0].id);
        } else if (displayedMembers.length === 0) {
            setSelectedMemberId(null);
        }
    }, [activeTab, displayedMembers, selectedMemberId]);


    return (
        <div className="rosa-container">
            <div className="hub-header">
                <h1>Hub Rosa</h1>
                <div className="hub-header-actions">
                    {isCoach && (
                        <button className="btn-add-global" onClick={() => openModal(activeTab === 'all' || activeTab === 'staff' ? 'portieri' : activeTab)}>
                            + Aggiungi
                        </button>
                    )}
                    <button className="btn-back" onClick={() => navigate('/')}>Esci</button>
                </div>
            </div>
            
            <div className="rosa-hub-layout">
                {/* Master: List View */}
                <div className="hub-list-section">
                    <div className="hub-tabs">
                        <button className={`hub-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Tutti</button>
                        {sections.map(sec => (
                            <button key={sec.key} className={`hub-tab ${activeTab === sec.key ? 'active' : ''}`} onClick={() => setActiveTab(sec.key)}>
                                {sec.title}
                            </button>
                        ))}
                    </div>
                    
                    <div className="hub-table-container">
                        <table className="hub-table">
                            <thead>
                                <tr>
                                    <th>Num / Ruolo</th>
                                    <th>Nome</th>
                                    <th>Pos</th>
                                    <th>Età</th>
                                    <th>Pres</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedMembers.map(m => (
                                    <tr 
                                        key={m.id} 
                                        className={selectedMemberId === m.id ? 'selected' : ''}
                                        onClick={() => setSelectedMemberId(m.id)}
                                    >
                                        <td>
                                            {m.category === 'staff' ? 
                                                <span className="player-num-badge" style={{background: 'rgba(255,255,255,0.05)', color: '#9ca3af'}}>{m.role || 'STAFF'}</span> : 
                                                <span className="player-num-badge">{m.number || '-'}</span>
                                            }
                                        </td>
                                        <td style={{ fontWeight: selectedMemberId === m.id ? '700' : '400' }}>{m.name}</td>
                                        <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{m.categoryName}</td>
                                        <td>{calculateAge(m.birthDate) || '-'}</td>
                                        <td>{getMemberStats(m).appearances}</td>
                                    </tr>
                                ))}
                                {displayedMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                                            Nessun membro trovato in questa sezione.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail: Player Card View */}
                <div className="hub-detail-section">
                    {selectedMemberFull ? (
                        <div className="player-card-large">
                            <div className="card-header">
                                <div className="card-number">{selectedMemberFull.category === 'staff' ? '' : selectedMemberFull.number}</div>
                                <div className="card-role">{selectedMemberFull.category === 'staff' ? selectedMemberFull.role : selectedMemberFull.categoryName}</div>
                            </div>
                            
                            <div className="card-avatar-large" style={{ background: 'transparent', boxShadow: 'none', borderRadius: 0 }}>
                                <PlayerAvatar height={selectedMemberFull.height} weight={selectedMemberFull.weight} />
                            </div>
                            
                            <div className="card-name">{selectedMemberFull.name}</div>
                            <div className="card-subtitle">
                                <span>{calculateAge(selectedMemberFull.birthDate) ? `${calculateAge(selectedMemberFull.birthDate)} anni` : 'Età non specificata'}</span>
                                {selectedMemberFull.height ? <span> • {selectedMemberFull.height} cm</span> : null}
                                {selectedMemberFull.weight ? <span> • {selectedMemberFull.weight} kg</span> : null}
                            </div>

                            {selectedMemberFull.category !== 'staff' && (() => {
                                const stats = getMemberStats(selectedMemberFull);
                                return (
                                    <div className="card-stats-grid">
                                        <div className="stat-item">
                                            <span className="stat-value">{stats.appearances}</span>
                                            <span className="stat-label">Pres</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value">{stats.goals}</span>
                                            <span className="stat-label">Gol</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value">{stats.assists}</span>
                                            <span className="stat-label">Ass</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {isCoach && (
                                <div className="card-actions">
                                    <button className="btn-edit-card" onClick={() => openModal(selectedMemberFull.category, selectedMemberFull)}>✎ Modifica</button>
                                    <button className="btn-remove-card" onClick={() => removeMember(selectedMemberFull.category, selectedMemberFull.id)}>✕ Rimuovi</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-detail">
                            <div className="empty-icon">👤</div>
                            <h3>Nessun Selezionato</h3>
                            <p>Seleziona un giocatore dalla lista per visualizzare le sue statistiche e opzioni.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="rosa-modal-overlay">
                    <div className="rosa-modal">
                        <div className="rosa-modal-header">
                            <h3>{editingMemberId ? 'Modifica Membro' : 'Nuovo Membro'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">&times;</button>
                        </div>
                        <form onSubmit={handleSaveMember} className="rosa-form">
                            <div className="rosa-form-row">
                                <div style={{ flex: 2 }}>
                                    <label>Nome Completo</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Es. Mario Rossi" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Settore</label>
                                    <select value={modalCategory} onChange={e => setModalCategory(e.target.value as keyof RosterState)}>
                                        {sections.map(s => <option key={s.key} value={s.key}>{s.title.split(' ')[0]}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="rosa-form-row">
                                <div style={{ flex: 1 }}>
                                    <label>Data di Nascita</label>
                                    <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>{modalCategory === 'staff' ? 'Ruolo' : 'Numero Maglia'}</label>
                                    <input type="text" value={modalCategory === 'staff' ? formData.role : formData.number} onChange={e => setFormData({...formData, [modalCategory === 'staff' ? 'role' : 'number']: e.target.value})} placeholder={modalCategory === 'staff' ? 'Es. Medico' : 'Es. 10'} />
                                </div>
                            </div>
                            <div className="rosa-form-row">
                                <div style={{ flex: 1 }}>
                                    <label>Altezza (cm)</label>
                                    <input type="number" value={formData.height || ''} onChange={e => setFormData({...formData, height: parseInt(e.target.value) || 0})} placeholder="Es. 185" min="0" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Peso (kg)</label>
                                    <input type="number" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: parseInt(e.target.value) || 0})} placeholder="Es. 75" min="0" />
                                </div>
                            </div>
                            {modalCategory !== 'staff' && (
                                <div className="stats-grid" style={{ opacity: editingMemberId?.startsWith('db_') ? 0.7 : 1 }}>
                                    <div style={{ flex: 1 }}>
                                        <label>Presenze</label>
                                        <input 
                                            type="number" 
                                            value={editingMemberId?.startsWith('db_') ? getMemberStats({ id: editingMemberId, name: formData.name } as any).appearances : formData.appearances} 
                                            onChange={e => setFormData({...formData, appearances: parseInt(e.target.value) || 0})} 
                                            min="0" 
                                            disabled={!!editingMemberId?.startsWith('db_')}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Gol</label>
                                        <input 
                                            type="number" 
                                            value={editingMemberId?.startsWith('db_') ? getMemberStats({ id: editingMemberId, name: formData.name } as any).goals : formData.goals} 
                                            onChange={e => setFormData({...formData, goals: parseInt(e.target.value) || 0})} 
                                            min="0" 
                                            disabled={!!editingMemberId?.startsWith('db_')}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Assist</label>
                                        <input 
                                            type="number" 
                                            value={editingMemberId?.startsWith('db_') ? getMemberStats({ id: editingMemberId, name: formData.name } as any).assists : formData.assists} 
                                            onChange={e => setFormData({...formData, assists: parseInt(e.target.value) || 0})} 
                                            min="0" 
                                            disabled={!!editingMemberId?.startsWith('db_')}
                                        />
                                    </div>
                                </div>
                            )}
                            {editingMemberId?.startsWith('db_') && (
                                <div style={{ fontSize: '0.85rem', color: '#4ade80', textAlign: 'center', marginTop: '-5px', marginBottom: '15px', fontWeight: '500' }}>
                                    ℹ️ Statistiche collegate all'area personale del giocatore.
                                </div>
                            )}
                            <div className="rosa-form-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Annulla</button>
                                <button type="submit" className="btn-submit">{editingMemberId ? 'Salva Modifiche' : 'Aggiungi Membro'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Rosa;
