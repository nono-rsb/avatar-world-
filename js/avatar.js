'use strict';
// ===== Rendu des avatars en SVG (viewBox 0 0 120 220, pieds en bas) =====
(() => {
  const { r, c, e, p, l, pl } = G.svg;
  const O = G.O, sh = G.shade;
  const A = G.avatar = {};

  A.K = 1.25; // pixels logiques par unité pour un adulte
  A.skins = ['#ffe3cc', '#fcd5b5', '#f6c39b', '#eab184', '#d99a6c', '#c68650', '#a8693c', '#8d5531', '#6b3e22', '#4a2b17', '#b8e0ff', '#c9f2c7'];
  A.hairColors = ['#2b1d14', '#4a2c17', '#7b4a24', '#b5752f', '#e8b44f', '#f6e09a', '#d9d9d9', '#ffffff', '#c0392b', '#ff7fb3', '#c77dff', '#4aa3ff', '#3ccf91', '#ff9f43', '#1f2a5a'];
  A.eyeColors = ['#4a2c17', '#2f7dd1', '#3aa35b', '#7a5cc4', '#7d8b99', '#1b1b1b', '#c48a2c', '#e0457b', '#18b5c9'];
  A.colors = ['#ff5c8a', '#ff9ebb', '#ff6b6b', '#e63946', '#ff9f43', '#ffd23f', '#c9e265', '#3ccf91', '#2ec4b6', '#7fd6ff', '#4aa3ff', '#3a5fcd', '#1d3557', '#9b6dff', '#c77dff', '#ffffff', '#e8e2d6', '#9aa5b1', '#3d3d4f', '#8b5a2b', '#f4a261', '#2d6a4f'];
  A.ages = {
    bebe: { n: 'Bébé', s: 0.52 }, enfant: { n: 'Enfant', s: 0.74 }, ado: { n: 'Ado', s: 0.88 },
    adulte: { n: 'Adulte', s: 1 }, senior: { n: 'Senior', s: 0.97 }
  };
  A.size = (L) => {
    const s = (A.ages[L.age] || A.ages.adulte).s * A.K;
    return { w: 132 * s, h: 262 * s, s };
  };
  // repères dans la viewBox (-6 -40 132 262), en unités depuis le coin haut-gauche
  A.PT = { foot: 257, hipStand: 196, hipSit: 194, footSit: 245, hand: [101, 192], head: [66, 100], cx: 66 };

  const limb = (pts, col, w) => pl(pts, O, w + 5) + pl(pts, col, w);

  // ---------- CHEVEUX ----------
  const cap = 'M20,62 C18,26 40,16 60,16 C82,16 102,26 100,62 C94,44 80,36 60,36 C40,36 26,44 20,62 Z';
  A.hair = {
    court: { n: 'Court', f: h => ({ front: p('M19,64 C15,28 40,14 62,15 C88,15 105,32 101,64 C97,50 91,42 84,38 C76,47 58,48 46,40 C36,47 26,52 19,64 Z', h) }) },
    long: { n: 'Long', f: h => ({ back: p('M22,58 C14,18 106,18 98,58 L105,136 C88,146 32,146 15,136 Z', h), front: p('M19,72 C13,30 36,15 60,15 C86,15 107,30 101,72 C98,56 93,46 87,40 C77,46 64,40 58,31 C52,44 36,50 25,52 C22,58 20,65 19,72 Z', h) }) },
    queue: { n: 'Queue', f: h => ({ back: p('M84,28 C118,22 126,62 113,98 C109,112 101,120 95,128 C101,98 104,66 84,46 Z', h) + c(88, 34, 6, '#ff5c8a', 2.5), front: p(cap, h) }) },
    chignon: { n: 'Chignon', f: h => ({ back: c(60, 14, 17, h) + e(60, 26, 12, 4, '#ff5c8a', 2.5), front: p(cap, h) }) },
    couettes: { n: 'Couettes', f: h => ({ back: c(12, 76, 16, h) + c(108, 76, 16, h) + c(22, 64, 5, '#ffd23f', 2.5) + c(98, 64, 5, '#ffd23f', 2.5), front: p('M20,62 C18,26 40,16 60,16 C82,16 102,26 100,62 C96,44 74,30 60,28 C46,30 24,44 20,62 Z', h) }) },
    afro: {
      n: 'Afro', f: h => {
        let b = c(60, 50, 50, h);
        [[16, 40], [24, 18], [46, 4], [74, 4], [96, 18], [104, 40], [108, 64], [12, 64]].forEach(([x, y]) => b += c(x, y, 16, h));
        b += c(60, 50, 44, h, 0);
        let f = '';
        [[28, 34], [42, 26], [60, 23], [78, 26], [92, 34]].forEach(([x, y]) => f += c(x, y, 12, h, 2.5));
        return { back: b, front: f };
      }
    },
    carre: { n: 'Carré', f: h => ({ back: p('M17,62 C13,18 107,18 103,62 L105,102 C94,106 86,102 82,98 L38,98 C34,102 26,106 15,102 Z', h), front: p('M20,60 C18,20 102,20 100,60 L99,48 C80,40 40,40 21,48 Z', h) }) },
    pique: { n: 'Pics', f: h => ({ front: p('M17,64 L21,34 L32,40 L35,16 L48,31 L58,8 L67,29 L81,12 L85,34 L99,25 L100,46 L103,64 C95,47 80,40 60,40 C40,40 25,47 17,64 Z', h) }) },
    iroquois: { n: 'Iroquoise', price: 40, f: h => ({ front: p('M48,44 L44,4 L55,12 L60,-4 L66,12 L76,4 L72,44 Z', h) }) },
    tresses: {
      n: 'Tresses', f: h => {
        let b = '';
        for (let i = 0; i < 6; i++) { b += e(20, 78 + i * 13, 9, 8, h, 2.5) + e(100, 78 + i * 13, 9, 8, h, 2.5); }
        b += c(20, 156, 4, '#ff5c8a', 2) + c(100, 156, 4, '#ff5c8a', 2);
        return { back: b, front: p('M20,64 C18,26 40,16 60,16 C82,16 102,26 100,64 C98,46 72,30 60,26 C48,30 22,46 20,64 Z', h) };
      }
    },
    boucles: {
      n: 'Boucles', price: 30, f: h => {
        let b = '';
        [[18, 50], [12, 74], [14, 98], [22, 120], [102, 50], [108, 74], [106, 98], [98, 120], [40, 128], [60, 132], [80, 128]].forEach(([x, y]) => b += c(x, y, 15, h, 2.5));
        let f = p(cap, h);
        [[26, 44], [40, 34], [56, 30], [72, 31], [86, 37], [96, 48]].forEach(([x, y]) => f += c(x, y, 9, h, 2.5));
        return { back: c(60, 70, 46, h, 0) + b, front: f };
      }
    },
    meche: { n: 'Mèche', f: h => ({ front: p('M18,66 C14,24 44,12 66,14 C92,16 106,34 102,64 C98,48 92,40 84,36 C70,42 50,46 30,40 C40,48 44,56 46,62 C36,58 24,60 18,66 Z', h) }) },
    chauve: { n: 'Chauve', f: () => ({}) },
  };

  // ---------- HAUTS ----------
  const torso = 'M34,108 C40,101 50,100 60,100 C70,100 80,101 86,108 L89,156 C76,161 44,161 31,156 Z';
  const armL = [[35, 110], [27, 132], [25, 150]], armR = [[85, 110], [93, 132], [95, 150]];
  const sleeve = (len, col, w = 17) => {
    const a = len === 'short' ? [[35, 110], [30, 124]] : armL;
    const b = len === 'short' ? [[85, 110], [90, 124]] : armR;
    const ea = len === 'long' ? [[35, 110], [27, 132], [25, 146]] : a;
    const eb = len === 'long' ? [[85, 110], [93, 132], [95, 146]] : b;
    return limb(ea, col, w) + limb(eb, col, w);
  };
  const skirtPath = (pose, wide) => {
    if (wide) return pose === 'sit' ? 'M34,146 L86,146 C98,160 104,172 106,182 C80,190 40,190 14,182 C16,172 22,160 34,146 Z'
      : 'M34,146 L86,146 C100,170 108,190 110,206 C80,214 40,214 10,206 C12,190 20,170 34,146 Z';
    return pose === 'sit' ? 'M33,148 L87,148 L93,172 C78,178 42,178 27,172 Z' : 'M33,148 L87,148 L97,190 C80,196 40,196 23,190 Z';
  };
  A.tops = {
    tshirt: { n: 'T-shirt', sl: 'short', f: (k, pose) => ({ body: p(torso, k) + p('M50,101 Q60,110 70,101', 'none', 2.5) }) },
    marin: {
      n: 'Marinière', sl: 'short', f: (k) => {
        const id = G.sid();
        let s = `<clipPath id="${id}"><path d="${torso}"/></clipPath>` + p(torso, '#ffffff');
        s += `<g clip-path="url(#${id})">`; for (let y = 112; y < 160; y += 10) s += `<rect x="20" y="${y}" width="80" height="5" fill="${k}"/>`;
        return { body: s + '</g>' + p(torso, 'none') };
      }, slc: () => '#ffffff'
    },
    pull: { n: 'Pull', sl: 'long', f: (k) => ({ body: p(torso, k) + l(33, 151, 87, 151, sh(k, -25), 3) + p('M50,101 Q60,109 70,101', 'none', 2.5) }) },
    debardeur: { n: 'Débardeur', sl: 'none', f: (k) => ({ body: p('M40,104 L48,103 Q60,112 72,103 L80,104 L88,156 C76,161 44,161 32,156 Z', k) }) },
    chemise: {
      n: 'Chemise', sl: 'long', f: (k) => ({
        body: p(torso, k) + p('M50,100 L60,114 L52,118 Z', '#ffffff', 2.5) + p('M70,100 L60,114 L68,118 Z', '#ffffff', 2.5)
          + c(60, 126, 2, O, 0) + c(60, 138, 2, O, 0) + c(60, 150, 2, O, 0)
      })
    },
    costume: {
      n: 'Costume', sl: 'long', price: 50, f: (k) => ({
        body: p(torso, '#ffffff') + p('M60,104 L56,112 L60,146 L64,112 Z', '#e63946', 2) + p('M34,108 C40,101 50,100 54,100 L60,130 L56,159 C46,160 38,158 31,156 Z', k) + p('M86,108 C80,101 70,100 66,100 L60,130 L64,159 C74,160 82,158 89,156 Z', k)
      })
    },
    sweat: {
      n: 'Sweat', sl: 'long', f: (k) => ({
        under: p('M38,104 C30,96 40,88 60,90 C80,88 90,96 82,104 Z', sh(k, -15)),
        body: p(torso, k) + p('M44,136 L76,136 L78,152 L42,152 Z', sh(k, -12), 2.5) + l(55, 104, 54, 120, '#fff', 2) + l(65, 104, 66, 120, '#fff', 2)
      })
    },
    veste: {
      n: 'Veste', sl: 'long', price: 40, f: (k) => ({
        body: p(torso, '#f4f4f4') + p('M34,108 C40,101 48,100 52,100 L56,159 C46,160 38,158 31,156 Z', k) + p('M86,108 C80,101 72,100 68,100 L64,159 C74,160 82,158 89,156 Z', k) + c(53, 130, 2.5, '#ffd23f', 1.5) + c(53, 144, 2.5, '#ffd23f', 1.5)
      })
    },
    maillot: { n: 'Maillot', sl: 'short', f: (k) => ({ body: p(torso, k) + `<text x="60" y="134" font-size="22" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#fff" stroke="${O}" stroke-width="1.5" font-family="Fredoka, sans-serif">10</text>` }) },
    robe: { n: 'Robe', sl: 'short', dress: true, f: (k, pose) => ({ body: p(skirtPath(pose), k) + p(torso, k) + l(36, 148, 84, 148, sh(k, -20), 3) + p('M50,101 Q60,110 70,101', 'none', 2.5) }) },
    princesse: {
      n: 'Princesse', sl: 'none', dress: true, price: 80, f: (k, pose) => ({
        body: p(skirtPath(pose, true), k) + p(skirtPath(pose, true).replace(/M34,146 L86,146/, 'M44,146 L76,146'), sh(k, 25), 2) + p(torso, k) + r(32, 140, 56, 10, '#ffd23f', 4, 2.5)
          + c(32, 112, 11, sh(k, 30)) + c(88, 112, 11, sh(k, 30)) + '<text x="60" y="122" font-size="14" text-anchor="middle" dominant-baseline="central">✨</text>'
      })
    },
    blouse: {
      n: 'Blouse', sl: 'long', price: 30, f: (k, pose) => ({
        body: p(torso, '#9fd8ff') + p(pose === 'sit' ? 'M34,108 L52,100 L56,168 L30,170 Z' : 'M34,108 L52,100 L56,190 L28,192 Z', '#ffffff') + p(pose === 'sit' ? 'M86,108 L68,100 L64,168 L90,170 Z' : 'M86,108 L68,100 L64,190 L92,192 Z', '#ffffff')
          + p('M48,104 Q46,128 60,134 Q74,128 72,104', 'none', 2.5, '#555') + c(60, 136, 4, '#9aa5b1', 2)
      }), slc: () => '#ffffff'
    },
    pyjama: {
      n: 'Pyjama', sl: 'long', f: (k) => {
        let s = p(torso, k);
        [[44, 118], [70, 126], [52, 146], [76, 146]].forEach(([x, y]) => s += `<text x="${x}" y="${y}" font-size="9" text-anchor="middle" dominant-baseline="central">⭐</text>`);
        return { body: s };
      }
    },
  };

  // ---------- BAS ----------
  const legPts = pose => pose === 'sit'
    ? { L: [[48, 154], [46, 167], [46, 194]], R: [[72, 154], [74, 167], [74, 194]], sL: [[48, 154], [46, 168]], sR: [[72, 154], [74, 168]], foot: 200 }
    : { L: [[48, 154], [48, 180], [48, 205]], R: [[72, 154], [72, 180], [72, 205]], sL: [[48, 154], [48, 176]], sR: [[72, 154], [72, 176]], foot: 210 };
  const hip = k => p('M34,146 L86,146 L87,164 L33,164 Z', k);
  A.bottoms = {
    pantalon: { n: 'Pantalon', f: (k, P) => limb(P.L, k, 17) + limb(P.R, k, 17) + hip(k) },
    short: { n: 'Short', f: (k, P) => limb(P.sL, k, 21) + limb(P.sR, k, 21) + hip(k) },
    jupe: { n: 'Jupe', f: (k, P, pose) => p(skirtPath(pose).replace('M33,148 L87,148', 'M33,146 L87,146'), k) },
    legging: { n: 'Legging', f: (k, P) => limb(P.L, k, 14) + limb(P.R, k, 14) + hip(k) },
    salopette: { n: 'Salopette', bib: true, f: (k, P) => limb(P.L, k, 17) + limb(P.R, k, 17) + hip(k) },
    couche: { n: 'Couche', f: () => p('M32,144 L88,144 L86,170 C70,178 50,178 34,170 Z', '#ffffff') },
  };

  // ---------- CHAUSSURES ----------
  A.shoes = {
    baskets: { n: 'Baskets', f: (k, y) => e(45, y, 12, 7, k) + e(75, y, 12, 7, k) + l(39, y + 2, 51, y + 2, '#fff', 2) + l(69, y + 2, 81, y + 2, '#fff', 2) },
    bottes: { n: 'Bottes', f: (k, y) => r(38, y - 22, 19, 26, k, 4) + r(63, y - 22, 19, 26, k, 4) + e(46, y + 1, 12, 6, k) + e(74, y + 1, 12, 6, k) },
    sandales: { n: 'Sandales', f: (k, y, skin) => e(45, y, 10, 6, skin, 2.5) + e(75, y, 10, 6, skin, 2.5) + l(37, y + 1, 53, y - 1, k, 4) + l(67, y - 1, 83, y + 1, k, 4) },
    ballerines: { n: 'Ballerines', f: (k, y) => e(46, y, 10, 6, k) + e(74, y, 10, 6, k) + c(46, y - 4, 2.5, '#fff', 1) + c(74, y - 4, 2.5, '#fff', 1) },
    pieds: { n: 'Pieds nus', f: (k, y, skin) => e(46, y, 9, 6, skin, 2.5) + e(74, y, 9, 6, skin, 2.5) },
  };

  // ---------- CHAPEAUX ----------
  A.hats = {
    aucun: { n: 'Aucun', f: () => '' },
    casquette: { n: 'Casquette', f: k => p('M20,46 C20,8 100,8 100,46 Z', k) + p('M60,40 L122,42 C118,52 72,52 60,47 Z', sh(k, -20)) + c(60, 12, 4, sh(k, -20), 2) },
    bonnet: { n: 'Bonnet', f: k => p('M18,48 C14,6 106,6 102,48 Z', k) + r(14, 38, 92, 15, sh(k, -15), 7) + c(60, 6, 10, '#ffffff') },
    noeud: { n: 'Nœud', f: k => p('M86,26 L70,14 L72,40 Z', k) + p('M86,26 L102,14 L100,40 Z', k) + c(86, 27, 5, sh(k, -15), 2.5) },
    fleur: { n: 'Fleur', f: k => { let s = ''; for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; s += c(90 + Math.cos(a) * 8, 30 + Math.sin(a) * 8, 7, k, 2); } return s + c(90, 30, 5, '#ffd23f', 2); } },
    chapeau: { n: 'Chapeau', f: k => e(60, 34, 60, 12, k) + p('M30,34 C30,2 90,2 90,34 Z', k) + p('M31,26 L89,26 L90,34 L30,34 Z', '#ff5c8a', 2.5) },
    couronne: { n: 'Couronne', price: 100, f: () => p('M30,32 L30,4 L45,18 L60,-2 L75,18 L90,4 L90,32 Z', '#ffd23f') + c(60, 22, 4, '#e63946', 2) + c(43, 25, 3, '#4aa3ff', 2) + c(77, 25, 3, '#3ccf91', 2) },
    chat: { n: 'Oreilles chat', price: 60, f: k => p('M24,40 L26,6 L50,26 Z', k) + p('M96,40 L94,6 L70,26 Z', k) + p('M30,32 L31,16 L42,26 Z', '#ff9ebb', 2) + p('M90,32 L89,16 L78,26 Z', '#ff9ebb', 2) },
    lapin: { n: 'Oreilles lapin', price: 60, f: k => e(44, 0, 9, 26, k) + e(76, 0, 9, 26, k) + e(44, 2, 4, 18, '#ff9ebb', 2) + e(76, 2, 4, 18, '#ff9ebb', 2) + p('M30,30 C40,18 80,18 90,30', 'none', 6, k) },
    casque: { n: 'Casque audio', price: 50, f: k => p('M18,62 C14,4 106,4 102,62', 'none', 9, O) + p('M18,62 C14,4 106,4 102,62', 'none', 5, k) + r(10, 52, 16, 28, k, 7) + r(94, 52, 16, 28, k, 7) },
    sorciere: { n: 'Sorcière', price: 40, f: k => e(60, 30, 56, 10, k) + p('M34,30 L66,-34 L86,30 Z', k) + p('M38,22 L84,22 L86,30 L34,30 Z', '#ff9f43', 2.5) },
    pirate: { n: 'Pirate', price: 40, f: () => p('M14,40 C30,0 90,0 106,40 C80,30 40,30 14,40 Z', '#2b2b3a') + `<text x="60" y="22" font-size="14" text-anchor="middle" dominant-baseline="central">💀</text>` },
  };

  // ---------- LUNETTES ----------
  A.glasses = {
    aucune: { n: 'Aucune', f: () => '' },
    rondes: { n: 'Rondes', f: k => c(44, 64, 12, 'rgba(255,255,255,.25)', 3, k) + c(76, 64, 12, 'rgba(255,255,255,.25)', 3, k) + l(56, 64, 64, 64, k, 3) },
    soleil: { n: 'Soleil', f: k => r(30, 56, 28, 18, '#222', 6, 3, k) + r(62, 56, 28, 18, '#222', 6, 3, k) + l(58, 62, 62, 62, k, 3) + l(34, 60, 40, 60, 'rgba(255,255,255,.5)', 2) },
    coeur: { n: 'Cœurs', price: 40, f: k => p('M44,74 L32,62 C28,56 34,50 38,52 C41,53 43,55 44,58 C45,55 47,53 50,52 C54,50 60,56 56,62 Z', '#ff5c8a', 2.5, k) + p('M76,74 L64,62 C60,56 66,50 70,52 C73,53 75,55 76,58 C77,55 79,53 82,52 C86,50 92,56 88,62 Z', '#ff5c8a', 2.5, k) + l(56, 60, 64, 60, k, 3) },
    etoiles: { n: 'Étoiles', price: 40, f: k => `<text x="44" y="64" font-size="28" text-anchor="middle" dominant-baseline="central">⭐</text><text x="76" y="64" font-size="28" text-anchor="middle" dominant-baseline="central">⭐</text>` },
  };
  A.beards = { aucune: { n: 'Aucune' }, moustache: { n: 'Moustache' }, barbe: { n: 'Barbe' } };
  A.eyeStyles = { ronds: { n: 'Ronds' }, cils: { n: 'Cils' }, amande: { n: 'Amande' }, petits: { n: 'Petits' }, grands: { n: 'Grands' } };
  A.exprs = { auto: '🙂 Auto', happy: '😊 Content', joy: '😄 Joie', love: '😍 Amour', sad: '😢 Triste', angry: '😠 Fâché', surprised: '😮 Surpris', silly: '😜 Farceur', sleep: '😴 Dodo', cool: '😎 Cool' };

  // ---------- VISAGE ----------
  function eye(x, y, L, ex, side) {
    const col = L.eyeC || '#4a2c17';
    if (ex === 'sleep') return p(`M${x - 8},${y} Q${x},${y + 6} ${x + 8},${y}`, 'none', 3);
    if (ex === 'joy' || ex === 'eat2') return p(`M${x - 8},${y + 3} Q${x},${y - 8} ${x + 8},${y + 3}`, 'none', 3.2);
    if (ex === 'silly' && side === 1) return p(`M${x - 8},${y + 2} Q${x},${y - 6} ${x + 8},${y + 2}`, 'none', 3.2);
    if (ex === 'love') return p(`M${x},${y + 9} L${x - 9},${y} C${x - 13},${y - 6} ${x - 6},${y - 11} ${x},${y - 5} C${x + 6},${y - 11} ${x + 13},${y - 6} ${x + 9},${y} Z`, '#ff3d6e', 2.5);
    let rx = 9, ry = 10, ir = 6.5;
    const st = L.eyes || 'ronds';
    if (st === 'amande') { ry = 7.5; ir = 6; }
    if (st === 'grands') { rx = 10.5; ry = 12.5; ir = 7.5; }
    if (ex === 'surprised') { rx = 10.5; ry = 12; ir = 5; }
    let s = '';
    if (st === 'petits' && ex !== 'surprised') {
      s = c(x, y, 5.5, '#1f1630', 0) + c(x - 1.8, y - 2, 1.8, '#fff', 0);
    } else {
      s = e(x, y, rx, ry, '#fff', 2.5) + c(x, y + 1, ir, col, 0) + c(x, y + 1, ir * 0.5, '#1f1630', 0) + c(x - 2.5, y - 2.5, 2.2, '#fff', 0);
      if (ex === 'cool') s += p(`M${x - rx - 1},${y - 3} L${x + rx + 1},${y - 3} L${x + rx + 1},${y - ry - 2} L${x - rx - 1},${y - ry - 2} Z`, L.skin, 0);
    }
    if (st === 'cils' || st === 'grands') {
      const d = side; // -1 gauche, 1 droite
      s += l(x + d * 7, y - 7, x + d * 12, y - 12, O, 2.5) + l(x + d * 9, y - 3, x + d * 14, y - 6, O, 2.5);
    }
    return s;
  }
  function brows(L, ex) {
    const k = L.hair === 'chauve' ? '#6b4b3a' : sh(L.hairC || '#4a2c17', -25);
    let a = [36, 48, 52, 47], b = [68, 47, 84, 48];
    if (ex === 'sad') { a = [36, 49, 52, 43]; b = [68, 43, 84, 49]; }
    if (ex === 'angry') { a = [36, 43, 52, 50]; b = [68, 50, 84, 43]; }
    if (ex === 'surprised') { a = [36, 42, 52, 40]; b = [68, 40, 84, 42]; }
    return l(...a, k, 3.5) + l(...b, k, 3.5);
  }
  function mouth(ex) {
    switch (ex) {
      case 'joy': return p('M47,80 Q60,98 73,80 Z', '#8a2b3e', 2.5) + p('M53,88 Q60,94 67,88 Q60,86 53,88 Z', '#ff7f9e', 0);
      case 'sad': return p('M50,89 Q60,80 70,89', 'none', 3);
      case 'angry': return p('M50,88 Q60,83 70,88', 'none', 3);
      case 'surprised': return e(60, 87, 5, 6.5, '#8a2b3e', 2.5);
      case 'sleep': return c(60, 86, 3, '#8a2b3e', 2);
      case 'eat': return `<g class="chew">${e(60, 86, 7, 7, '#8a2b3e', 2.5)}</g>`;
      case 'silly': return p('M48,82 Q60,92 72,82', 'none', 3) + p('M58,86 L58,94 Q63,100 68,94 L68,86 Z', '#ff7f9e', 2.5);
      case 'sick': return p('M50,87 Q55,83 60,87 Q65,91 70,87', 'none', 3);
      case 'cool': return p('M52,85 Q62,90 70,82', 'none', 3);
      default: return p('M49,82 Q60,91 71,82', 'none', 3);
    }
  }

  // ---------- SQUELETTE (radio) ----------
  function skeleton(pose) {
    const B = '#f4f8ff', S = '#9fb4cc';
    const P = legPts(pose);
    const bone = pts => pl(pts, S, 9) + pl(pts, B, 5);
    let s = bone(armL) + bone(armR) + bone(P.L) + bone(P.R);
    s += l(60, 98, 60, 150, S, 9) + l(60, 98, 60, 150, B, 5);
    for (let i = 0; i < 4; i++) s += p(`M44,${110 + i * 9} Q60,${104 + i * 9} 76,${110 + i * 9}`, 'none', 4, B);
    s += e(60, 150, 16, 8, B, 2.5, S);
    s += c(60, 58, 34, B, 3, S) + e(46, 60, 8, 9, '#203048', 0) + e(74, 60, 8, 9, '#203048', 0) + p('M57,72 L60,66 L63,72 Z', '#203048', 0);
    for (let i = 0; i < 5; i++) s += r(48 + i * 5, 80, 4, 7, B, 1, 1.5, S);
    return s;
  }

  // ---------- RENDU PRINCIPAL ----------
  A.render = (L, o = {}) => {
    const pose = o.pose || 'stand';
    const ex = o.expr || 'happy';
    const skin = L.skin || A.skins[2];
    const vb = o.vb || '-6 -40 132 262';
    if (o.xray) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" overflow="visible">${skeleton(pose)}</svg>`;
    const hc = L.hairC || '#4a2c17';
    const H = (A.hair[L.hair] || A.hair.court).f(hc, L);
    const T = A.tops[L.top] || A.tops.tshirt;
    const tc = L.topC || '#ff5c8a';
    const Tp = T.f(tc, pose);
    const P = legPts(pose);
    let s = '';
    s += H.back || '';
    // jambes
    s += limb(P.L, skin, 14) + limb(P.R, skin, 14);
    const B = A.bottoms[L.bottom] || A.bottoms.pantalon;
    if (!T.dress) s += B.f(L.bottomC || '#3a5fcd', P, pose);
    s += (A.shoes[L.shoes] || A.shoes.baskets).f(L.shoesC || '#ffffff', P.foot, skin);
    // cou + buste
    s += r(53, 92, 14, 16, skin, 3, 2.5);
    s += Tp.under || '';
    s += Tp.body;
    if (B.bib && !T.dress) {
      const bc = L.bottomC || '#3a5fcd';
      s += p('M44,118 L76,118 L78,150 L42,150 Z', bc, 2.5) + l(46, 118, 40, 104, bc, 5) + l(74, 118, 80, 104, bc, 5) + c(47, 122, 2, '#ffd23f', 1) + c(73, 122, 2, '#ffd23f', 1);
    }
    // bras
    s += limb(armL, skin, 12) + limb(armR, skin, 12);
    if (T.sl !== 'none') s += sleeve(T.sl, T.slc ? T.slc(tc) : tc, 17);
    s += c(25, 152, 7, skin, 2.5) + c(95, 152, 7, skin, 2.5);
    // tête
    s += c(21, 66, 8, skin, 2.5) + c(99, 66, 8, skin, 2.5);
    s += c(60, 60, 40, skin, 3);
    if (L.age === 'senior') s += p('M28,72 L33,70 M28,66 L33,66 M92,72 L87,70 M92,66 L87,66', 'none', 1.8);
    if (L.blush !== false) s += `<g opacity=".55">${e(32, 79, 7, 4, '#ff8fab', 0)}${e(88, 79, 7, 4, '#ff8fab', 0)}</g>`;
    if (L.freckles) [[34, 74], [38, 78], [30, 79], [86, 74], [82, 78], [90, 79]].forEach(([x, y]) => s += c(x, y, 1.3, '#a0613a', 0));
    if (o.sick) s += `<g opacity=".38">${e(60, 66, 32, 28, '#7ed957', 0)}</g>`;
    // yeux (clignement en CSS)
    const blink = (ex !== 'sleep' && ex !== 'joy' && ex !== 'love' && ex !== 'eat2' && o.blink !== false);
    s += `<g class="${blink ? 'eyes' : ''}" style="animation-delay:${(Math.random() * 4).toFixed(2)}s">${eye(44, 64, L, ex, -1)}${eye(76, 64, L, ex, 1)}</g>`;
    s += brows(L, ex);
    s += p('M57,73 Q60,77 63,73', 'none', 2.2);
    if (L.beard === 'barbe') s += p('M22,64 C24,98 44,108 60,108 C76,108 96,98 98,64 C94,80 84,90 76,86 Q60,80 44,86 C36,90 26,80 22,64 Z', hc, 2.5);
    if (L.beard === 'moustache' || L.beard === 'barbe') s += p('M46,80 Q53,74 60,78 Q67,74 74,80 Q67,83 60,81 Q53,83 46,80 Z', sh(hc, -10), 2);
    s += mouth(o.sick && ex === 'happy' ? 'sick' : ex);
    if (ex === 'sad') s += p('M33,74 Q31,80 33,84 Q36,80 33,74 Z', '#7fd6ff', 1.5);
    if (o.sick) s += p('M98,40 Q94,48 98,52 Q102,48 98,40 Z', '#7fd6ff', 1.5);
    s += H.front || '';
    s += (A.hats[L.hat] || A.hats.aucun).f(L.hatC || '#ff5c8a');
    s += (A.glasses[L.glasses] || A.glasses.aucune).f(L.glassesC || '#3d3d4f');
    if (ex === 'cool' && (!L.glasses || L.glasses === 'aucune')) s += A.glasses.soleil.f('#222');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" overflow="${o.vb ? 'hidden' : 'visible'}">${s}</svg>`;
  };
  // portrait (tête seulement)
  A.head = (L, expr) => A.render(L, { expr: expr || 'happy', vb: '4 -6 112 116', blink: false });

  A.defaultLook = () => ({
    age: 'adulte', skin: A.skins[2], hair: 'court', hairC: '#4a2c17', eyes: 'ronds', eyeC: '#4a2c17',
    blush: true, freckles: false, beard: 'aucune', top: 'tshirt', topC: '#ff5c8a', bottom: 'pantalon', bottomC: '#3a5fcd',
    shoes: 'baskets', shoesC: '#ffffff', hat: 'aucun', hatC: '#ff5c8a', glasses: 'aucune', glassesC: '#3d3d4f'
  });
  const freeKeys = obj => Object.keys(obj).filter(k => !obj[k].price);
  A.random = (o = {}) => {
    const pk = G.pick;
    const L = A.defaultLook();
    L.age = o.age || pk(['enfant', 'ado', 'adulte', 'adulte', 'senior']);
    L.skin = pk(A.skins.slice(0, 10));
    L.hair = pk(freeKeys(A.hair).filter(h => h !== 'chauve' || L.age === 'senior'));
    L.hairC = L.age === 'senior' ? pk(['#d9d9d9', '#ffffff', '#9aa5b1']) : pk(A.hairColors.slice(0, 6).concat(pk(A.hairColors)));
    L.eyes = pk(Object.keys(A.eyeStyles)); L.eyeC = pk(A.eyeColors);
    L.freckles = Math.random() < 0.25;
    L.beard = (L.age === 'adulte' || L.age === 'senior') && Math.random() < 0.2 ? pk(['moustache', 'barbe']) : 'aucune';
    L.top = pk(freeKeys(A.tops).filter(t => t !== 'pyjama')); L.topC = pk(A.colors);
    L.bottom = pk(['pantalon', 'short', 'jupe', 'legging', 'salopette']); L.bottomC = pk(A.colors);
    L.shoes = pk(['baskets', 'bottes', 'sandales', 'ballerines']); L.shoesC = pk(A.colors);
    L.hat = Math.random() < 0.2 ? pk(['casquette', 'bonnet', 'noeud', 'fleur', 'chapeau']) : 'aucun'; L.hatC = pk(A.colors);
    L.glasses = Math.random() < 0.15 ? pk(['rondes', 'soleil']) : 'aucune';
    if (L.age === 'bebe') { L.bottom = 'couche'; L.top = 'tshirt'; L.shoes = 'pieds'; L.beard = 'aucune'; }
    return Object.assign(L, o);
  };
  A.NAMES = ['Léo', 'Emma', 'Lina', 'Noah', 'Jade', 'Hugo', 'Zoé', 'Adam', 'Inès', 'Louis', 'Chloé', 'Gabriel', 'Mila', 'Nathan', 'Sarah', 'Tom', 'Lou', 'Rayan', 'Alice', 'Sacha', 'Nina', 'Yanis', 'Rose', 'Malo', 'Anna', 'Timéo', 'Léna', 'Kenzo', 'Maya', 'Elio'];
})();
