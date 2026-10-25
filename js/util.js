'use strict';
// ===== Utilitaires communs, helpers SVG et audio synthétisé =====
const G = window.G = {};
G.H = 720;          // hauteur logique d'une scène
G.FLOOR = 650;      // ligne de sol par défaut (bas des objets)
G.FTOP = 612;       // haut de la bande de sol (profondeur)
G.FBOT = 706;       // bas de la bande de sol

G.$ = (s, r = document) => r.querySelector(s);
G.$$ = (s, r = document) => [...r.querySelectorAll(s)];
G.uid = () => 'e' + Math.random().toString(36).slice(2, 10);
G.rand = (a, b) => a + Math.random() * (b - a);
G.ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
G.pick = a => a[Math.floor(Math.random() * a.length)];
G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
G.lerp = (a, b, t) => a + (b - a) * t;
G.el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
G.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---- couleurs ----
function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1);
}
G.shade = (hex, p) => {
  const [r, g, b] = hexToRgb(hex);
  const f = p < 0 ? v => v * (1 + p / 100) : v => v + (255 - v) * p / 100;
  return rgbToHex(f(r), f(g), f(b));
};
G.mix = (a, b, t) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(G.lerp(A[0], B[0], t), G.lerp(A[1], B[1], t), G.lerp(A[2], B[2], t));
};

// ---- helpers SVG ----
const O = G.O = '#3a2a4d';
let svgId = 0;
G.sid = () => 's' + (++svgId);
G.svg = {
  r: (x, y, w, h, f, rx = 6, sw = 3, s = O) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`,
  c: (x, y, r, f, sw = 3, s = O) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`,
  e: (x, y, rx, ry, f, sw = 3, s = O) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`,
  p: (d, f, sw = 3, s = O) => `<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`,
  l: (x1, y1, x2, y2, s = O, sw = 3) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-width="${sw}" stroke-linecap="round"/>`,
  pl: (pts, s, sw) => `<polyline points="${pts}" fill="none" stroke="${s}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
  t: (x, y, txt, size, fill = '#000', extra = '') => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="${fill}" ${extra}>${txt}</text>`,
  wrap: (w, h, inner, vb) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb || `0 0 ${w} ${h}`}" overflow="visible">${inner}</svg>`
};

