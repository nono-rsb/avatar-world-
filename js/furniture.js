'use strict';
// ===== Catalogue des meubles (coordonnées locales : 0..w, 0..h, le bas = h) =====
(() => {
  const { r, c, e, p, l, t } = G.svg;
  const O = G.O, sh = G.shade;
  const F = G.FURN = {};
  const W1 = '#d9995e', W2 = '#a5683a', WH = '#fbf7f2', MT = '#cfd8e3', GL = '#cdeeff';
  const def = (id, o) => F[id] = Object.assign({ n: id, cat: 'Déco', price: 30, w: 100, h: 100 }, o);
  const emo = (x, y, ch, s) => t(x, y, ch, s, '#000');
  const glow = (x, y, rr, col) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${col}" opacity=".35"/>`;

  // ================= STRUCTURE =================
  def('porte', {
    n: 'Porte', cat: 'Structure', fixed: true, w: 150, h: 300, c: '#c97b4a', door: true,
    svg: (st, k) => r(4, 4, 142, 296, W2, 10) + r(18, 18, 114, 282, k, 6) + r(32, 36, 86, 100, sh(k, -12), 6, 2.5) + r(32, 156, 86, 110, sh(k, -12), 6, 2.5) + c(114, 168, 8, '#ffd23f')
  });
  def('fenetre', {
    n: 'Fenêtre', cat: 'Déco', price: 40, w: 210, h: 230, wall: true, y: 420, c: '#ff9ebb', timeDep: true,
    svg: (st, k) => {
      const s = G.skyNow(), id = G.sid();
      let v = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.top}"/><stop offset="1" stop-color="${s.bot}"/></linearGradient></defs>`;
      v += r(20, 14, 170, 186, `url(#${id})`, 4, 6, '#fff');
      v += s.night ? c(140, 60, 16, '#fff6c2', 0) + c(148, 54, 13, s.top, 0) + emo(60, 50, '✦', 12).replace('#000', '#fff') + emo(90, 90, '✦', 9).replace('#000', '#fff')
        : c(140, 62, 18, '#ffd23f', 0) + e(70, 90, 26, 10, '#fff', 0) + e(86, 82, 16, 10, '#fff', 0);
      v += r(16, 10, 178, 194, 'none', 4, 10, W2) + l(105, 14, 105, 200, '#fff', 6) + l(20, 107, 190, 107, '#fff', 6);
      v += p('M6,4 C30,60 30,150 14,214 L44,214 C60,150 50,60 46,4 Z', k) + p('M204,4 C180,60 180,150 196,214 L166,214 C150,150 160,60 164,4 Z', k);
      v += r(0, 0, 210, 12, sh(k, -20), 5) + r(8, 206, 194, 16, WH, 5);
      return v;
    }
  });
  def('horloge', {
    n: 'Horloge', cat: 'Déco', price: 25, w: 90, h: 90, wall: true, y: 260, c: '#ff9f43', timeDep: true,
    svg: (st, k) => {
      const tm = G.S ? G.S.time : 0.4, hr = tm * 24, a1 = (hr % 12) / 12 * Math.PI * 2, a2 = (hr % 1) * Math.PI * 2;
      let v = c(45, 45, 42, k, 4) + c(45, 45, 34, WH, 2.5);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; v += c(45 + Math.sin(a) * 28, 45 - Math.cos(a) * 28, 2, O, 0); }
      v += l(45, 45, 45 + Math.sin(a1) * 16, 45 - Math.cos(a1) * 16, O, 4) + l(45, 45, 45 + Math.sin(a2) * 25, 45 - Math.cos(a2) * 25, '#e63946', 3) + c(45, 45, 4, O, 0);
      return v;
    }
  });
  def('cadre', {
    n: 'Tableau', cat: 'Déco', price: 30, w: 170, h: 135, wall: true, y: 330, c: '#e8b44f', drawing: true,
    svg: (st, k) => {
      let v = r(0, 0, 170, 135, k, 6, 4) + r(12, 12, 146, 111, '#bfe6ff', 2, 2.5);
      if (G.S && G.S.drawing) v += `<image href="${G.S.drawing}" x="14" y="14" width="142" height="107" preserveAspectRatio="xMidYMid slice"/>`;
      else v += p('M14,120 L60,60 L90,95 L110,75 L156,120 Z', '#3ccf91', 2.5) + c(124, 40, 13, '#ffd23f', 2.5);
      return v;
    }
  });
  def('guirlande', {
    n: 'Guirlande lumineuse', cat: 'Déco', price: 35, w: 320, h: 70, wall: true, y: 150, toggle: true, light: { x: 160, y: 40, r: 220 }, st: { on: true },
    svg: (st) => {
      let v = p('M0,10 Q80,60 160,20 Q240,60 320,10', 'none', 2.5);
      const cols = ['#ff5c8a', '#ffd23f', '#3ccf91', '#4aa3ff', '#c77dff'];
      for (let i = 0; i < 9; i++) {
        const x = 18 + i * 35, y = 10 + Math.sin(i / 8 * Math.PI * 2) * 0 + (i % 2 ? 34 : 26);
        v += (st.on ? glow(x, y + 8, 14, cols[i % 5]) : '') + e(x, y + 8, 7, 10, st.on ? cols[i % 5] : '#888', 2);
      }
      return v;
    }
  });
  def('etagere', {
    n: 'Étagère murale', cat: 'Déco', price: 15, w: 200, h: 34, wall: true, y: 420, c: W1,
    surf: [{ x1: 4, x2: 196, y: 4 }],
    svg: (st, k) => r(0, 4, 200, 14, k, 4) + p('M20,18 L30,34 L40,18', 'none', 4, W2) + p('M160,18 L170,34 L180,18', 'none', 4, W2)
  });
  def('tapis', {
    n: 'Tapis', cat: 'Salon', price: 25, w: 340, h: 50, layer: 1, c: '#c77dff',
    svg: (st, k) => e(170, 25, 168, 22, k, 3) + e(170, 25, 135, 15, sh(k, 25), 2) + e(170, 25, 90, 9, sh(k, -10), 2)
  });
  def('tapis2', {
    n: 'Tapis rayé', cat: 'Chambre', price: 25, w: 300, h: 46, layer: 1, c: '#4aa3ff',
    svg: (st, k) => p('M20,4 L280,4 L298,42 L2,42 Z', k) + p('M60,4 L50,42 M120,4 L115,42 M180,4 L185,42 M240,4 L250,42', 'none', 8, sh(k, 30))
  });

  // ================= SALON =================
  def('canape', {
    n: 'Canapé', cat: 'Salon', price: 90, w: 330, h: 160, c: '#ff7aa2',
    slots: [{ x: 85, y: 108 }, { x: 165, y: 108 }, { x: 245, y: 108 }],
    svg: (st, k) => r(14, 22, 302, 90, k, 30) + r(42, 34, 118, 66, sh(k, 12), 20, 2.5) + r(170, 34, 118, 66, sh(k, 12), 20, 2.5)
      + r(22, 92, 286, 44, sh(k, 8), 14) + l(165, 96, 165, 132, O, 2.5) + r(0, 66, 52, 80, sh(k, -10), 22) + r(278, 66, 52, 80, sh(k, -10), 22)
      + r(28, 144, 14, 16, W2, 3) + r(288, 144, 14, 16, W2, 3)
  });
  def('fauteuil', {
    n: 'Fauteuil', cat: 'Salon', price: 50, w: 180, h: 160, c: '#4aa3ff',
    slots: [{ x: 90, y: 108 }],
    svg: (st, k) => r(14, 18, 152, 96, k, 30) + r(26, 92, 128, 44, sh(k, 12), 14) + r(0, 62, 44, 84, sh(k, -10), 20) + r(136, 62, 44, 84, sh(k, -10), 20) + r(24, 144, 14, 16, W2, 3) + r(142, 144, 14, 16, W2, 3)
  });
  def('pouf', {
    n: 'Pouf', cat: 'Salon', price: 20, w: 110, h: 70, c: '#ffd23f', slots: [{ x: 55, y: 22 }],
    svg: (st, k) => e(55, 40, 52, 28, k) + e(55, 22, 48, 12, sh(k, 20), 2.5)
  });
  def('tablebasse', {
    n: 'Table basse', cat: 'Salon', price: 35, w: 220, h: 80, c: W1, surf: [{ x1: 6, x2: 214, y: 4 }],
    svg: (st, k) => r(0, 4, 220, 18, k, 8) + r(16, 22, 14, 56, sh(k, -20), 3) + r(190, 22, 14, 56, sh(k, -20), 3) + r(16, 54, 188, 10, sh(k, -20), 3)
  });
  def('tv', {
    n: 'Télévision', cat: 'Salon', price: 120, w: 230, h: 240, c: W2, toggle: true, light: { x: 115, y: 70, r: 160 },
    svg: (st, k) => {
      let v = r(0, 166, 230, 74, k, 8) + r(14, 180, 92, 46, sh(k, 15), 5, 2.5) + r(124, 180, 92, 46, sh(k, 15), 5, 2.5) + c(60, 203, 4, '#ffd23f', 2) + c(170, 203, 4, '#ffd23f', 2);
      v += r(96, 140, 38, 26, '#3d3d4f', 4) + r(14, 6, 202, 136, '#2a2a3a', 12) + r(24, 16, 182, 116, st.on ? '#7fd6ff' : '#3d4a5c', 6, 2);
      if (st.on) {
        const ch = st.ch || 0;
        if (ch === 0) v += r(24, 96, 182, 36, '#3ccf91', 0, 0) + `<circle cx="70" cy="60" r="16" fill="#ffd23f" stroke="${O}" stroke-width="2.5"><animate attributeName="cy" values="40;82;40" dur="1s" repeatCount="indefinite"/></circle>` + emo(150, 80, '🐰', 30);
        else if (ch === 1) v += r(24, 16, 182, 116, '#1d3557', 6, 0) + `<g>${emo(115, 70, '🚀', 40)}<animateTransform attributeName="transform" type="translate" values="-50 20;50 -20;-50 20" dur="3s" repeatCount="indefinite"/></g>` + emo(50, 40, '⭐', 14) + emo(180, 100, '🌍', 26);
        else if (ch === 2) v += emo(115, 74, '🦖', 54) + `<text x="115" y="120" font-size="14" text-anchor="middle" fill="#fff" font-family="Fredoka">RAWR!</text>`;
        else v += r(24, 16, 182, 116, '#ff9ebb', 6, 0) + emo(80, 74, '👩‍🍳', 44) + emo(150, 84, '🍰', 34);
      } else v += p('M40,30 L70,30 L44,60 Z', 'rgba(255,255,255,.12)', 0);
      return v;
    },
    tap: (f) => {
      const st = f.st;
      if (!st.on) { st.on = true; st.ch = 0; } else { st.ch = (st.ch || 0) + 1; if (st.ch > 3) st.on = false; }
      G.sfx('click'); G.redraw(f); G.lightsDirty = true; if (st.on) G.emit('tv');
    }
  });
  def('lampe', {
    n: 'Lampadaire', cat: 'Salon', price: 30, w: 100, h: 270, c: '#ffd23f', toggle: true, light: { x: 50, y: 50, r: 260 }, st: { on: true },
    svg: (st, k) => (st.on ? glow(50, 60, 60, '#fff3b0') : '') + r(44, 70, 12, 186, '#6b6b7d', 4) + e(50, 260, 36, 9, '#6b6b7d') + p('M14,80 L32,10 L68,10 L86,80 Z', st.on ? sh(k, 40) : k)
  });
  def('plante', {
    n: 'Plante', cat: 'Déco', price: 20, w: 110, h: 180, c: '#ff9f43',
    svg: (st, k) => p('M55,110 C20,90 4,60 20,30 C40,40 50,70 55,110 Z', '#3ccf91') + p('M55,110 C90,90 106,60 92,26 C70,40 60,70 55,110 Z', '#2ec4b6') + p('M55,110 C45,70 50,30 58,6 C70,30 66,70 55,110 Z', '#3ccf91')
      + p('M22,110 L88,110 L80,178 L30,178 Z', k) + r(16, 104, 78, 14, sh(k, -15), 5)
  });
  def('cactus', {
    n: 'Cactus', cat: 'Déco', price: 15, w: 90, h: 150, c: '#e76f51',
    svg: (st, k) => r(32, 20, 26, 100, '#52b788', 13) + r(10, 50, 18, 40, '#52b788', 9) + r(62, 36, 18, 44, '#52b788', 9) + l(20, 88, 32, 88, '#52b788', 8) + l(70, 78, 58, 78, '#52b788', 8) + emo(45, 16, '🌸', 18)
      + p('M20,110 L70,110 L64,150 L26,150 Z', k)
  });
  def('bibliotheque', {
    n: 'Bibliothèque', cat: 'Salon', price: 70, w: 200, h: 270, c: W1,
    surf: [{ x1: 4, x2: 196, y: 6 }, { x1: 14, x2: 186, y: 96 }, { x1: 14, x2: 186, y: 182 }],
    svg: (st, k) => {
      let v = r(0, 6, 200, 264, k, 6) + r(12, 16, 176, 80, sh(k, -25), 3, 2) + r(12, 104, 176, 78, sh(k, -25), 3, 2) + r(12, 190, 176, 70, sh(k, -25), 3, 2);
      const cols = ['#ff5c8a', '#4aa3ff', '#3ccf91', '#ffd23f', '#c77dff', '#ff9f43'];
      for (let i = 0; i < 6; i++) v += r(110 + i * 12, 46 + (i % 2) * 4, 11, 50 - (i % 2) * 4, cols[i], 2, 2);
      for (let i = 0; i < 5; i++) v += r(20 + i * 13, 136 + (i % 3) * 3, 12, 46 - (i % 3) * 3, cols[(i + 2) % 6], 2, 2);
      for (let i = 0; i < 7; i++) v += r(80 + i * 13, 216 + (i % 2) * 5, 12, 44 - (i % 2) * 5, cols[(i + 4) % 6], 2, 2);
      return v;
    }
  });
  def('cheminee', {
    n: 'Cheminée', cat: 'Salon', price: 110, w: 270, h: 230, c: '#c0624a', toggle: true, light: { x: 135, y: 170, r: 220 },
    surf: [{ x1: 0, x2: 270, y: 30 }],
    svg: (st, k) => {
      let v = r(0, 30, 270, 22, '#e8e2d6', 5) + r(16, 52, 238, 178, k, 4);
      for (let y = 64; y < 230; y += 20) for (let x = 20 + (y % 40 ? 0 : 14); x < 246; x += 30) v += r(x, y, 26, 16, sh(k, 8), 2, 1.5, sh(k, -25));
      v += p('M60,230 L60,140 C60,100 210,100 210,140 L210,230 Z', '#2a2030');
      if (st.on) v += glow(135, 190, 70, '#ff9f43') + `<g class="flame">${p('M100,226 C90,190 120,180 116,150 C140,170 132,190 150,166 C170,200 176,214 170,226 Z', '#ff9f43', 2.5)}${p('M118,226 C112,206 130,196 132,180 C146,198 150,212 150,226 Z', '#ffd23f', 2)}</g>`;
      v += r(80, 214, 110, 14, '#6b3e22', 5, 2.5);
      return v;
    }
  });
  def('piano', {
    n: 'Piano', cat: 'Salon', price: 150, w: 250, h: 210, c: '#2b2b3a', surf: [{ x1: 4, x2: 246, y: 4 }],
    svg: (st, k) => {
      let v = r(0, 4, 250, 120, k, 8) + r(10, 104, 230, 34, '#f8f8f8', 3) + r(0, 136, 250, 20, k, 4) + r(14, 156, 18, 54, k, 3) + r(218, 156, 18, 54, k, 3);
      for (let i = 1; i < 14; i++) v += l(10 + i * 16.4, 106, 10 + i * 16.4, 136, O, 1.5);
      [1, 2, 4, 5, 6, 8, 9, 11, 12, 13].forEach(i => v += r(4 + i * 16.4, 106, 10, 18, '#222', 2, 0));
      v += emo(125, 50, '🎼', 26);
      return v;
    },
    tap: (f, lx, ly) => {
      const sc = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 24];
      const i = G.clamp(Math.floor((lx - 10) / 16.4), 0, 13);
      G.sfx('note', sc[i]); G.fxAt(f.x - 125 + lx, f.y - 130, '🎵', 'note'); G.emit('music');
    }
  });
  def('radio', {
    n: 'Chaîne hi-fi', cat: 'Salon', price: 45, w: 140, h: 100, c: '#ff5c8a', toggle: true, music: 'radio', free: true,
    svg: (st, k) => r(0, 20, 140, 80, k, 12) + c(36, 60, 22, '#3d3d4f') + c(36, 60, 10, st.on ? '#ffd23f' : '#6b6b7d') + c(104, 60, 22, '#3d3d4f') + c(104, 60, 10, st.on ? '#ffd23f' : '#6b6b7d') + r(56, 34, 28, 12, st.on ? '#3ccf91' : '#9aa5b1', 3, 2) + p('M20,20 L40,0', 'none', 3)
      + (st.on ? `<g class="pulse">${emo(70, -6, '🎶', 20)}</g>` : '')
  });

  // ================= CUISINE =================
  def('frigo', {
    n: 'Réfrigérateur', cat: 'Cuisine', price: 120, w: 150, h: 300, c: '#e9f4ff',
    cont: { area: [10, 10, 140, 296], slots: [[38, 110], [75, 110], [112, 110], [38, 196], [75, 196], [112, 196], [38, 284], [75, 284], [112, 284]] },
    svg: (st, k) => {
      if (!st.open) return r(0, 0, 150, 300, k, 18) + l(4, 100, 146, 100, O, 3) + r(120, 30, 10, 50, MT, 4, 2.5) + r(120, 120, 10, 80, MT, 4, 2.5) + emo(40, 150, '🧲', 18);
      return r(0, 0, 150, 300, k, 18) + r(10, 10, 130, 284, '#cfeaff', 10, 2.5) + l(12, 112, 138, 112, '#fff', 5) + l(12, 198, 138, 198, '#fff', 5) + l(12, 286, 138, 286, '#fff', 5)
        + r(10, 14, 130, 30, '#ffffff', 6, 2) + p('M150,6 L194,22 L194,290 L150,296 Z', sh(k, -8)) + r(160, 120, 24, 12, '#fff', 4, 2) + r(160, 200, 24, 12, '#fff', 4, 2);
    }
  });
  def('cuisiniere', {
    n: 'Cuisinière', cat: 'Cuisine', price: 100, w: 170, h: 210, c: '#f4f4f4', toggle: true,
    surf: [{ x1: 4, x2: 166, y: 92, cook: 'fire' }],
    svg: (st, k) => {
      let v = r(0, 0, 170, 70, sh(k, -6), 6) + c(30, 36, 8, '#3d3d4f') + c(62, 36, 8, '#3d3d4f') + c(108, 36, 8, '#3d3d4f') + c(140, 36, 8, '#3d3d4f');
      v += r(0, 86, 170, 124, k, 8) + r(0, 80, 170, 14, '#3d3d4f', 5);
      v += e(48, 87, 28, 4, st.on ? '#ff5c5c' : '#6b6b7d', 2) + e(122, 87, 28, 4, st.on ? '#ff5c5c' : '#6b6b7d', 2);
      v += r(20, 112, 130, 76, st.on ? '#ffb46b' : '#3d4a5c', 8) + r(40, 98, 90, 8, MT, 4, 2);
      if (st.on) v += `<g class="flicker">${emo(48, 74, '🔥', 16)}${emo(122, 74, '🔥', 16)}</g>`;
      return v;
    }
  });
  def('evier', {
    n: 'Évier', cat: 'Cuisine', price: 60, w: 210, h: 210, c: '#7fd6ff', toggle: true,
    surf: [{ x1: 4, x2: 60, y: 92 }, { x1: 150, x2: 206, y: 92 }],
    svg: (st, k) => {
      let v = r(0, 92, 210, 118, k, 6) + r(0, 84, 210, 14, WH, 4) + r(12, 112, 88, 84, sh(k, 12), 5, 2.5) + r(110, 112, 88, 84, sh(k, 12), 5, 2.5) + c(88, 152, 4, '#fff', 2) + c(122, 152, 4, '#fff', 2);
      v += p('M66,90 L66,40 Q66,26 82,26 L120,26 L120,40', 'none', 7, '#9aa5b1') + r(60, 82, 90, 12, '#9aa5b1', 4, 2.5);
      if (st.on) v += `<rect x="114" y="42" width="10" height="44" fill="#7fd6ff" opacity=".8"><animate attributeName="opacity" values=".5;.9;.5" dur=".4s" repeatCount="indefinite"/></rect>`;
      return v;
    },
    tap: (f) => { f.st.on = !f.st.on; G.sfx(f.st.on ? 'splash' : 'click'); G.redraw(f); }
  });
  def('comptoir', {
    n: 'Plan de travail', cat: 'Cuisine', price: 40, w: 200, h: 120, c: '#ffd23f', surf: [{ x1: 2, x2: 198, y: 4 }],
    svg: (st, k) => r(0, 0, 200, 14, WH, 4) + r(4, 14, 192, 106, k, 5) + r(14, 24, 80, 30, sh(k, 12), 4, 2.5) + r(106, 24, 80, 30, sh(k, 12), 4, 2.5) + r(14, 62, 172, 50, sh(k, 12), 4, 2.5) + l(40, 38, 68, 38, O, 4) + l(132, 38, 160, 38, O, 4)
  });
  def('table', {
    n: 'Table', cat: 'Cuisine', price: 45, w: 230, h: 110, c: W1, surf: [{ x1: 4, x2: 226, y: 4 }],
    svg: (st, k) => r(0, 4, 230, 18, k, 6) + r(16, 22, 14, 88, sh(k, -20), 3) + r(200, 22, 14, 88, sh(k, -20), 3) + r(4, 20, 222, 10, sh(k, -10), 3, 2)
  });
  def('tableronde', {
    n: 'Table ronde', cat: 'Cuisine', price: 40, w: 160, h: 110, c: '#ffffff', surf: [{ x1: 6, x2: 154, y: 4 }],
    svg: (st, k) => e(80, 12, 80, 10, k) + r(72, 20, 16, 80, '#9aa5b1', 3) + e(80, 104, 40, 7, '#9aa5b1')
  });
  def('chaise', {
    n: 'Chaise', cat: 'Cuisine', price: 20, w: 90, h: 175, c: W1, slots: [{ x: 45, y: 102 }],
    svg: (st, k) => r(10, 0, 70, 96, k, 10) + r(22, 12, 46, 30, sh(k, 15), 6, 2.5) + r(4, 92, 82, 16, sh(k, -10), 5) + r(10, 108, 10, 67, sh(k, -20), 3) + r(70, 108, 10, 67, sh(k, -20), 3)
  });
  def('tabouret', {
    n: 'Tabouret', cat: 'Cuisine', price: 15, w: 80, h: 130, c: '#ff5c8a', slots: [{ x: 40, y: 12 }],
    svg: (st, k) => e(40, 12, 36, 10, k) + l(16, 18, 10, 128, '#9aa5b1', 6) + l(64, 18, 70, 128, '#9aa5b1', 6) + l(16, 90, 64, 90, '#9aa5b1', 5)
  });
  def('placard', {
    n: 'Placard', cat: 'Cuisine', price: 50, w: 220, h: 130, wall: true, y: 410, c: '#ffffff',
    cont: { area: [8, 8, 212, 128], slots: [[40, 60], [90, 60], [140, 60], [186, 60], [40, 124], [90, 124], [140, 124], [186, 124]] },
    svg: (st, k) => {
      if (!st.open) return r(0, 0, 220, 130, k, 6) + l(110, 4, 110, 126, O, 3) + r(94, 50, 6, 30, MT, 3, 2) + r(120, 50, 6, 30, MT, 3, 2);
      return r(0, 0, 220, 130, sh(k, -25), 6) + l(6, 64, 214, 64, k, 5) + p('M0,2 L-36,14 L-36,124 L0,128 Z', k) + p('M220,2 L256,14 L256,124 L220,128 Z', k);
    }
  });
  def('poubelle', {
    n: 'Poubelle', cat: 'Cuisine', price: 15, w: 80, h: 105, c: '#3ccf91', trash: true,
    svg: (st, k) => p('M8,22 L72,22 L64,104 L16,104 Z', k) + r(2, 12, 76, 12, sh(k, -15), 5) + r(30, 4, 20, 10, sh(k, -15), 4, 2.5) + l(28, 36, 30, 92, sh(k, -25), 3) + l(52, 36, 50, 92, sh(k, -25), 3) + emo(40, 60, '♻️', 18)
  });
  def('mixeur', {
    n: 'Mixeur', cat: 'Cuisine', price: 35, w: 70, h: 120, c: '#ff5c8a', free: true,
    svg: (st, k) => {
      const it = st.fill && G.ITEMS[st.fill];
      let v = p('M12,10 L58,10 L52,78 L18,78 Z', 'rgba(220,240,255,.7)') + r(8, 2, 54, 10, k, 4);
      if (it) v += `<g class="${st.on ? 'shake' : ''}">${emo(35, 52, it.e, 28)}</g>`;
      v += r(10, 78, 50, 40, k, 8) + c(35, 98, 7, st.on ? '#ffd23f' : '#fff', 2.5);
      return v;
    },
    accept: (f, it) => {
      const d = G.ITEMS[it.t];
      if (f.st.fill || !d.blend) return false;
      f.st.fill = it.t; G.del(it); G.sfx('pop'); G.redraw(f); return true;
    },
    tap: (f) => {
      if (!f.st.fill) { G.sayAt(f, 'Mets un fruit dedans !'); return; }
      if (f.st.on) return;
      f.st.on = true; G.redraw(f); G.sfx('whirr');
      setTimeout(() => {
        const out = G.ITEMS[f.st.fill].blend || 'smoothie';
        f.st.fill = null; f.st.on = false; G.redraw(f);
        const it = G.spawn('i', out, { x: f.x + 60, y: f.y - 140, sc: f.sc }); G.fall(it, 120, -300);
        G.sfx('pop'); G.emit('cook');
      }, 1500);
    }
  });
  def('microondes', {
    n: 'Micro-ondes', cat: 'Cuisine', price: 45, w: 130, h: 80, c: '#f4f4f4', free: true,
    svg: (st, k) => {
      const it = st.fill && G.ITEMS[st.fill];
      let v = r(0, 0, 130, 80, k, 8) + r(10, 10, 80, 60, st.on ? '#ffe08a' : '#3d4a5c', 6, 2.5);
      if (it) v += `<g class="${st.on ? 'spin' : ''}" style="transform-origin:50px 42px">${emo(50, 42, it.e, 28)}</g>`;
      v += c(110, 24, 6, '#9aa5b1', 2) + c(110, 46, 6, '#9aa5b1', 2) + r(100, 60, 20, 6, st.on ? '#3ccf91' : '#9aa5b1', 2, 1.5);
      return v;
    },
    accept: (f, it) => {
      const d = G.ITEMS[it.t];
      if (f.st.fill || !d.cook) return false;
      f.st.fill = it.t; G.del(it); G.redraw(f); G.sfx('click');
      f.st.on = true; G.redraw(f); G.sfx('whirr');
      setTimeout(() => {
        const out = G.ITEMS[f.st.fill].cook;
        f.st.fill = null; f.st.on = false; G.redraw(f); G.sfx('ding');
        const n = G.spawn('i', out, { x: f.x + 80, y: f.y - 80, sc: f.sc }); G.fall(n, 150, -250); G.emit('cook');
      }, 2000);
      return true;
    }
  });
  def('corbeille', {
    n: 'Corbeille de fruits', cat: 'Cuisine', price: 30, w: 120, h: 70, free: true,
    stock: [{ t: 'i', k: 'pomme', p: 0 }, { t: 'i', k: 'banane', p: 0 }, { t: 'i', k: 'orange', p: 0 }],
    spos: [[30, 40], [60, 32], [90, 40]],
    svg: () => p('M4,30 L116,30 L100,68 L20,68 Z', '#c98b54') + l(14, 44, 106, 44, '#a5683a', 3) + l(18, 56, 102, 56, '#a5683a', 3)
  });

  // ================= CHAMBRE =================
  const blanket = (x, y, w, h, k) => p(`M${x},${y + 6} Q${x + w / 2},${y - 6} ${x + w},${y + 4} L${x + w + 4},${y + h} L${x - 4},${y + h} Z`, k) + p(`M${x},${y + 6} Q${x + w / 2},${y - 6} ${x + w},${y + 4} L${x + w},${y + 18} Q${x + w / 2},${y + 8} ${x},${y + 20} Z`, '#ffffff', 2.5)
    + `<g opacity=".35">${c(x + w * 0.3, y + h * 0.55, 6, '#fff', 0)}${c(x + w * 0.6, y + h * 0.7, 6, '#fff', 0)}${c(x + w * 0.85, y + h * 0.5, 6, '#fff', 0)}</g>`;
  def('lit', {
    n: 'Lit', cat: 'Chambre', price: 110, w: 340, h: 180, c: '#4aa3ff',
    slots: [{ x: 168, y: 100, p: 'lie', a: 'sleep' }],
    svg: (st, k) => r(0, 0, 36, 180, W2, 10) + r(304, 60, 36, 120, W2, 10) + r(20, 86, 300, 34, '#ffffff', 10) + r(14, 116, 312, 46, W1, 8) + e(76, 84, 42, 16, '#ffffff') + r(24, 162, 14, 18, W2, 3) + r(304, 162, 14, 18, W2, 3),
    front: (st, k) => blanket(120, 74, 198, 58, k)
  });
  def('litsuperpose', {
    n: 'Lits superposés', cat: 'Chambre', price: 160, w: 340, h: 340, c: '#ff9f43',
    slots: [{ x: 162, y: 98, p: 'lie', a: 'sleep' }, { x: 162, y: 268, p: 'lie', a: 'sleep' }],
    surf: [{ x1: 30, x2: 310, y: 6 }],
    svg: (st, k) => r(0, 0, 22, 340, W2, 6) + r(318, 0, 22, 340, W2, 6) + r(16, 86, 308, 30, '#fff', 10) + r(10, 112, 320, 30, W1, 6) + e(70, 84, 38, 14, '#fff') + r(16, 256, 308, 30, '#fff', 10) + r(10, 282, 320, 34, W1, 6) + e(70, 254, 38, 14, '#fff')
      + l(300, 120, 300, 240, W2, 5) + l(280, 120, 280, 240, W2, 5) + [150, 180, 210].map(y => l(280, y, 300, y, W2, 4)).join(''),
    front: (st, k) => blanket(118, 74, 160, 50, k) + blanket(118, 244, 160, 50, sh(k, 20))
  });
  def('berceau', {
    n: 'Berceau', cat: 'Chambre', price: 70, w: 200, h: 160, c: '#ff9ebb',
    slots: [{ x: 96, y: 110, p: 'lie', a: 'sleep' }],
    svg: (st, k) => r(4, 100, 192, 30, '#fff', 8) + r(0, 124, 200, 20, k, 6) + r(10, 144, 12, 16, W2, 3) + r(178, 144, 12, 16, W2, 3) + e(40, 98, 26, 10, '#fff'),
    front: (st, k) => r(0, 40, 200, 12, k, 6) + [20, 44, 68, 92, 116, 140, 164, 186].map(x => l(x, 50, x, 128, k, 5)).join('') + emo(170, 30, '⭐', 20)
  });
  def('armoire', {
    n: 'Armoire', cat: 'Chambre', price: 90, w: 210, h: 310, c: '#c77dff',
    cont: { area: [12, 12, 198, 300], slots: [[50, 296], [105, 296], [160, 296], [50, 186], [105, 186], [160, 186]] },
    svg: (st, k) => {
      if (!st.open) return r(0, 0, 210, 300, k, 8) + l(105, 6, 105, 296, O, 3) + c(92, 150, 6, '#ffd23f') + c(118, 150, 6, '#ffd23f') + r(8, 300, 16, 10, W2, 3) + r(186, 300, 16, 10, W2, 3) + p('M30,30 L80,30 L80,80 L30,80 Z', sh(k, 15), 2) + p('M130,30 L180,30 L180,80 L130,80 Z', sh(k, 15), 2);
      let v = r(0, 0, 210, 300, sh(k, -30), 8) + l(14, 34, 196, 34, '#9aa5b1', 4) + l(12, 190, 198, 190, k, 6);
      ['#ff5c8a', '#3ccf91', '#ffd23f', '#4aa3ff'].forEach((cl, i) => v += p(`M${40 + i * 42},34 L${26 + i * 42},50 L${30 + i * 42},120 L${62 + i * 42},120 L${66 + i * 42},50 Z`, cl, 2.5));
      return v + p('M0,4 L-40,16 L-40,290 L0,300 Z', k) + p('M210,4 L250,16 L250,290 L210,300 Z', k) + r(8, 300, 16, 10, W2, 3) + r(186, 300, 16, 10, W2, 3);
    }
  });
  def('commode', {
    n: 'Commode', cat: 'Chambre', price: 50, w: 190, h: 135, c: '#ffd6e0', surf: [{ x1: 4, x2: 186, y: 4 }],
    svg: (st, k) => r(0, 4, 190, 120, k, 6) + [14, 50, 86].map(y => r(10, y, 170, 30, sh(k, 12), 4, 2.5) + c(95, y + 15, 4, '#ffd23f', 2)).join('') + r(8, 122, 14, 13, W2, 3) + r(168, 122, 14, 13, W2, 3)
  });
  def('coffre', {
    n: 'Coffre à jouets', cat: 'Chambre', price: 45, w: 180, h: 115, c: '#3ccf91',
    cont: { area: [0, -40, 180, 115], slots: [[36, 40], [72, 40], [108, 40], [144, 40]] },
    svg: (st, k) => {
      let v = r(0, 30, 180, 85, k, 8) + emo(90, 78, '⭐', 26) + r(16, 104, 22, 10, sh(k, -20), 3, 2) + r(142, 104, 22, 10, sh(k, -20), 3, 2);
      v += st.open ? p('M0,30 L-10,-30 L170,-40 L180,30 Z', sh(k, -12)) + r(0, 26, 180, 10, sh(k, -35), 3) : r(-4, 14, 188, 24, sh(k, -12), 8);
      return v;
    }
  });
  def('bureau', {
    n: 'Bureau', cat: 'Chambre', price: 55, w: 230, h: 115, c: '#ffffff', surf: [{ x1: 4, x2: 226, y: 4 }],
    svg: (st, k) => r(0, 4, 230, 16, k, 5) + r(8, 20, 70, 95, sh(k, -6), 4) + r(16, 30, 54, 28, sh(k, 8), 4, 2) + r(16, 66, 54, 40, sh(k, 8), 4, 2) + c(43, 44, 3, O, 0) + c(43, 86, 3, O, 0) + r(206, 20, 14, 95, sh(k, -10), 3)
  });
  def('chevet', {
    n: 'Table de chevet + lampe', cat: 'Chambre', price: 40, w: 100, h: 200, c: '#ff9ebb', toggle: true, light: { x: 50, y: 40, r: 170 },
    svg: (st, k) => (st.on ? glow(50, 50, 46, '#fff3b0') : '') + r(46, 60, 8, 50, '#6b6b7d', 3) + p('M20,66 L32,20 L68,20 L80,66 Z', st.on ? '#fff3b0' : '#ffe08a') + r(0, 108, 100, 92, k, 6) + r(10, 120, 80, 30, sh(k, 12), 4, 2.5) + c(50, 135, 4, '#ffd23f', 2) + r(10, 158, 80, 34, sh(k, 12), 4, 2.5)
  });
  def('veilleuse', {
    n: 'Lune veilleuse', cat: 'Chambre', price: 25, w: 100, h: 100, wall: true, y: 260, toggle: true, light: { x: 50, y: 50, r: 150 }, st: { on: true },
    svg: (st) => (st.on ? glow(50, 50, 50, '#fff6c2') : '') + p('M60,6 C20,10 10,70 50,92 C70,98 90,88 96,72 C60,80 36,40 60,6 Z', st.on ? '#fff3b0' : '#d9d9d9')
  });
  def('poster', {
    n: 'Poster', cat: 'Déco', price: 15, w: 120, h: 160, wall: true, y: 330, c: '#ff5c8a',
    svg: (st, k) => r(0, 0, 120, 160, k, 3) + emo(60, 70, '🦄', 64) + `<text x="60" y="138" font-size="16" font-weight="700" text-anchor="middle" fill="#fff" font-family="Fredoka">RÊVE !</text>` + c(10, 8, 3, '#ffd23f', 1.5) + c(110, 8, 3, '#ffd23f', 1.5)
  });

  // ================= SALLE DE BAIN =================
  def('baignoire', {
    n: 'Baignoire', cat: 'Salle de bain', price: 120, w: 320, h: 150, c: '#ffffff', toggle: true,
    slots: [{ x: 150, y: 96, p: 'sit', a: 'wash' }, { x: 230, y: 96, p: 'sit', a: 'wash' }],
    svg: (st, k) => r(4, 30, 312, 100, '#e3f1ff', 30) + p('M290,40 L290,10 Q290,0 278,0 L262,0', 'none', 7, '#9aa5b1') + (st.on ? `<rect x="258" y="6" width="8" height="40" fill="#7fd6ff" opacity=".8"/>` : ''),
    front: (st, k) => {
      let v = p('M0,70 L320,70 L310,122 Q300,140 270,140 L50,140 Q20,140 10,122 Z', k) + r(30, 136, 22, 14, '#ffd23f', 6, 2.5) + r(268, 136, 22, 14, '#ffd23f', 6, 2.5);
      if (st.on) [[40, 64], [70, 58], [110, 66], [190, 60], [240, 64], [290, 60], [150, 58]].forEach(([x, y], i) => v += c(x, y, 10 + (i % 3) * 4, 'rgba(255,255,255,.9)', 2, '#bfe6ff'));
      return v;
    },
    tap: (f) => { f.st.on = !f.st.on; G.sfx(f.st.on ? 'splash' : 'click'); G.redraw(f); }
  });
  def('douche', {
    n: 'Douche', cat: 'Salle de bain', price: 100, w: 170, h: 330, c: '#bfe6ff', toggle: true,
    slots: [{ x: 85, y: 312, p: 'stand', a: 'wash' }],
    svg: (st, k) => r(0, 310, 170, 20, '#ffffff', 6) + l(140, 300, 140, 40, '#9aa5b1', 6) + p('M140,40 Q140,20 120,20 L90,20', 'none', 6, '#9aa5b1') + e(86, 26, 22, 8, '#9aa5b1'),
    front: (st, k) => {
      let v = `<rect x="4" y="10" width="162" height="300" rx="6" fill="${k}" opacity=".28" stroke="${O}" stroke-width="3"/>` + l(24, 30, 50, 80, '#fff', 4) + l(24, 60, 36, 80, '#fff', 3);
      if (st.on) for (let i = 0; i < 7; i++) v += `<line x1="${66 + i * 6}" y1="40" x2="${60 + i * 7}" y2="300" stroke="#7fd6ff" stroke-width="3" opacity=".7" stroke-dasharray="14 18"><animate attributeName="stroke-dashoffset" from="0" to="-64" dur=".5s" repeatCount="indefinite"/></line>`;
      return v;
    },
    tap: (f) => { f.st.on = !f.st.on; G.sfx(f.st.on ? 'splash' : 'click'); G.redraw(f); }
  });
  def('toilettes', {
    n: 'Toilettes', cat: 'Salle de bain', price: 50, w: 120, h: 180, c: '#ffffff',
    slots: [{ x: 60, y: 118, a: 'toilet' }],
    svg: (st, k) => r(14, 0, 92, 80, k, 10) + r(76, 14, 18, 8, '#9aa5b1', 3, 2) + p('M6,100 L114,100 Q110,150 80,156 L84,180 L36,180 L40,156 Q10,150 6,100 Z', k) + e(60, 104, 54, 10, '#e3f1ff'),
    front: (st, k) => p('M4,112 L116,112 Q112,152 80,158 L84,180 L36,180 L40,158 Q8,152 4,112 Z', k) + p('M20,126 Q60,140 100,126', 'none', 2, '#cfd8e3'),
    tap: (f) => { G.sfx('flush'); G.fxAt(f.x, f.y - 120, '💧', 'up'); }
  });
  def('lavabo', {
    n: 'Lavabo', cat: 'Salle de bain', price: 40, w: 140, h: 200, c: '#ffffff', toggle: true,
    surf: [{ x1: 2, x2: 30, y: 88 }, { x1: 110, x2: 138, y: 88 }],
    svg: (st, k) => p('M0,88 L140,88 Q136,130 90,134 L84,200 L56,200 L50,134 Q4,130 0,88 Z', k) + e(70, 92, 52, 8, '#cfeaff') + p('M70,88 L70,62 L92,62', 'none', 6, '#9aa5b1')
      + (st.on ? `<rect x="88" y="64" width="6" height="26" fill="#7fd6ff" opacity=".8"/>` : ''),
    tap: (f) => { f.st.on = !f.st.on; G.sfx(f.st.on ? 'splash' : 'click'); G.redraw(f); }
  });
  def('miroir', {
    n: 'Miroir', cat: 'Salle de bain', price: 35, w: 130, h: 170, wall: true, y: 440, c: '#ffd23f', mirror: true,
    svg: (st, k) => e(65, 85, 62, 82, k, 4) + e(65, 85, 52, 72, '#dff4ff', 2.5) + l(40, 50, 60, 30, '#fff', 6) + l(40, 76, 74, 40, '#fff', 4),
    tap: (f) => {
      const ch = G.nearChar(f.x, 160);
      if (ch) G.ui.creator(ch, 'hair'); else G.sayAt(f, 'Approche quelqu\'un du miroir !');
    }
  });
  def('machinelaver', {
    n: 'Machine à laver', cat: 'Salle de bain', price: 80, w: 150, h: 160, c: '#ffffff', toggle: true, surf: [{ x1: 4, x2: 146, y: 4 }],
    svg: (st, k) => r(0, 4, 150, 156, k, 10) + r(10, 14, 130, 20, '#e3f1ff', 4, 2) + c(110, 24, 5, '#3ccf91', 2) + c(75, 96, 44, '#9aa5b1') + c(75, 96, 34, '#bfe6ff')
      + (st.on ? `<g class="spin" style="transform-origin:75px 96px">${emo(64, 90, '👕', 22)}${emo(88, 106, '🧦', 18)}</g>` : '')
  });
  def('etagerebain', {
    n: 'Étagère de salle de bain', cat: 'Salle de bain', price: 30, w: 200, h: 40, wall: true, y: 400, free: true,
    stock: [{ t: 'i', k: 'savon', p: 0 }, { t: 'i', k: 'brosse', p: 0 }, { t: 'i', k: 'eponge', p: 0 }, { t: 'i', k: 'shampoing', p: 0 }],
    spos: [[30, 8], [80, 8], [126, 8], [172, 8]],
    svg: () => r(0, 8, 200, 14, '#ffffff', 4) + p('M20,22 L30,40 L40,22', 'none', 4, '#9aa5b1') + p('M160,22 L170,40 L180,22', 'none', 4, '#9aa5b1')
  });

  // ================= JARDIN / EXTÉRIEUR =================
  def('potager', {
    n: 'Potager', cat: 'Jardin', price: 60, w: 310, h: 95, plots: [60, 155, 250], st: { plots: [null, null, null] },
    svg: (st) => {
      let v = r(0, 30, 310, 65, '#a5683a', 6) + r(8, 22, 294, 22, st.wet ? '#4a2c17' : '#7b4a24', 10);
      for (let i = 0; i < 3; i++) {
        const pl = st.plots && st.plots[i], x = [60, 155, 250][i];
        if (!pl) { v += e(x, 30, 20, 5, '#5c3a1c', 0); continue; }
        if (pl.w) v += emo(x + 24, 14, '💧', 12);
        if (pl.g === 0) v += emo(x, 18, '🌱', 22);
        else if (pl.g === 1) v += emo(x, 6, '🌿', 34);
        else if (pl.g === 2) v += emo(x, 0, '🌿', 40) + emo(x + 6, -2, '🌼', 14);
        else v += emo(x, 2, '🌿', 40) + `<g class="bob">${emo(x, -16, G.ITEMS[G.PLANTS[pl.p]].e, 34)}</g>`;
      }
      return v + r(4, 66, 302, 6, '#8a552c', 2, 0);
    },
    accept: (f, it) => {
      const d = G.ITEMS[it.t];
      const plots = f.st.plots || (f.st.plots = [null, null, null]);
      if (d.seed) {
        const i = plots.findIndex(x => !x);
        if (i < 0) { G.sayAt(f, 'Le potager est plein !'); return false; }
        plots[i] = { p: d.seed, g: 0, w: 0, t: 0 }; G.del(it); G.sfx('pop'); G.fxAt(f.x - 155 + [60, 155, 250][i], f.y - 70, '🌱', 'up'); G.redraw(f); G.emit('plant');
        return true;
      }
      if (d.water) {
        plots.forEach(pl => { if (pl && pl.g < 3) pl.w = 1; });
        G.sfx('splash'); for (let i = 0; i < 5; i++) G.fxAt(f.x - 120 + i * 60, f.y - 80, '💧', 'drop');
        G.redraw(f); G.fall(it, 0, -200); G.emit('water');
        return 'keep';
      }
      return false;
    },
    tap: (f, lx) => {
      const plots = f.st.plots || [];
      const i = [60, 155, 250].reduce((b, x, j) => Math.abs(x - lx) < Math.abs([60, 155, 250][b] - lx) ? j : b, 0);
      const pl = plots[i];
      if (pl && pl.g >= 3) {
        plots[i] = null; G.redraw(f); G.sfx('pop');
        const it = G.spawn('i', G.PLANTS[pl.p], { x: f.x - 155 + [60, 155, 250][i], y: f.y - 90, sc: f.sc }); G.fall(it, G.rand(-80, 80), -500);
        G.emit('harvest'); G.addCoins(3, f.x, f.y - 120);
      } else if (pl) G.sayAt(f, pl.w ? 'Ça pousse... 🌱' : 'Il faut arroser ! 💧');
      else G.sayAt(f, 'Plante des graines ici !');
    }
  });
  const tree = (k, fruit) => {
    let v = p('M140,420 L150,250 Q130,220 110,210 L120,200 Q146,214 152,230 L160,180 L172,180 L176,240 Q196,210 220,206 L224,216 Q190,228 180,262 L190,420 Z', '#8b5a2b');
    v += c(165, 130, 110, k) + c(90, 170, 70, k) + c(240, 170, 70, k) + c(165, 70, 80, k) + c(165, 140, 100, k, 0);
    v += c(120, 100, 16, sh(k, 20), 0) + c(210, 150, 20, sh(k, 20), 0);
    if (fruit) [[110, 150], [200, 90], [230, 190], [150, 200], [90, 200], [170, 120]].forEach(([x, y]) => v += emo(x, y, fruit, 28));
    return v;
  };
  def('arbre', {
    n: 'Arbre', cat: 'Jardin', price: 50, w: 330, h: 420, c: '#52b788',
    svg: (st, k) => tree(k),
    tap: (f) => { G.shakeEnt(f); G.sfx('swoosh'); if (Math.random() < 0.4) G.fxAt(f.x + G.rand(-80, 80), f.y - 300, '🍃', 'fall'); }
  });
  def('pommier', {
    n: 'Arbre fruitier', cat: 'Jardin', price: 90, w: 330, h: 420, c: '#3ccf91', st: { fruit: 'pomme' },
    svg: (st, k) => tree(k, G.ITEMS[st.fruit || 'pomme'].e),
    tap: (f) => {
      G.shakeEnt(f); G.sfx('swoosh');
      if (G.now - (f._lastFruit || 0) < 700) return;
      f._lastFruit = G.now;
      const it = G.spawn('i', f.st.fruit || 'pomme', { x: f.x + G.rand(-100, 100), y: f.y - 260, sc: f.sc }); G.fall(it, G.rand(-60, 60), 0);
    }
  });
  def('palmier', {
    n: 'Palmier', cat: 'Plage', price: 70, w: 300, h: 440,
    svg: () => {
      let v = p('M150,440 Q130,300 160,120 L178,122 Q152,300 176,440 Z', '#c98b54');
      for (let y = 160; y < 430; y += 28) v += l(146 + (y - 160) / 40, y, 172 + (y - 160) / 40, y - 4, '#8b5a2b', 3);
      [['M168,120 Q90,60 10,130 Q90,90 168,120 Z'], ['M168,120 Q240,50 300,120 Q230,90 168,120 Z'], ['M168,120 Q120,20 60,30 Q130,50 168,120 Z'], ['M168,120 Q220,10 280,40 Q210,50 168,120 Z'], ['M168,120 Q170,40 150,0 Q190,50 168,120 Z']].forEach(([d]) => v += p(d, '#3ccf91'));
      v += c(156, 132, 12, '#8b5a2b') + c(178, 136, 12, '#8b5a2b');
      return v;
    },
    tap: (f) => {
      G.shakeEnt(f); G.sfx('swoosh');
      if (G.now - (f._lastFruit || 0) < 900) return;
      f._lastFruit = G.now;
      const it = G.spawn('i', 'coco', { x: f.x + G.rand(-10, 30), y: f.y - 300, sc: f.sc }); G.fall(it, G.rand(-80, 80), 0);
    }
  });
  def('balancoire', {
    n: 'Balançoire', cat: 'Jardin', price: 80, w: 240, h: 300, c: '#ff5c8a',
    slots: [{ x: 120, y: 236, a: 'swing' }],
    svg: (st, k) => p('M10,300 L50,10 M90,300 L50,10 M150,300 L190,10 M230,300 L190,10', 'none', 9, O) + p('M10,300 L50,10 M90,300 L50,10 M150,300 L190,10 M230,300 L190,10', 'none', 5, k) + r(36, 2, 168, 14, sh(k, -15), 6)
      + `<g class="${st.busy ? 'swingf' : ''}" style="transform-origin:120px 10px">${l(84, 14, 84, 236, '#8b5a2b', 3)}${l(156, 14, 156, 236, '#8b5a2b', 3)}${r(76, 232, 88, 12, '#ffd23f', 4)}</g>`
  });
  def('toboggan', {
    n: 'Toboggan', cat: 'Jardin', price: 100, w: 320, h: 270, c: '#ffd23f',
    slots: [{ x: 80, y: 46, a: 'slide' }],
    svg: (st, k) => {
      let v = l(40, 270, 60, 50, '#ff5c8a', 9) + l(110, 270, 100, 50, '#ff5c8a', 9);
      for (let y = 90; y < 260; y += 34) v += l(46 + (y - 50) / 11, y, 104 - (y - 50) / 30, y, '#ff5c8a', 6);
      v += r(50, 44, 70, 16, '#4aa3ff', 5) + p('M110,44 Q160,50 200,150 Q240,250 320,256 L320,272 Q230,270 190,166 Q150,64 110,64 Z', k);
      return v;
    }
  });
  def('trampoline', {
    n: 'Trampoline', cat: 'Jardin', price: 90, w: 260, h: 90, c: '#4aa3ff',
    surf: [{ x1: 20, x2: 240, y: 14, bounce: 1 }],
    svg: (st, k) => e(130, 18, 126, 18, '#3d3d4f') + e(130, 16, 108, 12, k, 2.5) + l(30, 26, 20, 90, O, 5) + l(230, 26, 240, 90, O, 5) + l(90, 34, 86, 90, O, 5) + l(170, 34, 174, 90, O, 5)
  });
  def('piscine', {
    n: 'Piscine gonflable', cat: 'Jardin', price: 90, w: 340, h: 100, c: '#ff9ebb',
    slots: [{ x: 110, y: 50, p: 'sit', a: 'wash' }, { x: 230, y: 50, p: 'sit', a: 'wash' }],
    svg: () => e(170, 40, 160, 26, '#7fd6ff', 3),
    front: (st, k) => `<path d="M8,40 Q170,80 332,40 L332,62 Q170,104 8,62 Z" fill="${k}" stroke="${O}" stroke-width="3"/>` + `<path d="M8,62 Q170,104 332,62 L332,82 Q170,124 8,82 Z" fill="${sh(k, 25)}" stroke="${O}" stroke-width="3"/>` + emo(300, 30, '🦆', 30)
  });
  def('barbecue', {
    n: 'Barbecue', cat: 'Jardin', price: 70, w: 150, h: 180, c: '#3d3d4f', toggle: true, light: { x: 75, y: 60, r: 120 },
    surf: [{ x1: 10, x2: 140, y: 64, cook: 'fire' }],
    svg: (st, k) => p('M6,66 L144,66 Q140,120 75,124 Q10,120 6,66 Z', k) + l(30, 120, 14, 180, k, 6) + l(120, 120, 136, 180, k, 6) + l(75, 124, 75, 180, k, 6) + l(8, 64, 142, 64, '#9aa5b1', 5)
      + (st.on ? `<g class="flicker">${emo(50, 50, '🔥', 20)}${emo(100, 50, '🔥', 20)}</g>` : '') + r(-6, 70, 14, 30, '#9aa5b1', 4, 2)
  });
  def('niche', {
    n: 'Niche', cat: 'Jardin', price: 60, w: 180, h: 170, c: '#e63946',
    slots: [{ x: 90, y: 160, a: 'petsleep', pet: true }],
    svg: (st, k) => r(14, 64, 152, 106, W1, 4) + p('M0,74 L90,4 L180,74 Z', k) + p('M56,170 L56,120 Q90,86 124,120 L124,170 Z', '#3d2c26') + `<text x="90" y="80" font-size="13" font-weight="700" text-anchor="middle" fill="${O}" font-family="Fredoka">🦴</text>`
  });
  def('banc', {
    n: 'Banc', cat: 'Jardin', price: 40, w: 270, h: 140, c: '#3ccf91',
    slots: [{ x: 70, y: 76 }, { x: 135, y: 76 }, { x: 200, y: 76 }],
    svg: (st, k) => r(10, 0, 250, 22, k, 6) + r(10, 30, 250, 22, k, 6) + r(0, 66, 270, 18, k, 6) + l(30, 84, 24, 140, '#3d3d4f', 7) + l(240, 84, 246, 140, '#3d3d4f', 7) + l(30, 0, 30, 80, '#3d3d4f', 6) + l(240, 0, 240, 80, '#3d3d4f', 6)
  });
  def('fleurs', {
    n: 'Massif de fleurs', cat: 'Jardin', price: 20, w: 180, h: 80,
    svg: () => e(90, 64, 88, 18, '#52b788') + ['🌷', '🌼', '🌸', '🌺', '🌷', '🌻'].map((f, i) => emo(18 + i * 29, 40 + (i % 2) * 10, f, 30)).join('')
  });
  def('barriere', {
    n: 'Barrière', cat: 'Jardin', price: 15, w: 250, h: 110, c: '#ffffff',
    svg: (st, k) => r(0, 40, 250, 14, k, 3) + r(0, 76, 250, 14, k, 3) + [10, 60, 110, 160, 210].map(x => p(`M${x},110 L${x},20 L${x + 15},4 L${x + 30},20 L${x + 30},110 Z`, k)).join('')
  });
  def('lampadaire', {
    n: 'Lampadaire de rue', cat: 'Jardin', price: 45, w: 90, h: 340, c: '#3d3d4f', light: { x: 45, y: 40, r: 260 }, auto: true,
    svg: (st, k) => (st.on ? glow(45, 50, 50, '#fff3b0') : '') + r(38, 60, 14, 270, k, 5) + e(45, 334, 30, 8, k) + p('M18,64 L28,24 L62,24 L72,64 Z', k) + e(45, 64, 26, 6, st.on ? '#fff3b0' : '#d9d9d9')
  });
  def('fontaine', {
    n: 'Fontaine', cat: 'Jardin', price: 150, w: 320, h: 230,
    slots: [{ x: 90, y: 160, p: 'sit', a: 'wash' }, { x: 230, y: 160, p: 'sit', a: 'wash' }],
    svg: () => {
      let v = r(140, 60, 40, 110, '#cfd8e3', 6) + e(160, 64, 70, 14, '#cfd8e3') + e(160, 58, 56, 8, '#7fd6ff', 2);
      v += `<path d="M160,40 Q120,0 90,64 M160,40 Q200,0 230,64" fill="none" stroke="#7fd6ff" stroke-width="5" stroke-dasharray="10 8"><animate attributeName="stroke-dashoffset" from="0" to="-36" dur=".6s" repeatCount="indefinite"/></path>`;
      v += c(160, 34, 10, '#cfd8e3') + e(160, 166, 156, 26, '#7fd6ff');
      return v;
    },
    front: () => `<path d="M2,166 Q160,214 318,166 L318,196 Q160,244 2,196 Z" fill="#cfd8e3" stroke="${O}" stroke-width="3"/>`
  });
  def('bacasable', {
    n: 'Bac à sable', cat: 'Jardin', price: 50, w: 280, h: 80,
    slots: [{ x: 80, y: 36 }, { x: 200, y: 36 }],
    svg: () => r(0, 20, 280, 60, '#c98b54', 6) + e(140, 26, 130, 12, '#f6e09a', 0) + emo(140, 10, '🏰', 30),
  });
  def('parasol', {
    n: 'Parasol', cat: 'Plage', price: 35, w: 240, h: 290, c: '#ff5c8a',
    svg: (st, k) => l(120, 40, 120, 290, '#fff', 8) + l(120, 40, 120, 290, O, 2) + p('M0,80 Q120,-40 240,80 Q210,66 180,80 Q150,64 120,80 Q90,64 60,80 Q30,66 0,80 Z', k) + p('M60,80 Q90,-10 120,10 Q150,-10 180,80 Q150,64 120,80 Q90,64 60,80 Z', '#ffffff', 2.5)
  });
  def('transat', {
    n: 'Transat', cat: 'Plage', price: 40, w: 230, h: 120, c: '#4aa3ff',
    slots: [{ x: 150, y: 56 }],
    svg: (st, k) => p('M10,10 L60,90 L220,90', 'none', 6, '#c98b54') + p('M14,14 L64,80 L216,80 L216,94 L58,94 L8,18 Z', k) + l(40, 60, 30, 120, '#c98b54', 6) + l(200, 94, 210, 120, '#c98b54', 6) + l(120, 94, 110, 120, '#c98b54', 6)
  });
  def('serviette', {
    n: 'Serviette', cat: 'Plage', price: 15, w: 300, h: 40, layer: 1, c: '#ffd23f',
    slots: [{ x: 150, y: -20, p: 'lie', a: 'relax' }],
    svg: (st, k) => p('M10,6 L290,6 L300,36 L0,36 Z', k) + p('M70,6 L66,36 M140,6 L140,36 M210,6 L214,36', 'none', 10, '#ff5c8a')
  });
  def('chateau', {
    n: 'Château de sable', cat: 'Plage', price: 20, w: 180, h: 130,
    svg: () => r(10, 60, 160, 70, '#f6e09a', 4) + r(60, 20, 60, 50, '#f6e09a', 4) + [10, 50, 90, 130].map(x => r(x, 50, 18, 14, '#f6e09a', 2, 2.5)).join('') + r(76, 90, 28, 40, '#c98b54', 14) + l(90, 20, 90, -10, O, 2) + p('M90,-10 L110,-4 L90,2 Z', '#ff5c8a', 2)
  });

  // ================= MAGASINS =================
  def('etalage', {
    n: 'Étalage', cat: 'Magasin', price: 80, w: 330, h: 270, c: '#4aa3ff', fixed: false,
    stock: [{ t: 'i', k: 'pomme', p: 2 }],
    spos: [[50, 80], [125, 80], [205, 80], [280, 80], [50, 166], [125, 166], [205, 166], [280, 166], [50, 252], [125, 252], [205, 252], [280, 252]],
    svg: (st, k) => r(0, 0, 330, 30, k, 8) + r(6, 30, 318, 240, '#f4f4f4', 4) + [86, 172, 258].map(y => r(0, y, 330, 12, sh(k, -10), 3)).join('') + `<text x="165" y="16" font-size="16" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="Fredoka">${G.esc(st.label || 'Rayon')}</text>`
  });
  def('frigoshop', {
    n: 'Vitrine réfrigérée', cat: 'Magasin', price: 100, w: 260, h: 280, c: '#7fd6ff',
    stock: [{ t: 'i', k: 'lait', p: 2 }],
    spos: [[45, 100], [100, 100], [160, 100], [215, 100], [45, 190], [100, 190], [160, 190], [215, 190], [45, 272], [100, 272], [160, 272], [215, 272]],
    svg: (st, k) => r(0, 0, 260, 280, k, 10) + r(12, 20, 236, 256, '#e9f8ff', 6, 2.5) + [104, 194].map(y => l(14, y, 246, y, '#fff', 6)).join('') + `<text x="130" y="10" font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="Fredoka">❄ FRAIS ❄</text>`
  });
  def('caisse', {
    n: 'Caisse', cat: 'Magasin', price: 60, w: 230, h: 150, c: '#ff5c8a', surf: [{ x1: 4, x2: 140, y: 40 }],
    svg: (st, k) => r(0, 40, 230, 110, k, 8) + r(0, 34, 230, 14, '#3d3d4f', 5) + r(150, 0, 70, 40, '#3d3d4f', 6) + r(158, 8, 54, 18, '#3ccf91', 3, 2) + `<text x="185" y="17" font-size="11" text-anchor="middle" dominant-baseline="central" fill="#1d3557" font-family="Fredoka">0,00€</text>` + r(20, 70, 190, 60, sh(k, 15), 6, 2.5),
    tap: (f) => { G.sfx('bip'); G.sfx('coin'); G.fxAt(f.x + 70, f.y - 150, '🧾', 'up'); }
  });
  def('portant', {
    n: 'Portant', cat: 'Magasin', price: 60, w: 260, h: 250, c: '#9aa5b1',
    stock: [{ t: 'i', k: 'casquette', p: 8 }, { t: 'i', k: 'chapeau', p: 10 }, { t: 'i', k: 'noeud', p: 5 }, { t: 'i', k: 'lunettes', p: 8 }, { t: 'i', k: 'couronne', p: 25 }, { t: 'i', k: 'lunettes2', p: 6 }, { t: 'i', k: 'casque', p: 15 }, { t: 'i', k: 'chapsorc', p: 15 }],
    spos: [[40, 112], [100, 112], [160, 112], [220, 112], [40, 210], [100, 210], [160, 210], [220, 210]],
    svg: (st, k) => l(20, 20, 20, 240, k, 8) + l(240, 20, 240, 240, k, 8) + l(14, 20, 246, 20, k, 8) + e(20, 244, 18, 6, k) + e(240, 244, 18, 6, k) + r(16, 116, 228, 10, '#e8e2d6', 4) + r(16, 214, 228, 10, '#e8e2d6', 4)
      + ['#ff5c8a', '#4aa3ff', '#ffd23f', '#3ccf91', '#c77dff'].map((cl, i) => p(`M${50 + i * 40},20 L${36 + i * 40},34 L${40 + i * 40},70 L${64 + i * 40},70 L${68 + i * 40},34 Z`, cl, 2.5)).join('')
  });
  def('cabine', {
    n: "Cabine d'essayage", cat: 'Magasin', price: 90, w: 180, h: 330, c: '#c77dff',
    slots: [{ x: 90, y: 316, p: 'stand', a: 'dress' }],
    svg: (st, k) => r(0, 0, 180, 330, '#f3e8ff', 6) + r(0, 0, 180, 22, sh(k, -20), 6) + `<text x="90" y="11" font-size="12" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="Fredoka">CABINE</text>`,
    front: (st, k) => p('M4,24 Q20,180 6,330 L44,330 Q34,180 46,24 Z', k) + p('M176,24 Q160,180 174,330 L136,330 Q146,180 134,24 Z', k)
  });
  def('mannequin', {
    n: 'Mannequin', cat: 'Magasin', price: 40, w: 100, h: 260, c: '#ff9ebb',
    svg: (st, k) => c(50, 26, 20, '#e8e2d6') + p('M22,60 Q50,48 78,60 L82,150 Q50,160 18,150 Z', k) + p('M18,150 L82,150 L96,210 Q50,220 4,210 Z', sh(k, 15)) + l(50, 210, 50, 250, '#3d3d4f', 5) + e(50, 254, 30, 6, '#3d3d4f')
  });
  def('fauteuilcoiffure', {
    n: 'Fauteuil de coiffure', cat: 'Magasin', price: 80, w: 140, h: 210, c: '#e63946',
    slots: [{ x: 70, y: 114, a: 'hair' }],
    svg: (st, k) => r(20, 0, 100, 112, k, 20) + r(6, 100, 128, 36, sh(k, 10), 12) + r(0, 74, 24, 50, sh(k, -15), 8) + r(116, 74, 24, 50, sh(k, -15), 8) + r(62, 136, 16, 56, '#9aa5b1', 3) + e(70, 200, 50, 10, '#9aa5b1')
  });
  def('sechoir', {
    n: 'Casque séchoir', cat: 'Magasin', price: 50, w: 120, h: 300, c: '#ff9ebb',
    svg: (st, k) => p('M10,80 C10,10 110,10 110,80 L100,90 L20,90 Z', k) + r(54, 90, 12, 200, '#9aa5b1', 4) + e(60, 294, 40, 8, '#9aa5b1')
  });
  def('lithopital', {
    n: "Lit d'hôpital", cat: 'Hôpital', price: 120, w: 340, h: 200, c: '#7fd6ff',
    slots: [{ x: 168, y: 110, p: 'lie', a: 'heal' }],
    svg: (st, k) => r(0, 10, 18, 160, MT, 6) + r(322, 50, 18, 120, MT, 6) + r(14, 98, 312, 30, '#fff', 10) + r(10, 124, 320, 26, MT, 6) + e(70, 94, 40, 15, '#fff') + l(40, 150, 40, 186, '#9aa5b1', 6) + l(300, 150, 300, 186, '#9aa5b1', 6) + c(40, 192, 8, '#3d3d4f') + c(300, 192, 8, '#3d3d4f') + r(-40, -60, 8, 230, '#9aa5b1', 3, 2) + p('M-56,-60 L-16,-60 L-22,-20 L-50,-20 Z', '#bfe6ff', 2.5),
    front: (st, k) => blanket(120, 84, 198, 50, k)
  });
  def('radiographie', {
    n: 'Radiographie', cat: 'Hôpital', price: 150, w: 210, h: 330, c: '#1d3557',
    slots: [{ x: 105, y: 314, p: 'stand', a: 'xray' }],
    svg: (st, k) => r(0, 0, 210, 330, '#cfd8e3', 8) + r(0, 300, 210, 30, '#9aa5b1', 6) + r(70, 4, 70, 16, '#e63946', 4, 2) + `<text x="105" y="12" font-size="10" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="Fredoka">RAYONS X</text>`,
    front: (st, k) => `<rect x="20" y="30" width="170" height="250" rx="10" fill="${k}" opacity=".55" stroke="${O}" stroke-width="4"/>` + l(30, 40, 60, 90, '#fff', 3)
  });
  def('pharmacie', {
    n: 'Armoire à pharmacie', cat: 'Hôpital', price: 70, w: 200, h: 220, c: '#ffffff',
    stock: [{ t: 'i', k: 'pilule', p: 0 }, { t: 'i', k: 'pansement', p: 0 }, { t: 'i', k: 'seringue', p: 0 }, { t: 'i', k: 'thermometre', p: 0 }, { t: 'i', k: 'savon', p: 0 }, { t: 'i', k: 'eponge', p: 0 }],
    spos: [[42, 92], [100, 92], [158, 92], [42, 180], [100, 180], [158, 180]],
    svg: (st, k) => r(0, 0, 200, 220, k, 8) + r(10, 30, 180, 182, '#e9f4ff', 4, 2.5) + l(12, 100, 188, 100, '#9aa5b1', 5) + l(12, 186, 188, 186, '#9aa5b1', 5) + r(84, 4, 32, 22, '#e63946', 4, 2) + l(100, 8, 100, 22, '#fff', 5) + l(92, 15, 108, 15, '#fff', 5)
  });
  def('balance', {
    n: 'Balance', cat: 'Hôpital', price: 30, w: 120, h: 40, layer: 1,
    slots: [{ x: 60, y: 30, p: 'stand', a: 'scale' }],
    svg: () => r(0, 6, 120, 30, '#ffffff', 8) + r(40, 12, 40, 14, '#3ccf91', 3, 2)
  });
  def('fauteuilroulant', {
    n: 'Fauteuil roulant', cat: 'Hôpital', price: 60, w: 150, h: 160, c: '#4aa3ff',
    slots: [{ x: 75, y: 100 }],
    svg: (st, k) => r(20, 10, 16, 100, MT, 4) + r(20, 90, 110, 18, k, 6) + c(46, 126, 32, 'none', 6) + c(46, 126, 6, MT) + c(126, 146, 12, 'none', 4) + l(20, 10, 4, 6, MT, 5)
  });
  def('tableaunoir', {
    n: 'Tableau', cat: 'École', price: 80, w: 440, h: 260, wall: true, y: 470, drawing: true, c: '#2f5d3a',
    svg: (st, k) => {
      let v = r(0, 0, 440, 240, '#a5683a', 8) + r(14, 14, 412, 212, k, 4, 2.5);
      if (G.S && G.S.drawing) v += `<image href="${G.S.drawing}" x="16" y="16" width="408" height="208" preserveAspectRatio="xMidYMid slice"/>`;
      else v += `<text x="220" y="110" font-size="30" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="Fredoka" opacity=".9">Touche pour dessiner ✏️</text>`;
      return v + r(60, 238, 320, 12, '#a5683a', 4) + r(90, 228, 26, 10, '#fff', 3, 1.5) + r(130, 229, 30, 9, '#ffd23f', 3, 1.5);
    },
    tap: () => G.ui.drawing()
  });
  def('chevalet', {
    n: 'Chevalet', cat: 'Déco', price: 50, w: 160, h: 280, drawing: true,
    svg: () => l(30, 280, 80, 10, '#a5683a', 8) + l(130, 280, 80, 10, '#a5683a', 8) + l(80, 10, 80, 260, '#a5683a', 6) + r(16, 40, 128, 110, '#fff', 3) + (G.S && G.S.drawing ? `<image href="${G.S.drawing}" x="18" y="42" width="124" height="106" preserveAspectRatio="xMidYMid slice"/>` : emo(80, 95, '🎨', 50)) + r(10, 150, 140, 10, '#a5683a', 3),
    tap: () => G.ui.drawing()
  });
  def('pupitre', {
    n: 'Pupitre', cat: 'École', price: 45, w: 150, h: 175, c: '#ffd23f',
    slots: [{ x: 75, y: 104 }], surf: [{ x1: 6, x2: 144, y: 96 }],
    svg: (st, k) => r(30, 0, 90, 90, '#4aa3ff', 10) + r(26, 92, 98, 14, '#4aa3ff', 5) + l(40, 106, 40, 175, '#9aa5b1', 6) + l(110, 106, 110, 175, '#9aa5b1', 6),
    front: (st, k) => r(0, 96, 150, 16, k, 4) + r(8, 112, 134, 34, sh(k, 15), 4, 2.5) + l(14, 146, 14, 175, '#9aa5b1', 6) + l(136, 146, 136, 175, '#9aa5b1', 6)
  });
  def('globe', {
    n: 'Globe', cat: 'École', price: 30, w: 90, h: 120, free: true,
    svg: () => p('M10,50 A40,40 0 0,0 80,70', 'none', 4, '#a5683a') + c(45, 50, 34, '#4aa3ff') + p('M30,30 Q40,20 50,30 Q56,46 40,50 Q26,48 30,30 Z M54,60 Q66,56 70,66 Q60,78 54,60 Z', '#3ccf91', 2) + l(45, 86, 45, 110, '#a5683a', 5) + e(45, 114, 26, 6, '#a5683a')
  });
  def('fournitures', {
    n: 'Étagère de fournitures', cat: 'École', price: 60, w: 260, h: 200,
    stock: [{ t: 'i', k: 'livre', p: 0 }, { t: 'i', k: 'livres', p: 0 }, { t: 'i', k: 'crayon', p: 0 }, { t: 'i', k: 'crayons', p: 0 }, { t: 'i', k: 'regle', p: 0 }, { t: 'i', k: 'palette', p: 0 }, { t: 'i', k: 'cartable', p: 0 }, { t: 'i', k: 'des', p: 0 }],
    spos: [[40, 88], [100, 88], [160, 88], [220, 88], [40, 186], [100, 186], [160, 186], [220, 186]],
    svg: () => r(0, 0, 260, 200, W1, 6) + r(10, 10, 240, 82, sh(W1, -25), 3, 2) + r(10, 104, 240, 86, sh(W1, -25), 3, 2)
  });

  // ================= CAFÉ =================
  def('vitrine', {
    n: 'Vitrine du café', cat: 'Magasin', price: 120, w: 360, h: 200, c: '#ff9ebb',
    stock: [{ t: 'i', k: 'croissant', p: 3 }, { t: 'i', k: 'gateau', p: 6 }, { t: 'i', k: 'cupcake', p: 4 }, { t: 'i', k: 'donut', p: 3 }, { t: 'i', k: 'cookie', p: 2 }, { t: 'i', k: 'crepe', p: 4 }, { t: 'i', k: 'anniv', p: 15 }, { t: 'i', k: 'cafe', p: 2 }, { t: 'i', k: 'the', p: 2 }, { t: 'i', k: 'bulle', p: 5 }],
    spos: [[45, 52], [110, 52], [180, 52], [250, 52], [315, 52], [45, 124], [110, 124], [180, 124], [250, 124], [315, 124]],
    svg: (st, k) => r(0, 0, 360, 140, 'rgba(220,240,255,.6)', 10) + l(6, 60, 354, 60, '#fff', 5) + r(0, 132, 360, 68, k, 8) + p('M0,150 Q30,170 60,150 Q90,170 120,150 Q150,170 180,150 Q210,170 240,150 Q270,170 300,150 Q330,170 360,150', 'none', 3, '#fff')
  });
  def('machinecafe', {
    n: 'Machine à chocolat', cat: 'Cuisine', price: 50, w: 90, h: 120, c: '#e63946', free: true,
    svg: (st, k) => r(0, 0, 90, 120, k, 10) + r(14, 50, 62, 60, '#3d3d4f', 6) + r(36, 50, 18, 12, '#9aa5b1', 3, 2) + c(28, 24, 7, '#ffd23f', 2) + c(62, 24, 7, '#3ccf91', 2),
    tap: (f) => {
      if (!G.spend(1)) return;
      G.sfx('whirr');
      setTimeout(() => { const it = G.spawn('i', G.pick(['cafe', 'the']), { x: f.x, y: f.y - 20, sc: f.sc }); G.place(it); G.sfx('ding'); }, 900);
    }
  });
  def('banquette', {
    n: 'Banquette', cat: 'Salon', price: 70, w: 300, h: 150, c: '#9b6dff',
    slots: [{ x: 80, y: 98 }, { x: 150, y: 98 }, { x: 220, y: 98 }],
    svg: (st, k) => r(0, 0, 300, 100, k, 24) + [40, 100, 160, 220].map(x => l(x + 20, 14, x + 20, 86, sh(k, -20), 3)).join('') + r(0, 84, 300, 40, sh(k, 15), 12) + r(16, 124, 14, 26, '#3d3d4f', 3) + r(270, 124, 14, 26, '#3d3d4f', 3)
  });

  // ================= ANIMALERIE =================
  def('cage', {
    n: 'Présentoir animaux', cat: 'Magasin', price: 150, w: 340, h: 270, c: '#ff9f43',
    stock: [{ t: 'p', k: 'chien', p: 60 }, { t: 'p', k: 'chat', p: 60 }, { t: 'p', k: 'lapin', p: 50 }, { t: 'p', k: 'hamster', p: 40 }, { t: 'p', k: 'tortue', p: 45 }, { t: 'p', k: 'poussin', p: 30 }],
    spos: [[60, 120], [170, 120], [280, 120], [60, 250], [170, 250], [280, 250]],
    svg: (st, k) => r(0, 0, 340, 270, k, 8) + [[10, 10], [120, 10], [230, 10], [10, 140], [120, 140], [230, 140]].map(([x, y]) => r(x, y, 100, 120, '#fff4e0', 6, 2.5)).join('')
  });
  def('aquarium', {
    n: 'Aquarium', cat: 'Salon', price: 90, w: 240, h: 200, c: '#3d3d4f',
    svg: (st, k) => r(0, 120, 240, 80, k, 6) + r(0, 0, 240, 124, '#7fd6ff', 10) + r(6, 100, 228, 20, '#f6e09a', 4, 0) + emo(40, 90, '🪸', 28) + emo(200, 92, '🌿', 26)
      + `<g>${emo(0, 0, '🐠', 30)}<animateTransform attributeName="transform" type="translate" values="40 40;190 60;40 40" dur="6s" repeatCount="indefinite"/></g>`
      + `<g>${emo(0, 0, '🐟', 24)}<animateTransform attributeName="transform" type="translate" values="200 70;50 30;200 70" dur="8s" repeatCount="indefinite"/></g>`
      + `<circle cx="120" cy="90" r="4" fill="#fff" opacity=".8"><animate attributeName="cy" values="100;10" dur="2s" repeatCount="indefinite"/></circle>`
  });
  def('panier', {
    n: 'Panier pour animal', cat: 'Jardin', price: 30, w: 140, h: 50, c: '#e63946',
    slots: [{ x: 70, y: 34, a: 'petsleep', pet: true }],
    svg: (st, k) => e(70, 30, 68, 20, k) + e(70, 26, 54, 12, '#fff4e0', 2.5)
  });
  def('gamelle', {
    n: 'Gamelles', cat: 'Jardin', price: 20, w: 120, h: 40,
    stock: [{ t: 'i', k: 'croquettes', p: 0 }, { t: 'i', k: 'os', p: 0 }],
    spos: [[30, 22], [90, 22]],
    svg: () => e(30, 30, 26, 10, '#4aa3ff') + e(90, 30, 26, 10, '#ff5c8a')
  });

  // ================= ARCADE & DISCO =================
  def('borne', {
    n: "Borne d'arcade", cat: 'Fun', price: 200, w: 150, h: 310, c: '#9b6dff', st: { game: 'catch' },
    svg: (st, k) => {
      const g = G.MINIGAMES && G.MINIGAMES[st.game] || { n: 'Jeu', e: '🕹️' };
      return p('M10,0 L140,0 L150,310 L0,310 Z', k) + r(18, 20, 114, 26, '#ffd23f', 4, 2.5) + `<text x="75" y="33" font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="${O}" font-family="Fredoka">${g.n}</text>`
        + r(18, 56, 114, 96, '#1d1033', 6) + `<g class="pulse">${emo(75, 104, g.e, 44)}</g>` + p('M6,160 L144,160 L150,196 L0,196 Z', sh(k, -20)) + c(50, 176, 8, '#e63946') + c(100, 176, 7, '#3ccf91') + c(118, 176, 7, '#4aa3ff') + r(50, 230, 50, 30, '#1d1033', 4);
    },
    tap: (f) => G.mini.open(f.st.game)
  });
  def('distributeur', {
    n: 'Distributeur', cat: 'Fun', price: 120, w: 180, h: 310, c: '#e63946',
    stock: [{ t: 'i', k: 'chocolat', p: 2 }, { t: 'i', k: 'bonbon', p: 1 }, { t: 'i', k: 'sucette', p: 2 }, { t: 'i', k: 'popcorn', p: 3 }, { t: 'i', k: 'jus', p: 2 }, { t: 'i', k: 'smoothie', p: 4 }],
    spos: [[50, 84], [90, 84], [130, 84], [50, 164], [90, 164], [130, 164]],
    svg: (st, k) => r(0, 0, 180, 310, k, 10) + r(16, 16, 148, 170, '#e9f8ff', 6, 2.5) + l(18, 90, 162, 90, '#9aa5b1', 4) + l(18, 170, 162, 170, '#9aa5b1', 4) + r(16, 200, 100, 40, '#3d3d4f', 4) + r(126, 200, 38, 60, '#3d3d4f', 4) + c(145, 214, 4, '#ffd23f', 1)
  });
  def('bouledisco', {
    n: 'Boule à facettes', cat: 'Fun', price: 150, w: 130, h: 220, wall: true, y: 230, toggle: true, disco: true, light: { x: 65, y: 160, r: 200 },
    svg: (st) => {
      let v = l(65, 0, 65, 100, '#9aa5b1', 3) + c(65, 160, 56, '#cfd8e3');
      for (let i = -3; i <= 3; i++) v += p(`M${65 + i * 16},106 Q${65 + i * 22},160 ${65 + i * 16},214`, 'none', 1.5, '#9aa5b1');
      for (let j = -2; j <= 2; j++) v += l(12, 160 + j * 20, 118, 160 + j * 20, '#9aa5b1', 1.5);
      if (st.on) v += `<g class="sparkle">${emo(40, 140, '✨', 16)}${emo(90, 180, '✨', 16)}${emo(70, 130, '✦', 14)}</g>`;
      return v;
    }
  });
  def('platines', {
    n: 'Platines DJ', cat: 'Fun', price: 180, w: 260, h: 160, c: '#3d3d4f', toggle: true, music: 'disco',
    svg: (st, k) => r(0, 40, 260, 120, k, 8) + r(10, 50, 240, 30, '#1d1033', 4) + [70, 190].map(x => `<g class="${st.on ? 'spin' : ''}" style="transform-origin:${x}px 65px">${e(x, 65, 42, 12, '#111')}${e(x, 65, 12, 4, '#e63946', 0)}</g>`).join('')
      + r(110, 90, 40, 50, '#1d1033', 4) + [118, 130, 142].map((x, i) => r(x - 3, 96 + i * 8, 6, 30 - i * 8, ['#3ccf91', '#ffd23f', '#e63946'][i], 2, 0)).join('') + (st.on ? `<g class="pulse">${emo(130, 20, '🎧', 30)}</g>` : '')
  });
  def('enceinte', {
    n: 'Enceinte', cat: 'Fun', price: 60, w: 110, h: 210, c: '#2b2b3a',
    svg: (st, k) => r(0, 0, 110, 210, k, 8) + `<g class="${G.musicOn && G.musicOn() ? 'pulse' : ''}" style="transform-origin:55px 140px">${c(55, 140, 36, '#1d1033')}${c(55, 140, 14, '#6b6b7d')}</g>` + c(55, 50, 20, '#1d1033') + c(55, 50, 7, '#6b6b7d')
  });
  def('bar', {
    n: 'Bar à jus', cat: 'Fun', price: 140, w: 330, h: 190, c: '#c77dff',
    stock: [{ t: 'i', k: 'cocktail', p: 5 }, { t: 'i', k: 'jus', p: 2 }, { t: 'i', k: 'smoothie', p: 4 }, { t: 'i', k: 'bulle', p: 5 }, { t: 'i', k: 'lait', p: 2 }],
    spos: [[45, 76], [110, 76], [175, 76], [240, 76], [300, 76]],
    svg: (st, k) => r(0, 76, 330, 114, k, 8) + r(-6, 70, 342, 16, '#3d3d4f', 5) + [20, 100, 180, 260].map(x => `<rect x="${x}" y="100" width="50" height="70" rx="6" fill="${sh(k, 20)}" stroke="${O}" stroke-width="2.5"/>`).join('')
  });
  def('pistedanse', {
    n: 'Piste de danse', cat: 'Fun', price: 120, w: 520, h: 90, layer: 1,
    svg: () => {
      let v = '';
      const cols = ['#ff5c8a', '#ffd23f', '#3ccf91', '#4aa3ff', '#c77dff'];
      for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) v += `<path d="M${20 + i * 60 - j * 20},${j * 45} L${80 + i * 60 - j * 20},${j * 45} L${80 + i * 60 - (j + 1) * 20},${(j + 1) * 45} L${20 + i * 60 - (j + 1) * 20},${(j + 1) * 45} Z" fill="${cols[(i + j) % 5]}" stroke="${O}" stroke-width="2" class="tile" style="animation-delay:${((i * 7 + j * 3) % 10) / 10}s"/>`;
      return v;
    }
  });
  def('citrouilledeco', {
    n: "Citrouille d'Halloween", cat: 'Déco', price: 25, w: 120, h: 110, toggle: true, light: { x: 60, y: 60, r: 120 }, st: { on: true },
    svg: (st) => (st.on ? glow(60, 66, 50, '#ff9f43') : '') + e(60, 66, 56, 42, '#ff9f43') + p('M40,28 Q60,40 80,28', 'none', 2.5) + p('M60,26 L64,4 L74,8', 'none', 5, '#2d6a4f')
      + p('M30,54 L44,46 L46,60 Z M90,54 L76,46 L74,60 Z', st.on ? '#ffe08a' : O, 2) + p('M34,76 L44,86 L52,78 L60,88 L68,78 L76,86 L86,76 Q60,100 34,76 Z', st.on ? '#ffe08a' : O, 2)
  });
  def('sapin', {
    n: 'Sapin', cat: 'Jardin', price: 50, w: 200, h: 300,
    svg: () => r(88, 250, 24, 50, '#8b5a2b', 3) + p('M100,0 L170,110 L140,110 L190,190 L150,190 L200,260 L0,260 L50,190 L10,190 L60,110 L30,110 Z', '#2d6a4f') + emo(100, 0, '⭐', 30)
  });
  def('voiture', {
    n: 'Voiture', cat: 'Jardin', price: 250, w: 380, h: 190, c: '#e63946',
    slots: [{ x: 150, y: 112 }, { x: 236, y: 112 }],
    svg: (st, k) => p('M70,70 Q90,10 160,10 L250,10 Q300,10 320,70 Z', '#cdeeff') + l(196, 14, 196, 70, k, 8),
    front: (st, k) => p('M10,140 L10,96 Q14,70 60,68 L330,68 Q370,72 372,110 L372,140 Q372,156 356,156 L24,156 Q10,156 10,140 Z', k) + c(90, 158, 30, '#3d3d4f') + c(90, 158, 12, '#cfd8e3') + c(296, 158, 30, '#3d3d4f') + c(296, 158, 12, '#cfd8e3') + r(340, 86, 30, 16, '#ffd23f', 6, 2.5) + r(12, 90, 22, 14, '#ff9f43', 5, 2.5) + l(190, 90, 210, 90, O, 4)
  });
})();
