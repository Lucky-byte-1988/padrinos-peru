import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import JuegoLaberinto, { DIFICULTADES, LLAVES_TOTALES } from '../game/engine';
import SonidoLaberinto from '../game/audio';
import './Laberinto.css';

const TECLAS_JUEGO = [
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'ShiftLeft', 'ShiftRight', 'Space',
];

function formatoTiempo(segundos) {
  const s = Math.max(0, segundos || 0);
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  const c = Math.floor((s % 1) * 100);
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
}

function mejorTiempo(dificultad) {
  try {
    const v = parseFloat(window.localStorage.getItem(`laberinto-mejor-${dificultad}`));
    return Number.isFinite(v) ? v : null;
  } catch (err) {
    return null;
  }
}

const ESTADO_INICIAL = {
  fase: 'menu', llaves: 0, total: LLAVES_TOTALES, vidas: 0, vidasMax: 0,
  tiempo: 0, resistencia: 100, terror: 0, mensaje: null,
  puertaAbierta: false, efectos: null, dificultad: null, nuevoRecord: false,
};

export default function Laberinto() {
  const lienzoRef = useRef(null);
  const mapaRef = useRef(null);
  const juegoRef = useRef(null);
  const sonidoRef = useRef(null);
  const palancaRef = useRef(null);
  const punteroRef = useRef(null);

  const [estado, setEstado] = useState(ESTADO_INICIAL);
  const [dificultad, setDificultad] = useState('normal');
  const [mudo, setMudo] = useState(false);
  const [nudo, setNudo] = useState({ x: 0, y: 0, activo: false });
  const [records, setRecords] = useState({});

  useEffect(() => {
    const r = {};
    Object.keys(DIFICULTADES).forEach((k) => { r[k] = mejorTiempo(k); });
    setRecords(r);
  }, [estado.fase]);

  /* ── creación del juego y escuchas globales ───────────────── */
  useEffect(() => {
    const juego = new JuegoLaberinto(lienzoRef.current, mapaRef.current, (nuevo) => {
      setEstado((previo) => {
        if (
          previo.fase === nuevo.fase && previo.llaves === nuevo.llaves &&
          previo.vidas === nuevo.vidas && previo.mensaje === nuevo.mensaje &&
          Math.abs(previo.tiempo - nuevo.tiempo) < 0.05 &&
          Math.abs(previo.resistencia - nuevo.resistencia) < 1 &&
          Math.abs(previo.terror - nuevo.terror) < 0.03 &&
          previo.puertaAbierta === nuevo.puertaAbierta
        ) return previo;
        return nuevo;
      });
    });
    juegoRef.current = juego;
    juego.redimensionar();

    // Con ?debug=1 la partida queda accesible desde la consola del navegador.
    const modoDebug = window.location.search.indexOf('debug') !== -1;
    if (modoDebug) window.__laberinto = juego;

    const alBajar = (ev) => {
      if (ev.code === 'Escape' || ev.code === 'KeyP') {
        ev.preventDefault();
        if (juego.fase === 'jugando') juego.pausar();
        else if (juego.fase === 'pausa') juego.reanudar();
        return;
      }
      if (!TECLAS_JUEGO.includes(ev.code)) return;
      ev.preventDefault();
      juego.tecla(ev.code, true);
    };
    const alSubir = (ev) => {
      if (!TECLAS_JUEGO.includes(ev.code)) return;
      ev.preventDefault();
      juego.tecla(ev.code, false);
    };
    const alRedimensionar = () => juego.redimensionar();
    const alPerderFoco = () => {
      juego.teclas.clear();
      if (juego.fase === 'jugando') juego.pausar();
    };

    window.addEventListener('keydown', alBajar);
    window.addEventListener('keyup', alSubir);
    window.addEventListener('resize', alRedimensionar);
    window.addEventListener('blur', alPerderFoco);

    return () => {
      window.removeEventListener('keydown', alBajar);
      window.removeEventListener('keyup', alSubir);
      window.removeEventListener('resize', alRedimensionar);
      window.removeEventListener('blur', alPerderFoco);
      juego.detener();
      if (modoDebug) delete window.__laberinto;
      if (sonidoRef.current) sonidoRef.current.cerrar();
    };
  }, []);

  const empezar = useCallback((id) => {
    if (!sonidoRef.current) sonidoRef.current = new SonidoLaberinto();
    sonidoRef.current.iniciar();
    sonidoRef.current.silenciar(mudo);
    const juego = juegoRef.current;
    juego.sonido = sonidoRef.current;
    setDificultad(id);
    juego.nuevaPartida(id);
  }, [mudo]);

  const alternarSonido = useCallback(() => {
    setMudo((m) => {
      const nuevo = !m;
      if (sonidoRef.current) sonidoRef.current.silenciar(nuevo);
      return nuevo;
    });
  }, []);

  const volverAlMenu = useCallback(() => {
    const juego = juegoRef.current;
    juego.detener();
    juego.fase = 'menu';
    if (sonidoRef.current) sonidoRef.current.proximidad(0, 0);
    setEstado(ESTADO_INICIAL);
  }, []);

  /* ── palanca táctil ───────────────────────────────────────── */
  const inicioPalanca = (ev) => {
    const juego = juegoRef.current;
    if (!juego || juego.fase !== 'jugando') return;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    punteroRef.current = ev.pointerId;
    moverPalanca(ev);
  };

  const moverPalanca = (ev) => {
    const juego = juegoRef.current;
    if (!juego || punteroRef.current !== ev.pointerId) return;
    const caja = palancaRef.current.getBoundingClientRect();
    const cx = caja.left + caja.width / 2;
    const cy = caja.top + caja.height / 2;
    let dx = (ev.clientX - cx) / (caja.width / 2);
    let dy = (ev.clientY - cy) / (caja.height / 2);
    const largo = Math.hypot(dx, dy);
    if (largo > 1) { dx /= largo; dy /= largo; }
    juego.ejeTactil = { x: dx, y: dy };
    setNudo({ x: dx, y: dy, activo: true });
  };

  const finPalanca = () => {
    const juego = juegoRef.current;
    punteroRef.current = null;
    if (juego) juego.ejeTactil = { x: 0, y: 0 };
    setNudo({ x: 0, y: 0, activo: false });
  };

  const correr = (activo) => {
    if (juegoRef.current) juegoRef.current.correrTactil = activo;
  };

  const enJuego = estado.fase === 'jugando' || estado.fase === 'pausa';
  const cfg = DIFICULTADES[estado.dificultad || dificultad];

  return (
    <div className="lab-pagina">
      <div className="lab-escena">
        <canvas ref={lienzoRef} className="lab-lienzo" />

        {/* ── HUD ── */}
        <div className={`lab-hud ${enJuego ? '' : 'lab-hud--oculto'}`}>
          <div className="lab-hud-arriba">
            <div className="lab-panel lab-llaves">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f7c948" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="8" cy="8" r="4.2" />
                <path d="M11 11l8 8M16 16l2.4-2.4M19 19l2-2" />
              </svg>
              <span className="lab-llaves-num">{estado.llaves}</span>
              <span className="lab-llaves-tot">/ {estado.total}</span>
            </div>

            <div className="lab-panel lab-tiempo">{formatoTiempo(estado.tiempo)}</div>

            <div className="lab-panel lab-vidas" aria-label="Alientos restantes">
              {Array.from({ length: estado.vidasMax }).map((_, i) => (
                <span key={i} className={`lab-aliento ${i < estado.vidas ? '' : 'lab-aliento--ido'}`} />
              ))}
            </div>

            <div className="lab-hud-botones">
              <button className="lab-icono" onClick={alternarSonido} title={mudo ? 'Activar sonido' : 'Silenciar'}>
                {mudo ? '🔇' : '🔊'}
              </button>
              <button
                className="lab-icono"
                onClick={() => (estado.fase === 'jugando' ? juegoRef.current.pausar() : juegoRef.current.reanudar())}
                title="Pausa (Esc)"
              >
                {estado.fase === 'jugando' ? '❚❚' : '▶'}
              </button>
            </div>
          </div>

          <canvas ref={mapaRef} className="lab-minimapa" />

          <div className="lab-hud-abajo">
            <div className="lab-resistencia">
              <div
                className={`lab-resistencia-barra ${estado.resistencia < 20 ? 'lab-resistencia-barra--baja' : ''}`}
                style={{ width: `${estado.resistencia}%` }}
              />
            </div>
            {estado.efectos && (
              <div className="lab-efectos">
                {estado.efectos.oscuridad > 0 && <span className="lab-efecto">Linterna ahogada {Math.ceil(estado.efectos.oscuridad)}s</span>}
                {estado.efectos.vertigo > 0 && <span className="lab-efecto lab-efecto--morado">Controles invertidos {Math.ceil(estado.efectos.vertigo)}s</span>}
                {estado.efectos.cadenas > 0 && <span className="lab-efecto lab-efecto--rojo">Cadenas</span>}
              </div>
            )}
          </div>

          {estado.mensaje && <div className="lab-mensaje">{estado.mensaje}</div>}

          {/* Controles táctiles */}
          <div
            ref={palancaRef}
            className="lab-palanca"
            onPointerDown={inicioPalanca}
            onPointerMove={moverPalanca}
            onPointerUp={finPalanca}
            onPointerCancel={finPalanca}
          >
            <div
              className={`lab-palanca-nudo ${nudo.activo ? 'lab-palanca-nudo--activo' : ''}`}
              style={{ transform: `translate(${nudo.x * 30}px, ${nudo.y * 30}px)` }}
            />
          </div>
          <button
            className="lab-correr"
            onPointerDown={(e) => { e.preventDefault(); correr(true); }}
            onPointerUp={() => correr(false)}
            onPointerCancel={() => correr(false)}
            onPointerLeave={() => correr(false)}
          >
            Correr
          </button>
        </div>

        {/* ── Menú ── */}
        {estado.fase === 'menu' && (
          <div className="lab-capa">
            <div className="lab-tarjeta">
              <p className="lab-kicker">Un juego</p>
              <h1 className="lab-titulo">El laberinto<br />de las diez llaves</h1>
              <p className="lab-texto">
                Despiertas perdido en un laberinto de piedra. Hay <strong>diez llaves</strong> escondidas
                en los rincones y una puerta que solo abre con las diez. Pero no todo lo que brilla
                es una llave: algunos son <strong>cebos</strong>, y cada cebo hace ruido.
              </p>
              <p className="lab-texto lab-texto--tenue">
                Y hay algo más aquí abajo. Te escucha caminar. Corre más rápido si te oye correr.
              </p>

              <div className="lab-dificultades">
                {Object.values(DIFICULTADES).map((d) => (
                  <button
                    key={d.id}
                    className={`lab-dif ${dificultad === d.id ? 'lab-dif--activa' : ''}`}
                    onClick={() => setDificultad(d.id)}
                  >
                    <span className="lab-dif-nombre">{d.nombre}</span>
                    <span className="lab-dif-desc">{d.descripcion}</span>
                    {records[d.id] && <span className="lab-dif-record">Mejor: {formatoTiempo(records[d.id])}</span>}
                  </button>
                ))}
              </div>

              <button className="lab-boton" onClick={() => empezar(dificultad)}>Entrar al laberinto</button>

              <div className="lab-controles">
                <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o flechas para caminar</span>
                <span><kbd>Shift</kbd> para correr (gasta aire)</span>
                <span><kbd>Esc</kbd> para pausar</span>
                <span className="lab-controles-movil">En el celular: palanca abajo a la izquierda y botón Correr</span>
              </div>
              <Link to="/" className="lab-salir">← Volver a Cartas a Noel</Link>
            </div>
          </div>
        )}

        {/* ── Pausa ── */}
        {estado.fase === 'pausa' && (
          <div className="lab-capa lab-capa--suave">
            <div className="lab-tarjeta lab-tarjeta--corta">
              <h2 className="lab-titulo lab-titulo--chico">En pausa</h2>
              <p className="lab-texto">Llaves: {estado.llaves} de {estado.total} · Tiempo {formatoTiempo(estado.tiempo)}</p>
              <button className="lab-boton" onClick={() => juegoRef.current.reanudar()}>Seguir</button>
              <button className="lab-boton lab-boton--fantasma" onClick={volverAlMenu}>Salir al menú</button>
            </div>
          </div>
        )}

        {/* ── Derrota ── */}
        {estado.fase === 'derrota' && (
          <div className="lab-capa lab-capa--sangre">
            <div className="lab-tarjeta lab-tarjeta--corta">
              <h2 className="lab-titulo lab-titulo--chico">Te alcanzó</h2>
              <p className="lab-texto">
                Llegaste a <strong>{estado.llaves}</strong> de {estado.total} llaves en {formatoTiempo(estado.tiempo)}.
                {estado.llaves < 4 ? ' El laberinto casi no te conoció.' : ' Estuviste cerca.'}
              </p>
              <button className="lab-boton" onClick={() => empezar(estado.dificultad || dificultad)}>Otra vez</button>
              <button className="lab-boton lab-boton--fantasma" onClick={volverAlMenu}>Cambiar dificultad</button>
            </div>
          </div>
        )}

        {/* ── Victoria ── */}
        {estado.fase === 'victoria' && (
          <div className="lab-capa lab-capa--luz">
            <div className="lab-tarjeta lab-tarjeta--corta">
              <h2 className="lab-titulo lab-titulo--chico">Saliste</h2>
              <p className="lab-texto">
                Diez llaves, una puerta y {formatoTiempo(estado.tiempo)} sin que te agarrara.
                {cfg ? ` Dificultad ${cfg.nombre}.` : ''}
              </p>
              {estado.nuevoRecord && <p className="lab-record">¡Nuevo mejor tiempo!</p>}
              <button className="lab-boton" onClick={() => empezar(estado.dificultad || dificultad)}>Otro laberinto</button>
              <button className="lab-boton lab-boton--fantasma" onClick={volverAlMenu}>Menú</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
