import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, cld } from '../config';
import { useAuth } from '../AuthContext';
import achicarFoto, { mensajeError } from '../achicarFoto';
import '../noel.css';

// Página en blanco con Papá Noel al centro. Al tocarlo se abre su ventana
// y ahí se hace todo: ver cartas, apadrinar, registrar a un niño y Mi niño.

const REGIONES = ['Amazonas','Áncash','Apurímac','Arequipa','Ayacucho','Cajamarca','Callao','Cusco','Huancavelica','Huánuco','Ica','Junín','La Libertad','Lambayeque','Lima','Loreto','Madre de Dios','Moquegua','Pasco','Piura','Puno','San Martín','Tacna','Tumbes','Ucayali'];
const GUARDA = 'noelPantalla';

const Ic = ({ d }) => <svg viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;
const ICONOS = {
  cartas: <Ic d={<><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></>} />,
  regalo: <Ic d={<><rect x="3.5" y="9" width="17" height="11" rx="2"/><path d="M12 9v11M3.5 13h17M12 9S10.5 4 8 4.5 7 9 12 9Zm0 0s1.5-5 4-4.5S17 9 12 9Z"/></>} />,
  lapiz: <Ic d={<><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></>} />,
  corazon: <Ic d={<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>} />,
};

const lugar = n => [n.provincia, n.region].filter(Boolean).join(', ');

function Avatar({ n }) {
  const [mal, setMal] = useState(false);
  if (n.foto_familia && !mal) return <img className="noel-av" src={cld(n.foto_familia, 'w_120,h_120,q_auto,f_auto,c_fill,g_face')} alt="" onError={() => setMal(true)} />;
  return <span className="noel-av">{String(n.nombre || '?')[0]}</span>;
}

function Foto({ src, alt, className }) {
  const [mal, setMal] = useState(false);
  if (!src || mal) return null;
  return <img className={className} src={src} alt={alt} onError={() => setMal(true)} />;
}

// ── Pantallas ─────────────────────────────────────────────

function Inicio({ ir, ninos, user }) {
  const sin = ninos.filter(n => !n.tiene_padrino).length;
  const ops = [
    ['cartas', 'Ver las cartas', ninos.length ? `${ninos.length} niños escribieron a Papá Noel` : 'Las cartas de los niños', () => ir({ p: 'cartas', f: 'todos' })],
    ['regalo', 'Apadrinar a un niño', sin ? `${sin} esperan un padrino` : 'Elige a quién ayudar', () => ir({ p: 'cartas', f: 'sin' })],
    ['lapiz', 'Registrar a un niño', 'Escribir su carta a Papá Noel', () => ir({ p: 'registrar', i: 0 })],
    ['corazon', 'Mi niño', user ? 'Tus apadrinados y tus cartas' : 'Para ver a tu niño, inicia sesión', () => ir({ p: 'mi' })],
  ];
  return (
    <>
      <h1 className="noel-t">Hola, ¿qué quieres hacer?</h1>
      <p className="noel-s">Todo lo haces aquí, paso a paso.</p>
      <div className="noel-ops">
        {ops.map(([ic, t, s, f]) => (
          <button key={t} className="noel-op" onClick={f}>
            <i>{ICONOS[ic]}</i><div><b>{t}</b><span>{s}</span></div><em>›</em>
          </button>
        ))}
      </div>
    </>
  );
}

function Cartas({ ir, ninos, cargando, f }) {
  const lista = ninos.filter(n => f === 'sin' ? !n.tiene_padrino : true);
  return (
    <>
      <h1 className="noel-t">{f === 'sin' ? 'Esperan un padrino' : 'Las cartas'}</h1>
      <p className="noel-s">Toca un nombre para leer su carta.</p>
      <div className="noel-filtro" role="tablist">
        <button className={f !== 'sin' ? 'on' : ''} onClick={() => ir({ p: 'cartas', f: 'todos' }, true)}>Todos</button>
        <button className={f === 'sin' ? 'on' : ''} onClick={() => ir({ p: 'cartas', f: 'sin' }, true)}>Sin padrino</button>
      </div>
      {cargando ? <p className="noel-vacio">Cargando cartas…</p>
        : !lista.length ? <p className="noel-vacio">{f === 'sin' ? 'Todos los niños ya tienen padrino.' : 'Aún no hay cartas.'}</p>
        : lista.map(n => (
          <button key={n.id} className="noel-nino" onClick={() => ir({ p: 'carta', id: n.id })}>
            <Avatar n={n} />
            <div><b>{n.nombre}{n.edad ? `, ${n.edad} años` : ''}</b><span>{lugar(n) || 'Perú'}</span></div>
            <span className={`noel-tag ${n.tiene_padrino ? 'con' : ''}`}>{n.tiene_padrino ? 'Apadrinado' : 'Busca padrino'}</span>
          </button>
        ))}
    </>
  );
}

