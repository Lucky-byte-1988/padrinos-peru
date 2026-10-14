import React, { useState } from 'react';
import { cld } from './config';

// Foto con respaldo: si la imagen no carga, muestra un fondo suave en lugar del ícono roto.
export default function Foto({ src, alt, className, fallback = null, ...rest }) {
  const [rota, setRota] = useState(false);
  if (!src || rota) return fallback;
  return <img src={src} alt={alt} className={className} onError={() => setRota(true)} {...rest} />;
}

// Portada pública: la foto de la carta, o una hoja en blanco. Nunca la foto familiar.
export function CartaPortada({ nombre, carta, foto, className = '' }) {
  if (foto) {
    return (
      <Foto
        className={className}
        src={cld(foto, 'w_1400,q_auto,f_auto,c_limit')}
        alt={nombre ? `Carta de ${nombre}` : 'Carta'}
      />
    );
  }
  const texto = (carta || '').trim();
  return (
    <div className={`carta-portada ${className}`.trim()} role="img" aria-label={nombre ? `Carta de ${nombre}` : 'Carta'}>
      <div className="carta-portada-papel">
        {nombre ? <span className="carta-portada-nombre">{nombre}</span> : null}
        <p>{texto ? `“${texto.slice(0, 220)}${texto.length > 220 ? '…' : ''}”` : 'Carta a Papá Noel'}</p>
      </div>
    </div>
  );
}
