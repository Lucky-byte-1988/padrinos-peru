import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API, cld } from '../config';
import { LangContext } from '../App';
import VideoThread from '../VideoThread';
import Comments from '../Comments';
import PadrinoForm from '../PadrinoForm';
import { HeartIcon, ShareIcon, WhatsAppIcon } from '../Icons';
import Foto from '../Foto';

export default function FamilyDetail() {
  const { id } = useParams();
  const { t } = useContext(LangContext);
  const [nino, setNino] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState('mensajes'); // 'mensajes' | 'videos'
  const [noExiste, setNoExiste] = useState(false);

  useEffect(() => {
    setNino(null); setNoExiste(false);
    axios.get(`${API}/api/ninos/${id}`).then(r => {
      setNino(r.data); setLikes(r.data.likes || 0);
    }).catch(() => setNoExiste(true));
  }, [id]);

  const handleLike = () => {
    if (liked) return;
    setLiked(true); setLikes(l => l + 1);
    axios.post(`${API}/api/ninos/${id}/like`).then(r => setLikes(r.data.likes)).catch(() => {});
  };

  if (noExiste) return (
    <div className="form-page" style={{textAlign:'center'}}>
      <h2>Esta carta ya no está</h2>
      <p className="form-desc">Puede que el regalo ya se haya entregado. Hay más niños esperando su carta.</p>
      <Link to="/?f=sin" className="auth-submit" style={{display:'inline-block', textDecoration:'none', padding:'0.9rem 2rem'}}>Ver niños que buscan padrino</Link>
    </div>
  );
  if (!nino) return <p className="loading">Cargando…</p>;

  return (
    <div className="detail-wrapper">
      <Link to="/cartas" className="detail-back">‹ Cartas</Link>

      <div className="detail-post">
        {/* Header */}
        <div className="post-header">
          <Foto className="post-avatar" src={cld(nino.foto_familia, 'w_120,h_120,q_auto,f_auto,c_fill,g_face')} alt={nino.nombre}
            fallback={<div className="post-avatar-placeholder">🎁</div>} />
          <div className="post-meta">
            <div className="post-name">{nino.nombre}</div>
            <div className="post-location">{[nino.provincia, nino.region].filter(Boolean).join(', ')}{nino.edad ? ` · ${nino.edad} años` : ''}</div>
          </div>
          <span className={`post-badge ${nino.tiene_padrino || success ? 'con' : 'sin'}`}>
            {nino.tiene_padrino || success ? '✓ Apadrinado' : 'Busca padrino'}
          </span>
        </div>

        {/* Foto */}
        <Foto className="post-img" src={cld(nino.foto_familia, 'w_1000,q_auto,f_auto,c_limit')} alt={nino.nombre} />

        {/* Carta completa */}
        <div className="detail-carta-full">
          <h4>{t.detail_letter}</h4>
          <p>{nino.carta_texto}</p>
          {nino.carta_foto && (
            <Foto className="carta-handwritten" src={cld(nino.carta_foto, 'w_1000,q_auto,f_auto,c_limit')} alt="Carta escrita a mano" />
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
            <PadrinoForm ninoId={id} ninoNombre={nino.nombre} onSuccess={()=>setSuccess(true)} />
          </div>
        )}
        {success && <div className="success-msg" style={{margin:'0 1.8rem 1.4rem'}}>🎄 {t.godfather_success}</div>}

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
