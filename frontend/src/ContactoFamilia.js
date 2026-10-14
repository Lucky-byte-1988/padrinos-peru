import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API } from './config';
import { LangContext } from './i18n';
import { useAuth } from './AuthContext';

export default function ContactoFamilia({ ninoId, ninoNombre }) {
  const { t } = useContext(LangContext);
  const { user } = useAuth();
  const location = useLocation();
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  if (ok) {
    return <div className="success-msg" style={{ margin: 0 }}>{t.contact_success}</div>;
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return (
      <div className="contacto-familia">
        <h4>{t.detail_contact}</h4>
        <p>{t.contact_intro}</p>
        <Link to={`/login?next=${next}`} className="auth-submit contacto-login">
          {t.contact_login}
        </Link>
      </div>
    );
  }

  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    setError('');
    try {
      await axios.post(`${API}/api/ninos/${ninoId}/mensaje-privado`, {
        autor: user.displayName || user.email.split('@')[0],
        texto: texto.trim(),
      });
      setOk(true);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar. Inténtalo de nuevo.');
    }
    setEnviando(false);
  };

  return (
    <form className="contacto-familia" onSubmit={enviar}>
      <h4>{t.detail_contact}{ninoNombre ? ` · ${ninoNombre}` : ''}</h4>
      <p>{t.contact_intro}</p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={t.contact_placeholder}
        required
        rows={3}
      />
      {error && <div className="auth-error" role="alert">{error}</div>}
      <button className="auth-submit" disabled={enviando}>
        {enviando ? 'Enviando…' : t.contact_btn}
      </button>
    </form>
  );
}
