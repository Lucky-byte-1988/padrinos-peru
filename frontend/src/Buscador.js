import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from './config';

// Buscador (Ctrl+K) con la esfera flotante, el mismo Spotlight de sicac.
// El motor vive en public/buscador; aquí solo se le da el índice y la navegación.
const HUES = [8, 28, 150, 198, 222, 262, 330, 40, 172, 12];

const AYUDA = [
  ['¿Qué es CartasANoel?', 'Una plataforma que conecta a niños de provincias del Perú con personas de todo el mundo. Los niños comparten su carta a Papá Noel y tú puedes ser su padrino navideño.', 'que es plataforma quienes somos nosotros', '/nosotros'],
  ['¿Cómo apadrino a un niño?', 'Abre la carta de un niño que busca padrino y pulsa «Quiero ser su padrino». Necesitas iniciar sesión; tu correo se usa automáticamente.', 'padrino apadrinar ayudar regalar como apadrino', '/?f=sin'],
  ['¿Se maneja dinero?', 'No. El padrino coordina directamente con la familia del niño. Solo somos el puente de conexión.', 'dinero pago donacion plata cobro transferencia', null],
  ['¿Qué datos del niño se publican?', 'Solo el primer nombre, la edad, la provincia, la carta y lo que la familia decide compartir.', 'privacidad datos seguridad foto apellido', null],
  ['¿Cómo registro a un niño?', 'Pulsa «Registrar niño», escribe su carta y sube la foto de la carta, la de la familia y, si quieres, un video.', 'registrar carta familia nueva escribir', '/registrar'],
  ['¿Dónde operan?', 'En todas las regiones del Perú, con prioridad para las provincias más alejadas: Cusco, Puno, Huancavelica, Ayacucho, Cajamarca y más.', 'donde regiones provincias operan lugares', '/'],
  ['¿Dónde veo a mi niño apadrinado?', 'En «Mi niño», con tu sesión iniciada, ves a los niños que apadrinaste o las cartas que registraste.', 'mi nino apadrinado panel seguimiento', '/mi-nino'],
];

let NINOS = [];

function items(go) {
  const out = [];
  [['Inicio', '', 'home', '/'], ['Cartas', 'Todos los niños', 'mail', '/?f=todos'], ['Registrar niño', 'Escribir una carta', 'pen', '/registrar'],
   ['Mi niño', 'Tus apadrinados o tus cartas', 'user', '/mi-nino'], ['Nosotros', 'Qué es y cómo funciona', 'book', '/nosotros']]
    .forEach(([t, s, ic, h]) => out.push({ g: 'Ir a', t, s, ic, go: () => go(h) }));
  NINOS.forEach(n => {
    const est = n.tiene_padrino ? 'Apadrinado' : 'Busca padrino';
    out.push({ g: 'Niños', t: n.nombre, s: `${n.edad} años · ${n.provincia || ''}, ${n.region || ''}`, ic: 'user', c: est, kl: est, tl: n.region,
      d: n.carta_texto || '', x: `${n.provincia || ''} ${est}`, gl: 'Leer su carta', av: [String(n.nombre || '?')[0], HUES[n.id % HUES.length]],
      go: () => go(`/carta/${n.id}`) });
  });
  const R = {};
  NINOS.forEach(n => { if (n.region) (R[n.region] = R[n.region] || []).push(n); });
  Object.keys(R).sort((a, b) => a.localeCompare(b, 'es')).forEach(r => {
    const L = R[r], sin = L.filter(n => !n.tiene_padrino).length;
    out.push({ g: 'Regiones', t: r, s: `${L.length} ${L.length > 1 ? 'niños' : 'niño'}${sin ? ` · ${sin} buscan padrino` : ''}`, ic: 'pin', kl: String(L.length),
      x: L.map(n => `${n.provincia} ${n.nombre}`).join(' '), go: () => go(`/?region=${encodeURIComponent(r)}`) });
  });
  AYUDA.forEach(([t, d, x, h]) => out.push({ g: 'Ayuda', t, s: '', ic: 'doc', d, x, gl: h ? 'Ir' : 'Entendido', go: () => { if (h) go(h); } }));
  return out;
}

export default function Buscador() {
  const navigate = useNavigate();

  useEffect(() => {
    const go = h => navigate(h);
    window.SPOT_TIT = 'CartasANoel';
    window.SPOT_PH = 'Buscar niños, regiones o ayuda';
    window.SPOT_PIPH = 'Escribe un nombre, una provincia o una pregunta.';
    window.SPOT_SOLO = 1;
    window.SPOT_CATS = [{ k: 'nin', g: 'Niños', t: 'Niños', ic: 'user' }, { k: 'reg', g: 'Regiones', t: 'Regiones', ic: 'pin' }, { k: 'ayu', g: 'Ayuda', t: 'Ayuda', ic: 'book' }];
    window.SPOT_ORDER = ['Ir a', 'Niños', 'Regiones', 'Ayuda'];
    window.SPOT_SUG = ['Busca padrino', 'Cusco', '¿Se maneja dinero?', 'Registrar niño'];
    window.SPOT_ITEMS = () => items(go);
    window.SPOT_STATE = { get: () => ({}), set: () => {} };
    window.SPOT_ACCIONES = () => [
      { t: 'Cartas', i: 'mail', f: () => go('/?f=todos') },
      { t: 'Registrar niño', i: 'pen', f: () => go('/registrar') },
      { t: 'Mi niño', i: 'user', f: () => go('/mi-nino') },
      { t: 'Nosotros', i: 'book', f: () => go('/nosotros') },
    ];

    const cargar = () => axios.get(API + '/api/ninos').then(r => { NINOS = r.data || []; if (window.SPOT_RESET) window.SPOT_RESET(); }).catch(() => {});
    cargar();
    // La lista se refresca al abrir la búsqueda, así aparecen los niños nuevos
    const alAbrir = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') cargar(); };
    window.addEventListener('keydown', alAbrir, true);

    if (!document.getElementById('sp-motor')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = '/buscador/buscador.css';
      document.head.appendChild(css);
      const s = document.createElement('script');
      s.id = 'sp-motor'; s.src = '/buscador/buscador.js';
      document.body.appendChild(s);
    }
    return () => window.removeEventListener('keydown', alAbrir, true);
  }, [navigate]);

  return null;
}
