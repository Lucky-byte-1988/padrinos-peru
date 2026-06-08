import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API, cld } from '../config';
import { useAuth } from '../AuthContext';

function NinoMini({ n }) {
  return (
    <Link to={`/carta/${n.id}`} className="mini-card">
      {n.foto_familia
        ? <img src={cld(n.foto_familia, 'w_160,h_160,q_auto,f_auto,c_fill,g_face')} alt={n.nombre} />
        : <div className="mini-ph">🎁</div>}
      <div className="mini-body">
        <div className="mini-name">{n.nombre}</div>
        <div className="mini-loc">📍 {n.provincia}, {n.region} · {n.edad} años</div>
        <span className={`post-badge ${n.tiene_padrino ? 'con' : 'sin'}`} style={{display:'inline-block', marginTop:'0.4rem'}}>
          {n.tiene_padrino ? '✓ Apadrinado' : 'Busca padrino'}
        </span>
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
    const email = encodeURIComponent(user.email);
    Promise.all([
      axios.get(`${API}/api/mis-apadrinados?email=${email}`).then(r => setApadrinados(r.data)).catch(()=>{}),
      axios.get(`${API}/api/mis-ninos?email=${email}`).then(r => setMisNinos(r.data)).catch(()=>{}),
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
                <div className="mini-grid">{apadrinados.map(n => <NinoMini key={n.id} n={n} />)}</div>
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
                <div className="mini-grid">{misNinos.map(n => <NinoMini key={n.id} n={n} />)}</div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
