import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { LangContext } from '../App';

export default function PadrinoPanel() {
  const { t } = useContext(LangContext);
  const [email, setEmail] = useState('');
  const [nino, setNino] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const buscar = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNino(null);
    try {
      const res = await axios.get(`http://localhost:5003/api/padrino-panel?email=${encodeURIComponent(email)}`);
      setNino(res.data);
    } catch {
      setError('No encontramos un padrino con ese email. Verifica que sea el mismo email con el que te registraste.');
    }
    setLoading(false);
  };

  return (
    <div className="form-page" style={{maxWidth: 700}}>
      <h2>❤️ Panel del Padrino</h2>
      <p className="form-desc">Ingresa tu email para ver la carta del niño que apadrinaste.</p>

      <form onSubmit={buscar}>
        <div className="form-group">
          <label>Tu email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
          />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '⏳ Buscando...' : '🔍 Ver mi niño apadrinado'}
        </button>
      </form>

      {error && (
        <div style={{background:'#3d0000', color:'#ff9999', padding:'1rem', borderRadius:'10px', marginTop:'1rem'}}>
          ⚠️ {error}
        </div>
      )}

      {nino && (
        <div style={{marginTop:'2rem'}}>
          <div style={{background:'linear-gradient(135deg,#1a4d1a,#2ecc71)', borderRadius:'14px', padding:'1rem 1.5rem', marginBottom:'1.5rem', color:'white', textAlign:'center'}}>
            🎄 Eres el padrino de <strong>{nino.nombre}</strong>
          </div>

          {nino.foto_familia && (
            <img
              src={nino.foto_familia}
              alt={nino.nombre}
              style={{width:'100%', borderRadius:'14px', maxHeight:'280px', objectFit:'cover', marginBottom:'1rem', border:'2px solid #FFD700'}}
            />
          )}

          <h3 style={{color:'#FFD700', marginBottom:'0.3rem'}}>{nino.nombre}</h3>
          <p style={{color:'#888', marginBottom:'1.2rem'}}>
            🎂 {nino.edad} años · 📍 {nino.provincia}, {nino.region}
          </p>

          <div className="carta-box">
            <h3>📜 Su carta a Papá Noel</h3>
            <p>{nino.carta_texto}</p>
            {nino.carta_foto && (
              <img src={nino.carta_foto} alt="carta" className="carta-img" />
            )}
          </div>

          {nino.video_url && (
            <video controls style={{width:'100%', borderRadius:'12px', border:'2px solid #FFD700', marginBottom:'1rem'}}>
              <source src={nino.video_url} />
            </video>
          )}

          {nino.whatsapp && (
            <a
              href={`https://wa.me/51${nino.whatsapp}`}
              target="_blank" rel="noreferrer"
              style={{display:'flex', alignItems:'center', gap:'1rem', background:'#075e54', color:'white', borderRadius:'12px', padding:'1rem 1.5rem', textDecoration:'none', marginBottom:'1rem'}}
            >
              <span style={{fontSize:'1.8rem'}}>💬</span>
              <div>
                <div style={{fontWeight:'bold'}}>Contactar a la familia por WhatsApp</div>
                <div style={{opacity:0.8, fontSize:'0.85rem'}}>+51 {nino.whatsapp}</div>
              </div>
            </a>
          )}

          <Link to="/" style={{display:'block', textAlign:'center', color:'#FFD700', marginTop:'1rem'}}>
            ← Ver todas las cartas
          </Link>
        </div>
      )}
    </div>
  );
}
