import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API, cld } from '../config';
import { LangContext } from '../App';
import VideoThread from '../VideoThread';
import Comments from '../Comments';
import { useAuth } from '../AuthContext';
import { HeartIcon, ShareIcon, WhatsAppIcon } from '../Icons';

export default function FamilyDetail() {
  const { id } = useParams();
  const { t } = useContext(LangContext);
  const { user } = useAuth();
  const [nino, setNino] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [padrinoForm, setPadrinoForm] = useState({ nombre: '', email: '', pais: '' });
  const [success, setSuccess] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [msgForm, setMsgForm] = useState({ autor: '', email: '', texto: '' });
  const [msgEnviado, setMsgEnviado] = useState(false);
  const [msgEnviando, setMsgEnviando] = useState(false);
  const [tab, setTab] = useState('mensajes'); // 'mensajes' | 'videos'

  const handleMensajePrivado = async e => {
    e.preventDefault();
    setMsgEnviando(true);
    await axios.post(`${API}/api/ninos/${id}/mensaje-privado`, msgForm);
    setMsgEnviando(false); setMsgEnviado(true);
    setMsgForm({ autor: '', email: '', texto: '' });
  };

  useEffect(() => {
    axios.get(`${API}/api/ninos/${id}`).then(r => {
      setNino(r.data); setLikes(r.data.likes || 0);
    });
  }, [id]);

  const handleLike = async () => {
    if (liked) return;
    const res = await axios.post(`${API}/api/ninos/${id}/like`);
    setLikes(res.data.likes); setLiked(true);
  };

  const handlePadrino = async e => {
    e.preventDefault();
    setEnviando(true);
    // Si está logueado, su email de cuenta es el oficial (para vincular en "Mi niño")
    const email = user?.email || padrinoForm.email;
    const nombre = padrinoForm.nombre || user?.displayName || '';
    await axios.post(API+'/api/padrinos', { ...padrinoForm, nombre, email, nino_id: parseInt(id) });
    setEnviando(false); setSuccess(true);
    setNino(prev => ({ ...prev, tiene_padrino: true }));
  };

  if (!nino) return <p className="loading">🎄 Cargando...</p>;

  const videoEmbed = nino.video_url
    ? nino.video_url.replace('watch?v=','embed/').replace('youtu.be/','youtube.com/embed/')
    : null;

  return (
    <div className="detail-wrapper">
      <Link to="/" style={{color:'#666', textDecoration:'none', fontSize:'0.85rem', display:'block', marginBottom:'1rem'}}>
        ← Volver al feed
      </Link>

      <div className="detail-post">
        {/* Header */}
        <div className="post-header">
          {nino.foto_familia
            ? <img className="post-avatar" src={cld(nino.foto_familia, 'w_120,h_120,q_auto,f_auto,c_fill,g_face')} alt={nino.nombre} />
            : <div className="post-avatar-placeholder">🎁</div>
          }
          <div className="post-meta">
            <div className="post-name">{nino.nombre}</div>
            <div className="post-location">{nino.provincia}, {nino.region} · {nino.edad} años · {nino.fecha}</div>
          </div>
          <span className={`post-badge ${nino.tiene_padrino ? 'con' : 'sin'}`}>
            {nino.tiene_padrino ? '✓ Apadrinado' : 'Busca padrino'}
          </span>
        </div>

        {/* Foto */}
        {nino.foto_familia && (
          <img className="post-img" src={cld(nino.foto_familia, 'w_1000,q_auto,f_auto,c_limit')} alt={nino.nombre} />
        )}

        {/* Carta completa */}
        <div className="detail-carta-full">
          <h4>{t.detail_letter}</h4>
          <p>{nino.carta_texto}</p>
          {nino.carta_foto && (
            <img className="carta-handwritten" src={cld(nino.carta_foto, 'w_1000,q_auto,f_auto,c_limit')} alt="Carta escrita a mano" />
          )}
        </div>

        {/* Acciones estilo Instagram */}
        <div className="ig-actions">
          <div className="ig-actions-left">
            <button className={`ig-btn ${liked?'liked':''}`} onClick={handleLike} aria-label="Me gusta">
              <HeartIcon filled={liked} />
            </button>
            <a href={`https://api.whatsapp.com/send?text=🎅 Ayuda a ${nino.nombre}: ${window.location.href}`}
              target="_blank" rel="noreferrer" className="ig-btn" aria-label="Compartir">
              <ShareIcon />
            </a>
            {nino.whatsapp && (
              <a href={`https://wa.me/51${nino.whatsapp}`} target="_blank" rel="noreferrer" className="ig-btn" aria-label="Contactar por WhatsApp">
                <WhatsAppIcon />
              </a>
            )}
          </div>
        </div>
        <div className="ig-likes">{likes.toLocaleString('es')} me gusta</div>

        {/* Ser padrino (CTA principal) */}
        {!nino.tiene_padrino && !success && (
          <div className="godfather-form">
            <h4>{t.godfather_title}</h4>
            <form onSubmit={handlePadrino}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem', marginBottom:'0.8rem'}}>
                <div className="form-group" style={{marginBottom:0}}>
                  <label>{t.godfather_name}</label>
                  <input value={padrinoForm.nombre} onChange={e=>setPadrinoForm({...padrinoForm,nombre:e.target.value})} required />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label>{t.godfather_country}</label>
                  <input value={padrinoForm.pais} onChange={e=>setPadrinoForm({...padrinoForm,pais:e.target.value})} placeholder="Perú, España..." />
                </div>
              </div>
              <div className="form-group">
                <label>{t.godfather_email}</label>
                <input type="email" value={padrinoForm.email} onChange={e=>setPadrinoForm({...padrinoForm,email:e.target.value})} required />
              </div>
              <button className="submit-btn" disabled={enviando}>{enviando ? '⏳...' : t.godfather_btn}</button>
            </form>
          </div>
        )}
        {success && <div className="success-msg" style={{margin:'0 1.8rem 1.4rem'}}>🎄 {t.godfather_success}</div>}

        {/* Mensaje privado a la familia */}
        <div style={{margin:'0 1.8rem 1.6rem'}}>
          {!showMsg && !msgEnviado && (
            <button className="msg-priv-btn" onClick={() => setShowMsg(true)}>
              Enviar mensaje privado a la familia
            </button>
          )}
          {showMsg && !msgEnviado && (
            <form className="msg-priv-form" onSubmit={handleMensajePrivado}>
              <h4>Mensaje privado para la familia de {nino.nombre}</h4>
              <p className="msg-priv-hint">Solo la familia y el equipo lo verán. No aparece en el muro público.</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'0.6rem'}}>
                <input className="msg-priv-input" placeholder="Tu nombre" required
                  value={msgForm.autor} onChange={e=>setMsgForm({...msgForm,autor:e.target.value})} />
                <input className="msg-priv-input" type="email" placeholder="Tu email (para que te respondan)"
                  value={msgForm.email} onChange={e=>setMsgForm({...msgForm,email:e.target.value})} />
              </div>
              <textarea className="msg-priv-input" rows="3" placeholder="Escribe tu mensaje privado…" required
                value={msgForm.texto} onChange={e=>setMsgForm({...msgForm,texto:e.target.value})} style={{resize:'vertical'}} />
              <div style={{display:'flex', gap:'0.6rem', marginTop:'0.6rem'}}>
                <button type="button" className="msg-priv-cancel" onClick={()=>setShowMsg(false)}>Cancelar</button>
                <button type="submit" className="msg-priv-send" disabled={msgEnviando}>
                  {msgEnviando ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </div>
            </form>
          )}
          {msgEnviado && (
            <div className="success-msg" style={{margin:0}}>💌 Tu mensaje privado fue enviado a la familia.</div>
          )}
        </div>

        {/* Pestañas: Mensajes / Videos (todo ordenado y limpio) */}
        <div className="detail-tabs">
          <button className={`detail-tab ${tab==='mensajes'?'active':''}`} onClick={()=>setTab('mensajes')}>
            Mensajes
          </button>
          <button className={`detail-tab ${tab==='videos'?'active':''}`} onClick={()=>setTab('videos')}>
            Videos
          </button>
        </div>

        {tab === 'mensajes'
          ? <Comments ninoId={id} />
          : <div style={{margin:'0 1.8rem 1.8rem'}}>
              <VideoThread ninoId={id} ninoNombre={nino.nombre} videoInicial={nino.video_url} />
            </div>
        }
      </div>
    </div>
  );
}
