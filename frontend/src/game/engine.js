/* ═══════════════════════════════════════════════════════════
   El Laberinto de las Diez Llaves — motor del juego
   Canvas 2D puro: laberinto, linterna con sombras reales,
   diez llaves escondidas, señuelos que son trampas y una
   entidad que te busca por el sonido y por la vista.
   ═══════════════════════════════════════════════════════════ */

import {
  generarLaberinto, abrirBucles, callejones, celdasLibres,
  campoDistancias, hayVision, alcanceRayo, repartir, crearRng,
} from './maze';

export const LLAVES_TOTALES = 10;

export const DIFICULTADES = {
  facil: {
    id: 'facil', nombre: 'Fácil',
    cols: 35, filas: 27, luz: 5.4, senuelos: 5, vidas: 3,
    velPatrulla: 1.9, velCaza: 2.95, vista: 8.5, oido: 5, memoria: 3.5,
    verEntidadEnMapa: true,
    descripcion: 'Linterna amplia, tres sustos de margen y la entidad aparece en tu mapa.',
  },
  normal: {
    id: 'normal', nombre: 'Normal',
    cols: 45, filas: 33, luz: 4.3, senuelos: 7, vidas: 2,
    velPatrulla: 2.2, velCaza: 3.3, vista: 11, oido: 6.5, memoria: 5,
    verEntidadEnMapa: false,
    descripcion: 'El laberinto crece, la luz se encoge y ella escucha tus pasos.',
  },
  pesadilla: {
    id: 'pesadilla', nombre: 'Pesadilla',
    cols: 55, filas: 41, luz: 3.5, senuelos: 10, vidas: 1,
    velPatrulla: 2.6, velCaza: 3.75, vista: 14, oido: 8.5, memoria: 7,
    verEntidadEnMapa: false,
    descripcion: 'Un solo error y se acabó. Corre más rápido que tú si te descuidas.',
  },
};

const VEL_CAMINAR = 3.5;
const VEL_CORRER = 5.6;
const RADIO_JUGADOR = 0.3;
const RADIO_RECOGER = 0.56;
const RESISTENCIA_MAX = 100;
const GASTO_RESISTENCIA = 26;
const RECUPERO_RESISTENCIA = 15;

const TRAMPAS = [
  { id: 'grito', texto: 'Era un cebo. Un grito sale del suelo y ella sabe exactamente dónde estás.' },
  { id: 'oscuridad', texto: 'Era un cebo. Tu linterna se ahoga: casi no ves nada.' },
  { id: 'vertigo', texto: 'Era un cebo. El piso gira… tus controles se invirtieron.' },
  { id: 'cadenas', texto: 'Era un cebo. Unas cadenas te sujetan los pies. No puedes moverte.' },
  { id: 'eco', texto: 'Era un cebo. Un eco la arrastró hasta cerca de ti.' },
];

const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;

export default class JuegoLaberinto {
  constructor(canvas, minimapa, alCambiarEstado) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.minimapa = minimapa;
    this.mctx = minimapa ? minimapa.getContext('2d') : null;
    this.alCambiarEstado = alCambiarEstado || (() => {});

    this.luzCanvas = document.createElement('canvas');
    this.lctx = this.luzCanvas.getContext('2d');

    this.teclas = new Set();
    this.ejeTactil = { x: 0, y: 0 };
    this.correrTactil = false;
    this.sonido = null;

    this.fase = 'menu';
    this.raf = null;
    this.ultimo = 0;
    this.acumuladorEstado = 0;
    this.dpr = 1;
    this.tile = 40;

