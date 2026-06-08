import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, title, children, maxWidth = 480, sheet = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  // sheet = hoja deslizante desde abajo (estilo Instagram)
  return createPortal(
    <div className={`modal-overlay ${sheet ? 'is-sheet' : ''}`} onClick={onClose}>
      <div className={`modal-card ${sheet ? 'modal-sheet' : ''}`} style={sheet ? {} : { maxWidth }} onClick={(e) => e.stopPropagation()}>
        {sheet && <div className="sheet-handle" />}
        <div className="modal-head">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
