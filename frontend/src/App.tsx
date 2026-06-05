import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Formazione from './pages/Formazione';
import Rosa from './pages/Rosa';
import Infermeria from './pages/Infermeria';
import Squalifiche from './pages/Squalifiche';
import Calendario from './pages/Calendario';
import StatisticheGiocatore from './pages/StatisticheGiocatore';
import StatisticheSquadra from './pages/StatisticheSquadra';

import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';
import './index.css';

function App() {
  useEffect(() => {
    // Clear 'Giocatore Provvisorio' from 'roster_data_Juventus'
    const key = 'roster_data_Juventus';
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const roster = JSON.parse(saved);
        let changed = false;
        ['attaccanti', 'difensori', 'centrocampisti', 'portieri'].forEach((cat) => {
          if (roster[cat]) {
            const originalLen = roster[cat].length;
            roster[cat] = roster[cat].filter((m: any) => m.name !== 'Giocatore Provvisorio');
            if (roster[cat].length !== originalLen) {
              changed = true;
            }
          }
        });
        if (changed) {
          localStorage.setItem(key, JSON.stringify(roster));
        }
      } catch (e) {
        console.error("Error cleaning up legacy stats:", e);
      }
    }
  }, []);
  return (
    <>
      <div className="main-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/formazione" element={<Formazione />} />
          <Route path="/rosa" element={<Rosa />} />
          <Route path="/infermeria" element={<Infermeria />} />
          <Route path="/squalifiche" element={<Squalifiche />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/statistiche-giocatore" element={<StatisticheGiocatore />} />
          <Route path="/statistiche-squadra" element={<StatisticheSquadra />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;