// ---- Audio : effets et musique générés (Web Audio) ----
G.audio = (() => {
  let ctx = null, master, sfxGain, musicGain, nbuf;
  const st = { sfx: true, music: true };
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = 0.6; master.connect(ctx.destination);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.8; sfxGain.connect(master);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
    nbuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = nbuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function tone(f, d = 0.12, type = 'sine', v = 0.3, f2 = null, when = 0, dest = null) {
    if (!ctx || (!dest && !st.sfx)) return;
    const t = ctx.currentTime + when + 0.005;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest || sfxGain);
    o.start(t); o.stop(t + d + 0.05);
  }
  function noise(d = 0.2, freq = 1000, v = 0.3, when = 0, type = 'bandpass', dest = null) {
    if (!ctx || (!dest && !st.sfx)) return;
    const t = ctx.currentTime + when + 0.005;
    const s = ctx.createBufferSource(); s.buffer = nbuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(dest || sfxGain);
    s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
  }
  const N = n => 261.63 * Math.pow(2, n / 12);
  const sfx = {
    pop: () => tone(420, 0.09, 'sine', 0.3, 900),
    pick: () => tone(620, 0.07, 'triangle', 0.22, 1050),
    drop: () => tone(320, 0.1, 'sine', 0.28, 120),
    land: () => { tone(160, 0.08, 'sine', 0.25, 70); noise(0.05, 400, 0.15); },
    coin: () => { tone(988, 0.08, 'square', 0.09); tone(1319, 0.28, 'square', 0.09, null, 0.08); },
    eat: () => { noise(0.07, 2000, 0.35); noise(0.07, 1600, 0.3, 0.12); },
    drink: () => { tone(500, 0.08, 'sine', 0.2, 300); tone(450, 0.08, 'sine', 0.2, 280, 0.12); },
    splash: () => noise(0.55, 900, 0.35, 0, 'lowpass'),
    door: () => { tone(180, 0.15, 'triangle', 0.3, 140); noise(0.08, 600, 0.2, 0.12); },
    magic: () => [0, 0.06, 0.12, 0.18, 0.24].forEach((w, i) => tone(880 * Math.pow(1.19, i), 0.25, 'sine', 0.14, null, w)),
    error: () => { tone(220, 0.15, 'square', 0.1, 160); tone(160, 0.2, 'square', 0.1, 120, 0.12); },
    click: () => tone(900, 0.035, 'square', 0.06),
    zzz: () => tone(220, 0.5, 'sine', 0.07, 160),
    boing: () => tone(140, 0.35, 'sine', 0.32, 620),
    swoosh: () => noise(0.25, 1400, 0.22),
    tada: () => [0, 4, 7, 12].forEach((n, i) => tone(N(n + 12), 0.35, 'triangle', 0.18, null, i * 0.09)),
    note: n => { tone(N(n), 0.6, 'triangle', 0.22); tone(N(n + 12), 0.4, 'sine', 0.06); },
    flush: () => noise(1.1, 500, 0.3, 0, 'lowpass'),
    bip: () => tone(1500, 0.08, 'square', 0.08),
    ding: () => tone(1760, 0.6, 'sine', 0.18),
    bark: () => { tone(380, 0.09, 'sawtooth', 0.12, 250); tone(380, 0.09, 'sawtooth', 0.12, 250, 0.16); },
    meow: () => tone(700, 0.35, 'sawtooth', 0.07, 1000),
    squeak: () => tone(1800, 0.12, 'sine', 0.12, 2400),
    whirr: () => { tone(90, 1.4, 'sawtooth', 0.06, 140); noise(1.4, 3000, 0.08); },
    sizzle: () => noise(0.9, 5000, 0.08, 0, 'highpass'),
    camera: () => { noise(0.05, 3000, 0.3); tone(1200, 0.05, 'square', 0.05, null, 0.06); },
    ring: () => [0, 0.2, 0.6, 0.8].forEach(w => tone(1320, 0.12, 'square', 0.06, null, w)),
    cheer: () => [0, 2, 4, 5, 7, 9, 11, 12].forEach((n, i) => tone(N(n + 12), 0.15, 'square', 0.06, null, i * 0.05)),
    honk: () => { tone(420, 0.18, 'square', 0.1); tone(330, 0.25, 'square', 0.1, null, 0.2); },
    vroom: () => { tone(70, 1.2, 'sawtooth', 0.12, 220); noise(1, 300, 0.1, 0, 'lowpass'); },
    siren: () => [0, 0.4, 0.8, 1.2].forEach((w, i) => tone(i % 2 ? 660 : 880, 0.38, 'square', 0.06, null, w)),
    rocket: () => { noise(2, 600, 0.3, 0, 'lowpass'); tone(80, 2, 'sawtooth', 0.1, 400); },
    sparkle: () => [0, 0.05, 0.1].forEach((w, i) => tone(2000 + i * 400, 0.15, 'sine', 0.08, null, w)),
  };
  function play(name, a) { init(); if (sfx[name]) sfx[name](a); }

  // --- musique ---
  let musicTimer = null, mode = null, step = 0, nextT = 0;
  const prog = [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]]; // C G Am F
  const melody = [12, 14, 16, 19, 16, 14, 12, 7, 9, 12, 14, 12, 16, 14, 12, 11];
  function schedule() {
    if (!ctx || !mode) return;
    const disco = mode === 'disco';
    const stepDur = disco ? 0.23 : 0.3;
    while (nextT < ctx.currentTime + 0.25) {
      const bar = Math.floor(step / 8) % 4, s = step % 8, ch = prog[bar];
      const when = nextT - ctx.currentTime;
      const arp = ch[[0, 1, 2, 1][s % 4]];
      tone(N(arp), stepDur * 1.6, 'triangle', 0.16, null, when, musicGain);
      if (s === 0 || s === 4) tone(N(ch[0] - 12), stepDur * 3.5, 'sine', 0.3, null, when, musicGain);
      if (s % 2 === 0 && Math.random() < (disco ? 0.6 : 0.45)) {
        const m = melody[(step / 2 + bar * 3) % melody.length | 0];
        tone(N(m), stepDur * 1.8, 'sine', 0.12, null, when, musicGain);
      }
      if (disco) {
        if (s % 2 === 0) tone(150, 0.18, 'sine', 0.5, 45, when, musicGain);
        if (s % 2 === 1) noise(0.05, 8000, 0.12, when, 'highpass', musicGain);
        if (s === 2 || s === 6) noise(0.12, 1500, 0.18, when, 'bandpass', musicGain);
        if (s % 2 === 1) tone(N(ch[0] - 12 + (s === 3 || s === 7 ? 12 : 0)), 0.15, 'square', 0.06, null, when, musicGain);
      } else if (s % 4 === 2) {
        noise(0.03, 7000, 0.04, when, 'highpass', musicGain);
      }
      nextT += stepDur; step++;
    }
  }
  function setMusic(m) {
    if (!st.music) m = null;
    if (m === mode && (musicTimer || !m)) return;
    mode = m;
    if (!ctx) return;
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    if (mode) {
      nextT = ctx.currentTime + 0.1; step = 0;
      musicGain.gain.value = mode === 'disco' ? 0.2 : (mode === 'radio' ? 0.18 : 0.1);
      musicTimer = setInterval(schedule, 80);
    }
  }
  return { init, play, tone, noise, setMusic, st, get mode() { return mode; } };
})();
G.sfx = (n, a) => G.audio.play(n, a);