function Carta({ ir, nino }) {
  if (!nino) return <p className="noel-vacio">Esta carta ya no está.</p>;
  return (
    <>
      <p className="noel-paso">{lugar(nino) || 'Perú'}</p>
      <h1 className="noel-t">{nino.nombre}{nino.edad ? `, ${nino.edad} años` : ''}</h1>
      <Foto className="noel-foto" src={cld(nino.foto_familia, 'w_1000,h_625,q_auto,f_auto,c_fill,g_auto')} alt={nino.nombre} />
      <div className="noel-carta">{nino.carta_texto}</div>
      {nino.tiene_padrino
        ? <p className="noel-s" style={{ textAlign: 'center' }}>{nino.nombre} ya tiene padrino 🎄</p>
        : <button className="noel-btn" onClick={() => ir({ p: 'padrino', id: nino.id })}>Quiero ser su padrino</button>}
      <Link className="noel-btn sec" to={`/carta/${nino.id}`}>Ver mensajes y videos</Link>
    </>
  );
}

function Padrino({ ir, nino, user, alApadrinar }) {
  const [nombre, setNombre] = useState(user?.displayName || '');
  const [pais, setPais] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  if (!nino) return <p className="noel-vacio">Esta carta ya no está.</p>;

  if (ok) return (
    <div className="noel-ok">
      <div className="noel-check">✓</div>
      <h1 className="noel-t">¡Ahora eres el padrino de {nino.nombre}!</h1>
      <p className="noel-s">Coordina con su familia para hacer realidad su Navidad. Lo verás siempre en Mi niño.</p>
      <button className="noel-btn" onClick={() => ir({ p: 'mi' })}>Ir a Mi niño</button>
      <button className="noel-btn sec" onClick={() => ir({ p: 'inicio' }, true)}>Volver al inicio</button>
    </div>
  );

  if (!user) return (
    <>
      <h1 className="noel-t">Para apadrinar a {nino.nombre}, inicia sesión</h1>
      <p className="noel-s">Tu correo se usa automáticamente y podrás ver a tu niño en Mi niño. Al volver, seguirás aquí.</p>
      <Link className="noel-btn" to="/login?next=/">Iniciar sesión</Link>
    </>
  );

  const enviar = async e => {
    e.preventDefault();
    setEnviando(true); setError('');
    try {
      await axios.post(`${API}/api/padrinos`, { nombre: nombre.trim() || user.displayName || '', pais, nino_id: nino.id });
      setOk(true); alApadrinar(nino.id);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar. Inténtalo de nuevo.');
    }
    setEnviando(false);
  };

  return (
    <form onSubmit={enviar}>
      <h1 className="noel-t">Ser el padrino de {nino.nombre}</h1>
      <p className="noel-s">Solo dos datos. Tu correo es el de tu cuenta: {user.email}</p>
      <input className="noel-in" placeholder="Tu nombre" required value={nombre} onChange={e => setNombre(e.target.value)} autoFocus />
      <input className="noel-in" placeholder="Tu país" value={pais} onChange={e => setPais(e.target.value)} />
      {error && <div className="noel-err" role="alert">{error}</div>}
      <button className="noel-btn" disabled={enviando}>{enviando ? 'Enviando…' : 'Confirmar'}</button>
    </form>
  );
}

// Registro: una pregunta por pantalla
const PASOS = ['nombre', 'edad', 'lugar', 'carta', 'carta_foto', 'foto_familia', 'video', 'whatsapp', 'revisar'];

