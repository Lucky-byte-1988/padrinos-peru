import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API, cld } from '../config';
import { LangContext } from '../App';
import VideoThread from '../VideoThread';
import Comments from '../Comments';
import PadrinoForm from '../PadrinoForm';
import { HeartIcon, ShareIcon, WhatsAppIcon } from '../Icons';

export default function FamilyDetail() {
  const { id } = useParams();
  const { t } = useContext(LangContext);
  const [nino, setNino] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState('mensajes'); // 'mensajes' | 'videos'

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
