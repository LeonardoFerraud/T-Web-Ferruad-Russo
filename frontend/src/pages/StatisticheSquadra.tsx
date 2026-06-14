import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './SharedPages.css';

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
}

interface PlayerAggregate {
    id: string;
    name: string;
    goals: number;
    assists: number;
    minutes: number;
    appearances: number;
}

const getSaved = <T,>(key: string, def: T): T => {
    const saved = localStorage.getItem(key);
    try {
        return saved ? (JSON.parse(saved) as T) : def;
    } catch {
        return def;
    }
};

//assegnare colore in base al risultato
const resultColor = (result: string) => {
    if (result === 'W') return '#22c55e';
    if (result === 'D') return '#fbbf24';
    return '#ef4444';
};

function StatisticheSquadra() {
    const navigate = useNavigate();
    const [formationHistory, setFormationHistory] = useState<FormationEntry[]>([]);
    const [roster, setRoster] = useState<RosterState>({ staff: [], portieri: [], difensori: [], centrocampisti: [], attaccanti: [] });

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            navigate('/login');
            return;
        }

        const parsed = JSON.parse(savedUser);
        const key = parsed.teamName || 'default';
        setRoster(getSaved<RosterState>(`roster_data_${key}`, { staff: [], portieri: [], difensori: [], centrocampisti: [], attaccanti: [] }));

        const fetchServerHistory = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/formations', {
                    method: 'GET',
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        const entries = data.map((formation: any) => {
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
                                id: formation.id?.toString() || `server-${Date.now()}`,
                                opponent: formation.opponent || payload.opponent || '',
                                date: formation.matchDate || payload.date || new Date().toISOString(),
                                selectedFormation: payload.selectedFormation || '4-4-2',
                                assignedPositions: payload.assignedPositions || {},
                                goalsByPlayer: payload.goalsByPlayer || {},
                                assistsByPlayer: payload.assistsByPlayer || {},
                                minutesByPlayer: payload.minutesByPlayer || {},
                                goalsFor: payload.goalsFor ?? 0,
                                goalsAgainst: payload.goalsAgainst ?? 0
                            };
                        });
                        const uniqueEntries = Object.values(entries.reduce((acc: Record<string, FormationEntry>, entry) => {
                            acc[entry.id] = entry;
                            return acc;
                        }, {}));
                        setFormationHistory(uniqueEntries);
                        localStorage.setItem(`formation_history_${key}`, JSON.stringify(entries));
                        return;
                    }
                }
            } catch {
                //se fallisce la fetch usa loc str
            }

            setFormationHistory(getSaved<FormationEntry[]>(`formation_history_${key}`, []));
        };

        fetchServerHistory();
    }, [navigate]);

    const allPlayers = useMemo(() => {
        return [...roster.portieri, ...roster.difensori, ...roster.centrocampisti, ...roster.attaccanti];
    }, [roster]);

    const matchResults = useMemo(() => {
        return [...formationHistory]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((entry, index) => {
                const goalsFor = entry.goalsFor ?? 0;
                const goalsAgainst = entry.goalsAgainst ?? 0;
                const result = goalsFor > goalsAgainst ? 'W' : goalsFor < goalsAgainst ? 'L' : 'D';
                return {
                    id: entry.id,
                    label: entry.opponent || `Match ${index + 1}`,
                    date: new Date(entry.date).toLocaleDateString(),
                    opponent: entry.opponent,
                    goalsFor,
                    goalsAgainst,
                    result,
                    resultValue: result === 'W' ? 1 : result === 'D' ? 0.5 : -1,
                    summary: `${goalsFor}-${goalsAgainst}`
                };
            });
    }, [formationHistory]);

    const resultsSummary = useMemo(() => {
        const summary = { W: 0, D: 0, L: 0, goalsFor: 0, goalsAgainst: 0 };
        matchResults.forEach((match) => {
            summary[match.result as 'W' | 'D' | 'L'] += 1;
            summary.goalsFor += match.goalsFor;
            summary.goalsAgainst += match.goalsAgainst;
        });
        return summary;
    }, [matchResults]);

    const playerAggregates = useMemo(() => {
        const map: Record<string, PlayerAggregate> = {};
        formationHistory.forEach((entry) => {
            const playerIds = new Set<string>([
                ...Object.keys(entry.goalsByPlayer || {}),
                ...Object.keys(entry.assistsByPlayer || {}),
                ...Object.keys(entry.minutesByPlayer || {})
            ]);

            playerIds.forEach((playerId) => {
                const goals = entry.goalsByPlayer?.[playerId] ?? 0;
                const assists = entry.assistsByPlayer?.[playerId] ?? 0;
                const minutes = entry.minutesByPlayer?.[playerId] ?? 0;
                const assigned = Object.values(entry.assignedPositions).find(p => p.id === playerId);
                const existing = map[playerId] ?? {
                    id: playerId,
                    name: assigned?.name || allPlayers.find((p) => p.id === playerId)?.name || 'Giocatore',
                    goals: 0,
                    assists: 0,
                    minutes: 0,
                    appearances: 0
                };

                existing.goals += goals;
                existing.assists += assists;
                existing.minutes += minutes;
                if (minutes > 0) existing.appearances += 1;
                map[playerId] = existing;
            });
        });
        return Object.values(map);
    }, [formationHistory, allPlayers]);

    const topMinutes = useMemo(() => [...playerAggregates].sort((a, b) => b.minutes - a.minutes).slice(0, 8), [playerAggregates]);
    const topGoals = useMemo(() => [...playerAggregates].sort((a, b) => b.goals - a.goals).slice(0, 8), [playerAggregates]);
    const topAssists = useMemo(() => [...playerAggregates].sort((a, b) => b.assists - a.assists).slice(0, 8), [playerAggregates]);
    const topContributions = useMemo(() => [...playerAggregates]
        .map((player) => ({ ...player, contribution: player.goals + player.assists }))
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 8), [playerAggregates]);

    const noData = formationHistory.length === 0;

    return (
        <div className="shared-page-container">
            <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>Statistiche Squadra</h1>
            <p style={{ color: '#9ca3af', marginBottom: '20px', maxWidth: '860px', textAlign: 'center' }}>
                Queste classifiche sono calcolate direttamente dalle partite salvate nella sezione Formazione. Mostrarono minuti giocati, marcatori, assistman e contributo totale, insieme al trend stagionale.
            </p>

            <div className="shared-card" style={{ width: '100%', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: '220px' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Record Stagionale</h2>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            <div style={{ color: '#fff' }}>Partite salvate: <strong>{formationHistory.length}</strong></div>
                            <div style={{ color: '#22c55e' }}>Vittorie: <strong>{resultsSummary.W}</strong></div>
                            <div style={{ color: '#fbbf24' }}>Pareggi: <strong>{resultsSummary.D}</strong></div>
                            <div style={{ color: '#ef4444' }}>Sconfitte: <strong>{resultsSummary.L}</strong></div>
                            <div style={{ color: '#9ca3af' }}>Gol fatti: <strong>{resultsSummary.goalsFor}</strong></div>
                            <div style={{ color: '#9ca3af' }}>Gol subiti: <strong>{resultsSummary.goalsAgainst}</strong></div>
                        </div>
                    </div>
                    <div style={{ minWidth: '220px' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Trend</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {matchResults.slice(-5).map((item) => (
                                <span key={item.id} style={{ padding: '10px 12px', borderRadius: '999px', background: resultColor(item.result), color: '#0f172a', fontWeight: 700, minWidth: '70px', textAlign: 'center' }}>
                                    {item.result} {item.summary}
                                </span>
                            ))}
                            {matchResults.length === 0 && <span style={{ color: '#9ca3af' }}>Nessun dato</span>}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '28px', minHeight: '340px' }}>
                    {noData ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                            Nessun match salvato. Vai su Formazione e salva una partita con gol fatti e subiti.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={340}>
                            <BarChart data={matchResults} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                                <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis hide domain={[-1.1, 1.1]} />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px' }}
                                    labelStyle={{ color: '#9ca3af' }}
                                    formatter={(value: any, name: any) => {
                                        if (name === 'resultValue') return ['Risultato', ''];
                                        return [value, name];
                                    }}
                                    labelFormatter={(label) => `Partita: ${label}`}
                                />
                                <Bar dataKey="resultValue" radius={[10, 10, 0, 0]}>
                                    {matchResults.map((entry) => (
                                        <Cell key={entry.id} fill={resultColor(entry.result)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="shared-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div>
                    <h2>Classifica Minuti</h2>
                    {topMinutes.length === 0 ? (
                        <p style={{ color: '#9ca3af' }}>Ancora nessun dato.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px', color: '#fff' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', fontWeight: 700, color: '#9ca3af' }}>
                                <span>Giocatore</span>
                                <span style={{ textAlign: 'right' }}>Minuti</span>
                            </div>
                            {topMinutes.map((player) => (
                                <div key={player.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <span>{player.name}</span>
                                    <span style={{ textAlign: 'right' }}>{player.minutes} min</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2>Classifica Marcatori</h2>
                    {topGoals.length === 0 ? (
                        <p style={{ color: '#9ca3af' }}>Ancora nessun gol registrato.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px', color: '#fff' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', fontWeight: 700, color: '#9ca3af' }}>
                                <span>Giocatore</span>
                                <span style={{ textAlign: 'right' }}>Gol</span>
                            </div>
                            {topGoals.map((player) => (
                                <div key={player.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <span>{player.name}</span>
                                    <span style={{ textAlign: 'right' }}>{player.goals}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2>Classifica Assistman</h2>
                    {topAssists.length === 0 ? (
                        <p style={{ color: '#9ca3af' }}>Ancora nessun assist registrato.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px', color: '#fff' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', fontWeight: 700, color: '#9ca3af' }}>
                                <span>Giocatore</span>
                                <span style={{ textAlign: 'right' }}>Assist</span>
                            </div>
                            {topAssists.map((player) => (
                                <div key={player.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <span>{player.name}</span>
                                    <span style={{ textAlign: 'right' }}>{player.assists}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2>Classifica Goal+Assist</h2>
                    {topContributions.length === 0 ? (
                        <p style={{ color: '#9ca3af' }}>Inserisci alcune partite per vedere la classifica.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px', color: '#fff' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', fontWeight: 700, color: '#9ca3af' }}>
                                <span>Giocatore</span>
                                <span style={{ textAlign: 'right' }}>Totale</span>
                            </div>
                            {topContributions.map((player) => (
                                <div key={player.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <span>{player.name}</span>
                                    <span style={{ textAlign: 'right' }}>{player.goals + player.assists}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <button className="nav-btn" style={{ marginTop: '30px' }} onClick={() => navigate('/')}>
                Torna a Home
            </button>
        </div>
    );
}

export default StatisticheSquadra;