function Registrar({ ir, i, datos, setDatos, archivos, setArchivos, alRegistrar }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const paso = PASOS[i] || 'nombre';
  const sig = () => ir({ p: 'registrar', i: i + 1 });
  const set = k => e => setDatos({ ...datos, [k]: e.target.value });
  const archivo = k => e => { const f = e.target.files[0]; if (f) setArchivos({ ...archivos, [k]: f }); };
  const nombre = datos.nombre.trim() || 'el niño';

  if (ok) return (
    <div className="noel-ok">
      <div className="noel-check">✓</div>
      <h1 className="noel-t">La carta de {ok} ya está publicada</h1>
      <p className="noel-s">Cuando alguien quiera ser su padrino, te escribirá por WhatsApp.</p>
      <button className="noel-btn" onClick={() => ir({ p: 'cartas', f: 'todos' }, true)}>Ver las cartas</button>
      <button className="noel-btn sec" onClick={() => ir({ p: 'inicio' }, true)}>Volver al inicio</button>
    </div>
  );

  const enviar = async () => {
    setEnviando(true); setError('');
    const fd = new FormData();
    Object.entries(datos).forEach(([k, v]) => fd.append(k, v));
    try {
      if (archivos.carta_foto) fd.append('carta_foto', await achicarFoto(archivos.carta_foto));
      if (archivos.foto_familia) fd.append('foto_familia', await achicarFoto(archivos.foto_familia));
      if (archivos.video) fd.append('video', archivos.video);
      await axios.post(API + '/api/ninos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setOk(datos.nombre.trim() || 'el niño'); alRegistrar();
    } catch (err) {
      setError(mensajeError(err, 'enviar la carta'));
    }
    setEnviando(false);
  };

  const prog = <div className="noel-barra-prog"><i style={{ width: `${((i + 1) / PASOS.length) * 100}%` }} /></div>;
  const foto = (k, titulo, sub, esVideo) => {
    const f = archivos[k];
    const url = f ? URL.createObjectURL(f) : null;
    return (
      <>
        <h1 className="noel-t">{titulo}</h1>
        <p className="noel-s">{sub}</p>
        <label className="noel-foto-in">
          {url ? (esVideo ? <video src={url} controls /> : <img src={url} alt="" />)
            : <span>Toca para {esVideo ? 'grabar o elegir un video' : 'tomar una foto o elegir una imagen'}</span>}
          <input type="file" accept={esVideo ? 'video/*' : 'image/*'} onChange={archivo(k)} />
        </label>
        <button className="noel-btn" onClick={sig}>{f ? 'Continuar' : 'Omitir por ahora'}</button>
      </>
    );
  };

  const form = (cuerpo, listo = true) => (
    <form onSubmit={e => { e.preventDefault(); if (listo) sig(); }}>
      {cuerpo}
      <button className="noel-btn" disabled={!listo}>Continuar</button>
    </form>
  );

  let pantalla;
  if (paso === 'nombre') pantalla = form(<>
    <h1 className="noel-t">¿Cómo se llama el niño o la niña?</h1>
    <p className="noel-s">Solo su primer nombre.</p>
    <input className="noel-in" placeholder="Ej: Lucía" value={datos.nombre} onChange={set('nombre')} autoFocus />
  </>, !!datos.nombre.trim());
  else if (paso === 'edad') pantalla = form(<>
    <h1 className="noel-t">¿Cuántos años tiene {nombre}?</h1>
    <p className="noel-s">&nbsp;</p>
    <input className="noel-in" type="number" inputMode="numeric" min="1" max="16" placeholder="Ej: 8" value={datos.edad} onChange={set('edad')} autoFocus />
  </>);
  else if (paso === 'lugar') pantalla = form(<>
    <h1 className="noel-t">¿Dónde vive?</h1>
    <p className="noel-s">La región y la provincia.</p>
    <select className="noel-in" value={datos.region} onChange={set('region')}>
      <option value="">Elige la región</option>
      {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
    <input className="noel-in" placeholder="Provincia. Ej: Anta" value={datos.provincia} onChange={set('provincia')} />
  </>);
  else if (paso === 'carta') pantalla = form(<>
    <h1 className="noel-t">La carta de {nombre} a Papá Noel</h1>
    <p className="noel-s">Escríbela como la dicta {nombre}.</p>
    <textarea className="noel-in" placeholder="Querido Papá Noel, me llamo… tengo… años. Vivo en… Quisiera que me regales…" value={datos.carta_texto} onChange={set('carta_texto')} autoFocus />
  </>, !!datos.carta_texto.trim());
  else if (paso === 'carta_foto') pantalla = foto('carta_foto', 'Foto de la carta escrita a mano', 'Si la escribió en papel, tómale una foto.');
  else if (paso === 'foto_familia') pantalla = foto('foto_familia', `Una foto de ${nombre} o de su familia`, 'Es la foto que verán los padrinos.');
  else if (paso === 'video') pantalla = foto('video', `Un video de ${nombre}`, 'Opcional. Un saludo corto basta.', true);
  else if (paso === 'whatsapp') pantalla = form(<>
    <h1 className="noel-t">WhatsApp para coordinar</h1>
    <p className="noel-s">En la carta aparece un botón de WhatsApp para que el padrino te escriba.</p>
    <input className="noel-in" type="tel" inputMode="numeric" placeholder="9XXXXXXXX" value={datos.whatsapp} onChange={set('whatsapp')} autoFocus />
  </>);
  else pantalla = (
    <>
      <h1 className="noel-t">Revisa y envía</h1>
      <p className="noel-s">Toca un dato si quieres cambiarlo.</p>
      <div className="noel-resumen">
        {[['Nombre', datos.nombre, 0], ['Edad', datos.edad && `${datos.edad} años`, 1], ['Lugar', [datos.provincia, datos.region].filter(Boolean).join(', '), 2],
          ['Carta', datos.carta_texto, 3], ['Fotos', [archivos.carta_foto && 'carta', archivos.foto_familia && 'familia', archivos.video && 'video'].filter(Boolean).join(', ') || 'Ninguna', 4],
          ['WhatsApp', datos.whatsapp, 7]].map(([l, v, p]) => (
          <div key={l} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => ir({ p: 'registrar', i: p }, true)}><span>{l}</span><b>{v || '—'}</b></div>
        ))}
      </div>
      {error && <div className="noel-err" role="alert">{error}</div>}
      <button className="noel-btn" onClick={enviar} disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar carta a Papá Noel'}</button>
    </>
  );

  return <><p className="noel-paso">Paso {Math.min(i + 1, PASOS.length)} de {PASOS.length}</p>{prog}{pantalla}</>;
}

function Mi({ ir, user }) {
  const [datos, setDatos] = useState(null);
  useEffect(() => {
    if (!user) return;
    Promise.all([
      axios.get(`${API}/api/mis-apadrinados`).then(r => r.data).catch(() => []),
      axios.get(`${API}/api/mis-ninos`).then(r => r.data).catch(() => []),
    ]).then(([a, m]) => setDatos({ a, m }));
  }, [user]);

  if (!user) return (
    <>
      <h1 className="noel-t">Mi niño</h1>
      <p className="noel-s">Inicia sesión para ver a los niños que apadrinaste o las cartas que registraste.</p>
      <Link className="noel-btn" to="/login?next=/">Iniciar sesión</Link>
    </>
  );
  if (!datos) return <p className="noel-vacio">Cargando…</p>;
  const grupo = (titulo, L) => L.length > 0 && (
    <>
      <p className="noel-paso" style={{ marginTop: 18 }}>{titulo}</p>
      {L.map(n => (
        <button key={n.id} className="noel-nino" onClick={() => ir({ p: 'carta', id: n.id })}>
          <Avatar n={n} />
          <div><b>{n.nombre}{n.edad ? `, ${n.edad} años` : ''}</b><span>{lugar(n) || 'Perú'}</span></div>
          <span className={`noel-tag ${n.tiene_padrino ? 'con' : ''}`}>{n.tiene_padrino ? 'Apadrinado' : 'Busca padrino'}</span>
        </button>
      ))}
    </>
  );
  return (
    <>
      <h1 className="noel-t">Mi niño</h1>
      <p className="noel-s">{user.displayName || user.email}</p>
      {grupo('Niños que apadrinas', datos.a)}
      {grupo('Cartas que registraste', datos.m)}
      {!datos.a.length && !datos.m.length && (
        <>
          <p className="noel-vacio">Aún no apadrinas a ningún niño.</p>
          <button className="noel-btn" onClick={() => ir({ p: 'cartas', f: 'sin' })}>Ver quién espera un padrino</button>
        </>
      )}
    </>
  );
}

// ── Página ────────────────────────────────────────────────

export default function Noel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [pila, setPila] = useState([{ p: 'inicio' }]);
  const [atras, setAtras] = useState(false);
  const [ninos, setNinos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState({ nombre: '', edad: '', provincia: '', region: '', carta_texto: '', whatsapp: '' });
  const [archivos, setArchivos] = useState({ carta_foto: null, foto_familia: null, video: null });
  const cuerpo = useRef(null);

  const cargar = () => axios.get(API + '/api/ninos').then(r => setNinos(r.data || [])).catch(() => {}).finally(() => setCargando(false));

  useEffect(() => {
    document.body.classList.add('noel-solo');
    cargar();
    // Al volver de iniciar sesión, se retoma la pantalla donde estaba
    try {
      const g = JSON.parse(sessionStorage.getItem(GUARDA) || 'null');
      if (g && g.length) { setPila(g); setAbierto(true); }
      sessionStorage.removeItem(GUARDA);
    } catch (e) {}
    return () => document.body.classList.remove('noel-solo');
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const k = e => { if (e.key === 'Escape') cerrar(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const actual = pila[pila.length - 1];
  const ir = (pantalla, reemplazar) => {
    setAtras(false);
    setPila(p => reemplazar ? [...p.slice(0, -1), pantalla] : [...p, pantalla]);
    if (cuerpo.current) cuerpo.current.scrollTop = 0;
  };
  const volver = () => { setAtras(true); setPila(p => p.length > 1 ? p.slice(0, -1) : p); };
  const cerrar = () => { setAbierto(false); setPila([{ p: 'inicio' }]); };

  // Antes de ir a iniciar sesión, guardar dónde estaba
  useEffect(() => {
    const guardar = () => { try { sessionStorage.setItem(GUARDA, JSON.stringify(pila)); } catch (e) {} };
    const links = document.querySelectorAll('.noel a[href^="/login"]');
    links.forEach(a => a.addEventListener('click', guardar));
    return () => links.forEach(a => a.removeEventListener('click', guardar));
  });

  const nino = actual.id ? ninos.find(n => n.id === actual.id) : null;
  let pantalla;
  if (actual.p === 'cartas') pantalla = <Cartas ir={ir} ninos={ninos} cargando={cargando} f={actual.f} />;
  else if (actual.p === 'carta') pantalla = cargando ? <p className="noel-vacio">Cargando…</p> : <Carta ir={ir} nino={nino} />;
  else if (actual.p === 'padrino') pantalla = <Padrino ir={ir} nino={nino} user={user}
    alApadrinar={id => setNinos(L => L.map(n => n.id === id ? { ...n, tiene_padrino: true } : n))} />;
  else if (actual.p === 'registrar') pantalla = <Registrar ir={ir} i={actual.i || 0} datos={datos} setDatos={setDatos}
    archivos={archivos} setArchivos={setArchivos} alRegistrar={() => { cargar(); setDatos({ nombre: '', edad: '', provincia: '', region: '', carta_texto: '', whatsapp: '' }); setArchivos({ carta_foto: null, foto_familia: null, video: null }); }} />;
  else if (actual.p === 'mi') pantalla = <Mi ir={ir} user={user} />;
  else pantalla = <Inicio ir={ir} ninos={ninos} user={user} />;

  return (
    <div className={`noel ${abierto ? 'abierto' : ''}`}>
      {!abierto && <div className="noel-marca">CartasANoel<span>.pe</span></div>}
      <div className="noel-halo" aria-hidden="true"><i /><i /><i /></div>
      <button className="noel-santa" aria-label={abierto ? 'Volver al inicio' : 'Abrir a Papá Noel'}
        onClick={() => abierto ? ir({ p: 'inicio' }) : setAbierto(true)} />
      {!abierto && <p className="noel-hint">Toca a Papá Noel</p>}
      {!abierto && <div className="noel-pie"><a href="/cartas" onClick={e => { e.preventDefault(); navigate('/cartas'); }}>Ver la página completa</a></div>}
      {abierto && (
        <section className="noel-ventana" role="dialog" aria-label="Papá Noel">
          <div className="noel-barra">
            {pila.length > 1 ? <button onClick={volver}>‹ Atrás</button> : <span />}
            <button className="noel-x" onClick={cerrar} aria-label="Cerrar">✕</button>
          </div>
          <div ref={cuerpo} key={pila.length + actual.p + (actual.i || '') + (actual.f || '')} className={`noel-cuerpo ${atras ? 'atras' : ''}`}>
            {pantalla}
          </div>
        </section>
      )}
    </div>
  );
}