    this._bucle = this._bucle.bind(this);
  }

  /* ── ciclo de vida ───────────────────────────────────────── */

  redimensionar() {
    const c = this.canvas;
    const rect = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    this.ancho = Math.max(1, Math.round(rect.width));
    this.alto = Math.max(1, Math.round(rect.height));
    c.width = Math.round(this.ancho * dpr);
    c.height = Math.round(this.alto * dpr);
    this.luzCanvas.width = c.width;
    this.luzCanvas.height = c.height;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // El tamaño de celda se adapta para que siempre se vea una porción parecida.
    const celdasAltas = this.alto < 460 ? 9.5 : 11.5;
    this.tile = clamp(this.alto / celdasAltas, 26, 62);
    if (this.fase !== 'menu') this.dibujar();
  }

  nuevaPartida(dificultadId, semilla) {
    const cfg = DIFICULTADES[dificultadId] || DIFICULTADES.normal;
    this.cfg = cfg;
    this.semilla = semilla || (Date.now() % 2147483647);
    const rng = crearRng(this.semilla);
    this.rng = rng;

    const lab = generarLaberinto(cfg.cols, cfg.filas, rng);
    abrirBucles(lab, rng, 0.28);
    this.lab = lab;

    const inicio = { x: 1, y: 1 };
    const desdeInicio = campoDistancias(lab, inicio.x, inicio.y);
    const libres = celdasLibres(lab).filter((c) => desdeInicio[lab.i(c.x, c.y)] >= 0);
    let maxD = 0;
    for (const c of libres) maxD = Math.max(maxD, desdeInicio[lab.i(c.x, c.y)]);

    const puntas = callejones(lab).filter((c) => desdeInicio[lab.i(c.x, c.y)] > maxD * 0.15);
    puntas.sort((a, b) => desdeInicio[lab.i(b.x, b.y)] - desdeInicio[lab.i(a.x, a.y)]);

    // La salida: el rincón más lejano del punto de partida.
    this.salida = puntas.length ? puntas[0] : libres[libres.length - 1];
    const usadas = new Set([`${this.salida.x},${this.salida.y}`]);

    const disponibles = puntas.filter((c) => !usadas.has(`${c.x},${c.y}`));
    const reserva = libres.filter(
      (c) => desdeInicio[lab.i(c.x, c.y)] > maxD * 0.25 && !usadas.has(`${c.x},${c.y}`)
    );

    const puntosLlaves = repartir(
      disponibles.length >= LLAVES_TOTALES ? disponibles : disponibles.concat(reserva),
      LLAVES_TOTALES, Math.max(4, Math.round(cfg.cols / 7)), rng
    );
    puntosLlaves.forEach((p) => usadas.add(`${p.x},${p.y}`));

    const restantes = disponibles.concat(reserva).filter((c) => !usadas.has(`${c.x},${c.y}`));
    const puntosSenuelos = repartir(restantes, cfg.senuelos, 3, rng);

    this.objetos = [
      ...puntosLlaves.map((p, i) => ({ x: p.x + 0.5, y: p.y + 0.5, real: true, tomado: false, fase: i * 0.7 })),
      ...puntosSenuelos.map((p, i) => ({ x: p.x + 0.5, y: p.y + 0.5, real: false, tomado: false, fase: i * 0.9 })),
    ];

    this.jugador = {
      x: inicio.x + 0.5, y: inicio.y + 0.5,
      angulo: 0, resistencia: RESISTENCIA_MAX, vidas: cfg.vidas,
      invulnerable: 0, adrenalina: 0, moviendo: false, corriendo: false,
    };

    // La entidad empieza lejos, en la mitad opuesta del laberinto.
    const lejanas = libres.filter((c) => desdeInicio[lab.i(c.x, c.y)] > maxD * 0.6);
    const inicioEntidad = lejanas.length
      ? lejanas[(rng() * lejanas.length) | 0]
      : libres[libres.length - 1];
    this.entidad = {
      x: inicioEntidad.x + 0.5, y: inicioEntidad.y + 0.5,
      alerta: 0, aturdido: 0, objetivo: { x: inicioEntidad.x, y: inicioEntidad.y },
      objetivoIdx: -1, vel: cfg.velPatrulla, meneo: 0,
    };

    this.campo = new Int32Array(lab.cols * lab.filas);
    this.campo.fill(-1);
    this.visto = new Uint8Array(lab.cols * lab.filas);
    this.efectos = { oscuridad: 0, vertigo: 0, cadenas: 0 };
    this.llaves = 0;
    this.tiempo = 0;
    this.terror = 0;
    this.destello = 0;
    this.sacudida = 0;
    this.radioLuz = cfg.luz;
    this.puertaAbierta = false;
    this.mensaje = null;
    this.particulas = [];
    this.camara = { x: this.jugador.x, y: this.jugador.y };
    this.libresCache = libres;

    this.fase = 'jugando';
    this.ultimo = 0;
    this.mostrarMensaje('Diez llaves abren la puerta. No todo lo que brilla es una llave.', 5);
    this.redimensionar();
    this.emitirEstado(true);
    this.arrancarBucle();
  }

  arrancarBucle() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.ultimo = 0;
    this.raf = requestAnimationFrame(this._bucle);
  }

  detener() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  pausar() {
    if (this.fase !== 'jugando') return;
    this.fase = 'pausa';
    this.detener();
    this.emitirEstado(true);
  }

  reanudar() {
    if (this.fase !== 'pausa') return;
    this.fase = 'jugando';
    this.emitirEstado(true);
    this.arrancarBucle();
  }

  _bucle(ts) {
    if (this.fase !== 'jugando') return;
    if (!this.ultimo) this.ultimo = ts;
    const dt = Math.min((ts - this.ultimo) / 1000, 0.05);
    this.ultimo = ts;
    this.actualizar(dt);
    this.dibujar();
    if (this.fase === 'jugando') this.raf = requestAnimationFrame(this._bucle);
  }

  /* ── entradas ────────────────────────────────────────────── */

  tecla(codigo, pulsada) {
    if (pulsada) this.teclas.add(codigo);
    else this.teclas.delete(codigo);
  }

  vectorEntrada() {
    let x = 0, y = 0;
    const t = this.teclas;
    if (t.has('KeyW') || t.has('ArrowUp')) y -= 1;
    if (t.has('KeyS') || t.has('ArrowDown')) y += 1;
    if (t.has('KeyA') || t.has('ArrowLeft')) x -= 1;
    if (t.has('KeyD') || t.has('ArrowRight')) x += 1;
    if (Math.hypot(this.ejeTactil.x, this.ejeTactil.y) > 0.12) {
      x = this.ejeTactil.x;
      y = this.ejeTactil.y;
    }
    const largo = Math.hypot(x, y);
    if (largo > 1) { x /= largo; y /= largo; }
    return { x, y, largo: Math.min(largo, 1) };
  }

  /* ── lógica ──────────────────────────────────────────────── */

  libre(x, y) {
    const r = RADIO_JUGADOR;
    const x0 = Math.floor(x - r), x1 = Math.floor(x + r);
    const y0 = Math.floor(y - r), y1 = Math.floor(y + r);
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) if (this.lab.esPared(cx, cy)) return false;
    }
    return true;
  }

  actualizar(dt) {
    this.tiempo += dt;
    const j = this.jugador;
    const e = this.entidad;
    const cfg = this.cfg;

    for (const k of Object.keys(this.efectos)) {
      this.efectos[k] = Math.max(0, this.efectos[k] - dt);
    }
    j.invulnerable = Math.max(0, j.invulnerable - dt);
    j.adrenalina = Math.max(0, j.adrenalina - dt);
    this.destello = Math.max(0, this.destello - dt * 2.2);
    this.sacudida = Math.max(0, this.sacudida - dt * 2.6);
    if (this.mensaje && this.tiempo > this.mensaje.hasta) this.mensaje = null;

    /* movimiento del jugador */
    let ent = this.vectorEntrada();
    if (this.efectos.vertigo > 0) ent = { x: -ent.x, y: -ent.y, largo: ent.largo };
    if (this.efectos.cadenas > 0) ent = { x: 0, y: 0, largo: 0 };

    const quiereCorrer = (this.teclas.has('ShiftLeft') || this.teclas.has('ShiftRight') || this.correrTactil);
    const puedeCorrer = quiereCorrer && j.resistencia > 1 && ent.largo > 0.1;
    j.corriendo = puedeCorrer;
    j.moviendo = ent.largo > 0.1;

    if (puedeCorrer) j.resistencia = Math.max(0, j.resistencia - GASTO_RESISTENCIA * dt);
    else j.resistencia = Math.min(RESISTENCIA_MAX, j.resistencia + RECUPERO_RESISTENCIA * dt * (j.moviendo ? 0.6 : 1));

    let vel = puedeCorrer ? VEL_CORRER : VEL_CAMINAR;
    if (j.adrenalina > 0) vel *= 1.22;
    const dist = vel * dt * ent.largo;
    if (dist > 0) {
      j.angulo = Math.atan2(ent.y, ent.x);
      const pasos = Math.ceil(dist / 0.15);
      for (let i = 0; i < pasos; i++) {
        const paso = dist / pasos;
        const nx = j.x + ent.x * paso;
        if (this.libre(nx, j.y)) j.x = nx;
        const ny = j.y + ent.y * paso;
        if (this.libre(j.x, ny)) j.y = ny;
      }
      if (this.sonido) this.sonido.paso(this.tiempo, puedeCorrer);
    }

    /* luz: se estrecha con la trampa de oscuridad */
    const objetivoLuz = cfg.luz * (this.efectos.oscuridad > 0 ? 0.42 : 1);
    this.radioLuz = lerp(this.radioLuz, objetivoLuz, 1 - Math.exp(-dt * 3));

    this.marcarExplorado();
    this.recoger();
    this.actualizarEntidad(dt);
    this.actualizarParticulas(dt);

    /* cámara con un poco de retardo */
    const k = 1 - Math.exp(-dt * 9);
    this.camara.x = lerp(this.camara.x, j.x, k);
    this.camara.y = lerp(this.camara.y, j.y, k);

    /* terror: sube con la cercanía y con la caza */
    const d = Math.hypot(e.x - j.x, e.y - j.y);
    const cerca = clamp(1 - d / 14, 0, 1);
    const objetivoTerror = clamp(cerca * (e.alerta > 0 ? 1 : 0.55), 0, 1);
    this.terror = lerp(this.terror, objetivoTerror, 1 - Math.exp(-dt * 2.4));
    if (this.sonido) this.sonido.proximidad(this.terror, this.tiempo);

    /* salida */
    const dSalida = Math.hypot(this.salida.x + 0.5 - j.x, this.salida.y + 0.5 - j.y);
    if (dSalida < 0.75) {
      if (this.llaves >= LLAVES_TOTALES) this.terminar('victoria');
      else if (!this.mensaje) {
        this.mostrarMensaje(`La puerta pide diez llaves. Te faltan ${LLAVES_TOTALES - this.llaves}.`, 2.5);
      }
    }

    this.acumuladorEstado += dt;
    if (this.acumuladorEstado > 0.1) { this.acumuladorEstado = 0; this.emitirEstado(); }
  }

  marcarExplorado() {
    const j = this.jugador;
    const r = Math.ceil(this.radioLuz * 1.5);
    const cx = Math.floor(j.x), cy = Math.floor(j.y);
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (!this.lab.dentro(x, y)) continue;
        const i = this.lab.i(x, y);
        if (this.visto[i]) continue;
        if (Math.hypot(x + 0.5 - j.x, y + 0.5 - j.y) > this.radioLuz * 1.5) continue;
        if (hayVision(this.lab, j.x, j.y, x + 0.5, y + 0.5)) this.visto[i] = 1;
      }
    }
  }

  recoger() {
    const j = this.jugador;
    for (const o of this.objetos) {
      if (o.tomado) continue;
      if (Math.hypot(o.x - j.x, o.y - j.y) > RADIO_RECOGER) continue;
      o.tomado = true;
      if (o.real) {
        this.llaves++;
        if (this.sonido) this.sonido.llave();
        this.chispas(o.x, o.y, '#f7c948', 18);
        if (this.llaves >= LLAVES_TOTALES) {
          this.puertaAbierta = true;
          if (this.sonido) this.sonido.puerta();
          this.mostrarMensaje('Las diez llaves giran a la vez. La puerta se abrió… y ella lo escuchó.', 5);
          this.entidad.alerta = 999999;
        } else {
          this.mostrarMensaje(`Llave ${this.llaves} de ${LLAVES_TOTALES}.`, 2);
        }
      } else {
        this.activarTrampa(o);
      }
      this.emitirEstado(true);
    }
  }

  activarTrampa(o) {
    const trampa = TRAMPAS[(this.rng() * TRAMPAS.length) | 0];
    if (this.sonido) this.sonido.trampa();
    this.chispas(o.x, o.y, '#7f1d1d', 26);
    this.destello = 0.8;
    this.sacudida = 1;
    this.terror = Math.min(1, this.terror + 0.45);

    const j = this.jugador;
    const e = this.entidad;
    switch (trampa.id) {
      case 'grito':
        e.alerta = this.cfg.memoria * 1.8;
        e.objetivo = { x: Math.floor(j.x), y: Math.floor(j.y) };
        break;
      case 'oscuridad':
        this.efectos.oscuridad = 9;
        break;
      case 'vertigo':
        this.efectos.vertigo = 5;
        break;
      case 'cadenas':
        this.efectos.cadenas = 1.4;
        e.alerta = this.cfg.memoria;
        break;
      case 'eco': {
        const desdeJugador = campoDistancias(this.lab, Math.floor(j.x), Math.floor(j.y));
        const candidatas = this.libresCache.filter((c) => {
          const d = desdeJugador[this.lab.i(c.x, c.y)];
          return d >= 7 && d <= 12;
        });
        if (candidatas.length) {
          const c = candidatas[(this.rng() * candidatas.length) | 0];
          e.x = c.x + 0.5;
          e.y = c.y + 0.5;
        }
        e.alerta = this.cfg.memoria * 1.5;
        break;
      }
      default:
        break;
    }
    this.mostrarMensaje(trampa.texto, 4);
  }

  actualizarEntidad(dt) {
    const e = this.entidad;
    const j = this.jugador;
    const cfg = this.cfg;
    e.meneo += dt;

    if (e.aturdido > 0) { e.aturdido -= dt; return; }

    const dx = j.x - e.x, dy = j.y - e.y;
    const d = Math.hypot(dx, dy);
    const radioOido = cfg.oido * (j.corriendo ? 1.6 : j.moviendo ? 1 : 0.35);
    const ve = d < cfg.vista && hayVision(this.lab, e.x, e.y, j.x, j.y);
    const oye = d < radioOido;

    if (ve || oye || this.puertaAbierta) {
      e.alerta = this.puertaAbierta ? 999999 : cfg.memoria;
      e.objetivo = { x: Math.floor(j.x), y: Math.floor(j.y) };
    } else {
      e.alerta = Math.max(0, e.alerta - dt);
    }

    const cazando = e.alerta > 0;
    if (!cazando) {
      const cx = Math.floor(e.x), cy = Math.floor(e.y);
      const llego = cx === e.objetivo.x && cy === e.objetivo.y;
      if (llego || e.objetivoIdx === -1) {
        const c = this.libresCache[(this.rng() * this.libresCache.length) | 0];
        e.objetivo = { x: c.x, y: c.y };
      }
    }

    const idxObjetivo = this.lab.i(e.objetivo.x, e.objetivo.y);
    if (idxObjetivo !== e.objetivoIdx) {
      e.objetivoIdx = idxObjetivo;
      campoDistancias(this.lab, e.objetivo.x, e.objetivo.y, this.campo);
    }

    let vel = cazando ? cfg.velCaza : cfg.velPatrulla;
    if (this.puertaAbierta) vel *= 1.14;
    e.vel = vel;

    const cx = Math.floor(e.x), cy = Math.floor(e.y);
    const actual = this.campo[this.lab.i(cx, cy)];
    let destino = null;
    if (actual > 0) {
      let mejor = actual;
      for (const [ddx, ddy] of DIRS) {
        const nx = cx + ddx, ny = cy + ddy;
        if (this.lab.esPared(nx, ny)) continue;
        const nd = this.campo[this.lab.i(nx, ny)];
        if (nd >= 0 && nd < mejor) { mejor = nd; destino = { x: nx + 0.5, y: ny + 0.5 }; }
      }
    }
    if (!destino) destino = { x: cx + 0.5, y: cy + 0.5 };

    const vx = destino.x - e.x, vy = destino.y - e.y;
    const largo = Math.hypot(vx, vy);
    if (largo > 0.001) {
      const paso = Math.min(vel * dt, largo);
      e.x += (vx / largo) * paso;
      e.y += (vy / largo) * paso;
    }

    /* ¿te alcanzó? */
    if (d < 0.62 && j.invulnerable <= 0) this.impacto();
  }

  impacto() {
    const j = this.jugador;
    j.vidas -= 1;
    j.invulnerable = 2.8;
    j.adrenalina = 2;
    this.entidad.aturdido = 2;
    this.entidad.alerta = this.cfg.memoria;
    this.destello = 1;
    this.sacudida = 1.4;
    this.terror = 1;
    if (this.sonido) this.sonido.golpe();
    if (j.vidas <= 0) this.terminar('derrota');
    else {
      this.mostrarMensaje(`Te rozó. Te quedan ${j.vidas} ${j.vidas === 1 ? 'aliento' : 'alientos'}. Corre.`, 3.5);
      this.emitirEstado(true);
    }
  }

  terminar(resultado) {
    this.fase = resultado;
    this.detener();
    if (this.sonido) {
      if (resultado === 'victoria') this.sonido.victoria();
      else this.sonido.derrota();
      this.sonido.proximidad(0, this.tiempo);
    }
    if (resultado === 'victoria') {
      const clave = `laberinto-mejor-${this.cfg.id}`;
      try {
        const previo = parseFloat(window.localStorage.getItem(clave));
        if (!previo || this.tiempo < previo) {
          window.localStorage.setItem(clave, String(this.tiempo));
          this.nuevoRecord = true;
        } else this.nuevoRecord = false;
      } catch (err) { this.nuevoRecord = false; }
    }
    this.emitirEstado(true);
  }

  mostrarMensaje(texto, segundos) {
    this.mensaje = { texto, hasta: this.tiempo + (segundos || 3) };
  }

  chispas(x, y, color, cantidad) {
    for (let i = 0; i < cantidad; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 0.6 + Math.random() * 2.2;
      this.particulas.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        vida: 0.5 + Math.random() * 0.7, max: 1.2, color,
      });
    }
  }

  actualizarParticulas(dt) {
    for (let i = this.particulas.length - 1; i >= 0; i--) {
      const p = this.particulas[i];
      p.vida -= dt;
      if (p.vida <= 0) { this.particulas.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - dt * 2.4;
      p.vy *= 1 - dt * 2.4;
    }
  }

  emitirEstado(forzar) {
    const j = this.jugador;
    const estado = {
      fase: this.fase,
      llaves: this.llaves,
      total: LLAVES_TOTALES,
      vidas: j ? j.vidas : 0,
      vidasMax: this.cfg ? this.cfg.vidas : 0,
      tiempo: this.tiempo || 0,
      resistencia: j ? j.resistencia : 100,
      terror: this.terror || 0,
      mensaje: this.mensaje ? this.mensaje.texto : null,
      puertaAbierta: this.puertaAbierta,
      efectos: this.efectos ? { ...this.efectos } : null,
      dificultad: this.cfg ? this.cfg.id : null,
      nuevoRecord: !!this.nuevoRecord,
    };
    this.alCambiarEstado(estado, !!forzar);
  }

  /* ── dibujo ──────────────────────────────────────────────── */

  aPantalla(x, y) {
    return {
      x: (x - this.camara.x) * this.tile + this.ancho / 2,
      y: (y - this.camara.y) * this.tile + this.alto / 2,
    };
  }

  dibujar() {
    const ctx = this.ctx;
    const t = this.tile;
    const w = this.ancho, h = this.alto;

    ctx.save();
    if (this.sacudida > 0) {
      const s = this.sacudida * 7;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }

    ctx.fillStyle = '#07060a';
    ctx.fillRect(-20, -20, w + 40, h + 40);

    const x0 = Math.floor(this.camara.x - w / (2 * t)) - 1;
    const x1 = Math.ceil(this.camara.x + w / (2 * t)) + 1;
    const y0 = Math.floor(this.camara.y - h / (2 * t)) - 1;
    const y1 = Math.ceil(this.camara.y + h / (2 * t)) + 1;

    this.dibujarCeldas(ctx, x0, x1, y0, y1, t);
    this.dibujarSalida(ctx, t);
    this.dibujarObjetos(ctx, t);
    this.dibujarParticulas(ctx, t);
    this.dibujarEntidad(ctx, t);
    this.dibujarJugador(ctx, t);

    ctx.restore();

    this.dibujarLuz();
    this.dibujarBrillos();
    this.dibujarVineta();
    this.dibujarMinimapa();
  }

  dibujarCeldas(ctx, x0, x1, y0, y1, t) {
    const lab = this.lab;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const p = this.aPantalla(x, y);
        const pared = lab.esPared(x, y);
        // Variación determinista por celda: piedra irregular sin texturas externas.
        const n = ((x * 73856093) ^ (y * 19349663)) >>> 0;
        const v = (n % 100) / 100;
        if (pared) {
          ctx.fillStyle = `rgb(${38 + v * 12 | 0},${30 + v * 10 | 0},${26 + v * 9 | 0})`;
          ctx.fillRect(p.x, p.y, t + 1, t + 1);
          ctx.fillStyle = `rgba(255,236,200,${0.05 + v * 0.05})`;
          ctx.fillRect(p.x, p.y, t + 1, Math.max(2, t * 0.09));
          ctx.fillStyle = 'rgba(0,0,0,0.28)';
          ctx.fillRect(p.x, p.y + t * 0.88, t + 1, t * 0.14);
        } else {
          ctx.fillStyle = `rgb(${20 + v * 7 | 0},${17 + v * 6 | 0},${16 + v * 6 | 0})`;
          ctx.fillRect(p.x, p.y, t + 1, t + 1);
          if (v > 0.82) {
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.fillRect(p.x + t * 0.3, p.y + t * 0.35, t * 0.22, t * 0.16);
          }
          ctx.strokeStyle = 'rgba(0,0,0,0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(p.x + 0.5, p.y + 0.5, t, t);
        }
      }
    }
  }

  dibujarSalida(ctx, t) {
    const p = this.aPantalla(this.salida.x, this.salida.y);
    const abierta = this.puertaAbierta;
    const pulso = 0.5 + Math.sin(this.tiempo * 3) * 0.5;
    ctx.save();
    ctx.fillStyle = abierta ? `rgba(80,200,255,${0.25 + pulso * 0.35})` : 'rgba(60,50,45,0.9)';
    ctx.fillRect(p.x + t * 0.12, p.y + t * 0.06, t * 0.76, t * 0.9);
    ctx.strokeStyle = abierta ? `rgba(150,230,255,${0.7 + pulso * 0.3})` : 'rgba(120,100,80,0.8)';
    ctx.lineWidth = Math.max(2, t * 0.07);
    ctx.strokeRect(p.x + t * 0.12, p.y + t * 0.06, t * 0.76, t * 0.9);
    if (!abierta) {
      // Diez cerraduras: una por llave.
      for (let i = 0; i < LLAVES_TOTALES; i++) {
        const fila = i % 5, col = (i / 5) | 0;
        ctx.fillStyle = i < this.llaves ? '#f7c948' : 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.arc(p.x + t * (0.3 + col * 0.4), p.y + t * (0.2 + fila * 0.16), t * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  dibujarObjetos(ctx, t) {
    for (const o of this.objetos) {
      if (o.tomado) continue;
      const p = this.aPantalla(o.x, o.y);
      if (p.x < -t || p.y < -t || p.x > this.ancho + t || p.y > this.alto + t) continue;
      const flota = Math.sin(this.tiempo * 2 + o.fase) * t * 0.06;
      const y = p.y + flota;
      ctx.save();
      ctx.translate(p.x, y);
      const s = t / 40;
      // El señuelo es idéntico a la llave: solo al tocarlo sabes qué era.
      ctx.strokeStyle = '#f7c948';
      ctx.fillStyle = '#f7c948';
      ctx.lineWidth = 2.4 * s;
      ctx.beginPath();
      ctx.arc(0, -5 * s, 5 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillRect(-1.4 * s, -1 * s, 2.8 * s, 11 * s);
      ctx.fillRect(-1.4 * s, 6 * s, 6 * s, 2.2 * s);
      ctx.fillRect(-1.4 * s, 9.5 * s, 4.5 * s, 2.2 * s);
      // En Fácil, un titileo delata al cebo si estás muy cerca.
      if (this.cfg.id === 'facil' && !o.real) {
        const d = Math.hypot(o.x - this.jugador.x, o.y - this.jugador.y);
        if (d < 2.4) {
          ctx.globalAlpha = 0.35 + Math.sin(this.tiempo * 18) * 0.35;
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.arc(0, 0, 10 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  dibujarParticulas(ctx, t) {
    for (const p of this.particulas) {
      const s = this.aPantalla(p.x, p.y);
      ctx.globalAlpha = clamp(p.vida / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(s.x - t * 0.03, s.y - t * 0.03, t * 0.07, t * 0.07);
    }
    ctx.globalAlpha = 1;
  }

  dibujarEntidad(ctx, t) {
    const e = this.entidad;
    const p = this.aPantalla(e.x, e.y);
    const s = t / 40;
    ctx.save();
    ctx.translate(p.x, p.y);
    const r = 15 * s;
    // Cuerpo: humo que se retuerce.
    ctx.fillStyle = 'rgba(6,4,8,0.96)';
    ctx.beginPath();
    for (let i = 0; i <= 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const ondas = 1 + Math.sin(a * 3 + e.meneo * 4) * 0.14 + Math.sin(a * 5 - e.meneo * 2.4) * 0.08;
      const rr = r * ondas;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr * 1.22;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  dibujarJugador(ctx, t) {
    const j = this.jugador;
    const p = this.aPantalla(j.x, j.y);
    const s = t / 40;
    ctx.save();
    ctx.translate(p.x, p.y);
    if (j.invulnerable > 0 && Math.floor(this.tiempo * 12) % 2 === 0) ctx.globalAlpha = 0.4;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 9 * s, 8 * s, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8dcc8';
    ctx.beginPath();
    ctx.arc(0, -6 * s, 4.2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3c4a63';
    ctx.beginPath();
    ctx.moveTo(-6 * s, 8 * s);
    ctx.lineTo(-3.6 * s, -2.6 * s);
    ctx.lineTo(3.6 * s, -2.6 * s);
    ctx.lineTo(6 * s, 8 * s);
    ctx.closePath();
    ctx.fill();
    // Farol en la mano, del lado al que mira.
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.arc(Math.cos(j.angulo) * 8 * s, Math.sin(j.angulo) * 8 * s + 2 * s, 2.4 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Oscuridad con sombras: los rayos se detienen en las paredes. */
  dibujarLuz() {
    const l = this.lctx;
    const w = this.ancho, h = this.alto;
    const j = this.jugador;
    l.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    l.globalCompositeOperation = 'source-over';
    l.clearRect(0, 0, w, h);
    l.fillStyle = 'rgba(0,0,0,0.975)';
    l.fillRect(0, 0, w, h);

    const t = this.tile;
    const p = this.aPantalla(j.x, j.y);
    const radioCorto = this.radioLuz;
    const radioLargo = this.radioLuz * 2.2;
    const rayos = 132;

    l.beginPath();
    for (let i = 0; i <= rayos; i++) {
      const a = (i / rayos) * Math.PI * 2;
      const d = alcanceRayo(this.lab, j.x, j.y, a, radioLargo);
      const x = p.x + Math.cos(a) * d * t;
      const y = p.y + Math.sin(a) * d * t;
      if (i === 0) l.moveTo(x, y); else l.lineTo(x, y);
    }
    l.closePath();
    l.save();
    l.clip();
    l.globalCompositeOperation = 'destination-out';

    const halo = l.createRadialGradient(p.x, p.y, 0, p.x, p.y, radioCorto * t);
    halo.addColorStop(0, 'rgba(0,0,0,1)');
    halo.addColorStop(0.55, 'rgba(0,0,0,0.92)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    l.fillStyle = halo;
    l.fillRect(0, 0, w, h);

    // Cono de la linterna hacia donde caminas.
    const abertura = 0.44;
    const cono = l.createRadialGradient(p.x, p.y, radioCorto * t * 0.3, p.x, p.y, radioLargo * t);
    cono.addColorStop(0, 'rgba(0,0,0,0.95)');
    cono.addColorStop(1, 'rgba(0,0,0,0)');
    l.fillStyle = cono;
    l.beginPath();
    l.moveTo(p.x, p.y);
    l.arc(p.x, p.y, radioLargo * t, j.angulo - abertura, j.angulo + abertura);
    l.closePath();
    l.fill();
    l.restore();

    this.ctx.drawImage(this.luzCanvas, 0, 0, w, h);
  }

  /** Lo que se ve por encima de la oscuridad: destellos y ojos. */
  dibujarBrillos() {
    const ctx = this.ctx;
    const t = this.tile;
    const j = this.jugador;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Aura cálida del farol.
    const p = this.aPantalla(j.x, j.y);
    const aura = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, this.radioLuz * t * 0.9);
    aura.addColorStop(0, 'rgba(255,196,110,0.20)');
    aura.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, this.ancho, this.alto);

    // Los objetos brillan a lo lejos si hay línea de visión: no sabes si es
    // llave o cebo hasta que llegas.
    for (const o of this.objetos) {
      if (o.tomado) continue;
      const d = Math.hypot(o.x - j.x, o.y - j.y);
      if (d > 15) continue;
      if (!hayVision(this.lab, j.x, j.y, o.x, o.y)) continue;
      const s = this.aPantalla(o.x, o.y);
      const inten = clamp(1 - d / 15, 0.08, 1) * (0.55 + Math.sin(this.tiempo * 2.4 + o.fase) * 0.2);
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, t * 0.75);
      g.addColorStop(0, `rgba(255,210,120,${inten})`);
      g.addColorStop(1, 'rgba(255,180,80,0)');
      ctx.fillStyle = g;
      ctx.fillRect(s.x - t, s.y - t, t * 2, t * 2);
    }

    // La salida late a lo lejos cuando ya tienes las diez llaves.
    if (this.puertaAbierta) {
      const s = this.aPantalla(this.salida.x + 0.5, this.salida.y + 0.5);
      const pulso = 0.4 + Math.sin(this.tiempo * 3) * 0.25;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, t * 1.6);
      g.addColorStop(0, `rgba(120,220,255,${pulso})`);
      g.addColorStop(1, 'rgba(80,180,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(s.x - t * 2, s.y - t * 2, t * 4, t * 4);
    }

    // Los ojos de la entidad: lo único que ves de ella en la oscuridad.
    const e = this.entidad;
    const de = Math.hypot(e.x - j.x, e.y - j.y);
    if (de < 16 && hayVision(this.lab, j.x, j.y, e.x, e.y)) {
      const s = this.aPantalla(e.x, e.y);
      const sep = t * 0.13;
      const inten = clamp(1.1 - de / 16, 0.2, 1);
      for (const lado of [-1, 1]) {
        const g = ctx.createRadialGradient(s.x + sep * lado, s.y - t * 0.1, 0, s.x + sep * lado, s.y - t * 0.1, t * 0.42);
        g.addColorStop(0, `rgba(255,60,50,${inten})`);
        g.addColorStop(1, 'rgba(200,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(s.x - t, s.y - t, t * 2, t * 2);
      }
    }
    ctx.restore();

    if (this.puertaAbierta) this.dibujarBrujula();
  }

  /** Flecha en el borde de la pantalla apuntando a la salida abierta. */
  dibujarBrujula() {
    const ctx = this.ctx;
    const s = this.aPantalla(this.salida.x + 0.5, this.salida.y + 0.5);
    const cx = this.ancho / 2, cy = this.alto / 2;
    const margen = 46;
    if (s.x > margen && s.x < this.ancho - margen && s.y > margen && s.y < this.alto - margen) return;
    const a = Math.atan2(s.y - cy, s.x - cx);
    const rx = (this.ancho / 2 - margen) / Math.abs(Math.cos(a) || 0.0001);
    const ry = (this.alto / 2 - margen) / Math.abs(Math.sin(a) || 0.0001);
    const r = Math.min(rx, ry);
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(a);
    ctx.fillStyle = `rgba(140,225,255,${0.6 + Math.sin(this.tiempo * 4) * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-8, -9);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  dibujarVineta() {
    const ctx = this.ctx;
    const w = this.ancho, h = this.alto;
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.28, w / 2, h / 2, Math.max(w, h) * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(${18 + this.terror * 55 | 0},0,0,${0.5 + this.terror * 0.28})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    if (this.terror > 0.45) {
      const p = (this.terror - 0.45) / 0.55;
      ctx.fillStyle = `rgba(150,10,10,${p * 0.14 * (0.6 + Math.sin(this.tiempo * 7) * 0.4)})`;
      ctx.fillRect(0, 0, w, h);
    }
    if (this.destello > 0) {
      ctx.fillStyle = `rgba(190,20,20,${this.destello * 0.4})`;
      ctx.fillRect(0, 0, w, h);
    }
    if (this.efectos.vertigo > 0) {
      ctx.fillStyle = `rgba(120,0,140,${0.06 + Math.sin(this.tiempo * 5) * 0.05})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  dibujarMinimapa() {
    if (!this.mctx) return;
    const m = this.minimapa;
    const rect = m.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (m.width !== Math.round(rect.width * dpr)) {
      m.width = Math.round(rect.width * dpr);
      m.height = Math.round(rect.height * dpr);
    }
    const ctx = this.mctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);
    const esc = Math.min(w / this.lab.cols, h / this.lab.filas);
    const ox = (w - this.lab.cols * esc) / 2;
    const oy = (h - this.lab.filas * esc) / 2;

    for (let y = 0; y < this.lab.filas; y++) {
      for (let x = 0; x < this.lab.cols; x++) {
        if (!this.visto[this.lab.i(x, y)]) continue;
        ctx.fillStyle = this.lab.esPared(x, y) ? 'rgba(120,105,90,0.55)' : 'rgba(240,225,200,0.22)';
        ctx.fillRect(ox + x * esc, oy + y * esc, esc + 0.5, esc + 0.5);
      }
    }
    if (this.puertaAbierta) {
      ctx.fillStyle = '#6cd0ff';
      ctx.fillRect(ox + this.salida.x * esc - 1, oy + this.salida.y * esc - 1, esc + 2.5, esc + 2.5);
    }
    if (this.cfg.verEntidadEnMapa) {
      ctx.fillStyle = 'rgba(255,60,50,0.9)';
      ctx.beginPath();
      ctx.arc(ox + this.entidad.x * esc, oy + this.entidad.y * esc, Math.max(2, esc * 0.9), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.arc(ox + this.jugador.x * esc, oy + this.jugador.y * esc, Math.max(2, esc * 0.85), 0, Math.PI * 2);
    ctx.fill();
  }
}
