import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Calendario.css';

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

interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    description: string;
}

function Calendario() {
    const navigate = useNavigate();
    const teamKey = getTeamKey();
    
    // Inizializza il calendario al mese e anno correnti
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();
        const d = today.getDate();
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>(() => {
        const saved = localStorage.getItem(`calendario_events_${teamKey}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDesc, setNewEventDesc] = useState('');

    useEffect(() => {
        localStorage.setItem(`calendario_events_${teamKey}`, JSON.stringify(events));
    }, [events, teamKey]);

    //restituire il numero di giorni del mese e abbinarli al giorno della settimana (Lun-Dom)
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Lunedì come primo giorno della settimana
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    //creare la griglia del mese
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthNames = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];

    //restituire la data in forma standard
    const generateDateString = (y: number, m: number, d: number) => {
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

    const handleDayClick = (day: number) => {
        setSelectedDate(generateDateString(year, month, day));
    };

    const handleAddEvent = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !newEventTitle.trim()) return;

        const newEvent: CalendarEvent = {
            id: Date.now().toString(),
            date: selectedDate,
            title: newEventTitle,
            description: newEventDesc
        };

        setEvents([...events, newEvent]);
        setNewEventTitle('');
        setNewEventDesc('');
        setIsModalOpen(false);
    };

    const handleDeleteEvent = (id: string) => {
        setEvents(events.filter(ev => ev.id !== id));
    };

    const days = [];
    //cicli per impaginare le celle del calendario
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendario-day" style={{ visibility: 'hidden', border: 'none', background: 'transparent', boxShadow: 'none' }}></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = generateDateString(year, month, d);
        const dayEvents = events.filter(ev => ev.date === dateStr);
        const isSelected = selectedDate === dateStr;

        days.push(
            <div 
                key={d} 
                onClick={() => handleDayClick(d)}
                className={`calendario-day ${isSelected ? 'selected' : ''}`}
            >
                <div className="calendario-day-number">
                    {d}
                </div>
                <div className="calendario-events-dots">
                    {dayEvents.map(ev => (
                        <div key={ev.id} className="calendario-event-dot" title={ev.title} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="calendario-container">
            <h1 className="calendario-title">Calendario</h1>
            
            <div className="calendario-header">
                <button onClick={prevMonth} className="calendario-nav-btn">&larr; Prec.</button>
                <h2>{monthNames[month]} {year}</h2>
                <button onClick={nextMonth} className="calendario-nav-btn">Succ. &rarr;</button>
            </div>

            <div className="calendario-main-layout">
                <div className="calendario-grid">
                    {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
                        <div key={d} className="calendario-weekday">{d}</div>
                    ))}
                    {days}
                </div>

                {selectedDate && (
                    <div className="calendario-details">
                        <div className="calendario-details-header">
                            <h3>
                                Eventi del <span>{selectedDate.split('-').reverse().join('/')}</span>
                            </h3>
                            <button onClick={() => setIsModalOpen(true)} className="btn-add-event">
                                + Aggiungi Evento
                            </button>
                        </div>
                        
                        <div className="calendario-event-list">
                            {events.filter(ev => ev.date === selectedDate).length === 0 ? (
                                <p style={{ color: '#d1d5db', fontStyle: 'italic', margin: 0 }}>Nessun evento per questa data.</p>
                            ) : (
                                events.filter(ev => ev.date === selectedDate).map(ev => (
                                    <div key={ev.id} className="calendario-event-item">
                                        <div>
                                            <strong>{ev.title}</strong>
                                            {ev.description && <p>{ev.description}</p>}
                                        </div>
                                        <button onClick={() => handleDeleteEvent(ev.id)} className="btn-delete-event" title="Elimina evento">✖</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modale per l'inserimento / Popup */}
            {isModalOpen && (
                <div className="calendario-modal-overlay">
                    <div className="calendario-modal">
                        <div className="calendario-modal-header">
                            <h3>Nuovo Evento</h3>
                            <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">&times;</button>
                        </div>
                        <form onSubmit={handleAddEvent} className="calendario-form">
                            <div>
                                <label>Titolo</label>
                                <input 
                                    type="text" 
                                    placeholder="Es. Partita o Allenamento" 
                                    value={newEventTitle} 
                                    onChange={e => setNewEventTitle(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div>
                                <label>Descrizione</label>
                                <textarea 
                                    placeholder="Dettagli opzionali..." 
                                    value={newEventDesc} 
                                    onChange={e => setNewEventDesc(e.target.value)} 
                                    rows={3} 
                                />
                            </div>
                            <div className="calendario-form-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">
                                    Annulla
                                </button>
                                <button type="submit" className="btn-submit">
                                    Salva Evento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button className="btn-back" onClick={() => navigate('/')}>
                    Torna alla Home
                </button>
            </div>
        </div>
    );
}

export default Calendario;