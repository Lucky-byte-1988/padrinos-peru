import React, { useState } from 'react';

// Foto con respaldo: si la imagen no carga, muestra un fondo suave en lugar del ícono roto.
export default function Foto({ src, alt, className, fallback = null, ...rest }) {
  const [rota, setRota] = useState(false);
  if (!src || rota) return fallback;
  return <img src={src} alt={alt} className={className} onError={() => setRota(true)} {...rest} />;
}
