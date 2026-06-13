import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Formazione.css';

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

interface SuspendedPlayer {
    id: string;
    name: string;
    reason: string;
    duration: string;
    isWarning: boolean;
}

interface InjuredPlayer {
    id: string;
    name: string;
    injury: string;
    recoveryTime: string;
    status: 'danger' | 'warning' | 'info';
}

interface SavedFormationPlayer {
    id: string;
    name: string;
    number?: string;
    role?: string;
    position: string;
}

interface FormationEntry {
    id: string;
    opponent: string;
    date: string;
    selectedFormation: string;
    assignedPositions: Record<number, SavedFormationPlayer>;
    goalsByPlayer: Record<string, number>;
    assistsByPlayer: Record<string, number>;
    minutesByPlayer: Record<string, number>;
    goalsFor?: number;
    goalsAgainst?: number;
    statsPlayers?: Record<string, { id: string; name: string; role?: string; goals: number; assists: number; minutes: number }>;
}

// specificare la posizione del giocatore
type Position = { top: string; left: string; role: string; id: number };

// variabile formations per tenere traccia delle formazioni disponibili
const formations: Record<string, Position[]> = {
    '4-4-2': [
        { id: 1, role: 'POR', top: '90%', left: '50%' },
        { id: 2, role: 'TD', top: '72%', left: '20%' },
        { id: 3, role: 'DC', top: '78%', left: '40%' },
        { id: 4, role: 'DC', top: '78%', left: '60%' },
        { id: 5, role: 'TS', top: '72%', left: '80%' },
        { id: 6, role: 'ED', top: '45%', left: '20%' },
        { id: 7, role: 'CC', top: '52%', left: '40%' },
        { id: 8, role: 'CC', top: '52%', left: '60%' },
        { id: 9, role: 'ES', top: '45%', left: '80%' },
        { id: 10, role: 'ATT', top: '20%', left: '35%' },
        { id: 11, role: 'ATT', top: '20%', left: '65%' },
    ],
    '4-3-3': [
        { id: 1, role: 'POR', top: '90%', left: '50%' },
        { id: 2, role: 'TD', top: '72%', left: '20%' },
        { id: 3, role: 'DC', top: '78%', left: '40%' },
        { id: 4, role: 'DC', top: '78%', left: '60%' },
        { id: 5, role: 'TS', top: '72%', left: '80%' },
        { id: 6, role: 'MC', top: '52%', left: '30%' },
        { id: 7, role: 'CDC', top: '58%', left: '50%' },
        { id: 8, role: 'MC', top: '52%', left: '70%' },
        { id: 9, role: 'AD', top: '22%', left: '20%' },
        { id: 10, role: 'ATT', top: '18%', left: '50%' },
        { id: 11, role: 'AS', top: '22%', left: '80%' },
    ],
    '4-1-4-1': [
        { id: 1, role: 'POR', top: '90%', left: '50%' },
        { id: 2, role: 'TD', top: '72%', left: '18%' },
        { id: 3, role: 'DC', top: '78%', left: '38%' },
        { id: 4, role: 'DC', top: '78%', left: '62%' },
        { id: 5, role: 'TS', top: '72%', left: '82%' },
        { id: 6, role: 'CDC', top: '55%', left: '50%' },
        { id: 7, role: 'ED', top: '35%', left: '18%' },
        { id: 8, role: 'CC', top: '40%', left: '38%' },
        { id: 9, role: 'CC', top: '40%', left: '62%' },
        { id: 10, role: 'ES', top: '35%', left: '82%' },
        { id: 11, role: 'ATT', top: '18%', left: '50%' },
    ],
    '3-4-2-1': [
        { id: 1, role: 'POR', top: '90%', left: '50%' },
        { id: 2, role: 'DCD', top: '76%', left: '25%' },
        { id: 3, role: 'DC', top: '78%', left: '50%' },
        { id: 4, role: 'DCS', top: '76%', left: '75%' },
        { id: 5, role: 'ED', top: '50%', left: '20%' },
        { id: 6, role: 'CC', top: '50%', left: '40%' },
        { id: 7, role: 'CC', top: '50%', left: '60%' },
        { id: 8, role: 'ED', top: '50%', left: '80%' },
        { id: 9, role: 'AS', top: '25%', left: '35%' },
        { id: 10, role: 'AS', top: '25%', left: '65%' },
        { id: 11, role: 'ATT', top: '10%', left: '50%' },
    ],
    '4-5-1': [
        { id: 1, role: 'POR', top: '90%', left: '50%' },
        { id: 2, role: 'TD', top: '72%', left: '20%' },
        { id: 3, role: 'DC', top: '78%', left: '40%' },
        { id: 4, role: 'DC', top: '78%', left: '60%' },
        { id: 5, role: 'TS', top: '72%', left: '80%' },
        { id: 6, role: 'ED', top: '52%', left: '18%' },
        { id: 7, role: 'CC', top: '52%', left: '38%' },
        { id: 8, role: 'CC', top: '44%', left: '50%' },
        { id: 9, role: 'CC', top: '52%', left: '62%' },
        { id: 10, role: 'ES', top: '52%', left: '82%' },
        { id: 11, role: 'ATT', top: '22%', left: '50%' },
    ],
    '5-3-2': [
        { id: 1, role: 'POR', top: '90%', left: '50%' },
        { id: 2, role: 'DCD', top: '76%', left: '14%' },
        { id: 3, role: 'DC', top: '80%', left: '30%' },
        { id: 4, role: 'DC', top: '80%', left: '50%' },
        { id: 5, role: 'DC', top: '80%', left: '70%' },
        { id: 6, role: 'DCS', top: '76%', left: '86%' },
        { id: 7, role: 'MC', top: '55%', left: '30%' },
        { id: 8, role: 'CC', top: '45%', left: '50%' },
        { id: 9, role: 'MC', top: '55%', left: '70%' },
        { id: 10, role: 'ATT', top: '20%', left: '35%' },
        { id: 11, role: 'ATT', top: '20%', left: '65%' },
    ],
    '3-5-2': [
        { id: 1, role: 'POR', top: '90%', left: '50%' },
        { id: 2, role: 'DCD', top: '78%', left: '30%' },
        { id: 3, role: 'DC', top: '80%', left: '50%' },
        { id: 4, role: 'DCS', top: '78%', left: '70%' },
        { id: 5, role: 'ED', top: '48%', left: '15%' },
        { id: 6, role: 'CC', top: '52%', left: '35%' },
        { id: 7, role: 'CDC', top: '62%', left: '50%' },
        { id: 8, role: 'CC', top: '52%', left: '65%' },
        { id: 9, role: 'ES', top: '48%', left: '85%' },
        { id: 10, role: 'ATT', top: '20%', left: '35%' },
        { id: 11, role: 'ATT', top: '20%', left: '65%' },
    ],
    '4-2-3-1': [
        { id: 1, role: 'POR', top: '90%', left: '50%' },
        { id: 2, role: 'TD', top: '72%', left: '20%' },
        { id: 3, role: 'DC', top: '78%', left: '40%' },
        { id: 4, role: 'DC', top: '78%', left: '60%' },
        { id: 5, role: 'TS', top: '72%', left: '80%' },
        { id: 6, role: 'CDC', top: '60%', left: '40%' },
        { id: 7, role: 'CDC', top: '60%', left: '60%' },
        { id: 8, role: 'AD', top: '38%', left: '20%' },
        { id: 9, role: 'COC', top: '42%', left: '50%' },
        { id: 10, role: 'AS', top: '38%', left: '80%' },
        { id: 11, role: 'ATT', top: '18%', left: '50%' },
    ]
};

