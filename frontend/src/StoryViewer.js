import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cld } from './config';
import { LangContext, textoApadrinamiento } from './i18n';

const DURACION = 6000; // 6s por historia (como Instagram)

export default function StoryViewer({ ninos, startIndex = 0, onClose }) {
  const { t } = useContext(LangContext);
  const [idx, setIdx] = useState(startIndex);
  const [progreso, setProgreso] = useState(0);
  const navigate = useNavigate();
  const timer = useRef(null);
  const inicio = useRef(Date.now());

  const nino = ninos[idx];

  const siguiente = useCallback(() => {
    setIdx(i => {
      if (i + 1 >= ninos.length) { onClose(); return i; }
      return i + 1;
    });
    setProgreso(0); inicio.current = Date.now();
  }, [ninos.length, onClose]);

  const anterior = () => {
    setIdx(i => Math.max(0, i - 1));
    setProgreso(0); inicio.current = Date.now();
  };

  // Barra de progreso + auto-avance
  useEffect(() => {
    inicio.current = Date.now();
    setProgreso(0);
    timer.current = setInterval(() => {
      const t = Date.now() - inicio.current;
      const p = Math.min(100, (t / DURACION) * 100);
      setProgreso(p);
      if (p >= 100) siguiente();
    }, 50);
    return () => clearInterval(timer.current);
  }, [idx, siguiente]);

  // Cerrar con Escape, navegar con flechas
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') siguiente();
      if (e.key === 'ArrowLeft') anterior();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [siguiente, onClose]);

  if (!nino) return null;
  const foto = nino.carta_foto ? cld(nino.carta_foto, 'w_800,h_1400,q_auto,f_auto,c_fill') : '';

  return (
    <div className="story-overlay" onClick={onClose}>
      <div className="story-stage" onClick={e => e.stopPropagation()}>
        {/* Barras de progreso */}
        <div className="story-bars">
          {ninos.map((_, i) => (
            <div className="story-bar" key={i}>
              <div className="story-bar-fill" style={{ width: i < idx ? '100%' : i === idx ? `${progreso}%` : '0%' }} />
            </div>
          ))}
        </div>

        {/* Encabezado */}
        <div className="story-head">
          <div className="story-head-info">
            <span className="story-avatar-sm">{nino.nombre[0]}</span>
            <div>
              <div className="story-name">{nino.nombre}</div>
              <div className="story-loc">{nino.provincia}, {nino.region} · {nino.edad} años</div>
            </div>
          </div>
          <button className="story-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Imagen de fondo */}
        {foto
          ? <img className="story-img" src={foto} alt={`Carta de ${nino.nombre}`} />
          : <div className="story-img story-fallback" />}
        <div className="story-gradient" />

        {/* Zonas de toque para navegar */}
        <button className="story-tap story-tap-left" onClick={anterior} aria-label="Anterior" />
        <button className="story-tap story-tap-right" onClick={siguiente} aria-label="Siguiente" />

        {/* Contenido abajo */}
        <div className="story-content">
          {nino.carta_texto && (
            <p className="story-carta">"{nino.carta_texto.substring(0, 110)}{nino.carta_texto.length > 110 ? '…' : ''}"</p>
          )}
          <span className={`story-badge ${nino.tiene_padrino ? 'con' : ''}`}>
            {nino.tiene_padrino ? textoApadrinamiento(t, true, nino.rol_padrino) : `🎁 ${t.badge_espera}`}
          </span>
          <button className="story-cta" onClick={() => { onClose(); navigate(`/carta/${nino.id}`); }}>
            Ver su carta completa →
          </button>
        </div>
      </div>
    </div>
  );
}
