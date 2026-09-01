/* ═══════════════════════════════════════════════════════════
   El Laberinto de las Diez Llaves — utilidades de laberinto
   Rejilla de celdas: 1 = pared, 0 = suelo.
   ═══════════════════════════════════════════════════════════ */

export const PARED = 1;
export const SUELO = 0;

/** Las cuatro direcciones ortogonales, en orden reloj desde arriba. */
export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

/** Generador pseudoaleatorio con semilla (mulberry32): partidas reproducibles. */
export function crearRng(semilla) {
  let s = semilla >>> 0;
  return function rng() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Laberinto {
  constructor(cols, filas) {
    this.cols = cols;
    this.filas = filas;
    this.celdas = new Uint8Array(cols * filas).fill(PARED);
  }
  i(x, y) { return y * this.cols + x; }
  dentro(x, y) { return x >= 0 && y >= 0 && x < this.cols && y < this.filas; }
  esPared(x, y) { return !this.dentro(x, y) || this.celdas[this.i(x, y)] === PARED; }
  poner(x, y, v) { this.celdas[this.i(x, y)] = v; }
  /** Vecinos de suelo en 4 direcciones. */
  vecinos(x, y) {
    const out = [];
    for (const [dx, dy] of DIRS) if (!this.esPared(x + dx, y + dy)) out.push([x + dx, y + dy]);
    return out;
  }
}

/** Laberinto perfecto por backtracking iterativo. Las medidas se fuerzan a impares. */
export function generarLaberinto(cols, filas, rng) {
  const c = cols % 2 === 0 ? cols - 1 : cols;
  const f = filas % 2 === 0 ? filas - 1 : filas;
  const lab = new Laberinto(c, f);
  const pila = [[1, 1]];
  lab.poner(1, 1, SUELO);

  while (pila.length) {
    const [cx, cy] = pila[pila.length - 1];
    const opciones = [];
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx * 2;
      const ny = cy + dy * 2;
      if (nx > 0 && ny > 0 && nx < c - 1 && ny < f - 1 && lab.esPared(nx, ny)) {
        opciones.push([nx, ny, cx + dx, cy + dy]);
      }
    }
    if (!opciones.length) { pila.pop(); continue; }
    const [nx, ny, mx, my] = opciones[(rng() * opciones.length) | 0];
    lab.poner(mx, my, SUELO);
    lab.poner(nx, ny, SUELO);
    pila.push([nx, ny]);
  }
  return lab;
}

/**
 * Abre algunos callejones sin salida para crear bucles: sin esto el laberinto
 * es un árbol y la entidad te acorrala siempre en el mismo sitio.
 */
export function abrirBucles(lab, rng, probabilidad) {
  for (let y = 1; y < lab.filas - 1; y++) {
    for (let x = 1; x < lab.cols - 1; x++) {
      if (lab.esPared(x, y)) continue;
      if (lab.vecinos(x, y).length !== 1) continue;
      if (rng() > probabilidad) continue;
      const candidatas = DIRS.filter(([dx, dy]) => {
        const px = x + dx, py = y + dy;
        const sx = x + dx * 2, sy = y + dy * 2;
        return sx > 0 && sy > 0 && sx < lab.cols - 1 && sy < lab.filas - 1 &&
          lab.esPared(px, py) && !lab.esPared(sx, sy);
      });
      if (!candidatas.length) continue;
      const [dx, dy] = candidatas[(rng() * candidatas.length) | 0];
      lab.poner(x + dx, y + dy, SUELO);
    }
  }
}

/** Celdas de suelo con un solo vecino: los escondites naturales. */
export function callejones(lab) {
  const out = [];
  for (let y = 1; y < lab.filas - 1; y++) {
    for (let x = 1; x < lab.cols - 1; x++) {
      if (!lab.esPared(x, y) && lab.vecinos(x, y).length === 1) out.push({ x, y });
    }
  }
  return out;
}

/** Todas las celdas de suelo. */
export function celdasLibres(lab) {
  const out = [];
  for (let y = 1; y < lab.filas - 1; y++) {
    for (let x = 1; x < lab.cols - 1; x++) if (!lab.esPared(x, y)) out.push({ x, y });
  }
  return out;
}

/**
 * Campo de distancias (BFS) desde un origen. Devuelve un Int32Array con -1 en
 * lo inalcanzable. Sirve para repartir objetos y para que la entidad persiga.
 */
export function campoDistancias(lab, ox, oy, buffer) {
  const total = lab.cols * lab.filas;
  const dist = buffer && buffer.length === total ? buffer : new Int32Array(total);
  dist.fill(-1);
  if (lab.esPared(ox, oy)) return dist;
  const cola = new Int32Array(total);
  let cabeza = 0, cola_ = 0;
  const origen = lab.i(ox, oy);
  dist[origen] = 0;
  cola[cola_++] = origen;
  while (cabeza < cola_) {
    const actual = cola[cabeza++];
    const x = actual % lab.cols;
    const y = (actual / lab.cols) | 0;
    const d = dist[actual] + 1;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (lab.esPared(nx, ny)) continue;
      const ni = lab.i(nx, ny);
      if (dist[ni] !== -1) continue;
      dist[ni] = d;
      cola[cola_++] = ni;
    }
  }
  return dist;
}

/** ¿Hay línea recta sin paredes entre dos puntos (en coordenadas de celda)? */
export function hayVision(lab, x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const largo = Math.hypot(dx, dy);
  if (largo < 0.001) return true;
  const pasos = Math.ceil(largo / 0.12);
  for (let i = 1; i <= pasos; i++) {
    const t = i / pasos;
    if (lab.esPared(Math.floor(x0 + dx * t), Math.floor(y0 + dy * t))) return false;
  }
  return true;
}

/**
 * Distancia máxima que puede recorrer un rayo antes de chocar con una pared.
 * Se usa para dibujar el polígono de luz de la linterna.
 */
export function alcanceRayo(lab, x0, y0, angulo, maximo) {
  const dx = Math.cos(angulo);
  const dy = Math.sin(angulo);
  const paso = 0.09;
  for (let d = paso; d < maximo; d += paso) {
    if (lab.esPared(Math.floor(x0 + dx * d), Math.floor(y0 + dy * d))) return d - paso * 0.5;
  }
  return maximo;
}

/** Elige puntos bien repartidos entre las candidatas (separación mínima en celdas). */
export function repartir(candidatas, cantidad, separacion, rng) {
  const elegidas = [];
  const bolsa = candidatas.slice();
  for (let i = bolsa.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [bolsa[i], bolsa[j]] = [bolsa[j], bolsa[i]];
  }
  // Se intenta con la separacion pedida y se va relajando hasta completar el cupo.
  for (let margen = separacion; margen >= 0 && elegidas.length < cantidad; margen--) {
    const minimo = margen;
    for (const c of bolsa) {
      if (elegidas.length >= cantidad) break;
      if (elegidas.some((e) => e.x === c.x && e.y === c.y)) continue;
      if (elegidas.every((e) => Math.hypot(e.x - c.x, e.y - c.y) >= minimo)) elegidas.push(c);
    }
  }
  return elegidas;
}
