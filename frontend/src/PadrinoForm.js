import React, { useState } from 'react';
import axios from 'axios';
import { API } from './config';
import { useAuth } from './AuthContext';

export default function PadrinoForm({ ninoId, ninoNombre, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ nombre: '', email: '', pais: '' });
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const email = user?.email || form.email;
    const nombre = form.nombre || user?.displayName || '';
    await axios.post(`${API}/api/padrinos`, { ...form, nombre, email, nino_id: parseInt(ninoId) });
    setEnviando(false); setOk(true);
    if (onSuccess) onSuccess();
  };

  if (ok) return (
    <div className="success-msg" style={{margin:0}}>
      🎄 ¡Gracias! Ahora eres el padrino de {ninoNombre}. Nos pondremos en contacto contigo.
    </div>
  );

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
      <input className="auth-input" type="email" placeholder="Tu email" required
        value={user?.email || form.email} disabled={!!user?.email}
        onChange={e=>setForm({...form, email:e.target.value})} />
      <button className="auth-submit" disabled={enviando}>
        {enviando ? 'Enviando…' : '❤️ Quiero ser su padrino'}
      </button>
    </form>
  );
}
