/* ═══════════════════════════════════════════════════════════
   Sonido del laberinto — todo sintetizado con WebAudio.
   Sin archivos: nada que descargar, nada que pese.
   ═══════════════════════════════════════════════════════════ */

export default class SonidoLaberinto {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.activo = false;
    this.zumbido = null;
    this.gruñido = null;
    this.gruñidoGain = null;
    this.ultimoLatido = 0;
    this.ultimoPaso = 0;
  }

  /** Debe llamarse desde un gesto del usuario (el botón de empezar). */
  iniciar() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(this.ctx.destination);
    this.activo = true;
    this._ambiente();
  }

  silenciar(mudo) {
    this.activo = !mudo;
    if (this.master) {
      this.master.gain.setTargetAtTime(mudo ? 0 : 0.55, this.ctx.currentTime, 0.08);
    }
  }

  cerrar() {
    if (this.zumbido) { try { this.zumbido.stop(); } catch (e) { /* ya parado */ } }
    if (this.gruñido) { try { this.gruñido.stop(); } catch (e) { /* ya parado */ } }
    if (this.ctx) { try { this.ctx.close(); } catch (e) { /* ya cerrado */ } }
    this.ctx = null;
    this.master = null;
    this.zumbido = null;
    this.gruñido = null;
  }

  _ruidoBuffer(segundos) {
    const largo = Math.floor(this.ctx.sampleRate * segundos);
    const buf = this.ctx.createBuffer(1, largo, this.ctx.sampleRate);
    const datos = buf.getChannelData(0);
    for (let i = 0; i < largo; i++) datos[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** Colchón grave constante: el laberinto "respira". */
  _ambiente() {
    const ctx = this.ctx;
    const fuente = ctx.createBufferSource();
    fuente.buffer = this._ruidoBuffer(4);
    fuente.loop = true;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 130;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    fuente.connect(filtro).connect(g).connect(this.master);
    fuente.start();
    this.zumbido = fuente;

    // Gruñido de la entidad: siempre suena, pero su volumen depende de la distancia.
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 41;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 5.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 7;
    lfo.connect(lfoGain).connect(osc.frequency);
    const paso = ctx.createBiquadFilter();
    paso.type = 'lowpass';
    paso.frequency.value = 320;
    const g2 = ctx.createGain();
    g2.gain.value = 0;
    osc.connect(paso).connect(g2).connect(this.master);
    osc.start();
    lfo.start();
    this.gruñido = osc;
    this.gruñidoGain = g2;
  }

  /** Cercanía de la entidad de 0 a 1: sube el gruñido y acelera el latido. */
  proximidad(valor, tiempo) {
    if (!this.ctx || !this.activo) return;
    if (this.gruñidoGain) {
      this.gruñidoGain.gain.setTargetAtTime(Math.min(0.34, valor * 0.34), this.ctx.currentTime, 0.25);
    }
    if (valor > 0.18) {
      const intervalo = 1.15 - valor * 0.75;
      if (tiempo - this.ultimoLatido > intervalo) {
        this.ultimoLatido = tiempo;
        this._latido(0.14 + valor * 0.3);
        setTimeout(() => this._latido(0.09 + valor * 0.2), 190);
      }
    }
  }

  _latido(volumen) {
    if (!this.ctx || !this.activo) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(78, t);
    osc.frequency.exponentialRampToValueAtTime(34, t + 0.16);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(volumen, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  paso(tiempo, corriendo) {
    if (!this.ctx || !this.activo) return;
    const intervalo = corriendo ? 0.28 : 0.44;
    if (tiempo - this.ultimoPaso < intervalo) return;
    this.ultimoPaso = tiempo;
    const t = this.ctx.currentTime;
    const fuente = this.ctx.createBufferSource();
    fuente.buffer = this._ruidoBuffer(0.12);
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = 'bandpass';
    filtro.frequency.value = 950 + Math.random() * 320;
    filtro.Q.value = 1.2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(corriendo ? 0.12 : 0.07, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    fuente.connect(filtro).connect(g).connect(this.master);
    fuente.start(t);
  }

  _tono(freq, inicio, duracion, volumen, tipo) {
    const t = this.ctx.currentTime + inicio;
    const osc = this.ctx.createOscillator();
    osc.type = tipo || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volumen, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + duracion + 0.05);
  }

  llave() {
    if (!this.ctx || !this.activo) return;
    [1046, 1318, 1568].forEach((f, i) => this._tono(f, i * 0.07, 0.35, 0.16, 'triangle'));
  }

  trampa() {
    if (!this.ctx || !this.activo) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(52, t + 0.85);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.95);

    const ruido = this.ctx.createBufferSource();
    ruido.buffer = this._ruidoBuffer(0.5);
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = 'highpass';
    filtro.frequency.value = 1800;
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.16, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    ruido.connect(filtro).connect(g2).connect(this.master);
    ruido.start(t);
  }

  golpe() {
    if (!this.ctx || !this.activo) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.5);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  puerta() {
    if (!this.ctx || !this.activo) return;
    [196, 261, 329, 392].forEach((f, i) => this._tono(f, i * 0.11, 0.9, 0.14, 'triangle'));
  }

  victoria() {
    if (!this.ctx || !this.activo) return;
    [523, 659, 784, 1046, 1318].forEach((f, i) => this._tono(f, i * 0.13, 1.1, 0.16, 'triangle'));
  }

  derrota() {
    if (!this.ctx || !this.activo) return;
    [330, 262, 208, 156, 98].forEach((f, i) => this._tono(f, i * 0.17, 1.3, 0.17, 'sawtooth'));
  }
}
