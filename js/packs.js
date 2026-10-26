'use strict';
// ===== Packs : la Ferme, le Château royal, le Camping (tous gratuits) =====
(() => {
  const { r, c, e, p, l, t } = G.svg;
  const O = G.O, sh = G.shade;
  const F = G.FURN, I = G.ITEMS;
  const def = (id, o) => F[id] = Object.assign({ n: id, cat: 'Déco', price: 30, w: 100, h: 100 }, o);
  const emo = (x, y, ch, s) => t(x, y, ch, s, '#000');
  const glow = (x, y, rr, col) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${col}" opacity=".35"/>`;
  const wheel = (x, y, rr) => `<g class="wheel" style="transform-origin:${x}px ${y}px">${c(x, y, rr, '#3d3d4f')}${c(x, y, rr * 0.45, '#cfd8e3')}${l(x - rr * 0.45, y, x + rr * 0.45, y, O, 2.5)}${l(x, y - rr * 0.45, x, y + rr * 0.45, O, 2.5)}</g>`;
  const blanket = (x, y, w, h, k) => p(`M${x},${y + 6} Q${x + w / 2},${y - 6} ${x + w},${y + 4} L${x + w + 4},${y + h} L${x - 4},${y + h} Z`, k) + p(`M${x},${y + 6} Q${x + w / 2},${y - 6} ${x + w},${y + 4} L${x + w},${y + 18} Q${x + w / 2},${y + 8} ${x},${y + 20} Z`, '#ffffff', 2.5);

  // ---------- objets & animaux ----------
  Object.assign(I, {
    hotdog: { e: '🌭', n: 'Hot-dog', cat: 'food', food: 30, p: 3 },
    guimauve: { e: '🍡', n: 'Brochette de bonbons', cat: 'food', food: 10, p: 2, fun: 15 },
    canne: { e: '🎣', n: 'Canne à pêche', cat: 'toy', p: 5, rod: 1, sz: 62 },
    botte_item: { e: '🥾', n: 'Botte', cat: 'misc', p: 1 },
    ble: { e: '🌾', n: 'Blé', cat: 'misc', petfood: 1, p: 1 },
    tresor: { e: '🏆', n: 'Trophée en or', cat: 'misc', p: 20 },
  });
  Object.assign(G.PETS, {
    vache: { e: '🐄', n: 'Vache', p: 0, snd: 'bark', say: 'Meuuuh !', gives: 'lait' },
    mouton: { e: '🐑', n: 'Mouton', p: 0, snd: 'meow', say: 'Bêêêh !' },
    cheval: { e: '🐴', n: 'Cheval', p: 0, snd: 'boing', say: 'Hiiii !' },
    poule: { e: '🐔', n: 'Poule', p: 0, snd: 'squeak', say: 'Cot cot !', gives: 'oeuf' },
    canard: { e: '🦆', n: 'Canard', p: 0, snd: 'squeak', say: 'Coin coin !' },
    ecureuil: { e: '🐿️', n: 'Écureuil', p: 0, snd: 'squeak', say: 'Hihihi !' },
  });

  // ================= FERME =================
  def('grange', {
    n: 'Grange', cat: 'Ferme', price: 150, w: 520, h: 470, c: '#d64545',
    svg: (st, k) => p('M20,170 L260,20 L500,170 L500,470 L20,470 Z', k) + p('M0,180 L260,0 L520,180 L500,190 L260,30 L20,190 Z', '#fff')
      + r(170, 260, 180, 210, sh(k, -20), 4) + p('M170,260 L350,470 M350,260 L170,470', 'none', 8, '#fff') + r(170, 260, 180, 210, 'none', 4, 8, '#fff')
      + r(215, 110, 90, 80, '#fff6c2', 4, 6, '#fff') + emo(260, 152, '🌾', 40) + r(60, 230, 70, 70, '#cdeeff', 4, 6, '#fff') + r(390, 230, 70, 70, '#cdeeff', 4, 6, '#fff')
  });
  def('botte', {
    n: 'Botte de foin', cat: 'Ferme', price: 20, w: 150, h: 100,
    slots: [{ x: 75, y: 16 }], surf: [{ x1: 6, x2: 144, y: 6 }],
    svg: () => r(0, 8, 150, 92, '#f2c94c', 14) + [30, 60, 90, 120].map(x => p(`M${x},14 Q${x - 6},54 ${x},94`, 'none', 2, '#c9a227')).join('') + l(0, 36, 150, 36, '#a5683a', 4) + l(0, 72, 150, 72, '#a5683a', 4)
  });
  def('poulailler', {
    n: 'Poulailler', cat: 'Ferme', price: 80, w: 240, h: 230,
    stock: [{ t: 'i', k: 'oeuf', p: 0 }, { t: 'i', k: 'oeuf', p: 0 }, { t: 'i', k: 'ble', p: 0 }],
    spos: [[70, 196], [120, 196], [170, 196]],
    svg: () => p('M10,80 L120,10 L230,80 Z', '#e63946') + r(24, 80, 192, 150, '#d9995e', 4) + r(40, 150, 160, 50, '#7b4a24', 6) + r(30, 196, 180, 10, '#a5683a', 3) + p('M96,120 L96,104 Q120,84 144,104 L144,120 Z', '#3d2c26') + emo(120, 60, '🐔', 30)
  });
  def('abreuvoir', {
    n: 'Abreuvoir', cat: 'Ferme', price: 25, w: 240, h: 80,
    svg: () => p('M0,10 L240,10 L220,70 L20,70 Z', '#9aa5b1') + e(120, 16, 112, 8, '#7fd6ff', 2) + l(40, 70, 36, 80, O, 6) + l(200, 70, 204, 80, O, 6)
  });
  def('epouvantail', {
    n: 'Épouvantail', cat: 'Ferme', price: 30, w: 170, h: 320,
    svg: () => l(85, 80, 85, 320, '#8b5a2b', 9) + l(10, 140, 160, 140, '#8b5a2b', 8) + p('M40,120 L130,120 L140,220 L30,220 Z', '#4aa3ff') + p('M30,220 L50,250 L60,220 L75,252 L90,220 L105,250 L120,220 L140,250 L140,220 Z', '#f2c94c', 2)
      + c(85, 80, 34, '#f6e09a') + c(73, 76, 4, O, 0) + c(97, 76, 4, O, 0) + p('M70,94 Q85,102 100,94', 'none', 3) + e(85, 50, 60, 10, '#c98b54') + p('M55,50 L65,10 L105,10 L115,50 Z', '#c98b54') + emo(150, 120, '🐦', 26)
  });
  def('moulin', {
    n: 'Éolienne', cat: 'Ferme', price: 60, w: 220, h: 420,
    svg: () => p('M96,120 L84,420 L136,420 L124,120 Z', '#e8e2d6') + `<g class="spin" style="transform-origin:110px 120px;animation-duration:4s">${[0, 90, 180, 270].map(a => `<path d="M110,120 L104,20 L116,20 Z" fill="#fff" stroke="${O}" stroke-width="3" transform="rotate(${a} 110 120)"/>`).join('')}</g>` + c(110, 120, 12, '#e63946')
  });
  def('tracteur', {
    n: 'Tracteur', cat: 'Véhicules', vehicle: true, price: 300, w: 380, h: 270, c: '#3ccf91',
    slots: [{ x: 150, y: 140 }],
    svg: (st, k) => r(90, 20, 140, 120, '#cdeeff', 8) + l(90, 20, 230, 20, k, 10),
    front: (st, k) => p('M60,140 L240,140 L240,90 L360,110 L370,200 L60,200 Z', k) + r(250, 120, 90, 20, sh(k, -20), 4, 2) + r(330, 60, 12, 60, '#3d3d4f', 3) + wheel(110, 205, 60) + wheel(320, 222, 38) + r(350, 150, 24, 18, '#fff6b0', 6, 2.5)
  });

  // ================= CHÂTEAU =================
  def('trone', {
    n: 'Trône', cat: 'Château', price: 150, w: 210, h: 300, c: '#c0392b',
    slots: [{ x: 105, y: 190 }],
    svg: (st, k) => p('M30,190 L30,40 Q105,-20 180,40 L180,190 Z', '#ffd23f') + p('M46,190 L46,52 Q105,4 164,52 L164,190 Z', k) + c(105, 30, 12, '#e63946', 3) + r(10, 180, 190, 40, '#ffd23f', 10) + r(20, 186, 170, 24, k, 8, 2.5)
      + r(0, 140, 34, 80, '#ffd23f', 10) + r(176, 140, 34, 80, '#ffd23f', 10) + r(26, 220, 20, 80, '#ffd23f', 4) + r(164, 220, 20, 80, '#ffd23f', 4)
  });
  def('litbaldaquin', {
    n: 'Lit à baldaquin', cat: 'Château', price: 220, w: 360, h: 400, c: '#c77dff',
    slots: [{ x: 180, y: 300, p: 'lie', a: 'sleep' }],
    svg: (st, k) => r(10, 0, 340, 30, '#ffd23f', 8) + l(20, 30, 20, 400, '#a5683a', 10) + l(340, 30, 340, 400, '#a5683a', 10)
      + p('M20,30 Q40,160 30,300 L60,300 Q70,160 60,30 Z', sh(k, 25)) + p('M340,30 Q320,160 330,300 L300,300 Q290,160 300,30 Z', sh(k, 25))
      + r(30, 286, 300, 34, '#fff', 10) + r(24, 316, 312, 50, '#a5683a', 8) + e(90, 284, 44, 16, '#fff'),
    front: (st, k) => blanket(130, 274, 196, 60, k)
  });
  def('lustre', {
    n: 'Lustre', cat: 'Château', price: 120, w: 240, h: 200, wall: true, y: 220, toggle: true, light: { x: 120, y: 140, r: 320 }, st: { on: true },
    svg: (st) => l(120, 0, 120, 90, '#ffd23f', 4) + p('M20,130 Q120,190 220,130', 'none', 6, '#ffd23f') + e(120, 140, 40, 12, '#ffd23f')
      + [20, 70, 120, 170, 220].map(x => r(x - 6, 100, 12, 30, '#fff', 3, 2) + (st.on ? glow(x, 92, 18, '#fff3b0') + p(`M${x},84 Q${x + 6},94 ${x},100 Q${x - 6},94 ${x},84 Z`, '#ffd23f', 2) : '')).join('')
  });
  def('armure', {
    n: 'Armure', cat: 'Château', price: 90, w: 130, h: 320,
    svg: () => c(65, 50, 36, '#cfd8e3') + r(40, 44, 50, 10, '#3d3d4f', 3, 0) + p('M65,10 L60,-20 L74,-10 Z', '#e63946', 2) + p('M20,90 L110,90 L100,190 L30,190 Z', '#cfd8e3') + p('M65,96 L65,180', 'none', 3, '#9aa5b1')
      + r(4, 92, 18, 90, '#cfd8e3', 8) + r(108, 92, 18, 90, '#cfd8e3', 8) + r(34, 190, 26, 120, '#cfd8e3', 6) + r(70, 190, 26, 120, '#cfd8e3', 6) + l(124, 40, 124, 300, '#9aa5b1', 5) + p('M116,40 L124,0 L132,40 Z', '#9aa5b1')
  });
  def('coffretresor', {
    n: 'Coffre au trésor', cat: 'Château', price: 100, w: 190, h: 130,
    cont: { area: [0, -50, 190, 130], slots: [[40, 50], [80, 50], [120, 50], [158, 50]] },
    svg: (st) => {
      let v = r(0, 46, 190, 84, '#a5683a', 8) + r(0, 70, 190, 12, '#ffd23f', 0, 2.5) + l(40, 46, 40, 130, '#ffd23f', 8) + l(150, 46, 150, 130, '#ffd23f', 8) + r(82, 64, 26, 30, '#ffd23f', 4);
      v += st.open ? glow(95, 40, 70, '#ffe08a') + p('M0,46 L-10,-20 L180,-30 L190,46 Z', sh('#a5683a', -15)) : p('M-4,50 Q95,-10 194,50 Z', sh('#a5683a', 10));
      return v;
    }
  });
  def('tapisrouge', {
    n: 'Tapis royal', cat: 'Château', price: 40, w: 640, h: 50, layer: 1, c: '#c0392b',
    svg: (st, k) => p('M30,4 L610,4 L640,46 L0,46 Z', k) + p('M42,10 L598,10 L622,40 L18,40 Z', 'none', 3, '#ffd23f')
  });
  def('banniere', {
    n: 'Bannière', cat: 'Château', price: 25, w: 110, h: 240, wall: true, y: 420, c: '#4aa3ff',
    svg: (st, k) => l(0, 6, 110, 6, '#a5683a', 8) + p('M10,10 L100,10 L100,230 L55,200 L10,230 Z', k) + p('M55,60 L80,80 L74,120 L55,136 L36,120 L30,80 Z', '#ffd23f') + emo(55, 100, '👑', 26)
  });
  def('vitrail', {
    n: 'Vitrail', cat: 'Château', price: 50, w: 160, h: 260, wall: true, y: 440,
    svg: () => {
      let v = p('M10,260 L10,80 Q80,-20 150,80 L150,260 Z', '#3d3d4f', 6);
      const cols = ['#ff5c8a', '#ffd23f', '#4aa3ff', '#3ccf91', '#c77dff', '#ff9f43'];
      for (let i = 0; i < 6; i++) v += r(22 + (i % 2) * 60, 90 + Math.floor(i / 2) * 54, 56, 50, cols[i], 2, 3, O);
      return v + c(80, 60, 22, '#ffd23f', 3);
    }
  });

  // ================= CAMPING =================
  def('tente', {
    n: 'Tente', cat: 'Camping', price: 90, w: 360, h: 230, c: '#ff9f43',
    slots: [{ x: 180, y: 196, p: 'lie', a: 'sleep' }],
    svg: (st, k) => p('M0,230 L180,10 L360,230 Z', k) + p('M120,230 L180,60 L240,230 Z', '#4a2c17') + l(180, 0, 180, 20, O, 4) + p('M180,0 L210,8 L180,16 Z', '#ff5c8a', 2),
    front: (st, k) => p('M80,180 Q180,160 290,178 L296,226 L74,226 Z', '#4aa3ff') + p('M80,180 Q180,160 290,178 L290,192 Q180,174 80,194 Z', '#7fd6ff', 2) + p('M120,230 L150,120 L160,230 Z', sh(k, 15), 2.5)
  });
  def('feudecamp', {
    n: 'Feu de camp', cat: 'Camping', price: 40, w: 170, h: 120, toggle: true, light: { x: 85, y: 60, r: 260 }, st: { on: true },
    surf: [{ x1: 30, x2: 140, y: 60, cook: 'fire' }],
    svg: (st) => (st.on ? glow(85, 70, 70, '#ff9f43') + `<g class="flame">${p('M50,104 C40,60 80,60 76,24 C100,50 100,70 112,46 C130,80 130,96 120,104 Z', '#ff9f43', 2.5)}${p('M66,104 C62,84 84,76 86,58 C100,76 104,90 104,104 Z', '#ffd23f', 2)}</g>` : '')
      + p('M20,110 L150,90', 'none', 14, '#8b5a2b') + p('M20,90 L150,110', 'none', 14, '#a5683a') + [10, 40, 70, 100, 130, 160].map(x => e(x, 114, 14, 8, '#9aa5b1', 2.5)).join('')
  });
  def('chaisepliante', {
    n: 'Chaise de camping', cat: 'Camping', price: 20, w: 110, h: 150, c: '#3ccf91',
    slots: [{ x: 55, y: 84 }],
    svg: (st, k) => l(16, 150, 94, 70, '#9aa5b1', 5) + l(94, 150, 16, 70, '#9aa5b1', 5) + p('M14,10 L96,10 L94,74 L16,74 Z', k) + p('M10,70 L100,70 L96,92 L14,92 Z', sh(k, -12))
  });
  def('lanterne', {
    n: 'Lanterne', cat: 'Camping', price: 20, w: 70, h: 100, free: true, toggle: true, light: { x: 35, y: 56, r: 180 }, st: { on: true },
    svg: (st) => p('M20,20 Q35,0 50,20', 'none', 4) + r(14, 20, 42, 12, '#3d3d4f', 4) + r(18, 32, 34, 52, st.on ? '#fff3b0' : '#cdeeff', 6) + (st.on ? glow(35, 58, 30, '#ffe08a') : '') + r(12, 84, 46, 14, '#3d3d4f', 4)
  });
  def('glaciere', {
    n: 'Glacière', cat: 'Camping', price: 40, w: 180, h: 120, c: '#4aa3ff',
    stock: [{ t: 'i', k: 'hotdog', p: 0 }, { t: 'i', k: 'guimauve', p: 0 }, { t: 'i', k: 'jus', p: 0 }, { t: 'i', k: 'mais', p: 0 }],
    spos: [[30, 34], [72, 34], [112, 34], [152, 34]],
    svg: (st, k) => r(0, 30, 180, 90, k, 12) + r(0, 30, 180, 26, '#fff', 10) + r(70, 70, 40, 14, '#fff', 6, 2)
  });
  def('ponton', {
    n: 'Ponton de pêche', cat: 'Camping', price: 60, w: 320, h: 100,
    svg: () => r(0, 20, 320, 22, '#a5683a', 4) + [40, 140, 240, 300].map(x => r(x, 42, 16, 58, '#8b5a2b', 3)).join('') + [60, 110, 160, 210, 260].map(x => l(x, 22, x, 40, '#8b5a2b', 2)).join(''),
    accept: (f, it) => {
      if (!G.ITEMS[it.t].rod) return false;
      if (f.st.busy) return 'keep';
      f.st.busy = true; G.sfx('swoosh'); G.sayAt(f, 'Ça mord ?');
      G.fall(it, 0, -200);
      setTimeout(() => {
        f.st.busy = false;
        const fish = G.pick(['poisson', 'poisson', 'poisson', 'sushi', 'botte_item', 'tresor']);
        const n = G.spawn('i', fish, { x: f.x + G.rand(-60, 60), y: f.y - 120, sc: f.sc }); G.fall(n, G.rand(-200, 200), -900);
        G.sfx(fish === 'tresor' ? 'tada' : 'splash'); G.emit('fish');
        if (fish === 'botte_item') G.sayAt(f, 'Oh non, une vieille botte !'); else G.sayAt(f, 'Une prise !');
      }, 1800);
      return 'keep';
    }
  });
  def('canoe', {
    n: 'Canoë', cat: 'Véhicules', vehicle: true, price: 150, w: 380, h: 120, c: '#e63946',
    slots: [{ x: 130, y: 60 }, { x: 250, y: 60 }],
    svg: () => '',
    front: (st, k) => p('M0,50 Q190,40 380,50 Q330,118 190,118 Q50,118 0,50 Z', k) + p('M20,58 Q190,50 360,58', 'none', 4, '#ffd23f') + l(60, 20, 300, 100, '#a5683a', 6) + e(300, 100, 16, 8, '#a5683a')
  });

  // ---------- décors des nouvelles scènes ----------
  const pines = W => {
    let s = '';
    for (let x = -40, i = 0; x < W + 80; x += 110, i++) {
      const h = 150 + (i * 37) % 90, y = 600;
      s += `<path d="M${x},${y} L${x + 50},${y - h} L${x + 100},${y} Z" fill="${i % 2 ? '#2d6a4f' : '#40916c'}" stroke="${O}" stroke-width="2.5" opacity=".9"/>`;
    }
    return s;
  };
  const S = G.SCENES;
  S.ferme = {
    n: 'Ferme', ic: '🚜', W: 3300, type: 'out', ground: 'herbe',
    extra: W => `<path d="M0,690 Q${W / 2},650 ${W},690 L${W},720 L0,720 Z" fill="#c98b54" opacity=".6"/>`,
    ents: [['grange', 420], ['moulin', 860], ['botte', 1080, { y: 690 }], ['botte', 1230, { y: 700 }], ['poulailler', 1450], ['abreuvoir', 1750, { y: 696 }], ['barriere', 1980], ['potager', 2300], ['potager', 2650], ['epouvantail', 2950], ['tracteur', 3120]],
    pets: [['vache', 1700, 'Marguerite'], ['mouton', 1900, 'Flocon'], ['cheval', 1000, 'Éclair'], ['poule', 1350, 'Cocotte'], ['poule', 1550, 'Paillette'], ['cochon', 2450, 'Rose']],
    npcs: [{ name: 'Fermière Jeanne', x: 1240, look: { top: 'chemise', topC: '#e63946', bottom: 'salopette', bottomC: '#4aa3ff', hat: 'chapeau', hatC: '#f6e09a', shoes: 'bottes', shoesC: '#3ccf91' } }],
    items: [['arrosoir', 2480, 694], ['graine_mais', 2200, 700], ['graine_citrouille', 2240, 700], ['ble', 1800, 704]],
  };
  S.chateau = {
    n: 'Château royal', ic: '🏰', W: 2800, type: 'room',
    wall: { c: '#cfd8e3', p: 'briques' }, floor: { c: '#f4e1c1', p: 'marbre' },
    ents: [['banniere', 260], ['vitrail', 460], ['armure', 260], ['trone', 760], ['tapisrouge', 1150, { y: 696 }], ['lustre', 1150], ['vitrail', 1150, { y: 470 }], ['cheminee', 1520, { c: '#9aa5b1' }], ['banniere', 1780, { c: '#e63946' }], ['litbaldaquin', 2100], ['coffretresor', 2450], ['armure', 2650]],
    cont: { coffretresor: ['diamant', 'couronne', 'baguette', 'potion'] },
    npcs: [{ name: 'Roi Léon', x: 960, look: { top: 'costume', topC: '#c0392b', bottomC: '#3d3d4f', hat: 'couronne', beard: 'barbe', hairC: '#b5752f' } }, { name: 'Reine Alba', x: 560, look: { top: 'princesse', topC: '#c77dff', hat: 'couronne', hair: 'long', hairC: '#e8b44f' } }],
    items: [['gateau', 1520, 650 - 230 + 30]],
  };
  S.camping = {
    n: 'Camping', ic: '🏕️', W: 3200, type: 'out', ground: 'herbe',
    far: W => `<ellipse cx="${W / 2}" cy="600" rx="${W}" ry="120" fill="#a8e6a1"/>` + pines(W),
    extra: W => `<path d="M2200,580 Q2500,570 ${W},585 L${W},720 L2350,720 Q2260,650 2200,580 Z" fill="#4aa3ff" stroke="${O}" stroke-width="3"/>` + [2400, 2600, 2800, 3000].map(x => `<path d="M${x},620 q20,-8 40,0" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>`).join('') + `<text x="2900" y="680" font-size="34">🐟</text>`,
    ents: [['sapin', 180], ['tente', 520], ['chaisepliante', 800], ['feudecamp', 960, { y: 690 }], ['chaisepliante', 1120, { flip: true }], ['lanterne', 1300, { y: 640 }], ['glaciere', 1450], ['sapin', 1700], ['tente', 2000, { c: '#3ccf91' }], ['ponton', 2550, { y: 680 }], ['canoe', 2950, { y: 690 }]],
    pets: [['ecureuil', 300, 'Noisette'], ['canard', 2750, 'Plouf']],
    npcs: [{ name: 'Guide Tom', x: 1250, look: { top: 'veste', topC: '#2d6a4f', bottom: 'short', bottomC: '#8b5a2b', hat: 'chapeau', hatC: '#c98b54', shoes: 'bottes', shoesC: '#8b5a2b' } }],
    items: [['canne', 2380, 700], ['guitare', 1020, 700], ['guimauve', 900, 700]],
  };

  G.LOCS.push(
    { id: 'ferme', sc: 'ferme', n: 'Ferme', ic: '🚜', x: 92, y: 32 },
    { id: 'chateau', sc: 'chateau', n: 'Château', ic: '🏰', x: 52, y: 32 },
    { id: 'camping', sc: 'camping', n: 'Camping', ic: '🏕️', x: 12, y: 70 },
  );

  // ---------- catalogue des packs ----------
  G.PACKS = [
    { id: 'maison', n: 'Ma maison', ic: '🏠', c1: '#ffb3c6', c2: '#ff7aa2', txt: 'Salon, cuisine, chambre, salle de bain et jardin avec potager, balançoire et voiture.', sc: ['salon', 'cuisine', 'chambre', 'sdb', 'jardin'] },
    { id: 'ville', n: 'Centre-ville', ic: '🏙️', c1: '#9fc6ff', c2: '#4aa3ff', txt: 'Fais tes courses, change de look à la boutique et au coiffeur, prends un goûter au café.', sc: ['supermarche', 'boutique', 'coiffeur', 'cafe'] },
    { id: 'services', n: 'Hôpital & École', ic: '🏥', c1: '#b8f0c8', c2: '#3ccf91', txt: 'Soigne les malades, passe la radio, dessine au tableau et fais la classe.', sc: ['hopital', 'ecole'] },
    { id: 'loisirs', n: 'Loisirs', ic: '🎡', c1: '#ffe08a', c2: '#ff9f43', txt: 'Parc, plage, salle d\'arcade avec 5 jeux et disco avec boule à facettes.', sc: ['parc', 'plage', 'arcade', 'disco'] },
    { id: 'animaux', n: 'Animaux', ic: '🐾', c1: '#c9f2c7', c2: '#2ec4b6', txt: 'Adopte chiens, chats, licornes et dinos, puis prends soin d\'eux.', sc: ['animalerie'] },
    { id: 'ferme', n: 'La ferme', ic: '🚜', c1: '#ffd6a5', c2: '#d64545', txt: 'Grange, vache qui donne du lait, poules qui pondent, tracteur, potagers et éolienne.', sc: ['ferme'], isNew: 1 },
    { id: 'chateau', n: 'Château royal', ic: '🏰', c1: '#e3dcff', c2: '#9b6dff', txt: 'Trône, lit à baldaquin, lustre, armures et coffre au trésor. Le roi et la reine t\'attendent !', sc: ['chateau'], isNew: 1 },
    { id: 'camping', n: 'Camping', ic: '🏕️', c1: '#b8e0d2', c2: '#2d6a4f', txt: 'Tentes, feu de camp pour cuisiner, pêche au ponton, canoë et forêt de sapins.', sc: ['camping'], isNew: 1 },
  ];
})();
