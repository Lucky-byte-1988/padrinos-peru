import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import achicarFoto, { mensajeError } from '../achicarFoto';
import axios from 'axios';
import { API } from '../config';
import { LangContext } from '../App';

const REGIONES = ['Amazonas','Áncash','Apurímac','Arequipa','Ayacucho','Cajamarca','Callao','Cusco','Huancavelica','Huánuco','Ica','Junín','La Libertad','Lambayeque','Lima','Loreto','Madre de Dios','Moquegua','Pasco','Piura','Puno','San Martín','Tacna','Tumbes','Ucayali'];

const CameraGlyph = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>
    <circle cx="12" cy="13" r="3.5"/>
  </svg>
);
const VideoGlyph = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="6" width="13" height="12" rx="2.5"/>
    <path d="m16 10 5-3v10l-5-3Z"/>
  </svg>
);

function FileUpload({ label, name, accept, capture, preview, onChange }) {
  const esVideo = accept.startsWith('video');
  return (
    <div className="form-group">
      <label>{label}</label>
      <label className="file-upload-box">
        {preview ? (
          esVideo ? (
            <video src={preview} controls className="file-preview-video" />
          ) : (
            <img src={preview} alt="Vista previa" className="file-preview-img" />
          )
        ) : (
          <div className="file-upload-placeholder">
            <span className="file-upload-icon">{esVideo ? <VideoGlyph /> : <CameraGlyph />}</span>
            <span className="file-upload-text">Toca para {esVideo ? 'grabar o subir un video' : 'tomar una foto o elegir una imagen'}</span>
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
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles(prev => ({ ...prev, [field]: file }));
    setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (files.carta_foto) formData.append('carta_foto', await achicarFoto(files.carta_foto));
    if (files.foto_familia) formData.append('foto_familia', await achicarFoto(files.foto_familia));
    if (files.video) formData.append('video', files.video);
    try {
      await axios.post(API+'/api/ninos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(mensajeError(err, 'enviar la carta'));
    }
    setLoading(false);
  };

  if (success) return (
    <div className="form-page" style={{textAlign:'center'}}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{margin:'1.5rem auto 1rem', display:'block'}} aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="m8.5 12.5 2.5 2.5 5-6"/>
      </svg>
      <h2 style={{marginBottom:'0.6rem'}}>Carta publicada</h2>
      <p className="form-desc" style={{marginBottom:'2rem'}}>{t.reg_success}</p>
      <Link to="/cartas" className="btn-gold" style={{display:'inline-block', textDecoration:'none'}}>
        Ver las cartas
      </Link>
    </div>
  );

  return (
    <div className="form-page">
      <h2>{t.reg_title}</h2>
      <p className="form-desc">{t.reg_desc}</p>
      <form onSubmit={handleSubmit}>
        <h3 className="form-sec"><span>1</span>El niño</h3>
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

        <h3 className="form-sec"><span>2</span>Su carta</h3>
        <div className="form-group">
          <label>{t.field_carta}</label>
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
        />

        <h3 className="form-sec"><span>3</span>La familia</h3>
        <FileUpload
          label="Foto de la familia"
          name="foto_familia"
          accept="image/*"
          capture="environment"
          preview={previews.foto_familia}
          onChange={handleFile('foto_familia')}
        />

        <FileUpload
          label="Video del niño (opcional)"
          name="video"
          accept="video/*"
          capture="camcorder"
          preview={previews.video}
          onChange={handleFile('video')}
        />

        <div className="form-group">
          <label>{t.field_whatsapp}</label>
          <input name="whatsapp" type="tel" inputMode="numeric" value={form.whatsapp} onChange={handleChange} placeholder="9XXXXXXXX" />
          <p style={{fontSize:'0.8rem', color:'var(--ink-faint)', marginTop:'0.4rem'}}>En la carta aparece un botón de WhatsApp para que el padrino coordine contigo.</p>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Enviando…' : t.reg_btn}
        </button>
      </form>
    </div>
  );
}
