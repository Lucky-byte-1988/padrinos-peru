import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from './config';
import { useAuth } from './AuthContext';

// Buscador (Ctrl+K) con la esfera flotante, el mismo Spotlight de sicac.
// El motor vive en public/buscador; aquí solo se le da el índice y la navegación.
const HUES = [8, 28, 150, 198, 222, 262, 330, 40, 172, 12];

const AYUDA = [
  ['¿Qué es CartasANoel?', 'Una plataforma que conecta a niños de provincias del Perú con personas de todo el mundo. Los niños comparten su carta a Papá Noel y tú puedes ser su padrino navideño.', 'que es plataforma quienes somos nosotros', '/nosotros'],
  ['¿Cómo apadrino a un niño?', 'Abre la carta de un niño que busca padrino y elige «Padrino» o «Madrina». Necesitas iniciar sesión. El equipo coordina con la familia, sin mostrar teléfonos.', 'padrino madrina apadrinar ayudar regalar como apadrino', '/?f=sin'],
  ['¿Se maneja dinero?', 'No. Nadie paga a la plataforma. El equipo hace de puente con la familia y no se publican teléfonos.', 'dinero pago donacion plata cobro transferencia whatsapp telefono', null],
  ['¿Qué datos del niño se publican?', 'Solo el primer nombre, la edad, la provincia y la carta, después de que un administrador la apruebe. No se publican apellidos, teléfono ni foto familiar.', 'privacidad datos seguridad foto apellido whatsapp revision', null],
  ['¿Cómo registro a un niño?', 'Pulsa «Registrar niño» y escribe su carta. La foto familiar es opcional y no se publica. La carta queda en revisión hasta que un administrador la apruebe.', 'registrar carta familia nueva escribir revision', '/registrar'],
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
    const est = !n.tiene_padrino ? 'Busca padrino' : (n.rol_padrino === 'madrina' ? 'Su madrina' : 'Su padrino');
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

// Accesos directos que aparecen al abrir el buscador: es una guía, no solo búsqueda.
function guia(go, user, isAdmin, salir) {
  const sin = NINOS.filter(n => !n.tiene_padrino).length;
  const G = [
    { t: 'Ver las cartas', s: NINOS.length ? `${NINOS.length} niños` : 'Todos los niños', ic: 'mail', sec: 'Ver', go: () => go('/?f=todos') },
    { t: 'Cómo funciona', s: 'Qué es CartasANoel', ic: 'book', sec: 'Ver', go: () => go('/nosotros') },
    { t: 'Apadrinar a un niño', s: sin ? `${sin} buscan padrino` : 'Niños que buscan padrino', ic: 'gift', sec: 'Ayudar', go: () => go('/?f=sin') },
    { t: 'Registrar un niño', s: 'Escribir su carta', ic: 'pen', sec: 'Ayudar', go: () => go('/registrar') },
    { t: 'Mi niño', s: 'Tus apadrinados o tus cartas', ic: 'heart', sec: 'Tu cuenta', go: () => go('/mi-nino') },
  ];
  if (isAdmin) G.push({ t: 'Panel admin', s: 'Niños, padrinos e historial', ic: 'star', sec: 'Tu cuenta', go: () => go('/admin') });
  else if (!user) G.push({ t: 'Iniciar sesión', s: 'Para apadrinar o ver tu niño', ic: 'user', sec: 'Tu cuenta', go: () => go('/login') });
  else G.push({ t: 'Cerrar sesión', s: user.email, ic: 'user', sec: 'Tu cuenta', go: () => { salir(); go('/'); } });
  return G;
}

export default function Buscador() {
  const navigate = useNavigate();
  const { user, isAdmin, salir } = useAuth();
  const salirRef = useRef(salir);
  salirRef.current = salir;

  useEffect(() => {
    const go = h => navigate(h);
    window.SPOT_TIT = 'CartasANoel';
    window.SPOT_PH = 'Busca un niño, una región o una duda';
    window.SPOT_PIPH = 'Escribe un nombre, una provincia o una pregunta.';
    window.SPOT_SOLO = 1;
    window.SPOT_CATS = [{ k: 'nin', g: 'Niños', t: 'Niños', ic: 'user' }, { k: 'reg', g: 'Regiones', t: 'Regiones', ic: 'pin' }, { k: 'ayu', g: 'Ayuda', t: 'Ayuda', ic: 'book' }];
    window.SPOT_ORDER = ['Ir a', 'Niños', 'Regiones', 'Ayuda'];
    window.SPOT_SUG = ['Cusco', '¿Se maneja dinero?', '¿Cómo apadrino?'];
    window.SPOT_ITEMS = () => items(go);
    window.SPOT_GUIA = () => guia(go, user, isAdmin, () => salirRef.current());
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
  }, [navigate, user, isAdmin]);

  return null;
}
