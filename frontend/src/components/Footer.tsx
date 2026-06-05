import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : null;

    const handleDeleteAccount = () => {
        if (!user) return;
        const confirmDelete = window.confirm(
            "Sei sicuro di voler eliminare definitivamente il tuo account? Questa azione è irreversibile e rimuoverà tutte le tue informazioni dal database."
        );
        if (!confirmDelete) return;

        fetch(`http://localhost:8080/api/users/${user.username}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            if (data.success) {
                // Remove player from local shared roster
                const teamKey = user.teamName || 'default';
                const rosterKey = `roster_data_${teamKey}`;
                const rosterSaved = localStorage.getItem(rosterKey);
                if (rosterSaved) {
                    try {
                        const rosterObj = JSON.parse(rosterSaved);
                        let changed = false;
                        ['attaccanti', 'difensori', 'centrocampisti', 'portieri', 'staff'].forEach((cat) => {
                            if (rosterObj[cat]) {
                                const originalLen = rosterObj[cat].length;
                                rosterObj[cat] = rosterObj[cat].filter((m: any) => m.name !== user.username);
                                if (rosterObj[cat].length !== originalLen) {
                                    changed = true;
                                }
                            }
                        });
                        if (changed) {
                            localStorage.setItem(rosterKey, JSON.stringify(rosterObj));
                        }
                    } catch (e) {
                        // ignore
                    }
                }
                
                // Clear statistics
                localStorage.removeItem(`stats_${user.username}`);
                
                // Logout and redirect
                localStorage.removeItem('user');
                alert("Account eliminato definitivamente.");
                navigate('/login');
                window.location.reload();
            } else {
                alert(data.message || "Errore durante l'eliminazione dell'account.");
            }
        })
        .catch(() => {
            alert("Impossibile connettersi al server per eliminare l'account.");
        });
    };

    const sections = [
        {
            title: 'Link Rapidi',
            links: [
                { href: '/', label: 'Home' },
                { href: '/formazione', label: 'Formazione' },
                { href: '/rosa', label: 'Rosa' },
                { href: '/statistiche-squadra', label: 'Statistiche Squadra' },
                { href: '/calendario', label: 'Calendario' },
            ]
        },
        {
            title: 'Risorse',
            links: [

                { href: '/infermeria', label: 'Infermeria' },
                { href: '/squalifiche', label: 'Squalifiche' },
            ]
        }
    ];

    const socials = [
        { label: 'FB', name: 'Facebook' },
        { label: 'IG', name: 'Instagram' },
        { label: 'X', name: 'X' },
        { label: 'GH', name: 'GitHub' },
    ];

    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-section branding">
                    <h2 className="footer-logo">Eleven Goal Manager</h2>
                    <p className="footer-tagline">
                        La piattaforma definitiva per la gestione della tua squadra di calcio.
                    </p>
                </div>

                {sections.map((section, idx) => (
                    <div key={idx} className="footer-section">
                        <h3>{section.title}</h3>
                        <ul>
                            {section.links.map((link, lIdx) => (
                                <li key={lIdx}><a href={link.href}>{link.label}</a></li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div className="footer-section social">
                    <h3>Seguici</h3>
                    <div className="social-icons">
                        {socials.map((social, idx) => (
                            <a key={idx} href="#" aria-label={social.name} className="social-icon">{social.label}</a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} Eleven Goal Manager. Tutti i diritti riservati.</p>
                <p className="footer-credits">
                    Creato con ❤️ per gli appassionati di calcio.
                    {user && user.role !== 'GUEST' && user.username !== 'Giocatore Provvisorio' && user.username !== 'Ospite' && (
                        <button onClick={handleDeleteAccount} className="footer-delete-btn">
                            • Elimina Account
                        </button>
                    )}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
