// URL del backend. En local usa localhost; en producción usa la variable de entorno.
export const API = process.env.REACT_APP_API_URL || 'http://localhost:5003';

// Optimiza imágenes de Cloudinary: entrega versiones livianas y del tamaño justo.
// Evita cargar fotos de 2MB (que en móvil pueden verse en blanco) y acelera todo.
export function cld(url, transform = 'w_900,q_auto,f_auto,c_limit') {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
  return url.replace('/image/upload/', `/image/upload/${transform}/`);
}

