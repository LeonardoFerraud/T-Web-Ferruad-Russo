import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './SharedPages.css';

interface MatchPerformance {
    name: string;
    minutes: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    createdBy?: 'player' | 'mister';
}

interface SavedFormationPlayer {
    id: string;
    name: string;
    role?: string;
    position: string;
}

interface FormationEntry {
    id: string;
    opponent: string;
    date: string;
    selectedFormation: string;
    assignedPositions: Record<number, SavedFormationPlayer>;
}

interface PlayerStats {
    votoMedio: number;
    matchHistory: MatchPerformance[];
}

function StatisticheGiocatore() {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ username: string, role: string, teamName?: string } | null>(null);
    const [stats, setStats] = useState<PlayerStats>({
        votoMedio: 6.0,
        matchHistory: []
    });
    const [statsSource, setStatsSource] = useState<'player' | 'mister'>('player');
    const [roleUsage, setRoleUsage] = useState<Record<string, number>>({});

    // Form states
    const [newMatchName, setNewMatchName] = useState('');
    const [newMatchMinutes, setNewMatchMinutes] = useState(90);
    const [newMatchGoals, setNewMatchGoals] = useState(0);
    const [newMatchAssists, setNewMatchAssists] = useState(0);
    const [newMatchYellow, setNewMatchYellow] = useState(0);
    const [newMatchRed, setNewMatchRed] = useState(0);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            
            const statsKeys = [`stats_${parsedUser.username}`, `stats_db_${parsedUser.username}`];
            if (parsedUser.id) {
                statsKeys.unshift(`stats_${parsedUser.id}`);
            }

            for (const key of statsKeys) {
                const savedStats = localStorage.getItem(key);
                if (savedStats) {
                    const parsed = JSON.parse(savedStats);
                    setStats({
                        votoMedio: parsed.votoMedio || 6.0,
                        matchHistory: parsed.matchHistory || []
                    });
                    if (key.startsWith('stats_db_')) {
                        setStatsSource('mister');
                    } else {
                        setStatsSource('player');
                    }
                    break;
                }
            }

            const teamKey = parsedUser.teamName || 'default';
            const savedHistory = localStorage.getItem(`formation_history_${teamKey}`);
            if (savedHistory) {
                const parsedHistory = JSON.parse(savedHistory) as FormationEntry[];
                const usage = parsedHistory.reduce((acc, entry) => {
                    Object.values(entry.assignedPositions).forEach((player) => {
                        if (player.name === parsedUser.username) {
                            acc[player.position] = (acc[player.position] || 0) + 1;
                        }
                    });
                    return acc;
                }, {} as Record<string, number>);
                setRoleUsage(usage);
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const saveStats = (newStats: PlayerStats) => {
        const normalized = {
            ...newStats,
            matchHistory: newStats.matchHistory.map((m) => ({
                ...m,
                createdBy: m.createdBy || 'player'
            }))
        };
        setStats(normalized);
        if (user) {
            localStorage.setItem(`stats_${user.username}`, JSON.stringify(normalized));
        }
        setStatsSource('player');
    };

    const addMatch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMatchName.trim()) return;

        const newMatch: MatchPerformance = {
            name: newMatchName,
            minutes: newMatchMinutes,
            goals: newMatchGoals,
            assists: newMatchAssists,
            yellowCards: newMatchYellow,
            redCards: newMatchRed,
            createdBy: 'player'
        };

        const newHistory = [...stats.matchHistory, newMatch];
        saveStats({ ...stats, matchHistory: newHistory });
        
        // Reset form
        setNewMatchName('');
        setNewMatchMinutes(90);
        setNewMatchGoals(0);
        setNewMatchAssists(0);
        setNewMatchYellow(0);
        setNewMatchRed(0);
    };

    const canRemoveMatch = (match: MatchPerformance) => {
        if (match.createdBy) {
            return match.createdBy === 'player';
        }
        return statsSource === 'player';
    };

    const removeMatch = (index: number) => {
        const match = stats.matchHistory[index];
        if (!match || !canRemoveMatch(match)) return;
        const newHistory = stats.matchHistory.filter((_, i) => i !== index);
        saveStats({ ...stats, matchHistory: newHistory });
    };

    // Computed Totals
    const totals = stats.matchHistory.reduce((acc, curr) => ({
        goals: acc.goals + curr.goals,
        assists: acc.assists + curr.assists,
        yellowCards: acc.yellowCards + curr.yellowCards,
        redCards: acc.redCards + curr.redCards,
        presenze: acc.presenze + 1
    }), { goals: 0, assists: 0, yellowCards: 0, redCards: 0, presenze: 0 });

    // Custom Label for Chart
    const CustomLabel = (props: any) => {
        const { x, y, index } = props;
        const match = stats.matchHistory[index];
        if (!match) return null;

        const indicators = [];
        if (match.goals > 0) indicators.push(`⚽${match.goals > 1 ? match.goals : ''}`);
        if (match.assists > 0) indicators.push(`🅰️${match.assists > 1 ? match.assists : ''}`);
        if (match.yellowCards > 0) indicators.push(`🟨`);
        if (match.redCards > 0) indicators.push(`🟥`);

        if (indicators.length === 0) return null;

        return (
            <text x={x} y={y - 15} fill="#fff" fontSize={12} textAnchor="middle" fontWeight="bold">
                {indicators.join(' ')}
            </text>
        );
    };

    if (!user) return null;

    return (
        <div className="shared-page-container">
            <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>Le Mie Statistiche</h1>
            <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Area Personale di {user.username}.</p>

            {/* Grafico Andamento */}
            <div className="shared-card" style={{ marginBottom: '30px' }}>
                <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Minutaggio e Goal
                    <span style={{ fontSize: '0.9rem', color: '#9ca3af', fontWeight: 'normal' }}>Andamento Stagionale</span>
                </h2>
                
                <div style={{ width: '100%', height: 350, marginTop: '20px' }}>
                    {stats.matchHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.matchHistory} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[0, 110]} hide />
                                <Tooltip 
                                    contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#4ade80' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="minutes" 
                                    stroke="#4ade80" 
                                    strokeWidth={3} 
                                    fill="url(#colorMinutes)"
                                    label={<CustomLabel />}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                            Aggiungi i dati delle partite per visualizzare il grafico.
                        </div>
                    )}
                </div>
            </div>

            <div className="shared-card" style={{ marginBottom: '30px' }}>
                <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Heatmap Ruoli
                    <span style={{ fontSize: '0.9rem', color: '#9ca3af', fontWeight: 'normal' }}>Impiegato durante la stagione</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '20px' }}>
                    {Object.keys(roleUsage).length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', color: '#9ca3af', fontStyle: 'italic' }}>I ruoli verranno tracciati quando il mister salva le formazioni.</div>
                    ) : (
                        Object.entries(roleUsage).sort((a, b) => b[1] - a[1]).map(([role, count]) => {
                            const maxCount = Math.max(...Object.values(roleUsage), 1);
                            const intensity = Math.min(0.85, 0.25 + (count / maxCount) * 0.6);
                            return (
                                <div key={role} style={{ background: `rgba(74, 222, 128, ${intensity})`, borderRadius: '12px', padding: '15px', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>{role}</span>
                                    <span style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 'bold' }}>{count}</span>
                                    <span style={{ color: '#ecfccb', fontSize: '0.85rem' }}>{count === 1 ? 'Partita' : 'Partite'}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', width: '100%' }}>
                {/* Form Aggiunta Partita */}
                <div className="shared-card">
                    <h2 style={{ fontSize: '1.5rem' }}>Dati Match</h2>
                    <form onSubmit={addMatch} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input 
                            type="text" 
                            value={newMatchName} 
                            onChange={(e) => setNewMatchName(e.target.value)}
                            placeholder="Nome Match (es: Giornata 1)"
                            required
                            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px', color: 'white' }}
                        />
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Minuti: {newMatchMinutes}'</label>
                            <input type="range" min="0" max="90" value={newMatchMinutes} onChange={(e) => setNewMatchMinutes(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#4ade80' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Gol</label>
                                <input type="number" min="0" value={newMatchGoals} onChange={(e) => setNewMatchGoals(parseInt(e.target.value) || 0)} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Assist</label>
                                <input type="number" min="0" value={newMatchAssists} onChange={(e) => setNewMatchAssists(parseInt(e.target.value) || 0)} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px', color: 'white' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Gialli</label>
                                <input type="number" min="0" max="2" value={newMatchYellow} onChange={(e) => setNewMatchYellow(parseInt(e.target.value) || 0)} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Rossi</label>
                                <input type="number" min="0" max="1" value={newMatchRed} onChange={(e) => setNewMatchRed(parseInt(e.target.value) || 0)} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px', color: 'white' }} />
                            </div>
                        </div>

                        <button type="submit" className="btn-submit">Salva Match</button>
                    </form>
                </div>

                {/* Riepilogo Totale */}
                <div className="shared-card">
                    <h2 style={{ fontSize: '1.5rem' }}>Statistiche Totali</h2>
                    <div className="info-list" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: '25px' }}>
                        {[
                            { label: 'Presenze', val: totals.presenze, color: '#60a5fa' },
                            { label: 'Gol', val: totals.goals, color: '#4ade80' },
                            { label: 'Assist', val: totals.assists, color: '#a78bfa' },
                            { label: 'Gialli', val: totals.yellowCards, color: '#fbbf24' },
                            { label: 'Rossi', val: totals.redCards, color: '#ef4444' },
                        ].map(item => (
                            <div key={item.label} className="info-item" style={{ flexDirection: 'column', gap: '5px', textAlign: 'center' }}>
                                <span style={{ color: item.color, fontSize: '0.9rem', fontWeight: 'bold' }}>{item.label}</span>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{item.val}</span>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Lista Partite</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {stats.matchHistory.map((m, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                                <span>{m.name}</span>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{m.minutes}' | {m.goals}⚽ | {m.assists}🅰️</span>
                                    {canRemoveMatch(m) ? (
                                        <button onClick={() => removeMatch(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Elimina partita">✖</button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button className="nav-btn" style={{ width: 'auto', marginTop: '20px' }} onClick={() => navigate('/')}>
                ← Home Dashboard
            </button>
        </div>
    );
}

export default StatisticheGiocatore;
