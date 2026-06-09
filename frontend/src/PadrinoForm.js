import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API } from './config';
import { useAuth } from './AuthContext';

export default function PadrinoForm({ ninoId, ninoNombre, onSuccess }) {
  const { user } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ nombre: '', pais: '' });
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const nombre = form.nombre || user?.displayName || '';
    await axios.post(`${API}/api/padrinos`, { ...form, nombre, email: user.email, nino_id: parseInt(ninoId) });
    setEnviando(false); setOk(true);
    if (onSuccess) onSuccess();
  };

  if (ok) return (
    <div className="success-msg" style={{margin:0}}>
      🎄 ¡Gracias! Ahora eres el padrino de {ninoNombre}. Nos pondremos en contacto contigo.
    </div>
  );

  // Si NO ha iniciado sesión → pedir que inicie sesión primero.
  // Al volver, su correo aparecerá automáticamente en la casilla.
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return (
      <div style={{textAlign:'center', padding:'0.5rem 0'}}>
        <p style={{color:'var(--ink)', fontSize:'1.05rem', fontWeight:600, marginBottom:'0.5rem'}}>
          Inicia sesión para apadrinar a {ninoNombre}
        </p>
        <p style={{color:'var(--ink-soft)', fontSize:'0.92rem', marginBottom:'1.4rem', lineHeight:1.5}}>
          Necesitas una cuenta para apadrinar. Al iniciar sesión, tu correo se usará automáticamente y podrás ver a tu niño en "Mi niño".
        </p>
        <Link to={`/login?next=${next}`} className="auth-submit" style={{display:'inline-block', textDecoration:'none', padding:'0.9rem 2.2rem'}}>
          Iniciar sesión para continuar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <p style={{color:'var(--ink-soft)', fontSize:'0.92rem', marginBottom:'1.1rem'}}>
        Conviértete en el padrino de <strong>{ninoNombre}</strong> y coordina para hacer realidad su Navidad.
      </p>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.7rem', marginBottom:'0.7rem'}}>
        <input className="auth-input" placeholder="Tu nombre" required style={{marginBottom:0}}
          value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} />
        <input className="auth-input" placeholder="Tu país" style={{marginBottom:0}}
          value={form.pais} onChange={e=>setForm({...form, pais:e.target.value})} />
      </div>
      {/* Correo de la cuenta: automático y bloqueado */}
      <label style={{display:'block', fontSize:'0.8rem', color:'var(--ink-soft)', margin:'0 0 0.35rem 0.2rem'}}>Tu correo (de tu cuenta)</label>
      <input className="auth-input" type="email" value={user.email} disabled readOnly
        style={{background:'var(--gray-bg)', color:'var(--ink-soft)'}} />
      <button className="auth-submit" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Quiero ser su padrino'}
      </button>
    </form>
  );
}
