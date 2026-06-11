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

function StepAnim({ type }) {
  if (type === 'carta') {
    return (
      <svg className="stepanim" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="paperG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff"/><stop offset="100%" stopColor="#fff1f2"/>
          </linearGradient>
          <linearGradient id="pencilG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185"/><stop offset="100%" stopColor="#e11d48"/>
          </linearGradient>
          <filter id="softSh" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#e11d48" floodOpacity="0.18"/>
          </filter>
        </defs>
        <g filter="url(#softSh)">
          <rect x="26" y="24" width="62" height="78" rx="10" fill="url(#paperG)" stroke="#fbcfd6" strokeWidth="1.5"/>
        </g>
        <line className="ln ln1" x1="38" y1="44" x2="76" y2="44" stroke="#f9a8b4" strokeWidth="3.5" strokeLinecap="round"/>
        <line className="ln ln2" x1="38" y1="58" x2="76" y2="58" stroke="#f9a8b4" strokeWidth="3.5" strokeLinecap="round"/>
        <line className="ln ln3" x1="38" y1="72" x2="62" y2="72" stroke="#f9a8b4" strokeWidth="3.5" strokeLinecap="round"/>
        <path className="seal" d="M57 88 a5 5 0 0 1 7 0 a5 5 0 0 1 7 0 q0 5 -7 9 q-7 -4 -7 -9 Z" fill="#e11d48"/>
        <g className="pencil">
          <rect x="-5" y="-30" width="9" height="34" rx="3.5" fill="url(#pencilG)" transform="rotate(42)"/>
          <rect x="-5" y="-30" width="9" height="6" rx="2" fill="#fbbf24" transform="rotate(42)"/>
          <polygon points="0,0 6,2.5 2.5,8" fill="#fcd9b6" transform="rotate(42)"/>
          <polygon points="1.4,3.2 3.4,4 2,6" fill="#3b2a1f" transform="rotate(42)"/>
        </g>
      </svg>
    );
  }
  if (type === 'mundo') {
    return (
      <svg className="stepanim" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <radialGradient id="globeG" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#7dd3fc"/>
            <stop offset="55%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#1e40af"/>
          </radialGradient>
          <clipPath id="globeClip"><circle cx="60" cy="60" r="30"/></clipPath>
          <filter id="globeSh" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1e40af" floodOpacity="0.30"/>
          </filter>
        </defs>
        <circle className="ring r1" cx="60" cy="60" r="30" fill="none" stroke="#60a5fa" strokeWidth="2.5"/>
        <circle className="ring r2" cx="60" cy="60" r="30" fill="none" stroke="#60a5fa" strokeWidth="2.5"/>
        <g filter="url(#globeSh)">
          <circle cx="60" cy="60" r="30" fill="url(#globeG)"/>
        </g>
        <g clipPath="url(#globeClip)">
          <g className="globe-spin">
            <path d="M44 46 q8 -6 16 -2 q6 3 4 9 q-3 6 -10 5 q-8 -1 -11 -6 q-2 -4 1 -6 Z" fill="#34d399" opacity="0.9"/>
            <path d="M66 66 q9 -3 14 3 q3 5 -2 9 q-7 4 -13 0 q-5 -4 -3 -8 q1 -3 4 -4 Z" fill="#34d399" opacity="0.9"/>
            <path d="M40 72 q6 -2 9 2 q2 4 -2 6 q-6 2 -9 -2 q-2 -4 2 -6 Z" fill="#6ee7b7" opacity="0.85"/>
            <ellipse cx="60" cy="60" rx="12" ry="30" fill="none" stroke="#bfdbfe" strokeWidth="1.4" opacity="0.6"/>
            <ellipse cx="60" cy="60" rx="24" ry="30" fill="none" stroke="#bfdbfe" strokeWidth="1.4" opacity="0.45"/>
          </g>
          <line x1="30" y1="60" x2="90" y2="60" stroke="#bfdbfe" strokeWidth="1.4" opacity="0.5"/>
          <ellipse cx="50" cy="48" rx="12" ry="8" fill="#ffffff" opacity="0.28"/>
        </g>
        <g className="orbit">
          <g transform="translate(60,18)">
            <path className="pin-beat" d="M0 -3 a3.5 3.5 0 0 1 5 0 a3.5 3.5 0 0 1 5 0 q0 4 -5 7 q-5 -3 -5 -7 Z" fill="#ef4444"/>
          </g>
        </g>
      </svg>
    );
  }
  return (
    <svg className="stepanim" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="boxG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb7185"/><stop offset="100%" stopColor="#e11d48"/>
        </linearGradient>
        <linearGradient id="bowG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f43f5e"/><stop offset="100%" stopColor="#be123c"/>
        </linearGradient>
        <filter id="giftSh" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#e11d48" floodOpacity="0.30"/>
        </filter>
      </defs>
      <g filter="url(#giftSh)">
        <rect x="34" y="58" width="52" height="42" rx="8" fill="url(#boxG)" stroke="#fb7185" strokeWidth="1.5"/>
        <rect x="55" y="58" width="10" height="42" fill="url(#bowG)"/>
      </g>
      <g className="lid">
        <rect x="30" y="48" width="60" height="16" rx="6" fill="url(#bowG)"/>
        <rect x="55" y="48" width="10" height="16" fill="#9f1239"/>
        <path d="M60 48 C45 28 28 42 52 48 M60 48 C75 28 92 42 68 48" fill="none" stroke="#e11d48" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="60" cy="46" r="4" fill="#fb7185"/>
      </g>
      <g className="sparkles">
        <path className="sp s1" d="M30 40 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6 Z" fill="#fbbf24"/>
        <path className="sp s2" d="M92 46 l1.3 3.2 l3.2 1.3 l-3.2 1.3 l-1.3 3.2 l-1.3 -3.2 l-3.2 -1.3 l3.2 -1.3 Z" fill="#fb7185"/>
        <path className="sp s3" d="M60 24 l1.8 4.4 l4.4 1.8 l-4.4 1.8 l-1.8 4.4 l-1.8 -4.4 l-4.4 -1.8 l4.4 -1.8 Z" fill="#fbbf24"/>
      </g>
    </svg>
  );
}

