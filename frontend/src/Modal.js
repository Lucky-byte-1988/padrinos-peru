import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, title, children, maxWidth = 480, sheet = false }) {
  // Guardamos onClose en una ref para que el efecto de congelado SOLO dependa de `open`.
  // Si dependiera de onClose, cada re-render del padre re-ejecutaría el efecto,
  // leería scrollY=0 (el body ya está fijo) y al cerrar saltaría de posición ("carrusel").
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current(); };
    window.addEventListener('keydown', onKey);
    // Congelar el fondo por completo (método a prueba de iOS): el fondo no se mueve
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      // Restaurar la posición SIN animación. El html tiene scroll-behavior:smooth,
      // que al volver a la posición anterior haría un "barrido/carrusel" visible.
      // Desactivamos el suave solo durante la restauración instantánea.
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY);
      // Restaurar el valor original en el siguiente frame
      requestAnimationFrame(() => { html.style.scrollBehavior = prev; });
    };
  }, [open]);

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
