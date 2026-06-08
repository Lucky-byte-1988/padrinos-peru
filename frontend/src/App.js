import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import RegisterFamily from './pages/RegisterFamily';
import FamilyDetail from './pages/FamilyDetail';
import Admin from './pages/Admin';
import PadrinoPanel from './pages/PadrinoPanel';
import Nosotros from './pages/Nosotros';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './AuthContext';
import { translations } from './i18n';
import './App.css';

export const LangContext = React.createContext();

function SessionButton() {
  const { user, salir } = useAuth();
  const navigate = useNavigate();
  if (user) {
    const inicial = (user.displayName || user.email || '?')[0].toUpperCase();
    return (
      <div className="session-box">
        <span className="session-avatar" title={user.displayName || user.email}>{inicial}</span>
        <button className="session-logout" onClick={() => { salir(); navigate('/'); }}>Salir</button>
      </div>
    );
  }
  return <Link to="/login" className="session-login">Iniciar sesión</Link>;
}

function Nav() {
  const { lang, setLang, t } = React.useContext(LangContext);
  return (
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
        <SessionButton />
      </div>
    </nav>
  );
}

function App() {
  const [lang, setLang] = useState('es');
  const t = translations[lang];

  return (
    <AuthProvider>
      <LangContext.Provider value={{ lang, setLang, t }}>
        <Router>
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registrar" element={<RegisterFamily />} />
            <Route path="/carta/:id" element={<FamilyDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/mi-nino" element={<PadrinoPanel />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/login" element={<Login />} />
          </Routes>
          <footer className="footer">{t.footer}</footer>
        </Router>
      </LangContext.Provider>
    </AuthProvider>
  );
}

export default App;
