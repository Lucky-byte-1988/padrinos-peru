import React, { useContext, useState } from 'react';
import axios from 'axios';
import { API } from '../config';
import { LangContext } from '../App';

const REGIONES = ['Amazonas','Áncash','Apurímac','Arequipa','Ayacucho','Cajamarca','Callao','Cusco','Huancavelica','Huánuco','Ica','Junín','La Libertad','Lambayeque','Lima','Loreto','Madre de Dios','Moquegua','Pasco','Piura','Puno','San Martín','Tacna','Tumbes','Ucayali'];

function FileUpload({ label, name, accept, capture, preview, onChange, icon }) {
  return (
    <div className="form-group">
      <label>{icon} {label}</label>
      <label className="file-upload-box">
        {preview ? (
          accept.startsWith('video') ? (
            <video src={preview} controls className="file-preview-video" />
          ) : (
            <img src={preview} alt="preview" className="file-preview-img" />
          )
        ) : (
          <div className="file-upload-placeholder">
            <span className="file-upload-icon">{accept.startsWith('video') ? '🎥' : '📷'}</span>
            <span className="file-upload-text">Toca para {accept.startsWith('video') ? 'grabar o subir video' : 'tomar foto o elegir imagen'}</span>
            <span className="file-upload-hint">Desde cámara o galería</span>
          </div>
        )}
        <input
          type="file"
          name={name}
          accept={accept}
          onChange={onChange}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}

export default function RegisterFamily() {
  const { t } = useContext(LangContext);
  const [form, setForm] = useState({ nombre: '', edad: '', provincia: '', region: '', carta_texto: '', whatsapp: '' });
  const [files, setFiles] = useState({ carta_foto: null, foto_familia: null, video: null });
  const [previews, setPreviews] = useState({ carta_foto: null, foto_familia: null, video: null });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles(prev => ({ ...prev, [field]: file }));
    setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (files.carta_foto) formData.append('carta_foto', files.carta_foto);
    if (files.foto_familia) formData.append('foto_familia', files.foto_familia);
    if (files.video) formData.append('video', files.video);
    await axios.post(API+'/api/ninos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setLoading(false);
    setSuccess(true);
    window.scrollTo(0, 0);
  };

  if (success) return (
    <div className="form-page" style={{textAlign:'center'}}>
      <div style={{fontSize:'5rem', marginBottom:'1rem'}}>🎅</div>
      <div className="success-msg">{t.reg_success}</div>
      <br />
      <a href="/" className="btn-gold" style={{display:'inline-block', marginTop:'1rem', padding:'0.9rem 2rem', borderRadius:'30px', fontWeight:'bold', textDecoration:'none', background:'linear-gradient(135deg,#FFD700,#FFA500)', color:'#8B0000'}}>
        Ver otras cartas
      </a>
    </div>
  );

  return (
    <div className="form-page">
      <h2>{t.reg_title}</h2>
      <p className="form-desc">{t.reg_desc}</p>
      <form onSubmit={handleSubmit}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
          <div className="form-group">
            <label>{t.field_nombre}</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: Lucía" />
          </div>
          <div className="form-group">
            <label>{t.field_edad}</label>
            <input name="edad" type="number" min="1" max="16" value={form.edad} onChange={handleChange} placeholder="Ej: 8" />
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
          <div className="form-group">
            <label>{t.field_provincia}</label>
            <input name="provincia" value={form.provincia} onChange={handleChange} placeholder="Ej: Anta" />
          </div>
          <div className="form-group">
            <label>{t.field_region}</label>
            <select name="region" value={form.region} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>✉️ {t.field_carta}</label>
          <textarea
            name="carta_texto"
            value={form.carta_texto}
            onChange={handleChange}
            required
            placeholder="Estimado Papá Noel, me llamo... tengo... años. Vivo en... Mi sueño es... Quisiera que me regales..."
          />
        </div>

        <FileUpload
          label="Foto de la carta escrita a mano"
          name="carta_foto"
          accept="image/*"
          capture="environment"
          preview={previews.carta_foto}
          onChange={handleFile('carta_foto')}
          icon="📝"
        />

        <FileUpload
          label="Foto de la familia"
          name="foto_familia"
          accept="image/*"
          capture="environment"
          preview={previews.foto_familia}
          onChange={handleFile('foto_familia')}
          icon="👨‍👩‍👧"
        />

        <FileUpload
          label="Video del niño (opcional)"
          name="video"
          accept="video/*"
          capture="camcorder"
          preview={previews.video}
          onChange={handleFile('video')}
          icon="🎥"
        />

        <div className="form-group">
          <label>📱 {t.field_whatsapp}</label>
          <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="9XXXXXXXX" />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '⏳ Enviando...' : t.reg_btn}
        </button>
      </form>
    </div>
  );
}
