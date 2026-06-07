import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { LangContext } from '../App';
import VideoThread from '../VideoThread';

export default function FamilyDetail() {
  const { id } = useParams();
  const { t } = useContext(LangContext);
  const [nino, setNino] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comForm, setComForm] = useState({ autor: '', pais: '', texto: '' });
  const [padrinoForm, setPadrinoForm] = useState({ nombre: '', email: '', pais: '' });
  const [success, setSuccess] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5003/api/ninos/${id}`).then(r => {
      setNino(r.data); setLikes(r.data.likes || 0);
    });
    axios.get(`http://localhost:5003/api/ninos/${id}/comentarios`).then(r => setComentarios(r.data));
  }, [id]);

  const handleLike = async () => {
    if (liked) return;
    const res = await axios.post(`http://localhost:5003/api/ninos/${id}/like`);
    setLikes(res.data.likes); setLiked(true);
  };

  const handleComment = async e => {
    e.preventDefault();
    if (!comForm.texto.trim()) return;
    await axios.post(`http://localhost:5003/api/ninos/${id}/comentarios`, comForm);
    const res = await axios.get(`http://localhost:5003/api/ninos/${id}/comentarios`);
    setComentarios(res.data);
    setComForm({ autor: '', pais: '', texto: '' });
  };

  const handlePadrino = async e => {
    e.preventDefault();
    setEnviando(true);
    await axios.post('http://localhost:5003/api/padrinos', { ...padrinoForm, nino_id: parseInt(id) });
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
            ? <img className="post-avatar" src={nino.foto_familia} alt={nino.nombre} />
            : <div className="post-avatar-placeholder">🎁</div>
          }
          <div className="post-meta">
            <div className="post-name">🎄 {nino.nombre}</div>
            <div className="post-location">📍 {nino.provincia}, {nino.region} · {nino.edad} años · {nino.fecha}</div>
          </div>
          <span className={`post-badge ${nino.tiene_padrino ? 'con' : 'sin'}`}>
            {nino.tiene_padrino ? '✓ Apadrinado' : 'Busca padrino'}
          </span>
        </div>

        {/* Foto */}
        {nino.foto_familia && (
          <img className="post-img" src={nino.foto_familia} alt={nino.nombre}
            style={{maxHeight:450}} />
        )}

        {/* Carta completa */}
        <div className="detail-carta-full">
          <h4>📜 {t.detail_letter}</h4>
          <p>{nino.carta_texto}</p>
          {nino.carta_foto && (
            <img className="carta-handwritten" src={nino.carta_foto} alt="Carta escrita a mano" />
          )}
        </div>

        {/* Hilo de videos estilo TikTok */}
        <div style={{margin:'0 1.4rem 1.4rem'}}>
          <VideoThread ninoId={id} ninoNombre={nino.nombre} videoInicial={nino.video_url} />
        </div>

        {/* WhatsApp */}
        {nino.whatsapp && (
          <a href={`https://wa.me/51${nino.whatsapp}`} target="_blank" rel="noreferrer" className="wa-contact">
            <span style={{fontSize:'1.6rem'}}>💬</span>
            <div>
              <div style={{fontWeight:'bold', fontSize:'0.9rem'}}>Contactar familia por WhatsApp</div>
              <div style={{opacity:0.7, fontSize:'0.78rem'}}>+51 {nino.whatsapp}</div>
            </div>
          </a>
        )}

        {/* Acciones */}
        <div className="post-actions" style={{borderTop:'1px solid #1a1a1a'}}>
          <button className={`action-btn ${liked?'liked':''}`} onClick={handleLike}>
            <span>{liked?'❤️':'🤍'}</span> {likes}
          </button>
          <span className="action-btn" style={{cursor:'default'}}>
            <span>💬</span> {comentarios.length}
          </span>
          <a href={`https://api.whatsapp.com/send?text=🎅 Ayuda a ${nino.nombre}: ${window.location.href}`}
            target="_blank" rel="noreferrer" className="action-btn" style={{textDecoration:'none'}}>
            <span>💬</span> WhatsApp
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
            target="_blank" rel="noreferrer" className="action-btn" style={{textDecoration:'none'}}>
            <span>📘</span> Facebook
          </a>
        </div>

        {/* Ser padrino */}
        {!nino.tiene_padrino && !success && (
          <div className="godfather-form">
            <h4>❤️ {t.godfather_title}</h4>
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
        {success && <div className="success-msg" style={{margin:'0 1.2rem 1.2rem'}}>🎄 {t.godfather_success}</div>}

        {/* Comentarios */}
        <div className="comments-section">
          <h4>💬 Mensajes de apoyo ({comentarios.length})</h4>
          {comentarios.map(c => (
            <div className="comment" key={c.id}>
              <div className="comment-avatar">{c.autor[0]?.toUpperCase()}</div>
              <div className="comment-body">
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                  <span className="comment-autor">{c.autor}</span>
                  {c.pais && <span className="comment-pais">🌍 {c.pais}</span>}
                  <span className="comment-pais" style={{marginLeft:'auto'}}>{c.fecha}</span>
                </div>
                <div className="comment-texto">{c.texto}</div>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'0.6rem'}}>
              <input className="comment-input" placeholder="Tu nombre" style={{borderRadius:8}}
                value={comForm.autor} onChange={e=>setComForm({...comForm,autor:e.target.value})} required />
              <input className="comment-input" placeholder="Tu país (opcional)" style={{borderRadius:8}}
                value={comForm.pais} onChange={e=>setComForm({...comForm,pais:e.target.value})} />
            </div>
            <div className="comment-form">
              <input className="comment-input" placeholder="Escribe un mensaje de aliento para esta familia..."
                value={comForm.texto} onChange={e=>setComForm({...comForm,texto:e.target.value})} required />
              <button type="submit" className="comment-submit">Enviar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
