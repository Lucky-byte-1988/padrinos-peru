import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API, cld } from '../config';
import { LangContext } from '../App';
import Reveal from '../Reveal';
import StoryViewer from '../StoryViewer';
import Modal from '../Modal';
import Comments from '../Comments';
import PadrinoForm from '../PadrinoForm';
import { HeartIcon, CommentIcon, ShareIcon, LetterIcon, WhatsAppIcon, GiftIcon } from '../Icons';

function HowItWorks() {
  const pasos = [
    { n: '01', icon: '✍️', t: 'El niño escribe su carta', d: 'La familia registra al niño y comparte su carta a Papá Noel, con foto y video.' },
    { n: '02', icon: '🌎', t: 'El mundo la descubre', d: 'Personas de todo el planeta leen su historia, la comparten y dejan mensajes de aliento.' },
    { n: '03', icon: '🎁', t: 'Un padrino la hace realidad', d: 'Alguien se convierte en su padrino y coordina directamente para cumplir su sueño de Navidad.' },
  ];
  return (
    <section className="how">
      <Reveal><h2 className="how-title">Cómo funciona</h2></Reveal>
      <Reveal delay={80}><p className="how-sub">Tres pasos para cambiar una Navidad para siempre.</p></Reveal>
      <div className="how-grid">
        {pasos.map((p, i) => (
          <Reveal key={p.n} delay={i * 140} className="how-card">
            <span className="how-num">{p.n}</span>
            <span className="how-icon">{p.icon}</span>
            <h3 className="how-card-title">{p.t}</h3>
            <p className="how-card-desc">{p.d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

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
  const [modal, setModal] = useState(null); // 'carta' | 'comentarios' | 'padrino' | null
  const [tienePadrino, setTienePadrino] = useState(n.tiene_padrino);

  const handleLike = async () => {
    if (liked) return;
    const res = await axios.post(`${API}/api/ninos/${n.id}/like`);
    setLikes(res.data.likes);
    setLiked(true);
  };

  return (
    <div className="post">
      {/* Header */}
      <div className="post-header">
        {n.foto_familia
          ? <img className="post-avatar" src={cld(n.foto_familia, 'w_120,h_120,q_auto,f_auto,c_fill,g_face')} alt={n.nombre}
              onError={e => { e.target.style.display='none'; }} />
          : <div className="post-avatar-placeholder">🎁</div>
        }
        <div className="post-meta">
          <div className="post-name">🎄 {n.nombre}</div>
          <div className="post-location">📍 {n.provincia}, {n.region} · {n.edad} años</div>
        </div>
        <span className={`post-badge ${tienePadrino ? 'con' : 'sin'}`}>
          {tienePadrino ? '✓ Apadrinado' : 'Busca padrino'}
        </span>
      </div>

      {/* Imagen */}
      {n.foto_familia && (
        <img className="post-img" src={cld(n.foto_familia)} alt={n.nombre}
          loading="lazy"
          onError={e => { e.target.style.display='none'; }} />
      )}

      {/* Preview carta */}
      {n.carta_texto && (
        <div className="post-carta">
          "{n.carta_texto.substring(0, 120)}{n.carta_texto.length > 120 ? '...' : ''}"
        </div>
      )}

      {/* Acciones estilo Instagram — abren ventanitas (popups) */}
      <div className="ig-actions">
        <div className="ig-actions-left">
          <button className={`ig-btn ${liked ? 'liked' : ''}`} onClick={handleLike} aria-label="Me gusta">
            <HeartIcon filled={liked} />
          </button>
          <button className="ig-btn" onClick={() => setModal('comentarios')} aria-label="Mensajes">
            <CommentIcon />
          </button>
          {!tienePadrino && (
            <button className="ig-btn" onClick={() => setModal('padrino')} aria-label="Ser padrino" title="Ser su padrino">
              <GiftIcon />
            </button>
          )}
          {n.whatsapp && (
            <a href={`https://wa.me/51${n.whatsapp}`} target="_blank" rel="noreferrer" className="ig-btn" aria-label="Contactar por WhatsApp">
              <WhatsAppIcon />
            </a>
          )}
          <a href={`https://api.whatsapp.com/send?text=🎅 Ayuda a ${n.nombre} esta Navidad: ${window.location.origin}/carta/${n.id}`}
            target="_blank" rel="noreferrer" className="ig-btn" aria-label="Compartir">
            <ShareIcon />
          </a>
        </div>
        <button className="ig-btn" onClick={() => setModal('carta')} aria-label="Ver carta" title="Ver carta"><LetterIcon /></button>
      </div>

      {/* VENTANITAS EMERGENTES */}
      <Modal open={modal==='carta'} onClose={()=>setModal(null)} title={`Carta de ${n.nombre}`}>
        {n.foto_familia && (
          <img src={cld(n.foto_familia, 'w_700,q_auto,f_auto,c_limit')} alt={n.nombre}
            style={{width:'100%', borderRadius:16, marginBottom:'1rem', maxHeight:'40vh', objectFit:'cover'}} />
        )}
        <p style={{fontSize:'1.05rem', lineHeight:1.7, color:'var(--ink)'}}>"{n.carta_texto}"</p>
        {n.carta_foto && (
          <img src={cld(n.carta_foto, 'w_700,q_auto,f_auto,c_limit')} alt="Carta a mano"
            style={{width:'100%', borderRadius:14, marginTop:'1rem'}} />
        )}
        <p style={{color:'var(--ink-faint)', fontSize:'0.85rem', marginTop:'0.8rem'}}>
          📍 {n.provincia}, {n.region} · {n.edad} años
        </p>
        <Link to={`/carta/${n.id}`} className="auth-submit" style={{display:'block', textAlign:'center', textDecoration:'none', marginTop:'1rem'}}>
          Ver videos y más →
        </Link>
      </Modal>

      <Modal open={modal==='comentarios'} onClose={()=>setModal(null)} title="Mensajes" sheet>
        <Comments ninoId={n.id} />
      </Modal>

      <Modal open={modal==='padrino'} onClose={()=>setModal(null)} title={`Ser padrino de ${n.nombre}`}>
        <PadrinoForm ninoId={n.id} ninoNombre={n.nombre} onSuccess={()=>setTienePadrino(true)} />
      </Modal>

      {/* Conteo de me gusta */}
      <div className="ig-likes">{likes.toLocaleString('es')} me gusta</div>

      {/* Comentarios */}
      {n.num_comentarios > 0 && (
        <div className="post-comments-preview">
          <button onClick={()=>setModal('comentarios')} style={{background:'none', border:'none', padding:0, cursor:'pointer', color:'var(--ink-soft)', fontFamily:'inherit', fontSize:'0.88rem'}}>
            Ver los {n.num_comentarios} mensaje{n.num_comentarios !== 1 ? 's' : ''}
          </button>
        </div>
      )}
      <div style={{paddingBottom:'1rem'}} />
    </div>
  );
}

const REGIONES_SIDEBAR = ['Cusco','Puno','Ayacucho','Huancavelica','Cajamarca','Apurímac','Huánuco','Pasco'];

export default function Home() {
  const { t } = useContext(LangContext);
  const [ninos, setNinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [storyIdx, setStoryIdx] = useState(null);
  const [region, setRegion] = useState('Todas');
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    axios.get(API+'/api/ninos')
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
        <div className="hero-orb orb-1" />
        <div className="hero-orb orb-2" />
        <div className="hero-orb orb-3" />
        <span className="hero-eyebrow"><span className="dot" /> {t.hero_eyebrow}</span>
        <h1>{t.hero_tagline}<br /><span className="accent">{t.hero_title}</span></h1>
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

      <HowItWorks />

      <div className="social-layout" id="feed">
        {/* FEED */}
        <div>
          {/* Stories — al tocar se abren como historias de Instagram */}
          <div className="stories-bar">
            <Link to="/registrar" className="story" title="Registrar niño">
              <div className="story-add"><span>＋</span></div>
              <span className="story-name">Agregar</span>
            </Link>
            {ninos.slice(0, 12).map((n, i) => (
              <button type="button" className="story" key={n.id} onClick={() => setStoryIdx(i)}>
                <div className="story-ring">
                  <img src={cld(n.foto_familia, 'w_140,h_140,q_auto,f_auto,c_fill,g_face') || 'https://images.pexels.com/photos/1250452/pexels-photo-1250452.jpeg?w=60'}
                    alt={n.nombre} onError={e => { e.target.src='https://images.pexels.com/photos/1250452/pexels-photo-1250452.jpeg?w=60'; }} />
                </div>
                <span className="story-name">{n.nombre}</span>
              </button>
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
            : filtrados.map((n, i) => <Reveal key={n.id} delay={Math.min(i, 5) * 90}><PostCard n={n} t={t} /></Reveal>)
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

      {/* CTA de cierre cinematográfico */}
      <section className="cta-final">
        <div className="cta-orb cta-orb-1" />
        <div className="cta-orb cta-orb-2" />
        <Reveal>
          <h2 className="cta-title">Esta Navidad, sé el milagro de un niño.</h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="cta-sub">
            Cada carta es real. Cada niño espera. Un gesto tuyo puede cambiarlo todo.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div className="cta-btns">
            <a href="#feed" className="cta-btn-white">{t.hero_btn}</a>
            <Link to="/registrar" className="cta-btn-ghost">{t.hero_btn2}</Link>
          </div>
        </Reveal>
      </section>

      {storyIdx !== null && (
        <StoryViewer
          ninos={ninos.slice(0, 12)}
          startIndex={storyIdx}
          onClose={() => setStoryIdx(null)}
        />
      )}
    </>
  );
}
