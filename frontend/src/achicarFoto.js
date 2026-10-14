// Achica una foto antes de subirla (máx. 1600 px, JPEG): pesa 10 veces menos y el envío no se corta.
// Si el navegador no puede leerla, se envía la original.
export default async function achicarFoto(file, max = 1600, calidad = 0.85) {
  if (!file || !file.type.startsWith('image/') || file.type === 'image/gif') return file;
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i); i.onerror = mal; i.src = url;
    });
    URL.revokeObjectURL(url);
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', calidad));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch (e) {
    return file;
  }
}

// Mensaje claro según lo que respondió (o no) el servidor
export function mensajeError(err, accion) {
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.status === 413) return `El archivo es muy pesado. Prueba con un video más corto o sin video.`;
  if (err.response) return `No se pudo ${accion} (error ${err.response.status} del servidor). Inténtalo de nuevo en un momento.`;
  if (err.code === 'ECONNABORTED') return `El envío tardó demasiado. Prueba con un video más corto o sin video.`;
  return `No se pudo ${accion}: el servidor no respondió. Revisa tu conexión o prueba sin video.`;
}