// salvataggio sicuro in local storage
const getSaved = (key: string, def: any) => {
    const saved = localStorage.getItem(key);
    try { return saved ? JSON.parse(saved) : def; } catch { return def; }
};

function Formazione() {
    const navigate = useNavigate();

    //controllare se l'utente è allenatore
    const [isCoach] = useState(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                const role = parsed.role?.toUpperCase();
                return role === 'ALLENATORE' || role === 'MANAGER' || role === 'MISTER';
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

    const teamKey = getTeamKey();
    //caricare dal loc stor gli stati iniziali
    const [roster] = useState<RosterState>(() => getSaved(`roster_data_${teamKey}`, { staff: [], portieri: [], difensori: [], centrocampisti: [], attaccanti: [] }));
    const [selectedFormation, setSelectedFormation] = useState<string>(() => localStorage.getItem(`selected_modulo_${teamKey}`) || '4-4-2');
    const [activeFormation, setActiveFormation] = useState<Record<number, Member>>(() => getSaved(`active_formation_${teamKey}`, {}));
    const [editingPosId, setEditingPosId] = useState<number | null>(null);
    const [formationHistory, setFormationHistory] = useState<FormationEntry[]>(() => getSaved(`formation_history_${teamKey}`, []));
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [opponentName, setOpponentName] = useState('');
    const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
    const [goalsByPlayer, setGoalsByPlayer] = useState<Record<string, number>>({});
    const [assistsByPlayer, setAssistsByPlayer] = useState<Record<string, number>>({});
    const [minutesByPlayer, setMinutesByPlayer] = useState<Record<string, number>>({});
    const [goalsFor, setGoalsFor] = useState<number>(0);
    const [goalsAgainst, setGoalsAgainst] = useState<number>(0);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const parseServerFormation = (formation: any): FormationEntry => {
        let payload: any = {};
        if (formation.payloadJson) {
            try {
                payload = typeof formation.payloadJson === 'string'
                    ? JSON.parse(formation.payloadJson)
                    : formation.payloadJson;
            } catch {
                payload = {};
            }
        }

        return {
            id: formation.id?.toString() || `local-${Date.now()}`,
            opponent: formation.opponent || payload.opponent || '',
            date: formation.matchDate || payload.date || new Date().toISOString(),
            selectedFormation: payload.selectedFormation || '4-4-2',
            assignedPositions: payload.assignedPositions || {},
            goalsByPlayer: payload.goalsByPlayer || {},
            assistsByPlayer: payload.assistsByPlayer || {},
            minutesByPlayer: payload.minutesByPlayer || {},
            goalsFor: payload.goalsFor ?? 0,
            goalsAgainst: payload.goalsAgainst ?? 0,
            statsPlayers: payload.statsPlayers || {}
        };
    };

    useEffect(() => {
        const fetchServerHistory = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/formations', {
                    method: 'GET',
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        const entries = data.map(parseServerFormation);
                        setFormationHistory(entries);
                        localStorage.setItem(`formation_history_${teamKey}`, JSON.stringify(entries));
                    }
                }
            } catch {
                // Fallback alla versione locale se il server non risponde
            }
        };

        fetchServerHistory();
    }, [teamKey]);

    //filtrare i giocatori indisponibili
    const suspendedPlayers = getSaved(`suspended_data_${teamKey}`, []) as SuspendedPlayer[];
    const injuredPlayers = getSaved(`injured_data_${teamKey}`, []) as InjuredPlayer[];
    const unavailableNames = [
        ...suspendedPlayers.filter(p => !p.isWarning).map(p => p.name),
        ...injuredPlayers.map(p => p.name)
    ];
    //controllare i giocatori disponibili
    const allPlayersRaw = [...roster.portieri, ...roster.difensori, ...roster.centrocampisti, ...roster.attaccanti];
    const allPlayers = allPlayersRaw.filter(p => !unavailableNames.includes(p.name));
    const playersOnFieldIds = Object.values(activeFormation).map(p => p.id);
    const benchPlayers = allPlayers.filter(p => !playersOnFieldIds.includes(p.id));
    const statsEligiblePlayers = Array.from(
        new Map([...Object.values(activeFormation), ...benchPlayers].map(p => [p.id, p])).values()
    );

    // sincro a loc stor
    useEffect(() => { localStorage.setItem(`selected_modulo_${teamKey}`, selectedFormation); }, [selectedFormation]);
    useEffect(() => { localStorage.setItem(`active_formation_${teamKey}`, JSON.stringify(activeFormation)); }, [activeFormation]);
    useEffect(() => { localStorage.setItem(`formation_history_${teamKey}`, JSON.stringify(formationHistory)); }, [formationHistory, teamKey]);

    const handlePlayerSelect = (posId: number, player: Member) => {
        if (!isCoach) return;
        setActiveFormation(prev => ({ ...prev, [posId]: player }));
        setEditingPosId(null);
        setGoalsByPlayer((current) => ({ ...current, [player.id]: current[player.id] || 0 }));
        setAssistsByPlayer((current) => ({ ...current, [player.id]: current[player.id] || 0 }));
        setMinutesByPlayer((current) => ({ ...current, [player.id]: current[player.id] || 0 }));
    };

    const saveFormation = () => {
        if (!isCoach || !opponentName.trim()) return;

        const assignedPositions: Record<number, SavedFormationPlayer> = {};
        formations[selectedFormation].forEach((position) => {
            const player = activeFormation[position.id];
            if (player) {
                assignedPositions[position.id] = {
                    id: player.id,
                    name: player.name,
                    number: player.number,
                    role: player.role,
                    position: position.role
                };
            }
        });

        const statsPlayers: Record<string, { id: string; name: string; role?: string; goals: number; assists: number; minutes: number }> = {};
        const statPlayerIds = Array.from(new Set([
            ...Object.keys(goalsByPlayer),
            ...Object.keys(assistsByPlayer),
            ...Object.keys(minutesByPlayer)
        ]));

        statPlayerIds.forEach((playerId) => {
            const player = Object.values(activeFormation).find(p => p.id === playerId)
                || allPlayersRaw.find(p => p.id === playerId);
            if (player) {
                statsPlayers[playerId] = {
                    id: player.id,
                    name: player.name,
                    role: player.role,
                    goals: goalsByPlayer[player.id] || 0,
                    assists: assistsByPlayer[player.id] || 0,
                    minutes: minutesByPlayer[player.id] || 0
                };
            }
        });

        const newEntry: FormationEntry = {
            id: editingHistoryId || Date.now().toString(),
            opponent: opponentName.trim(),
            date: new Date().toISOString(),
            selectedFormation,
            assignedPositions,
            goalsByPlayer: goalsByPlayer,
            assistsByPlayer: assistsByPlayer,
            minutesByPlayer: minutesByPlayer,
            goalsFor,
            goalsAgainst,
            statsPlayers
        };

        // fare post a backend, se il server non risponde mantieni il comportamento locale.
        try {
            const payload: any = {
                opponent: newEntry.opponent,
                matchDate: newEntry.date,
                payloadJson: JSON.stringify(newEntry)
            };
            if (editingHistoryId && /^[0-9]+$/.test(editingHistoryId)) {
                payload.id = Number(editingHistoryId);
            }
            fetch('http://localhost:8080/api/formations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            }).catch(() => { /* ignorare gli errori e manetenrere il comportamento locale */ });
        } catch (e) {
            // ignorare
        }

        Object.values(statsPlayers).forEach((playerStat) => {
            if (!playerStat.name || !playerStat.id) return;
            const idKey = `stats_${playerStat.id}`;
            const nameKey = `stats_${playerStat.name}`;
            let currentStats = { votoMedio: 6.0, matchHistory: [] as any[] };

            try {
                const saved = localStorage.getItem(idKey) ?? localStorage.getItem(nameKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && Array.isArray(parsed.matchHistory)) {
                        currentStats = parsed;
                    }
                }
            } catch {
                currentStats = { votoMedio: 6.0, matchHistory: [] };
            }

            const matchName = opponentName.trim() || `Partita ${new Date().toLocaleDateString()}`;
            const newMatch = {
                name: matchName,
                minutes: playerStat.minutes,
                goals: playerStat.goals,
                assists: playerStat.assists,
                yellowCards: 0,
                redCards: 0,
                createdBy: 'mister' as const
            };

            if (playerStat.minutes > 0 || playerStat.goals > 0 || playerStat.assists > 0) {
                // modificare le partite senza duplicarle
                if (editingHistoryId) {
                    const existingIndex = currentStats.matchHistory.findIndex(
                        (m: any) => m.name === matchName && m.createdBy === 'mister'
                    );
                    if (existingIndex >= 0) {
                        currentStats.matchHistory[existingIndex] = newMatch;
                    } else {
                        currentStats.matchHistory = [...currentStats.matchHistory, newMatch];
                    }
                } else {
                    currentStats.matchHistory = [...currentStats.matchHistory, newMatch];
                }
                localStorage.setItem(idKey, JSON.stringify(currentStats));
                if (nameKey !== idKey) {
                    localStorage.setItem(nameKey, JSON.stringify(currentStats));
                }
            }
        });

        setFormationHistory((current) => {
            const existingIndex = current.findIndex(entry => entry.id === newEntry.id);
            if (existingIndex >= 0) {
                const next = [...current];
                next[existingIndex] = newEntry;
                return next;
            }
            return [...current, newEntry];
        });

        setOpponentName('');
        setEditingHistoryId(null);
        setGoalsByPlayer({});
        setAssistsByPlayer({});
        setMinutesByPlayer({});
        setGoalsFor(0);
        setGoalsAgainst(0);
    };

    const loadHistoryEntry = (entry: FormationEntry) => {
        setSelectedFormation(entry.selectedFormation);
        setActiveFormation(Object.fromEntries(Object.entries(entry.assignedPositions).map(([posId, player]) => {
            const storedPlayer = allPlayersRaw.find(p => p.id === player.id) || allPlayersRaw.find(p => p.name === player.name);
            const number = player.number || storedPlayer?.number;
            return [Number(posId), { id: player.id, name: player.name, role: player.role, number } as Member];
        })));
        setOpponentName(entry.opponent);
        setEditingHistoryId(entry.id);
        setEditingPosId(null);
        setGoalsByPlayer(entry.goalsByPlayer || {});
        setAssistsByPlayer(entry.assistsByPlayer || {});
        setMinutesByPlayer(entry.minutesByPlayer || {});
        setGoalsFor(entry.goalsFor ?? 0);
        setGoalsAgainst(entry.goalsAgainst ?? 0);
    };

    const deleteHistoryEntry = (id: string) => {
        if (!isCoach) return;
        const entryToDelete = formationHistory.find(e => e.id === id);

        const deleteRemote = async () => {
            const numericId = Number(id);
            if (!Number.isNaN(numericId)) {
                try {
                    await fetch(`http://localhost:8080/api/formations/${numericId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                } catch {
                    // remote delete failed, continue with local deletion
                }
            }
        };

        //eliminare player stats se elimini una partita
        if (entryToDelete) {
            const statsList: Array<{ id: string; name: string; goals: number; assists: number; minutes: number }> = entryToDelete.statsPlayers
                ? Object.values(entryToDelete.statsPlayers)
                : Array.from(new Set([
                    ...Object.keys(entryToDelete.goalsByPlayer || {}),
                    ...Object.keys(entryToDelete.assistsByPlayer || {}),
                    ...Object.keys(entryToDelete.minutesByPlayer || {})
                ])).map((pid) => {
                    const assigned = Object.values(entryToDelete.assignedPositions || {}).find(p => p.id === pid);
                    return {
                        id: pid,
                        name: assigned?.name || pid,
                        goals: entryToDelete.goalsByPlayer?.[pid] ?? 0,
                        assists: entryToDelete.assistsByPlayer?.[pid] ?? 0,
                        minutes: entryToDelete.minutesByPlayer?.[pid] ?? 0
                    };
                });

            const matchNameCandidates: string[] = [];
            if (entryToDelete.opponent && entryToDelete.opponent.trim()) matchNameCandidates.push(entryToDelete.opponent);
            try { matchNameCandidates.push(`Partita ${new Date(entryToDelete.date).toLocaleDateString()}`); } catch {}

            statsList.forEach((playerStat) => {
                const idKey = `stats_${playerStat.id}`;
                const nameKey = `stats_${playerStat.name}`;
                [idKey, nameKey].forEach((key) => {
                    try {
                        const saved = localStorage.getItem(key);
                        if (!saved) return;
                        const parsed = JSON.parse(saved);
                        if (!parsed || !Array.isArray(parsed.matchHistory)) return;

                        const newHistory = parsed.matchHistory.filter((m: any) => {
                            const nameMatch = matchNameCandidates.includes(m.name);
                            const metricsMatch = (m.goals === playerStat.goals && m.assists === playerStat.assists && m.minutes === playerStat.minutes);
                            return !(nameMatch && metricsMatch);
                        });

                        if (newHistory.length !== parsed.matchHistory.length) {
                            parsed.matchHistory = newHistory;
                            localStorage.setItem(key, JSON.stringify(parsed));
                        }
                    } catch {
                        // ignorare
                    }
                });
            });
        }

        deleteRemote();
        setFormationHistory((current) => current.filter(entry => entry.id !== id));
        if (editingHistoryId === id) {
            setEditingHistoryId(null);
            setOpponentName('');
        }
    };

    
    //inizializzare a 0 le statistiche giocatore quando fai formation entry
    const getEntryStatList = (entry: FormationEntry) => {
        const stats = entry.statsPlayers
            ? Object.values(entry.statsPlayers)
            : Object.keys(Array.from(new Set([...
                    Object.keys(entry.goalsByPlayer || {}),
                    ...Object.keys(entry.assistsByPlayer || {}),
                    ...Object.keys(entry.minutesByPlayer || {})
                ]))).map((playerId) => {
                    const player = Object.values(entry.assignedPositions).find(p => p.id === playerId);
                    return {
                        id: playerId,
                        name: player?.name || 'Giocatore',
                        goals: entry.goalsByPlayer[playerId] || 0,
                        assists: entry.assistsByPlayer?.[playerId] || 0,
                        minutes: entry.minutesByPlayer?.[playerId] || 0
                    };
                });
        return stats.filter(stat => stat.goals > 0 || stat.assists > 0 || stat.minutes > 0);
    };

    return (
        <div className="formazione-container">
            <h1 className="formazione-title">Gestione Formazione</h1>
            <div className="main-content">
                <div className="soccer-field">
                    {/* Markings */}
                    <div className="center-circle"></div><div className="center-line"></div><div className="center-spot"></div>
                    <div className="penalty-area-top"></div><div className="penalty-arc-top"></div>
                    <div className="penalty-area-bottom"></div><div className="penalty-arc-bottom"></div>

                    {formations[selectedFormation].map((pos) => {
                        const rawPlayer = activeFormation[pos.id];
                        const assignedPlayer = (rawPlayer && unavailableNames.includes(rawPlayer.name)) ? null : rawPlayer;
                        
                        return (
                            <div key={pos.id} style={{ position: 'absolute', top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}>
                                <div 
                                    className={`player-node ${isCoach ? 'editable' : 'read-only'} ${editingPosId === pos.id ? 'active' : ''}`}
                                    onClick={() => isCoach && setEditingPosId(editingPosId === pos.id ? null : pos.id)}
                                >
                                    {assignedPlayer ? (assignedPlayer.number || allPlayersRaw.find(p => p.id === assignedPlayer.id)?.number || pos.id) : pos.id}
                                    <span className="player-label">{assignedPlayer ? assignedPlayer.name : pos.role}</span>
                                </div>

                                {editingPosId === pos.id && (
                                    <div className="player-dropdown-menu">
                                        <div className="dropdown-header">Seleziona Giocatore</div>
                                        <div className="dropdown-list">
                                            <div className="dropdown-item empty" onClick={() => {
                                                const newForm = { ...activeFormation }; delete newForm[pos.id];
                                                setActiveFormation(newForm); setEditingPosId(null);
                                            }}>-- Rimuovi --</div>
                                            {allPlayers.map((p) => {
                                                const isTaken = playersOnFieldIds.includes(p.id) && assignedPlayer?.id !== p.id;
                                                return (
                                                    <div key={p.id} className={`dropdown-item ${isTaken ? 'disabled' : ''}`} onClick={() => !isTaken && handlePlayerSelect(pos.id, p)}>
                                                        <span className="player-num">{p.number || '?'}</span> {p.name}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="field-bench-divider" />

                <div className="side-panel">
                    <div className="selection-card">
                        <h2>Modulo</h2>
                        <select className="formation-select" value={selectedFormation} onChange={e => setSelectedFormation(e.target.value)} disabled={!isCoach}>
                            {Object.keys(formations).map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    <div className="bench-section">
                        <h2>Panchina</h2>
                        <div className="bench-vertical-list">
                            {benchPlayers.length === 0 ? <p className="bench-empty">Panchina vuota</p> : 
                                benchPlayers.map(p => (
                                    <div key={p.id} className="bench-item">
                                        <span className="bench-num">{p.number || '?'}</span>
                                        <span className="bench-name">{p.name}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div className="selection-card">
                        <h2>Salva Formazione</h2>
                        <p style={{ color: '#d1d5db', marginBottom: '16px' }}>
                            Apri il popup di salvataggio quando vuoi confermare la formazione e inserire le statistiche della partita.
                        </p>
                        <button
                            className="btn-submit"
                            style={{ width: '100%' }}
                            onClick={() => setIsSaveModalOpen(true)}
                            disabled={!isCoach}
                        >
                            Salva Formazione
                        </button>
                    </div>

                    {isSaveModalOpen && (
                        <div className="modal-overlay" onClick={() => setIsSaveModalOpen(false)}>
                            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Salva Formazione</h2>
                                    <button className="modal-close" onClick={() => setIsSaveModalOpen(false)}>×</button>
                                </div>
                                <label style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Avversario</label>
                                <input
                                    value={opponentName}
                                    onChange={(e) => setOpponentName(e.target.value)}
                                    placeholder="Nome squadra avversaria"
                                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px', color: 'white', marginBottom: '16px' }}
                                />
                                <div style={{ marginBottom: '15px' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Giocatori in campo e panchina (gol/assist/minuti)</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '10px', marginBottom: '10px', padding: '0 10px', color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <span>Giocatore</span>
                                        <span>Gol</span>
                                        <span>Assist</span>
                                        <span>Minuti</span>
                                    </div>
                                    {statsEligiblePlayers.length === 0 ? (
                                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Non ci sono giocatori disponibili.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
                                            {statsEligiblePlayers.map((player) => (
                                                <div key={player.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '10px' }}>
                                                    <span style={{ color: '#fff' }}>{player.name}</span>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Gol</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={goalsByPlayer[player.id] ?? 0}
                                                            onChange={(e) => {
                                                                const value = Math.max(0, parseInt(e.target.value) || 0);
                                                                setGoalsByPlayer(prev => ({ ...prev, [player.id]: value }));
                                                            }}
                                                            style={{ width: '70px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: 'white', padding: '8px' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Assist</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={assistsByPlayer[player.id] ?? 0}
                                                            onChange={(e) => {
                                                                const value = Math.max(0, parseInt(e.target.value) || 0);
                                                                setAssistsByPlayer(prev => ({ ...prev, [player.id]: value }));
                                                            }}
                                                            style={{ width: '70px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: 'white', padding: '8px' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Minuti</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={120}
                                                            value={minutesByPlayer[player.id] ?? 0}
                                                            onChange={(e) => {
                                                                const value = Math.max(0, Math.min(120, parseInt(e.target.value) || 0));
                                                                setMinutesByPlayer(prev => ({ ...prev, [player.id]: value }));
                                                            }}
                                                            style={{ width: '70px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: 'white', padding: '8px' }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', padding: '0 10px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.9rem', color: '#d1d5db' }}>Gol fatti</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={goalsFor}
                                            onChange={(e) => setGoalsFor(Math.max(0, parseInt(e.target.value) || 0))}
                                            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px', color: 'white' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.9rem', color: '#d1d5db' }}>Gol subiti</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={goalsAgainst}
                                            onChange={(e) => setGoalsAgainst(Math.max(0, parseInt(e.target.value) || 0))}
                                            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px', color: 'white' }}
                                        />
                                    </div>
                                </div>
                                <button
                                    className="btn-submit"
                                    style={{ width: '100%', marginBottom: '12px' }}
                                    onClick={() => { saveFormation(); setIsSaveModalOpen(false); }}
                                    disabled={!isCoach || !opponentName.trim()}
                                >
                                    {editingHistoryId ? 'Aggiorna Formazione' : 'Salva Formazione'}
                                </button>
                            </div>
                        </div>
                    )}

                    

                    <div className="selection-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ marginBottom: 0 }}>Storico Formazioni</h2>
                            <button
                                className="btn-submit"
                                style={{ padding: '8px 14px', fontSize: '0.95rem', minWidth: '120px' }}
                                onClick={() => setIsHistoryOpen(prev => !prev)}
                            >
                                {isHistoryOpen ? 'Nascondi' : 'Mostra'}
                            </button>
                        </div>
                        {isHistoryOpen ? (
                            formationHistory.length === 0 ? (
                                <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Nessuna formazione salvata.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {formationHistory.map((entry) => (
                                        <div key={entry.id} style={{ display: 'grid', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong style={{ display: 'block' }}>{entry.opponent}</strong>
                                                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{new Date(entry.date).toLocaleDateString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn-submit" style={{ padding: '6px 10px' }} onClick={() => loadHistoryEntry(entry)}>Modifica</button>
                                                    {isCoach && (
                                                        <button className="btn-cancel" style={{ padding: '6px 10px' }} onClick={() => deleteHistoryEntry(entry.id)}>Elimina</button>
                                                    )}
                                                </div>
                                            </div>
                                            {(() => {
                                                const statList = getEntryStatList(entry);
                                                return statList.length > 0 ? (
                                                    <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                                                        Marcatori/Assist: {statList.map(stat => `${stat.name} (${stat.minutes}m ${stat.goals}G ${stat.assists}A)`).join(', ')}
                                                    </div>
                                                ) : (
                                                    <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Nessun gol o assist</div>
                                                );
                                            })()}
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '12px' }}>
                                Storico chiuso. Clicca "Mostra" per consultarlo.
                            </p>
                        )}
                    </div>

                    <button className="nav-btn" style={{ width: '100%', marginTop: '20px' }} onClick={() => navigate('/')}>← Home</button>
                </div>
            </div>
        </div>
    );
}

export default Formazione;
