import { useNavigate } from 'react-router-dom';
import campoDaCalcio from '../campo da calcio.jpg';
import { useState, useEffect } from 'react';

function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ username: string, role: string, teamName?: string } | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            if (parsed.role === 'GUEST' || parsed.role === 'GIOCATORE') return;
        }

        fetch('http://localhost:8080/api/check-session', { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                if (data.success) {
                    const userData = { username: data.username, role: data.role, teamName: data.teamName };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } else {
                    navigate('/login');
                }
            })
            .catch(() => {
                if (!localStorage.getItem('user')) {
                    navigate('/login');
                }
            });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        fetch('http://localhost:8080/api/logout', { method: 'POST', credentials: 'include' });
        navigate('/login');
    };


    const allNavItems = [
        { path: '/formazione', label: 'Formazione', desc: 'Gestisci i titolari e le riserve per la prossima partita.', roles: ['ALLENATORE', 'MANAGER', 'MISTER', 'GIOCATORE', 'PLAYER'] },
        { path: '/rosa', label: 'Rosa', desc: 'Visualizza i giocatori attualmente nella tua squadra.', roles: ['ALLENATORE', 'MANAGER', 'MISTER', 'GIOCATORE', 'PLAYER', 'GUEST', 'USER'] },
        { path: '/infermeria', label: 'Infermeria', desc: 'Controlla lo stato degli infortunati e i tempi di recupero.', roles: ['ALLENATORE', 'MANAGER', 'MISTER', 'GIOCATORE', 'PLAYER'] },
        { path: '/squalifiche', label: 'Squalifiche', desc: 'Consulta l\'elenco dei giocatori squalificati e diffidati.', roles: ['ALLENATORE', 'MANAGER', 'MISTER', 'GIOCATORE', 'PLAYER'] },
        { path: '/calendario', label: 'Calendario', desc: 'Scopri i prossimi appuntamenti.', roles: ['ALLENATORE', 'MANAGER', 'MISTER', 'GIOCATORE', 'PLAYER', 'GUEST', 'USER'] },
        { path: '/statistiche-giocatore', label: 'Le Mie Statistiche', desc: 'Gestisci le tue performance e i tuoi dati stagionali.', roles: ['GIOCATORE', 'PLAYER'] },
        { path: '/statistiche-squadra', label: 'Statistiche Squadra', desc: 'Visualizza il rendimento e le classifiche dei giocatori per la stagione.', roles: ['ALLENATORE', 'MANAGER', 'MISTER', 'GIOCATORE', 'PLAYER', 'GUEST', 'USER'] },
    ];

    const navItems = allNavItems.filter(item => 
        user && item.roles.includes(user.role.toUpperCase())
    );

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <div className="bg-overlay" style={{ backgroundImage: `url(${campoDaCalcio})` }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="top-nav-actions">
                    {user ? (
                        <>
                            <span className="user-welcome">Ciao, {user.username} {user.teamName ? `(${user.teamName})` : ''}</span>
                            <button className="nav-btn" style={{ width: 'auto', padding: '8px 15px' }} onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <button className="nav-btn" style={{ width: 'auto', padding: '8px 15px' }} onClick={() => navigate('/login')}>Login</button>
                    )}
                </div>

                <div className="head">
                    <h1> Eleven Goal Manager </h1>
                    <hr className="separator" />
                    <div className="nav-grid">
                        {navItems.map((item, idx) => (
                            <div key={idx} className="nav-card">
                                <button className="nav-btn" onClick={() => navigate(item.path)}>{item.label}</button>
                                <p className="nav-desc">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="corpo"></div>
            </div>
        </div>
    );
}

export default Home;
