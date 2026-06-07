import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LangContext } from '../App';

function CountdownNavidad() {
  const [t2, setT2] = useState({});
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const nav = new Date(now.getFullYear(), 11, 25);
      if (now > nav) nav.setFullYear(now.getFullYear() + 1);
      const d = nav - now;
      setT2({
        dias: Math.floor(d / 86400000),
        horas: Math.floor((d / 3600000) % 24),
        minutos: Math.floor((d / 60000) % 60),
        segundos: Math.floor((d / 1000) % 60),
      });
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="countdown">
      <p className="countdown-label">⏳ Faltan para Navidad</p>
      <div className="countdown-boxes">
        {[['dias','Días'],['horas','Hrs'],['minutos','Min'],['segundos','Seg']].map(([k,l]) => (
          <div className="countdown-box" key={k}>
            <span className="countdown-num">{String(t2[k]??0).padStart(2,'0')}</span>
            <span className="countdown-unit">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostCard({ n, t }) {
  const [likes, setLikes] = useState(n.likes || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    const res = await axios.post(`http://localhost:5003/api/ninos/${n.id}/like`);
    setLikes(res.data.likes);
    setLiked(true);
  };

  return (
    <div className="post">
      {/* Header */}
      <div className="post-header">
        {n.foto_familia
          ? <img className="post-avatar" src={n.foto_familia} alt={n.nombre}
              onError={e => { e.target.style.display='none'; }} />
          : <div className="post-avatar-placeholder">🎁</div>
        }
        <div className="post-meta">
          <div className="post-name">🎄 {n.nombre}</div>
          <div className="post-location">📍 {n.provincia}, {n.region} · {n.edad} años</div>
        </div>
        <span className={`post-badge ${n.tiene_padrino ? 'con' : 'sin'}`}>
          {n.tiene_padrino ? '✓ Apadrinado' : 'Busca padrino'}
        </span>
      </div>

      {/* Imagen */}
      {n.foto_familia && (
        <img className="post-img" src={n.foto_familia} alt={n.nombre}
          onError={e => { e.target.style.display='none'; }} />
      )}

      {/* Preview carta */}
      {n.carta_texto && (
        <div className="post-carta">
          "{n.carta_texto.substring(0, 120)}{n.carta_texto.length > 120 ? '...' : ''}"
        </div>
      )}

      {/* Acciones */}
      <div className="post-actions">
        <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <span>{liked ? '❤️' : '🤍'}</span> {likes}
        </button>
        <Link to={`/carta/${n.id}`} className="action-btn" style={{textDecoration:'none'}}>
          <span>💬</span> {n.num_comentarios}
        </Link>
        <a href={`https://api.whatsapp.com/send?text=🎅 Ayuda a ${n.nombre} esta Navidad: ${window.location.origin}/carta/${n.id}`}
          target="_blank" rel="noreferrer" className="action-btn" style={{textDecoration:'none'}}>
          <span>↗️</span> Compartir
        </a>
        {!n.tiene_padrino && (
          <Link to={`/carta/${n.id}`} className="action-btn-primary">❤️ Ser padrino</Link>
        )}
      </div>

      {n.num_comentarios > 0 && (
        <div className="post-comments-preview">
          <Link to={`/carta/${n.id}`} style={{color:'#666', textDecoration:'none'}}>
            Ver los {n.num_comentarios} comentario{n.num_comentarios !== 1 ? 's' : ''}
          </Link>
        </div>
      )}
    </div>
  );
}

const REGIONES_SIDEBAR = ['Cusco','Puno','Ayacucho','Huancavelica','Cajamarca','Apurímac','Huánuco','Pasco'];

export default function Home() {
  const { t } = useContext(LangContext);
  const [ninos, setNinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [region, setRegion] = useState('Todas');
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    axios.get('http://localhost:5003/api/ninos')
      .then(r => { setNinos(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtrados = ninos.filter(n => {
    const q = busqueda.toLowerCase();
    const matchQ = !q || n.nombre.toLowerCase().includes(q) || n.provincia?.toLowerCase().includes(q);
    const matchR = region === 'Todas' || n.region === region;
    const matchF = filtro === 'todos' || (filtro === 'sin' && !n.tiene_padrino) || (filtro === 'con' && n.tiene_padrino);
    return matchQ && matchR && matchF;
  });

  const sinPadrino = ninos.filter(n => !n.tiene_padrino).length;
  const regiones = [...new Set(ninos.map(n => n.region).filter(Boolean))].length;

  return (
    <>
      <div className="hero">
        <div className="hero-snow" />
        <h1>{t.hero_title}</h1>
        <p className="hero-tagline">{t.hero_tagline}</p>
        <p className="hero-sub">{t.hero_sub}</p>
        <CountdownNavidad />
        <div className="hero-btns">
          <a href="#feed" className="btn-gold">{t.hero_btn}</a>
          <Link to="/registrar" className="btn-outline">{t.hero_btn2}</Link>
        </div>
      </div>

      {!loading && (
        <div className="stats-bar">
          <div className="stat-item"><span className="stat-num">{ninos.length}</span><span className="stat-label">🎄 Cartas</span></div>
          <div className="stat-divider"/>
          <div className="stat-item"><span className="stat-num">{ninos.filter(n=>n.tiene_padrino).length}</span><span className="stat-label">❤️ Apadrinados</span></div>
          <div className="stat-divider"/>
          <div className="stat-item"><span className="stat-num" style={{color: sinPadrino > 0 ? '#e74c3c' : '#2ecc71'}}>{sinPadrino}</span><span className="stat-label">⏳ Esperando</span></div>
          <div className="stat-divider"/>
          <div className="stat-item"><span className="stat-num">{regiones}</span><span className="stat-label">📍 Regiones</span></div>
        </div>
      )}

      <div className="social-layout" id="feed">
        {/* FEED */}
        <div>
          {/* Stories */}
          <div className="stories-bar">
            <Link to="/registrar" className="story-add" title="Registrar niño">➕</Link>
            {ninos.slice(0, 8).map(n => (
              <Link to={`/carta/${n.id}`} className="story" key={n.id}>
                <div className="story-ring">
                  <img src={n.foto_familia || 'https://images.pexels.com/photos/1250452/pexels-photo-1250452.jpeg?w=60'}
                    alt={n.nombre} onError={e => { e.target.src='https://images.pexels.com/photos/1250452/pexels-photo-1250452.jpeg?w=60'; }} />
                </div>
                <span className="story-name">{n.nombre}</span>
              </Link>
            ))}
          </div>

          {/* Filtros */}
          <div className="filtros">
            <input className="filtro-buscar" placeholder="🔍 Buscar niño o provincia..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <div className="filtro-tabs">
              {[['todos','Todos'],['sin','Sin padrino'],['con','Con padrino']].map(([v,l]) => (
                <button key={v} className={`filtro-tab ${filtro===v?'active':''}`} onClick={() => setFiltro(v)}>{l}</button>
              ))}
            </div>
          </div>

          {loading ? <p className="loading">🎄 Cargando cartas...</p>
            : filtrados.length === 0 ? <p className="loading" style={{color:'#555'}}>Sin resultados.</p>
            : filtrados.map(n => <PostCard key={n.id} n={n} t={t} />)
          }
        </div>

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-card">
            <h3>📊 Resumen</h3>
            {[
              ['Total cartas', ninos.length],
              ['Apadrinados', ninos.filter(n=>n.tiene_padrino).length],
              ['Necesitan padrino', sinPadrino],
              ['Regiones', regiones],
            ].map(([l,v]) => (
              <div className="sidebar-stat" key={l}>
                <span className="sidebar-stat-label">{l}</span>
                <span className="sidebar-stat-val">{v}</span>
              </div>
            ))}
            <Link to="/registrar" className="sidebar-cta">🎄 Registrar niño</Link>
          </div>

          <div className="sidebar-card">
            <h3>📍 Por Región</h3>
            <div>
              {REGIONES_SIDEBAR.map(r => (
                <span key={r} className={`region-tag ${region===r?'active':''}`}
                  onClick={() => setRegion(region===r?'Todas':r)}>
                  {r}
                </span>
              ))}
              {region !== 'Todas' && (
                <span className="region-tag" onClick={() => setRegion('Todas')} style={{color:'#e74c3c'}}>✕ Limpiar</span>
              )}
            </div>
          </div>

          <div className="sidebar-card">
            <h3>❤️ ¿Quieres ayudar?</h3>
            <p style={{color:'#888', fontSize:'0.83rem', marginBottom:'0.8rem', lineHeight:1.6}}>
              Sé el padrino de un niño. Coordina directamente con la familia y haz realidad su Navidad.
            </p>
            <Link to="/mi-nino" className="sidebar-cta" style={{background:'linear-gradient(135deg,#8B0000,#c0392b)', color:'white'}}>
              Ver mi niño apadrinado
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
