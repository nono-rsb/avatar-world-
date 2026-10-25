'use strict';
// ===== Décors, lieux et carte =====
(() => {
  const { r, c, e, p, l, t } = G.svg;
  const O = G.O, sh = G.shade;
  const F = G.FURN;

  // --- meubles spécifiques aux lieux ---
  F.kiosque = {
    n: 'Kiosque à glaces', cat: 'Magasin', price: 120, w: 280, h: 300, c: '#ff9ebb',
    stock: [{ t: 'i', k: 'glace', p: 3 }, { t: 'i', k: 'sorbet', p: 3 }, { t: 'i', k: 'sucette', p: 2 }, { t: 'i', k: 'popcorn', p: 3 }, { t: 'i', k: 'baudruche', p: 2 }],
    spos: [[40, 196], [95, 196], [140, 196], [190, 196], [240, 196]],
    svg: (st, k) => {
      let v = r(20, 196, 240, 104, '#ffffff', 8) + r(20, 196, 240, 16, k, 4) + l(30, 60, 30, 196, '#9aa5b1', 6) + l(250, 60, 250, 196, '#9aa5b1', 6);
      for (let i = 0; i < 7; i++) v += p(`M${i * 40},60 L${i * 40 + 40},60 L${i * 40 + 40},80 Q${i * 40 + 20},96 ${i * 40},80 Z`, i % 2 ? '#fff' : k, 2.5);
      v += p('M0,60 L140,0 L280,60 Z', k) + `<text x="140" y="44" font-size="20" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#fff" stroke="${O}" stroke-width="1" font-family="Fredoka">GLACES</text>`;
      return v + t(140, 250, '🍦', 40);
    }
  };
  F.caissegraines = {
    n: 'Caisse de graines', cat: 'Jardin', price: 40, w: 220, h: 90,
    stock: [{ t: 'i', k: 'graine_tomate', p: 0 }, { t: 'i', k: 'graine_carotte', p: 0 }, { t: 'i', k: 'graine_fleur', p: 0 }, { t: 'i', k: 'graine_fraise', p: 0 }, { t: 'i', k: 'graine_citrouille', p: 0 }, { t: 'i', k: 'graine_mais', p: 0 }],
    spos: [[25, 30], [60, 30], [95, 30], [130, 30], [165, 30], [200, 30]],
    svg: () => r(0, 30, 220, 60, '#c98b54', 4) + l(0, 50, 220, 50, '#a5683a', 3) + l(0, 70, 220, 70, '#a5683a', 3) + `<text x="110" y="78" font-size="13" font-weight="700" text-anchor="middle" fill="#fff" font-family="Fredoka">GRAINES</text>`
  };

  F.enseigne = {
    n: 'Enseigne', cat: 'Magasin', price: 30, w: 360, h: 90, wall: true, y: 150, c: '#ff5c8a', fixed: true,
    svg: (st, k) => l(60, 0, 70, 20, O, 3) + l(300, 0, 290, 20, O, 3) + r(0, 18, 360, 70, k, 18, 4) + r(10, 28, 340, 50, 'none', 12, 2.5, '#fff')
      + `<text x="180" y="54" font-size="30" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#fff" stroke="${O}" stroke-width="1.5" paint-order="stroke" font-family="Fredoka, sans-serif">${G.esc(st.label || '')}</text>`
  };
  // --- motifs de murs / sols ---
  G.WALLS = { uni: 'Uni', rayures: 'Rayures', pois: 'Pois', carreaux: 'Carreaux', briques: 'Briques', lambris: 'Lambris', etoiles: 'Étoiles', coeurs: 'Cœurs', fleurs: 'Fleurs' };
  G.FLOORS = { parquet: 'Parquet', carrelage: 'Carrelage', damier: 'Damier', moquette: 'Moquette', marbre: 'Marbre' };
  G.WALL_COLORS = ['#ffd6e0', '#ffe8c2', '#fff6c2', '#dff7d8', '#d6f1ff', '#e3dcff', '#f3e8ff', '#ffffff', '#ffc4a8', '#b8e0d2', '#9fc6ff', '#c9b6ff', '#3d3d6b', '#2b2b3a', '#ff9ebb', '#a8e6cf'];
  G.FLOOR_COLORS = ['#d9995e', '#a5683a', '#f4e1c1', '#e9f4ff', '#cfd8e3', '#9aa5b1', '#ffc0cb', '#b5e48c', '#7fd6ff', '#c77dff', '#3d3d4f', '#ffffff'];

  function wallPat(type, k, id) {
    const d = sh(k, -9), u = sh(k, 14);
    switch (type) {
      case 'rayures': return `<pattern id="${id}" width="64" height="10" patternUnits="userSpaceOnUse"><rect width="32" height="10" fill="${u}"/></pattern>`;
      case 'pois': return `<pattern id="${id}" width="56" height="56" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="6" fill="${d}"/><circle cx="42" cy="42" r="6" fill="${d}"/></pattern>`;
      case 'carreaux': return `<pattern id="${id}" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="none" stroke="${d}" stroke-width="3"/></pattern>`;
      case 'briques': return `<pattern id="${id}" width="90" height="44" patternUnits="userSpaceOnUse"><rect width="90" height="44" fill="${k}"/><path d="M0,22 L90,22 M0,44 L90,44 M45,0 L45,22 M0,22 L0,44 M90,22 L90,44" stroke="${d}" stroke-width="4"/></pattern>`;
      case 'etoiles': return `<pattern id="${id}" width="80" height="80" patternUnits="userSpaceOnUse"><text x="20" y="24" font-size="16" fill="${u}">★</text><text x="58" y="64" font-size="12" fill="${u}">★</text></pattern>`;
      case 'coeurs': return `<pattern id="${id}" width="70" height="70" patternUnits="userSpaceOnUse"><text x="16" y="26" font-size="18" fill="${d}">♥</text><text x="50" y="62" font-size="14" fill="${d}">♥</text></pattern>`;
      case 'fleurs': return `<pattern id="${id}" width="90" height="90" patternUnits="userSpaceOnUse"><text x="18" y="30" font-size="20" fill="${d}">✿</text><text x="62" y="76" font-size="16" fill="${u}">✿</text></pattern>`;
      default: return '';
    }
  }
  function floorPat(type, k, id) {
    const d = sh(k, -14), u = sh(k, 10);
    switch (type) {
      case 'parquet': return `<pattern id="${id}" width="240" height="38" patternUnits="userSpaceOnUse"><rect width="240" height="38" fill="${k}"/><rect y="19" width="240" height="19" fill="${u}"/><path d="M0,0 L240,0 M0,19 L240,19 M60,0 L60,19 M180,19 L180,38" stroke="${d}" stroke-width="2.5"/></pattern>`;
      case 'carrelage': return `<pattern id="${id}" width="70" height="38" patternUnits="userSpaceOnUse"><rect width="70" height="38" fill="${k}" stroke="${d}" stroke-width="3"/></pattern>`;
      case 'damier': return `<pattern id="${id}" width="100" height="56" patternUnits="userSpaceOnUse"><rect width="100" height="56" fill="${k}"/><rect width="50" height="28" fill="${d}"/><rect x="50" y="28" width="50" height="28" fill="${d}"/></pattern>`;
      case 'moquette': return `<pattern id="${id}" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="${k}"/><circle cx="8" cy="8" r="1.5" fill="${d}"/><circle cx="22" cy="20" r="1.5" fill="${u}"/></pattern>`;
      case 'marbre': return `<pattern id="${id}" width="160" height="56" patternUnits="userSpaceOnUse"><rect width="160" height="56" fill="${k}" stroke="${d}" stroke-width="2"/><path d="M10,40 Q50,10 90,30 T150,16" stroke="${u}" stroke-width="3" fill="none"/></pattern>`;
      default: return '';
    }
  }
  G.roomBg = (W, sc) => {
    const w = sc.wall, f = sc.floor, idw = G.sid(), idf = G.sid(), idg = G.sid();
    let s = `<defs>${wallPat(w.p, w.c, idw)}${floorPat(f.p, f.c, idf)}<linearGradient id="${idg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".35" stop-color="#000" stop-opacity="0"/></linearGradient></defs>`;
    s += `<rect width="${W}" height="610" fill="${w.c}"/>`;
    if (w.p && w.p !== 'uni' && w.p !== 'lambris') s += `<rect width="${W}" height="610" fill="url(#${idw})"/>`;
    if (w.p === 'lambris') {
      s += `<rect y="380" width="${W}" height="210" fill="${sh(w.c, -10)}"/><rect y="372" width="${W}" height="12" fill="#fff" stroke="${O}" stroke-width="2"/>`;
      for (let x = 30; x < W; x += 120) s += `<rect x="${x}" y="404" width="90" height="164" rx="6" fill="none" stroke="${sh(w.c, -22)}" stroke-width="3"/>`;
    }
    s += `<rect width="${W}" height="16" fill="${sh(w.c, -14)}"/>`;
    s += `<rect y="${f.p ? 606 : 606}" width="${W}" height="114" fill="${f.c}"/>`;
    if (f.p) s += `<rect y="606" width="${W}" height="114" fill="url(#${idf})"/>`;
    s += `<rect y="606" width="${W}" height="114" fill="url(#${idg})"/>`;
    s += `<rect y="586" width="${W}" height="22" fill="#ffffff" stroke="${O}" stroke-width="2.5"/>`;
    return `<svg width="${W}" height="720" viewBox="0 0 ${W} 720">${s}</svg>`;
  };

  const ground = (W, kind) => {
    const col = { herbe: '#7ed957', sable: '#f6e09a', paves: '#cfd8e3' }[kind];
    let s = `<path d="M0,580 Q${W / 4},560 ${W / 2},578 T${W},572 L${W},720 L0,720 Z" fill="${col}" stroke="${O}" stroke-width="3"/>`;
    s += `<rect y="640" width="${W}" height="80" fill="${sh(col, -6)}" opacity=".5"/>`;
    if (kind === 'herbe') for (let x = 20; x < W; x += 90) s += `<path d="M${x},${660 + (x % 37)} l6,-14 l4,14 l6,-10 l2,10" fill="none" stroke="#52b788" stroke-width="3" stroke-linecap="round"/>`;
    if (kind === 'sable') for (let x = 40; x < W; x += 130) s += `<circle cx="${x}" cy="${650 + (x % 50)}" r="3" fill="${sh(col, -15)}"/>` + (x % 3 === 0 ? `<text x="${x + 40}" y="${690}" font-size="18">🐚</text>` : '');
    return s;
  };
  const hills = (W, col) => {
    let s = '';
    for (let x = -100; x < W + 200; x += 420) s += `<ellipse cx="${x}" cy="590" rx="300" ry="${110 + (x % 60)}" fill="${col}" opacity=".9"/>`;
    return s;
  };
  G.outdoorBg = (W, sc, def) => {
    let s = def.far ? def.far(W) : hills(W, '#a8e6a1');
    s += ground(W, def.ground || 'herbe');
    if (def.extra) s += def.extra(W);
    return `<svg width="${W}" height="720" viewBox="0 0 ${W} 720">${s}</svg>`;
  };

  const city = W => {
    let s = '';
    const cols = ['#ffc4a8', '#9fc6ff', '#ffe08a', '#c9b6ff', '#b8e0d2'];
    for (let x = 0, i = 0; x < W; x += 170, i++) {
      const h = 120 + (i * 53) % 130;
      s += `<rect x="${x}" y="${590 - h}" width="150" height="${h}" fill="${cols[i % 5]}" stroke="${O}" stroke-width="2.5" opacity=".75"/>`;
      for (let y = 600 - h; y < 560; y += 40) s += `<rect x="${x + 25}" y="${y}" width="28" height="22" fill="#fff" opacity=".7"/><rect x="${x + 95}" y="${y}" width="28" height="22" fill="#fff" opacity=".7"/>`;
    }
    return s + hills(W, '#a8e6a1');
  };

  // --- définitions des scènes ---
  const npc = (name, x, look, o) => Object.assign({ name, x, look }, o || {});
  G.SCENES = {
    salon: {
      n: 'Salon', ic: '🛋️', grp: 'maison', W: 2300, type: 'room', home: true,
      wall: { c: '#ffd6e0', p: 'rayures' }, floor: { c: '#d9995e', p: 'parquet' },
      ents: [
        ['porte', 110, { st: { to: 'cuisine' } }], ['plante', 280], ['fenetre', 470], ['piano', 520], ['lampe', 690],
        ['tapis', 900, { y: 692 }], ['canape', 900], ['tablebasse', 900, { y: 704 }], ['cadre', 900], ['horloge', 1180], ['fauteuil', 1180],
        ['porte', 1420, { st: { to: 'jardin' } }], ['tv', 1700], ['bibliotheque', 1950], ['radio', 1990, { y: 386 }], ['porte', 2190, { st: { to: 'chambre' } }],
      ],
      items: [['tirelire', 1900, 386], ['livre', 1920, 476], ['ours', 960, 586], ['ballon', 1300, 690], ['cadeau', 860, 650 - 80 + 4 + 50], ['guitare', 1560, 680]],
    },
    cuisine: {
      n: 'Cuisine', ic: '🍳', grp: 'maison', W: 2000, type: 'room', home: true,
      wall: { c: '#fff6c2', p: 'carreaux' }, floor: { c: '#e9f4ff', p: 'damier' },
      ents: [
        ['frigo', 140], ['comptoir', 330], ['mixeur', 290, { y: 534 }], ['corbeille', 380, { y: 534 }], ['placard', 520], ['cuisiniere', 525],
        ['evier', 735], ['comptoir', 940], ['microondes', 950, { y: 534 }], ['poubelle', 1100], ['horloge', 1100], ['fenetre', 1400],
        ['chaise', 1240], ['table', 1400], ['chaise', 1560], ['porte', 1880, { st: { to: 'salon' } }],
      ],
      cont: { frigo: ['oeuf', 'oeuf', 'viande', 'lait', 'fromage', 'pain', 'carotte', 'mais', 'patate'], placard: ['pates', 'chocolat', 'cookie', 'biberon', 'jus', 'pizza'] },
      items: [['pomme', 1360, 650 - 110 + 4], ['lait', 1440, 650 - 110 + 4]],
    },
    chambre: {
      n: 'Chambre', ic: '🛏️', grp: 'maison', W: 2300, type: 'room', home: true,
      wall: { c: '#d6f1ff', p: 'etoiles' }, floor: { c: '#c77dff', p: 'moquette' },
      ents: [
        ['porte', 110, { st: { to: 'salon' } }], ['lit', 420], ['veilleuse', 420], ['chevet', 700], ['tapis2', 1000, { y: 696 }], ['litsuperpose', 980],
        ['poster', 1260], ['coffre', 1260], ['armoire', 1500], ['fenetre', 1720], ['bureau', 1720], ['chaise', 1720, { y: 690 }], ['berceau', 1930],
        ['porte', 2190, { st: { to: 'sdb' } }],
      ],
      cont: { coffre: ['robot', 'yoyo', 'voiture', 'puzzle'], armoire: ['casquette', 'lunettes', 'noeud', 'chapeau', 'cadeau', 'baguette'] },
      items: [['crayons', 1680, 650 - 115 + 4], ['livres', 1770, 650 - 115 + 4], ['manette', 760, 650 - 200 + 108]],
    },
    sdb: {
      n: 'Salle de bain', ic: '🛁', grp: 'maison', W: 1800, type: 'room', home: true,
      wall: { c: '#b8e0d2', p: 'carreaux' }, floor: { c: '#ffffff', p: 'carrelage' },
      ents: [
        ['porte', 110, { st: { to: 'chambre' } }], ['etagerebain', 400, { y: 380 }], ['baignoire', 400], ['douche', 720], ['toilettes', 930],
        ['miroir', 1150], ['lavabo', 1150], ['machinelaver', 1450], ['plante', 1660],
      ],
      items: [['papier', 1010, 690]],
    },
    jardin: {
      n: 'Jardin', ic: '🌻', grp: 'maison', W: 3700, type: 'out', ground: 'herbe', home: true,
      extra: () => {
        let s = `<rect x="0" y="180" width="500" height="410" fill="#ffc4a8" stroke="${O}" stroke-width="3"/>`;
        for (let y = 200; y < 590; y += 26) s += `<line x1="0" y1="${y}" x2="500" y2="${y}" stroke="${sh('#ffc4a8', -10)}" stroke-width="2"/>`;
        s += `<path d="M-30,190 L250,40 L530,190 Z" fill="#e63946" stroke="${O}" stroke-width="3"/>`;
        s += `<rect x="40" y="250" width="110" height="110" fill="#cdeeff" stroke="${O}" stroke-width="5"/><rect x="350" y="250" width="110" height="110" fill="#cdeeff" stroke="${O}" stroke-width="5"/>`;
        s += `<path d="M95,250 L95,360 M40,305 L150,305 M405,250 L405,360 M350,305 L460,305" stroke="${O}" stroke-width="4"/>`;
        return s;
      },
      ents: [
        ['porte', 250, { st: { to: 'salon' } }], ['fleurs', 440, { y: 700 }], ['potager', 700], ['potager', 1060], ['caissegraines', 880, { y: 704 }],
        ['pommier', 1450], ['trampoline', 1450, { y: 704 }], ['balancoire', 1800], ['barbecue', 2060], ['piscine', 2350, { y: 690 }],
        ['niche', 2700], ['gamelle', 2560, { y: 700 }], ['barriere', 2880], ['lampadaire', 1250], ['voiture', 3200], ['velo', 3520, { y: 690 }],
      ],
      items: [['arrosoir', 1220, 694], ['graine_tomate', 600, 694], ['ballon', 2000, 700]],
    },
    parc: {
      n: 'Parc', ic: '🌳', W: 3500, type: 'out', ground: 'herbe',
      far: W => city(W),
      extra: W => `<ellipse cx="2150" cy="620" rx="330" ry="40" fill="#7fd6ff" stroke="${O}" stroke-width="3"/><text x="2050" y="610" font-size="34">🦆</text><text x="2250" y="630" font-size="28">🦢</text><path d="M0,690 Q1400,640 2800,690 L2800,720 L0,720 Z" fill="#e8d3a6" opacity=".8"/>`,
      ents: [['arbre', 200], ['banc', 520], ['lampadaire', 720], ['fontaine', 1020], ['balancoire', 1380], ['toboggan', 1720], ['bacasable', 2000, { y: 700 }], ['kiosque', 2350], ['arbre', 2650], ['lampadaire', 2500], ['fleurs', 820, { y: 706 }], ['bus', 3130], ['scooter', 2880, { y: 700 }]],
      npcs: [npc('Paulo', 2480, { top: 'chemise', topC: '#ffffff', age: 'adulte', hat: 'casquette', hatC: '#ff5c8a' })],
      items: [['cerfvolant', 900, 690], ['ballonplage', 1550, 694]],
    },
    supermarche: {
      n: 'Supermarché', ic: '🛒', W: 2400, type: 'room', shop: true,
      wall: { c: '#e9f8ff', p: 'carreaux' }, floor: { c: '#ffffff', p: 'carrelage' },
      ents: [['enseigne', 1200, { c: '#3ccf91', st: { label: '🛒 Supermarché' } }], 
        ['etalage', 300, { st: { label: 'Fruits & légumes', stock: 'pomme banane raisin fraise pasteque orange carotte mais brocoli tomate patate citrouille' } }],
        ['etalage', 700, { st: { label: 'Épicerie', stock: 'pain oeuf viande poulet poisson fromage pates pizza sushi chocolat cookie bonbon' } }],
        ['frigoshop', 1080, { st: { stock: 'lait jus smoothie glace sorbet biberon fromage cocktail burger frites the cafe' } }],
        ['etalage', 1460, { st: { label: 'Maison & jardin', stock: 'savon brosse shampoing papier cadeau baudruche fleur bouquet bougie graine_tomate graine_carotte graine_fleur' } }],
        ['caisse', 1900], ['plante', 2250],
      ],
      npcs: [npc('Mia la caissière', 2040, { top: 'tshirt', topC: '#ff5c8a', hat: 'casquette', hatC: '#ff5c8a' })],
    },
    boutique: {
      n: 'Boutique', ic: '👗', W: 2000, type: 'room', shop: true,
      wall: { c: '#ffe0ec', p: 'pois' }, floor: { c: '#f4e1c1', p: 'marbre' },
      ents: [['enseigne', 1000, { c: '#c77dff', st: { label: '👗 Boutique' } }], ['portant', 300], ['mannequin', 560], ['cabine', 770], ['miroir', 1010], ['etalage', 1320, { st: { label: 'Jouets', stock: 'ours ballon basket yoyo voiture robot poupee manette puzzle cerfvolant skate baudruche' } }], ['caisse', 1720], ['plante', 1920]],
      npcs: [npc('Chloé la styliste', 1830, { top: 'robe', topC: '#c77dff', hair: 'chignon', hairC: '#ff7fb3', age: 'adulte' })],
    },
    coiffeur: {
      n: 'Coiffeur', ic: '💇', W: 1900, type: 'room', shop: true,
      wall: { c: '#e3dcff', p: 'lambris' }, floor: { c: '#3d3d4f', p: 'damier' },
      ents: [['enseigne', 950, { c: '#ff5c8a', st: { label: '💇 Coiffeur' } }], ['miroir', 350], ['fauteuilcoiffure', 350], ['miroir', 750], ['fauteuilcoiffure', 750], ['sechoir', 1050], ['etalage', 1380, { st: { label: 'Beauté', stock: 'rouge vernis shampoing savon brosse noeud fleur rose lunettes2 potion' } }], ['pouf', 1700, { y: 690 }]],
      npcs: [npc('Sam le coiffeur', 560, { top: 'debardeur', topC: '#3d3d4f', hair: 'iroquois', hairC: '#c77dff' })],
    },
    hopital: {
      n: 'Hôpital', ic: '🏥', W: 2750, type: 'room',
      wall: { c: '#dff7d8', p: 'uni' }, floor: { c: '#cfd8e3', p: 'carrelage' },
      ents: [['enseigne', 1100, { c: '#e63946', st: { label: '🏥 Hôpital' } }], ['ambulance', 2480], ['lithopital', 360], ['lithopital', 820], ['radiographie', 1170], ['balance', 1370, { y: 690 }], ['pharmacie', 1580], ['fauteuilroulant', 1820], ['bureau', 2060], ['horloge', 1580, { y: 340 }]],
      npcs: [npc('Dr Zoé', 1440, { top: 'blouse', topC: '#ffffff', bottomC: '#4aa3ff', glasses: 'rondes' })],
    },
    ecole: {
      n: 'École', ic: '🏫', W: 2250, type: 'room',
      wall: { c: '#fff1b8', p: 'uni' }, floor: { c: '#d9995e', p: 'parquet' },
      ents: [['bureau', 300], ['globe', 280, { y: 539 }], ['tableaunoir', 720], ['pupitre', 560], ['pupitre', 760], ['pupitre', 960], ['pupitre', 1160], ['horloge', 1170, { y: 270 }], ['fournitures', 1500], ['fenetre', 1860], ['chevalet', 1860], ['plante', 2120]],
      npcs: [npc('M. Victor', 420, { top: 'costume', topC: '#1d3557', bottomC: '#1d3557', age: 'senior', glasses: 'rondes', beard: 'moustache' })],
    },
    cafe: {
      n: 'Café', ic: '☕', W: 2150, type: 'room', shop: true,
      wall: { c: '#ffe8c2', p: 'rayures' }, floor: { c: '#a5683a', p: 'parquet' },
      ents: [['enseigne', 1000, { c: '#8b5a2b', st: { label: '☕ Café' } }], ['vitrine', 420], ['machinecafe', 640, { y: 650 - 200 + 132 + 20 }], ['fenetre', 1000], ['chaise', 870], ['tableronde', 1000], ['chaise', 1130], ['fenetre', 1500], ['chaise', 1370], ['tableronde', 1500], ['chaise', 1630], ['banquette', 1960]],
      npcs: [npc('Hugo le barista', 760, { top: 'tshirt', topC: '#8b5a2b', hat: 'bonnet', hatC: '#3d3d4f', beard: 'barbe' })],
    },
    plage: {
      n: 'Plage', ic: '🏖️', W: 3300, type: 'out', ground: 'sable',
      far: W => {
        let s = `<rect y="430" width="${W}" height="170" fill="#4aa3ff"/><path d="M${W * 0.7},440 q60,-50 140,0 Z" fill="#52b788" stroke="${O}" stroke-width="2.5"/>`;
        for (let x = 0; x < W; x += 120) s += `<path d="M${x},${470 + (x % 3) * 20} q30,-12 60,0" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>`;
        s += `<text x="${W * 0.3}" y="470" font-size="40">⛵</text><text x="${W * 0.55}" y="510" font-size="30">🐬</text>`;
        return s;
      },
      ents: [['palmier', 200], ['parasol', 600], ['serviette', 600, { y: 692 }], ['transat', 900], ['chateau', 1220, { y: 700 }], ['kiosque', 1650], ['parasol', 2050, { c: '#4aa3ff' }], ['transat', 2050], ['serviette', 2350, { y: 696, c: '#3ccf91' }], ['palmier', 2620], ['camionglace', 3000]],
      npcs: [npc('Kai le surfeur', 1850, { top: 'debardeur', topC: '#2ec4b6', bottom: 'short', bottomC: '#ff9f43', shoes: 'sandales', glasses: 'soleil' })],
      items: [['ballonplage', 1400, 694], ['bouee', 1800, 700], ['pelle', 1300, 704]],
    },
    animalerie: {
      n: 'Animalerie', ic: '🐾', W: 2100, type: 'room', shop: true,
      wall: { c: '#a8e6cf', p: 'pois' }, floor: { c: '#f4e1c1', p: 'carrelage' },
      ents: [['enseigne', 1050, { c: '#ff9f43', st: { label: '🐾 Animalerie' } }], ['cage', 330], ['cage', 760, { st: { stock: [{ t: 'p', k: 'perroquet', p: 80 }, { t: 'p', k: 'cochon', p: 70 }, { t: 'p', k: 'renard', p: 120 }, { t: 'p', k: 'panda', p: 200 }, { t: 'p', k: 'licorne', p: 300 }, { t: 'p', k: 'dino', p: 250 }] } }], ['aquarium', 1180], ['etalage', 1530, { st: { label: 'Animaux', stock: 'croquettes os herbe carotte poisson ballon' } }], ['panier', 1850, { y: 694 }], ['niche', 1990]],
      npcs: [npc('Léa la soigneuse', 1330, { top: 'tshirt', topC: '#ffffff', bottom: 'salopette', bottomC: '#3ccf91', hair: 'couettes', hairC: '#b5752f' })],
    },
    arcade: {
      n: 'Salle d\'arcade', ic: '🕹️', W: 2000, type: 'room', shop: true,
      wall: { c: '#2b2b3a', p: 'etoiles' }, floor: { c: '#3d3d6b', p: 'damier' },
      ents: [['enseigne', 1000, { c: '#9b6dff', st: { label: '🕹️ Arcade' } }], ['borne', 260, { st: { game: 'catch' } }], ['borne', 460, { st: { game: 'memory' } }], ['borne', 660, { st: { game: 'mole' } }], ['borne', 860, { st: { game: 'bubbles' } }], ['borne', 1060, { st: { game: 'simon' } }], ['guirlande', 660], ['distributeur', 1320], ['banquette', 1640], ['enceinte', 1900]],
      npcs: [npc('Max', 1470, { top: 'sweat', topC: '#9b6dff', age: 'ado', hat: 'casque', hatC: '#3ccf91' })],
    },
    disco: {
      n: 'Disco', ic: '🪩', W: 2300, type: 'room', shop: true,
      wall: { c: '#3d3d6b', p: 'etoiles' }, floor: { c: '#2b2b3a', p: 'damier' },
      ents: [['enseigne', 1700, { c: '#ff5c8a', st: { label: '🪩 Disco' } }], ['enceinte', 200], ['platines', 420], ['enceinte', 640], ['pistedanse', 1150, { y: 694 }], ['bouledisco', 1150], ['guirlande', 1150, { y: 120 }], ['bar', 1780], ['banquette', 2130]],
      npcs: [npc('DJ Nova', 420, { top: 'veste', topC: '#c77dff', hat: 'casque', hatC: '#ffd23f', glasses: 'etoiles' }, { y: 640 }), npc('Rose', 1050, { top: 'princesse', topC: '#ff5c8a' }), npc('Tim', 1250, { top: 'marin', topC: '#4aa3ff' })],
    },
  };

  // --- lieux sur la carte ---
  G.LOCS = [
    { id: 'maison', sc: 'salon', n: 'Ma maison', ic: '🏠', x: 22, y: 30 },
    { id: 'jardin', sc: 'jardin', n: 'Jardin', ic: '🌻', x: 11, y: 52 },
    { id: 'parc', sc: 'parc', n: 'Parc', ic: '🌳', x: 42, y: 50 },
    { id: 'supermarche', sc: 'supermarche', n: 'Supermarché', ic: '🛒', x: 62, y: 28 },
    { id: 'boutique', sc: 'boutique', n: 'Boutique', ic: '👗', x: 80, y: 22 },
    { id: 'coiffeur', sc: 'coiffeur', n: 'Coiffeur', ic: '💇', x: 86, y: 45 },
    { id: 'hopital', sc: 'hopital', n: 'Hôpital', ic: '🏥', x: 38, y: 18 },
    { id: 'ecole', sc: 'ecole', n: 'École', ic: '🏫', x: 54, y: 70 },
    { id: 'cafe', sc: 'cafe', n: 'Café', ic: '☕', x: 68, y: 52 },
    { id: 'plage', sc: 'plage', n: 'Plage', ic: '🏖️', x: 24, y: 82, price: 150 },
    { id: 'animalerie', sc: 'animalerie', n: 'Animalerie', ic: '🐾', x: 80, y: 72, price: 200 },
    { id: 'arcade', sc: 'arcade', n: 'Arcade', ic: '🕹️', x: 40, y: 82, price: 150 },
    { id: 'disco', sc: 'disco', n: 'Disco', ic: '🪩', x: 66, y: 86, price: 250 },
  ];
})();
