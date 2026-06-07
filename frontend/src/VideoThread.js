import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5003';

function VideoCard({ v, onLike }) {
  const ref = useRef(null);
  const [likes, setLikes] = useState(v.likes || 0);
  const [liked, setLiked] = useState(false);
  const esNino = v.de === 'nino';

  const handleLike = async () => {
    if (liked) return;
    const res = await axios.post(`${API}/api/videos/${v.id}/like`);
    setLikes(res.data.likes); setLiked(true);
  };

  // src puede ser archivo subido o link de youtube
  const isYoutube = v.video_url.includes('youtube') || v.video_url.includes('youtu.be');
  const embed = isYoutube
    ? v.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
    : null;

  return (
    <div className={`vthread-item ${esNino ? 'from-nino' : 'from-padrino'}`}>
      <div className="vthread-bubble">
        <div className="vthread-head">
          <div className={`vthread-avatar ${esNino ? 'av-nino' : 'av-padrino'}`}>
            {esNino ? '🧒' : '🎅'}
          </div>
          <div>
            <div className="vthread-autor">{v.autor}</div>
            <div className="vthread-meta">
              {esNino ? 'Niño' : 'Padrino'}{v.pais ? ` · 🌍 ${v.pais}` : ''} · {v.fecha}
            </div>
          </div>
        </div>

        <div className="vthread-video">
          {embed ? (
            <iframe src={embed} title={v.autor} frameBorder="0" allowFullScreen />
          ) : (
            <video ref={ref} src={v.video_url} controls playsInline preload="metadata" />
          )}
        </div>

        {v.texto && <p className="vthread-texto">{v.texto}</p>}

        <div className="vthread-actions">
          <button className={`vthread-like ${liked ? 'liked' : ''}`} onClick={handleLike}>
            {liked ? '❤️' : '🤍'} {likes}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VideoThread({ ninoId, ninoNombre, videoInicial }) {
  const [videos, setVideos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ autor: '', pais: '', texto: '', de: 'padrino' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    axios.get(`${API}/api/ninos/${ninoId}/videos`).then(r => setVideos(r.data));
  };
  useEffect(() => { cargar(); }, [ninoId]);

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const enviar = async e => {
    e.preventDefault();
    if (!file) { alert('Graba o elige un video primero 🎥'); return; }
    setEnviando(true);
    const fd = new FormData();
    fd.append('autor', form.autor);
    fd.append('pais', form.pais);
    fd.append('texto', form.texto);
    fd.append('de', form.de);
    fd.append('video', file);
    await axios.post(`${API}/api/ninos/${ninoId}/videos`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setEnviando(false);
    setForm({ autor: '', pais: '', texto: '', de: 'padrino' });
    setFile(null); setPreview(null); setShowForm(false);
    cargar();
  };

  return (
    <div className="vthread">
      <div className="vthread-title">
        <h4>🎬 Conversación en video con {ninoNombre}</h4>
        <span className="vthread-count">{videos.length + (videoInicial ? 1 : 0)} videos</span>
      </div>
      <p className="vthread-sub">Responde con tu propio video, como en TikTok 💬</p>

      {/* Video inicial del niño */}
      {videoInicial && (
        <div className="vthread-item from-nino">
          <div className="vthread-bubble">
            <div className="vthread-head">
              <div className="vthread-avatar av-nino">🧒</div>
              <div>
                <div className="vthread-autor">{ninoNombre}</div>
                <div className="vthread-meta">Niño · Video original 🎄</div>
              </div>
            </div>
            <div className="vthread-video">
              {videoInicial.includes('youtube') || videoInicial.includes('youtu.be') ? (
                <iframe src={videoInicial.replace('watch?v=','embed/').replace('youtu.be/','youtube.com/embed/')} title="original" frameBorder="0" allowFullScreen />
              ) : (
                <video src={videoInicial} controls playsInline preload="metadata" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hilo */}
      {videos.map(v => <VideoCard key={v.id} v={v} />)}

      {videos.length === 0 && !videoInicial && (
        <div className="vthread-empty">
          🎥 Aún no hay videos. ¡Sé el primero en enviar un saludo en video!
        </div>
      )}

      {/* Botón / Formulario para responder */}
      {!showForm ? (
        <button className="vthread-reply-btn" onClick={() => setShowForm(true)}>
          🎥 Responder con un video
        </button>
      ) : (
        <form className="vthread-form" onSubmit={enviar}>
          <label className="vthread-upload">
            {preview ? (
              <video src={preview} controls className="vthread-upload-preview" />
            ) : (
              <div className="vthread-upload-empty">
                <span style={{fontSize:'2.4rem'}}>🎥</span>
                <strong>Toca para grabar o subir tu video</strong>
                <small>Desde tu cámara o galería</small>
              </div>
            )}
            <input type="file" accept="video/*" capture="user" onChange={handleFile} style={{display:'none'}} />
          </label>

          <div className="vthread-form-row">
            <select value={form.de} onChange={e => setForm({...form, de: e.target.value})}>
              <option value="padrino">Soy el Padrino 🎅</option>
              <option value="nino">Soy el Niño 🧒</option>
            </select>
            <input placeholder="Tu nombre" value={form.autor}
              onChange={e => setForm({...form, autor: e.target.value})} required />
          </div>
          <input placeholder="País (opcional)" value={form.pais}
            onChange={e => setForm({...form, pais: e.target.value})} />
          <input placeholder="Escribe un mensaje (opcional)" value={form.texto}
            onChange={e => setForm({...form, texto: e.target.value})} />

          <div className="vthread-form-btns">
            <button type="button" className="vthread-cancel" onClick={() => { setShowForm(false); setFile(null); setPreview(null); }}>
              Cancelar
            </button>
            <button type="submit" className="vthread-send" disabled={enviando}>
              {enviando ? '⏳ Publicando...' : '🚀 Publicar video'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