function HowItWorks() {
  const pasos = [
    { n: '01', anim: 'carta', t: 'El niño escribe su carta', d: 'La familia registra al niño y comparte su carta a Papá Noel, con foto y video.' },
    { n: '02', anim: 'mundo', t: 'El mundo la descubre', d: 'Personas de todo el planeta leen su historia, la comparten y dejan mensajes de aliento.' },
    { n: '03', anim: 'regalo', t: 'Un padrino la hace realidad', d: 'Alguien se convierte en su padrino y coordina directamente para cumplir su sueño de Navidad.' },
  ];
  return (
    <section className="how">
      <Reveal><h2 className="how-title">Cómo funciona</h2></Reveal>
      <Reveal delay={80}><p className="how-sub">Tres pasos para cambiar una Navidad para siempre.</p></Reveal>
      <div className="how-grid">
        {pasos.map((p, i) => (
          <Reveal key={p.n} delay={i * 140} className="how-card">
            <span className="how-num">{p.n}</span>
            <div className="how-anim"><StepAnim type={p.anim} /></div>
            <h3 className="how-card-title">{p.t}</h3>
            <p className="how-card-desc">{p.d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Testimonios() {
  const items = [
    { ini: 'M', color: '#e11d48', texto: 'Apadrinar a Lucía fue la mejor decisión de mi Navidad. Ver su carita al recibir su mochila no tiene precio.', nombre: 'María G.', rol: 'Madrina · Madrid, España' },
    { ini: 'C', color: '#2563eb', texto: 'Como familia agradecemos esta plataforma. Mi hijo Josué recibió sus zapatillas y un mensaje hermoso de su padrino.', nombre: 'Carmen M.', rol: 'Mamá · Azángaro, Puno' },
    { ini: 'J', color: '#f59e0b', texto: 'Vivo en USA y siempre quise ayudar en mi país. Aquí puedo ver al niño, su carta y coordinar directo. Transparente y real.', nombre: 'Jorge R.', rol: 'Padrino · Nueva Jersey, EE.UU.' },
  ];
  return (
    <section className="testi">
      <Reveal><h2 className="testi-title">Historias que ya cambiaron una Navidad</h2></Reveal>
      <Reveal delay={80}><p className="testi-sub">Lo que dicen padrinos y familias de CartasANoel</p></Reveal>
      <div className="testi-grid">
        {items.map((it, i) => (
          <Reveal key={i} delay={i * 120} className="testi-card">
            <p className="testi-quote">"{it.texto}"</p>
            <div className="testi-author">
              <span className="testi-avatar" style={{ background: it.color }}>{it.ini}</span>
              <div>
                <div className="testi-name">{it.nombre}</div>
                <div className="testi-role">{it.rol}</div>
              </div>
            </div>
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
      <p className="countdown-label">Faltan para Navidad</p>
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
          <div className="post-name">{n.nombre}</div>
          <div className="post-location">{n.provincia}, {n.region} · {n.edad} años</div>
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
        <p style={{fontSize:'1.08rem', lineHeight:1.7, color:'var(--ink)'}}>"{n.carta_texto}"</p>
        {n.carta_foto && (
          <>
            <p style={{color:'var(--ink-faint)', fontSize:'0.78rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'1.2rem 0 0.5rem'}}>Carta escrita a mano</p>
            <img src={cld(n.carta_foto, 'w_700,q_auto,f_auto,c_limit')} alt="Carta a mano"
              style={{width:'100%', borderRadius:14}} />
          </>
        )}
        {n.video_url && (
          <>
            <p style={{color:'var(--ink-faint)', fontSize:'0.78rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'1.2rem 0 0.5rem'}}>Video del niño</p>
            <video src={n.video_url} controls playsInline preload="metadata"
              style={{width:'100%', borderRadius:14, background:'#000', maxHeight:'50vh'}} />
          </>
        )}
        <p style={{color:'var(--ink-faint)', fontSize:'0.85rem', marginTop:'1rem'}}>
          {n.provincia}, {n.region} · {n.edad} años
        </p>
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
            <h3>Resumen</h3>
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
            <Link to="/registrar" className="sidebar-cta">Registrar niño</Link>
          </div>

          <div className="sidebar-card">
            <h3>Por Región</h3>
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
            <h3>¿Quieres ayudar?</h3>
            <p style={{color:'#888', fontSize:'0.83rem', marginBottom:'0.8rem', lineHeight:1.6}}>
              Sé el padrino de un niño. Coordina directamente con la familia y haz realidad su Navidad.
            </p>
            <Link to="/mi-nino" className="sidebar-cta" style={{background:'var(--gray-bg)', color:'var(--red)'}}>
              Ver mi niño apadrinado
            </Link>
          </div>
        </aside>
      </div>

      <Testimonios />

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
