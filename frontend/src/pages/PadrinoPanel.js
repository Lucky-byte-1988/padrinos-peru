import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API, cld } from '../config';
import { useAuth } from '../AuthContext';

function etiquetaEstado(n) {
  if (n.estado === 'rechazado') return n.motivo_rechazo ? `No publicada: ${n.motivo_rechazo}` : 'No publicada';
  if (n.estado === 'pendiente') return 'En revisión';
  return 'Publicada';
}

function NinoMini({ n, modo }) {
  const estadoClase = n.estado === 'aprobado' ? 'badge-si' : n.estado === 'rechazado' ? 'badge-no' : 'badge-wait';
  return (
    <Link to={`/carta/${n.id}`} className="mini-card">
      {n.carta_foto
        ? <img src={cld(n.carta_foto, 'w_160,h_160,q_auto,f_auto,c_fill')} alt={`Carta de ${n.nombre}`} />
        : <div className="mini-ph">{(n.nombre || '?')[0]}</div>}
      <div className="mini-body">
        <div className="mini-name">{n.nombre}</div>
        <div className="mini-loc">{n.provincia}, {n.region}{n.edad ? ` · ${n.edad} años` : ''}</div>
        {modo === 'familia' ? (
          <span className={estadoClase} style={{display:'inline-block', marginTop:'0.45rem'}}>{etiquetaEstado(n)}</span>
        ) : (
          <span className="post-badge con" style={{display:'inline-block', marginTop:'0.45rem'}}>
            {n.mi_rol === 'madrina' ? 'Eres su madrina' : 'Eres su padrino'}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function PadrinoPanel() {
  const { user, rol, loading } = useAuth();
  const [apadrinados, setApadrinados] = useState([]);
  const [misNinos, setMisNinos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!user) { setCargando(false); return; }
    Promise.all([
      axios.get(`${API}/api/mis-apadrinados`).then(r => setApadrinados(r.data)).catch(()=>{}),
      axios.get(`${API}/api/mis-ninos`).then(r => setMisNinos(r.data)).catch(()=>{}),
    ]).finally(() => setCargando(false));
  }, [user]);

  if (loading) return <p className="loading">Cargando…</p>;

  // No logueado
  if (!user) {
    return (
      <div className="form-page" style={{textAlign:'center'}}>
        <div style={{fontSize:'3.5rem', marginBottom:'0.5rem'}}>🔒</div>
        <h2>Tu espacio personal</h2>
        <p className="form-desc">Inicia sesión para ver a los niños que apadrinaste o las cartas que registraste.</p>
        <Link to="/login" className="auth-submit" style={{display:'inline-block', textDecoration:'none', padding:'0.9rem 2rem'}}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const esFamilia = rol === 'familia';

  return (
    <div className="panel-personal">
      <div className="panel-hero">
        <div className="panel-avatar">{(user.displayName || user.email)[0].toUpperCase()}</div>
        <div>
          <h1>Hola, {user.displayName || user.email.split('@')[0]} 👋</h1>
          <p>{esFamilia ? 'Panel de Familia' : 'Panel de Padrino'} · {user.email}</p>
        </div>
      </div>

      {cargando ? <p className="loading">Cargando tu información…</p> : (
        <>
          {/* Para PADRINOS: niños que apadrinó */}
          {!esFamilia && (
            <section className="panel-sec">
              <h2>❤️ Mis niños apadrinados ({apadrinados.length})</h2>
              {apadrinados.length === 0 ? (
                <div className="panel-empty">
                  <p>Aún no apadrinas a ningún niño.</p>
                  <Link to="/" className="auth-submit" style={{display:'inline-block', textDecoration:'none', padding:'0.8rem 1.6rem', marginTop:'0.6rem'}}>
                    Ver cartas y apadrinar
                  </Link>
                </div>
              ) : (
                <div className="mini-grid">{apadrinados.map(n => <NinoMini key={n.id} n={n} modo="padrino" />)}</div>
              )}
            </section>
          )}

          {/* Para FAMILIAS: niños que registró */}
          {esFamilia && (
            <section className="panel-sec">
              <h2>👨‍👩‍👧 Mis cartas registradas ({misNinos.length})</h2>
              {misNinos.length === 0 ? (
                <div className="panel-empty">
                  <p>Aún no has registrado a ningún niño.</p>
                  <Link to="/registrar" className="auth-submit" style={{display:'inline-block', textDecoration:'none', padding:'0.8rem 1.6rem', marginTop:'0.6rem'}}>
                    Registrar un niño
                  </Link>
                </div>
              ) : (
                <div className="mini-grid">{misNinos.map(n => <NinoMini key={n.id} n={n} modo="familia" />)}</div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
