import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import RegisterFamily from './pages/RegisterFamily';
import FamilyDetail from './pages/FamilyDetail';
import Admin from './pages/Admin';
import PadrinoPanel from './pages/PadrinoPanel';
import Nosotros from './pages/Nosotros';
import { translations } from './i18n';
import './App.css';

export const LangContext = React.createContext();

function App() {
  const [lang, setLang] = useState('es');
  const t = translations[lang];

  return (
    <LangContext.Provider value={{ lang, t }}>
      <Router>
        <nav className="navbar">
          <Link to="/" className="nav-brand"><span className="brand-mark">✉</span> {t.title}<span className="brand-dot">.pe</span></Link>
          <div className="nav-links">
            <Link to="/">{t.nav_home}</Link>
            <Link to="/registrar">{t.nav_registro}</Link>
            <Link to="/nosotros">{lang === 'es' ? 'Nosotros' : 'About'}</Link>
            <Link to="/mi-nino">{lang === 'es' ? 'Mi niño' : 'My child'}</Link>
            <Link to="/admin">{t.nav_admin}</Link>
            <button className="lang-btn" onClick={() => setLang(lang === 'es' ? 'en' : 'es')}>
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registrar" element={<RegisterFamily />} />
          <Route path="/carta/:id" element={<FamilyDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/mi-nino" element={<PadrinoPanel />} />
          <Route path="/nosotros" element={<Nosotros />} />
        </Routes>
        <footer className="footer">{t.footer}</footer>
      </Router>
    </LangContext.Provider>
  );
}

export default App;
