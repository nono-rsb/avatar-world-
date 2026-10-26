'use strict';
// ===== Interface utilisateur =====
(() => {
  const A = G.avatar;
  const U = G.ui = {};
  const $ = G.$;
  let floating = null;

  // ---------- PANNEAUX GÉNÉRIQUES ----------
  U.panel = (cls, html, onClose) => {
    U.closeFloating();
    const back = G.el('div', 'modal ' + (cls || ''));
    back.innerHTML = `<div class="panel">${html}</div>`;
    $('#ui').appendChild(back);
    const close = () => { back.remove(); onClose && onClose(); };
    back.addEventListener('pointerdown', ev => { if (ev.target === back) close(); });
    back.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { G.sfx('click'); close(); });
    G.paused = false;
    return { el: back, p: back.firstChild, close };
  };
  U.confirm = (txt, yes, yesTxt = 'Oui', noTxt = 'Non') => {
    const m = U.panel('small', `<h2>${txt}</h2><div class="row center"><button class="btn green" data-y>${yesTxt}</button><button class="btn" data-close>${noTxt}</button></div>`);
    m.p.querySelector('[data-y]').onclick = () => { m.close(); yes(); };
  };
  U.alert = (title, html, btn = 'Super !') => {
    const m = U.panel('small', `<h2>${title}</h2><div class="txt">${html}</div><div class="row center"><button class="btn green" data-close>${btn}</button></div>`);
    return m;
  };
  U.closeFloating = () => { if (floating) { floating.remove(); floating = null; } };

  // ---------- BARRE DU HAUT ----------
  let lastCoins = -1;
  U.updateTop = (bump) => {
    const S = G.S;
    const c = $('#coins span');
    if (S.coins !== lastCoins) { c.textContent = S.coins; lastCoins = S.coins; if (bump) { const p = $('#coins'); p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); } }
    $('#clock').innerHTML = `${G.isNight() ? '🌙' : '☀️'} ${G.clockStr()} <small>J${S.day}</small>`;
  };
  U.onScene = () => {
    const d = G.sceneDef();
    $('#locName').innerHTML = `${d.ic} ${d.n}`;
    U.updateWeather();
    $('#btnDeco').classList.toggle('on', G.deco);
    if (G.deco) U.openDecoBar();
  };
  U.updateWeather = () => {
    const w = $('#weather'), d = G.sceneDef();
    const wt = G.S.weather;
    w.className = '';
    w.innerHTML = '';
    if (d.type === 'room') return;
    if (wt === 'pluie' || wt === 'neige') {
      w.className = wt;
      for (let i = 0; i < (wt === 'pluie' ? 70 : 50); i++) {
        const p = G.el('i');
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = (-Math.random() * 3) + 's';
        p.style.animationDuration = (wt === 'pluie' ? G.rand(0.5, 0.9) : G.rand(3, 6)) + 's';
        if (wt === 'neige') p.textContent = '❄';
        w.appendChild(p);
      }
    }
    $('#sky').classList.toggle('cloudy', wt !== 'soleil');
  };

  // ---------- POCHE ----------
  U.renderTray = () => {
    const tr = $('#tray');
    tr.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const id = G.S.tray[i], e = id && G.S.ents[id];
      const s = G.el('div', 'slot');
      if (e) {
        s.dataset.id = id;
        if (e.k === 'c') s.innerHTML = A.head(e.look);
        else if (e.k === 'p') s.innerHTML = `<span>${G.PETS[e.t].e}</span>`;
        else { const d = G.ITEMS[e.t]; s.innerHTML = d.svg ? G.ITEM_SVG[d.svg](e.st) : `<span>${d.e}</span>`; }
        s.title = e.name || (G.defOf(e) || {}).n || '';
        s.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); G.audio.init(); G.fromTray(id, ev); });
      }
      tr.appendChild(s);
    }
  };
  U.overTray = (cx, cy) => {
    const r = $('#tray').getBoundingClientRect();
    return cx >= r.left - 10 && cx <= r.right + 10 && cy >= r.top - 10 && cy <= r.bottom + 14;
  };
  U.trayHover = (cx, cy) => $('#tray').classList.toggle('hover', U.overTray(cx, cy));
  U.overTrash = (cx, cy) => {
    const t = $('#trashzone'); if (!G.deco) return false;
    const r = t.getBoundingClientRect();
    return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
  };

  // ---------- MENU PERSONNAGE ----------
  const bar = (ic, n, v) => `<div class="stat"><span>${ic}</span><div class="bar"><div style="width:${v}%;background:${v < 25 ? '#ff5c5c' : v < 55 ? '#ffd23f' : '#3ccf91'}"></div></div></div>`;
  U.charMenu = (c) => {
    U.closeFloating();
    const el = G.el('div', 'floating charmenu');
    const draw = () => {
      const st = c.stats || {};
      el.innerHTML = `<div class="cm-head">${A.head(c.look)}<div><b>${G.esc(c.name)}</b>${c.npc ? '<small>Habitant</small>' : ''}${c.sick ? '<small class="sick">🤒 Malade</small>' : ''}</div><button class="x">✖</button></div>
        ${c.npc ? '' : bar('🍔', 'Faim', st.faim | 0) + bar('⚡', 'Énergie', st.energie | 0) + bar('🧼', 'Propreté', st.proprete | 0) + bar('🎈', 'Amusement', st.fun | 0)}
        <div class="cm-btns"><button data-a="look">👕<i>Look</i></button><button data-a="mood">😊<i>Humeur</i></button><button data-a="talk">💬<i>Parler</i></button>${c.seat && G.S.ents[c.seat.f] && G.FURN[G.S.ents[c.seat.f].t].vehicle ? '<button data-a="drive">🚗<i>Conduire</i></button>' : ''}<button data-a="pocket">👝<i>Poche</i></button><button data-a="del">🗑️<i>Retirer</i></button></div>
        <div class="moods" hidden>${Object.entries(A.exprs).map(([k, v]) => `<button data-m="${k}" class="${c.expr === k ? 'on' : ''}">${v.split(' ')[0]}</button>`).join('')}</div>`;
      el.querySelector('.x').onclick = U.closeFloating;
      el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
        G.sfx('click');
        const a = b.dataset.a;
        if (a === 'look') { U.closeFloating(); U.creator(c); }
        if (a === 'mood') el.querySelector('.moods').hidden = !el.querySelector('.moods').hidden;
        if (a === 'talk') G.say(c, talkLine(c));
        if (a === 'drive') { U.closeFloating(); U.drivePicker(G.S.ents[c.seat.f]); }
        if (a === 'pocket') { U.closeFloating(); G.toTray(c); }
        if (a === 'del') { U.closeFloating(); U.confirm(`Faire partir ${G.esc(c.name)} pour toujours ?`, () => { G.burst(G.headPos(c).x, G.headPos(c).y + 60, '💨', 6); G.del(c); G.save(); }); }
      });
      el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { c.expr = b.dataset.m; G.sfx('pop'); draw(); el.querySelector('.moods').hidden = false; });
    };
    draw();
    el._draw = draw; el._c = c;
    $('#ui').appendChild(el);
    floating = el;
  };
  function talkLine(c) {
    const st = c.stats || { faim: 80, energie: 80, proprete: 80, fun: 80 };
    if (c.sick) return 'Je ne me sens pas bien... 🤒';
    if (st.faim < 30) return G.pick(['J\'ai faim !', 'Mon ventre gargouille...', 'Un petit goûter ?']);
    if (st.energie < 30) return G.pick(['Je suis fatigué(e)...', 'Au dodo ?', '*bâille*']);
    if (st.proprete < 30) return G.pick(['Il me faut un bain !', 'Je sens pas très bon...']);
    if (st.fun < 30) return G.pick(['Je m\'ennuie...', 'On joue ?', 'On va au parc ?']);
    return G.pick(['Coucou !', 'Quelle belle journée !', 'J\'adore cette ville !', 'Tu viens jouer ?', 'Hihi !', 'On va à la plage ?', 'J\'ai envie d\'une glace 🍦', 'Salut toi !', 'Youpi !', `Je m'appelle ${c.name} !`]);
  }
  U.tick = () => {
    if (floating && floating._draw && floating.classList.contains('charmenu')) {
      const moodsOpen = !floating.querySelector('.moods').hidden;
      if (!G.S.ents[floating._c.id] || floating._c.sc !== G.S.cur) { U.closeFloating(); return; }
      floating._draw(); floating.querySelector('.moods').hidden = !moodsOpen;
    }
  };

  // ---------- CRÉATEUR D'AVATAR ----------
  const TABS = [
    ['corps', '🧍', 'Corps'], ['hair', '💇', 'Cheveux'], ['face', '😊', 'Visage'], ['top', '👕', 'Haut'],
    ['bottom', '👖', 'Bas'], ['shoes', '👟', 'Chaussures'], ['acc', '🎩', 'Accessoires']
  ];
  const CROP = { head: '-4 -36 128 140', top: '6 84 108 90', bottom: '6 126 108 100', shoes: '16 176 88 50' };
  U.creator = (c, tab, onDone) => {
    U.closeFloating();
    G.cancelDrag();
    const isNew = !c;
    const look = JSON.parse(JSON.stringify(c ? c.look : A.random({ age: 'enfant' })));
    let name = c ? c.name : G.pick(A.NAMES);
    let cur = tab || 'corps';
    const title = isNew ? (G.S.started ? 'Nouveau personnage' : 'Crée ton personnage !') : 'Modifier le look';
    const m = U.panel('creator', `
      <div class="cr-left"><h2>${title}</h2><div class="cr-prev"></div>
        <div class="cr-name"><input maxlength="16" value="${G.esc(name)}" aria-label="Nom"><button class="btn small" data-rand title="Au hasard">🎲</button></div>
        <div class="cr-ex">${['happy', 'joy', 'love', 'silly', 'cool', 'surprised'].map(x => `<button data-ex="${x}">${A.exprs[x].split(' ')[0]}</button>`).join('')}</div>
        <div class="row center"><button class="btn green big" data-ok>✔ Valider</button>${G.S.started ? '<button class="btn" data-close>✖</button>' : ''}</div></div>
      <div class="cr-right"><div class="cr-tabs">${TABS.map(([k, ic, n]) => `<button data-tab="${k}"><span>${ic}</span><i>${n}</i></button>`).join('')}</div><div class="cr-opts"></div></div>`);
    let prevExpr = 'happy';
    const prev = () => { m.p.querySelector('.cr-prev').innerHTML = A.render(look, { expr: prevExpr }); };
    const inp = m.p.querySelector('input');
    inp.oninput = () => name = inp.value;
    m.p.querySelector('[data-rand]').onclick = () => { G.sfx('magic'); const keepAge = look.age; Object.assign(look, A.random({ age: keepAge })); fixOwned(look); prev(); renderTab(); };
    m.p.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => { prevExpr = b.dataset.ex; prev(); G.sfx('pop'); });
    m.p.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { cur = b.dataset.tab; G.sfx('click'); renderTab(); });
    m.p.querySelector('[data-ok]').onclick = () => {
      G.sfx('tada');
      name = (name || '').trim() || 'Sans nom';
      if (c) { c.look = look; c.name = name; G.redraw(c); G.place(c); G.emit('dress'); G.tmpExpr(c, 'joy', 1800); G.say(c, G.pick(['Je suis trop beau/belle !', 'Nouveau look !', 'Merci !'])); }
      m.close();
      if (onDone) onDone(look, name);
      else if (isNew) {
        const e = G.spawn('c', 'perso', { look, name, x: G.camCenter(), y: 300 });
        G.fall(e, 0, 0); G.emit('create'); G.burst(e.x, 400, '✨', 8);
      }
      G.save();
    };
    const owned = (cat, id, opt) => G.FREE || !opt.price || G.S.owned.includes(cat + ':' + id);
    function fixOwned(L) {
      const chk = (cat, key, obj, def) => { if (!owned(cat, L[key], obj[L[key]] || {})) L[key] = def; };
      chk('hair', 'hair', A.hair, 'court'); chk('top', 'top', A.tops, 'tshirt'); chk('hat', 'hat', A.hats, 'aucun'); chk('glasses', 'glasses', A.glasses, 'aucune');
    }
    function optGrid(label, cat, key, obj, crop) {
      let h = `<h3>${label}</h3><div class="grid">`;
      Object.entries(obj).forEach(([id, o]) => {
        const L = Object.assign({}, look, { [key]: id });
        if (key === 'top' && (id === 'robe' || id === 'princesse')) L.bottom = look.bottom;
        const lock = !owned(cat, id, o);
        h += `<button class="opt ${look[key] === id ? 'on' : ''} ${lock ? 'lock' : ''}" data-k="${key}" data-v="${id}" data-cat="${cat}" title="${o.n}">${A.render(L, { vb: crop, blink: false })}<i>${o.n}</i>${lock ? `<b>🔒${o.price}🪙</b>` : ''}</button>`;
      });
      return h + '</div>';
    }
    function swatches(label, key, list) {
      return `<h3>${label}</h3><div class="sw">${list.map(col => `<button class="swc ${look[key] === col ? 'on' : ''}" data-k="${key}" data-v="${col}" style="background:${col}"></button>`).join('')}</div>`;
    }
    function choices(label, key, obj) {
      return `<h3>${label}</h3><div class="chips">${Object.entries(obj).map(([id, o]) => `<button class="chip ${look[key] === id ? 'on' : ''}" data-k="${key}" data-v="${id}">${o.n}</button>`).join('')}</div>`;
    }
    function renderTab() {
      m.p.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === cur));
      let h = '';
      if (cur === 'corps') h = choices('Âge', 'age', A.ages) + swatches('Couleur de peau', 'skin', A.skins);
      if (cur === 'hair') h = optGrid('Coiffure', 'hair', 'hair', A.hair, CROP.head) + swatches('Couleur des cheveux', 'hairC', A.hairColors);
      if (cur === 'face') h = optGrid('Yeux', 'eyes', 'eyes', A.eyeStyles, '14 34 92 50') + swatches('Couleur des yeux', 'eyeC', A.eyeColors) + choices('Barbe', 'beard', A.beards)
        + `<h3>Détails</h3><div class="chips"><button class="chip ${look.blush !== false ? 'on' : ''}" data-t="blush">Joues roses</button><button class="chip ${look.freckles ? 'on' : ''}" data-t="freckles">Taches de rousseur</button></div>`;
      if (cur === 'top') h = optGrid('Haut', 'top', 'top', A.tops, CROP.top) + swatches('Couleur', 'topC', A.colors);
      if (cur === 'bottom') h = optGrid('Bas', 'bottom', 'bottom', A.bottoms, CROP.bottom) + swatches('Couleur', 'bottomC', A.colors);
      if (cur === 'shoes') h = optGrid('Chaussures', 'shoes', 'shoes', A.shoes, CROP.shoes) + swatches('Couleur', 'shoesC', A.colors);
      if (cur === 'acc') h = optGrid('Chapeau', 'hat', 'hat', A.hats, CROP.head) + swatches('Couleur du chapeau', 'hatC', A.colors) + optGrid('Lunettes', 'glasses', 'glasses', A.glasses, '14 34 92 50') + swatches('Couleur des lunettes', 'glassesC', A.colors);
      const box = m.p.querySelector('.cr-opts');
      const sc = box.scrollTop;
      box.innerHTML = h;
      box.scrollTop = sc;
      box.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
        const k = b.dataset.k, v = b.dataset.v, cat = b.dataset.cat;
        if (b.classList.contains('lock')) {
          const obj = { hair: A.hair, top: A.tops, hat: A.hats, glasses: A.glasses }[cat];
          const o = obj[v];
          U.confirm(`Acheter « ${o.n} » pour ${o.price} 🪙 ?`, () => {
            if (!G.spend(o.price)) return;
            G.S.owned.push(cat + ':' + v); look[k] = v; G.sfx('tada'); prev(); renderTab();
          }, 'Acheter', 'Annuler');
          return;
        }
        look[k] = v; G.sfx('pop'); prev(); renderTab();
      });
      box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
        const k = b.dataset.t; look[k] = k === 'blush' ? look.blush === false : !look[k]; G.sfx('pop'); prev(); renderTab();
      });
    }
    prev(); renderTab();
    setTimeout(() => { if (isNew && !G.S.started) inp.select(); }, 100);
  };

  // ---------- CARTE ----------
  U.map = () => {
    G.sfx('swoosh');
    const S = G.S;
    let pins = '';
    G.LOCS.forEach(L => {
      const locked = !G.FREE && L.price && !S.unlocked[L.id];
      const here = G.SCENES[S.cur] && (S.cur === L.sc || (L.id === 'maison' && G.SCENES[S.cur].grp === 'maison' && S.cur !== 'jardin'));
      const people = Object.values(S.ents).filter(e => (e.k === 'c' && !e.npc || e.k === 'p') && (e.sc === L.sc || (L.id === 'maison' && ['salon', 'cuisine', 'chambre', 'sdb'].includes(e.sc)))).slice(0, 4);
      pins += `<button class="pin ${locked ? 'locked' : ''} ${here ? 'here' : ''}" data-l="${L.id}" style="left:${L.x}%;top:${L.y}%"><span class="ic">${L.ic}</span><span class="nm">${L.n}</span>${locked ? `<b>🔒 ${L.price}🪙</b>` : ''}<span class="ppl">${people.map(p => p.k === 'c' ? `<i>${A.head(p.look)}</i>` : `<i class="pe">${G.PETS[p.t].e}</i>`).join('')}</span></button>`;
    });
    const m = U.panel('mapp', `<div class="maphead"><h2>🗺️ La carte de MiniVille</h2><button class="btn" data-close>✖</button></div>
      <div class="mapbox"><svg viewBox="0 0 1000 560" preserveAspectRatio="none" class="mapsvg">
        <rect width="1000" height="560" fill="#7fd6ff"/>
        <path d="M60,120 C40,40 220,10 400,30 C560,0 760,10 900,60 C990,120 980,300 960,420 C930,520 760,550 600,540 C420,560 200,560 110,500 C30,440 70,300 60,120 Z" fill="#f6e09a" stroke="#3a2a4d" stroke-width="5"/>
        <path d="M90,140 C80,70 230,44 400,60 C560,36 750,44 870,90 C950,140 940,300 920,400 C890,480 760,500 600,490 C430,500 230,500 150,460 C90,420 100,300 90,140 Z" fill="#9be38f" stroke="#3a2a4d" stroke-width="3"/>
        <path d="M200,190 C350,230 480,260 640,170 C720,130 820,150 860,250 M640,170 C620,300 560,380 540,420 M200,190 C180,300 260,420 400,450 C500,470 600,460 680,480 M420,280 C470,300 520,300 560,290" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity=".9"/>
        <text x="760" y="520" font-size="40">⛵</text><text x="40" y="60" font-size="34">☁️</text><text x="880" y="40" font-size="30">☁️</text><text x="470" y="200" font-size="30">🌳</text><text x="300" y="120" font-size="26">🌲</text><text x="900" y="200" font-size="26">🌲</text><text x="130" y="380" font-size="26">🌳</text>
      </svg>${pins}</div>`);
    m.p.querySelectorAll('.pin').forEach(b => b.onclick = () => {
      const L = G.LOCS.find(x => x.id === b.dataset.l);
      if (!G.FREE && L.price && !S.unlocked[L.id]) {
        U.confirm(`Débloquer ${L.ic} ${L.n} pour ${L.price} 🪙 ?`, () => {
          if (!G.spend(L.price)) return;
          S.unlocked[L.id] = true; G.sfx('tada'); G.toast(`🎉 ${L.n} débloqué !`);
          m.close(); G.go(L.sc);
        }, 'Débloquer', 'Plus tard');
        return;
      }
      m.close(); G.sfx('door'); G.go(L.sc);
    });
  };

  // ---------- PACKS ----------
  U.packs = () => {
    G.sfx('swoosh');
    const m = U.panel('packsp', `<div class="maphead"><h2>🎁 Les packs</h2><button class="btn" data-close>✖</button></div>
      <p class="hint">Tous les packs sont gratuits et déjà débloqués. Touche un lieu pour y aller !</p>
      <div class="packs">${G.PACKS.map(P => `<div class="pack" style="--c1:${P.c1};--c2:${P.c2}"><div class="pcover"><span>${P.ic}</span>${P.isNew ? '<em>NOUVEAU</em>' : ''}<b>GRATUIT</b></div>
        <div class="pbody"><h3>${P.n}</h3><p>${P.txt}</p><div class="pplaces">${P.sc.map(s => `<button data-go="${s}">${G.SCENES[s].ic} ${G.SCENES[s].n}</button>`).join('')}</div></div></div>`).join('')}</div>`);
    m.p.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { m.close(); G.sfx('door'); G.go(b.dataset.go); });
  };

  // ---------- DESTINATION D'UN VÉHICULE ----------
  U.drivePicker = (f) => {
    const S = G.S, d = G.FURN[f.t];
    const locs = G.LOCS.filter(L => (!L.price || S.unlocked[L.id]) && L.sc !== S.cur);
    const m = U.panel('small', `<div class="maphead"><h2>${d.rocket ? '🚀 Où on décolle ?' : '🚗 On va où ?'}</h2><button class="btn" data-close>✖</button></div>
      <div class="dests">${locs.map(L => `<button class="dest" data-to="${L.sc}"><span>${L.ic}</span><i>${L.n}</i></button>`).join('')}</div>
      <p class="hint">Les passagers partent avec le véhicule. Débloque d'autres lieux sur la carte !</p>`);
    m.p.querySelectorAll('[data-to]').forEach(b => b.onclick = () => { m.close(); G.drive(f, b.dataset.to); });
  };

  // ---------- MISSIONS ----------
  U.quests = () => {
    const m = U.panel('questp', '<div class="qbody"></div>');
    const draw = () => {
      const S = G.S;
      const trophies = [[1, '🥉', 'Débutant'], [5, '🥈', 'Aventurier'], [15, '🥇', 'Champion'], [30, '🏆', 'Légende'], [60, '👑', 'Roi/Reine de MiniVille']];
      m.p.querySelector('.qbody').innerHTML = `<div class="maphead"><h2>📋 Missions</h2><button class="btn" data-close>✖</button></div>
        ${S.quests.map(a => { const q = G.QUESTS.find(x => x.id === a.id); return `<div class="quest"><div><b>${q.txt}</b><div class="bar"><div style="width:${Math.min(100, a.p / q.n * 100)}%"></div></div></div><span>${a.p}/${q.n}</span></div>`; }).join('')}
        <p class="hint">Les missions terminées sont remplacées par de nouvelles. Missions réussies : <b>${S.qdone}</b></p>
        <h3>Trophées</h3><div class="trophies">${trophies.map(([n, ic, t]) => `<div class="${S.qdone >= n ? 'got' : ''}"><span>${ic}</span><i>${t}</i><small>${n} missions</small></div>`).join('')}</div>
        <h3>Astuces</h3><ul class="tips"><li>🎁 Tous les packs sont gratuits : ouvre le bouton Packs !</li><li>🚗 Installe des personnages dans un véhicule et touche-le pour voyager</li><li>🥕 Plante, arrose et récolte au potager et à la ferme</li><li>🎣 Pêche au ponton du camping</li></ul>`;
      m.p.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { m.close(); U.refreshQuests = null; });
    };
    draw();
    U.refreshQuests = () => { if (m.el.isConnected) draw(); else U.refreshQuests = null; };
  };

  // ---------- PERSONNAGES ----------
  U.people = () => {
    const S = G.S;
    const list = Object.values(S.ents).filter(e => e.k === 'c' || e.k === 'p').sort((a, b) => (a.npc ? 1 : 0) - (b.npc ? 1 : 0) || (a.k === 'p') - (b.k === 'p'));
    const where = e => e.sc === 'tray' ? '👝 Dans la poche' : (G.SCENES[e.sc] ? `${G.SCENES[e.sc].ic} ${G.SCENES[e.sc].n}` : '?');
    const m = U.panel('peoplep', `<div class="maphead"><h2>👥 Habitants</h2><button class="btn" data-close>✖</button></div>
      <div class="plist">${list.map(e => `<div class="pp ${e.sc === S.cur ? 'here' : ''}"><div class="ph">${e.k === 'c' ? A.head(e.look) : `<span>${G.PETS[e.t].e}</span>`}</div><div class="pn"><b>${G.esc(e.name)}</b><small>${e.npc ? 'Habitant · ' : ''}${where(e)}</small></div>
        <button class="btn small" data-call="${e.id}" ${e.sc === S.cur ? 'disabled' : ''}>📍 Ici</button><button class="btn small" data-see="${e.id}" ${e.sc === S.cur || e.sc === 'tray' ? 'disabled' : ''}>👀 Voir</button></div>`).join('')}</div>
      <div class="row center"><button class="btn green" data-new>➕ Créer un personnage</button></div>`);
    m.p.querySelectorAll('[data-call]').forEach(b => b.onclick = () => {
      const e = S.ents[b.dataset.call];
      if (e.sc === 'tray') { S.tray = S.tray.filter(x => x !== e.id); U.renderTray(); }
      G.moveTo(e, S.cur, G.camCenter() + G.rand(-150, 150));
      e.y = 250; G.fall(e, 0, 0); G.sfx('magic'); G.burst(e.x, 400, '✨', 6);
      m.close();
    });
    m.p.querySelectorAll('[data-see]').forEach(b => b.onclick = () => { const e = S.ents[b.dataset.see]; m.close(); G.go(e.sc); });
    m.p.querySelector('[data-new]').onclick = () => { m.close(); U.creator(null); };
  };

  // ---------- RÉGLAGES ----------
  U.settings = () => {
    const S = G.S;
    const m = U.panel('small', `<div class="maphead"><h2>⚙️ Réglages</h2><button class="btn" data-close>✖</button></div>
      <div class="setrow"><span>🔊 Effets sonores</span><button class="btn small tog" data-s="sfx">${S.set.sfx ? 'Oui' : 'Non'}</button></div>
      <div class="setrow"><span>🎵 Musique</span><button class="btn small tog" data-s="music">${S.set.music ? 'Oui' : 'Non'}</button></div>
      <div class="setrow"><span>⏰ Le temps</span><button class="btn small" data-t="day">☀️ Matin</button><button class="btn small" data-t="night">🌙 Soir</button></div>
      <div class="setrow"><span>🌦️ Météo</span>${['soleil', 'pluie', 'neige'].map(w => `<button class="btn small" data-w="${w}">${{ soleil: '☀️', pluie: '🌧️', neige: '❄️' }[w]}</button>`).join('')}</div>
      <div class="setrow"><span>💾 Partie</span><button class="btn small red" data-reset>Recommencer</button></div>
      <p class="hint">MiniVille — ta ville, tes histoires ! Tout est sauvegardé automatiquement sur cet appareil.</p>`);
    m.p.querySelectorAll('[data-s]').forEach(b => b.onclick = () => {
      const k = b.dataset.s; S.set[k] = !S.set[k]; b.textContent = S.set[k] ? 'Oui' : 'Non';
      G.audio.st.sfx = S.set.sfx; G.audio.st.music = S.set.music; G.updateMusic(); G.sfx('click'); G.save();
    });
    m.p.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { S.time = b.dataset.t === 'day' ? 0.32 : 0.86; G.sfx('magic'); G.updateSky(); G.lightsDirty = true; G.cur.forEach(f => { if (f.k === 'f' && G.FURN[f.t].timeDep) G.redraw(f); }); U.updateTop(); });
    m.p.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { S.weather = b.dataset.w; G.sfx('click'); U.updateWeather(); });
    m.p.querySelector('[data-reset]').onclick = () => U.confirm('Effacer toute la partie et recommencer ?', () => { G.wipe(); location.reload(); }, 'Effacer', 'Annuler');
  };

  // ---------- DÉCORATION ----------
  const CATS = ['Salon', 'Cuisine', 'Chambre', 'Salle de bain', 'Jardin', 'Véhicules', 'Ferme', 'Château', 'Camping', 'Plage', 'Déco', 'Magasin', 'Hôpital', 'École', 'Fun'];
  let decoCat = 'Salon';
  U.toggleDeco = () => {
    G.deco = !G.deco;
    G.sfx('click');
    $('#btnDeco').classList.toggle('on', G.deco);
    document.body.classList.toggle('decomode', G.deco);
    U.closeFloating();
    if (G.deco) { U.openDecoBar(); G.toast('🛠️ Mode déco : déplace les meubles, touche-les pour les modifier, achète-en de nouveaux !'); }
    else { $('#decobar').hidden = true; G.save(); }
  };
  U.openDecoBar = () => {
    const bar = $('#decobar');
    bar.hidden = false;
    const room = G.sceneDef().type === 'room';
    const cats = room ? CATS.concat(['Murs & sols']) : CATS;
    if (!cats.includes(decoCat)) decoCat = 'Salon';
    let h = `<div class="dtabs">${cats.map(c => `<button data-c="${c}" class="${c === decoCat ? 'on' : ''}">${c}</button>`).join('')}</div><div class="ditems">`;
    if (decoCat === 'Murs & sols') {
      const sc = G.S.scenes[G.S.cur];
      h += `<div class="wf"><b>Mur</b>${Object.entries(G.WALLS).map(([k, n]) => `<button class="chip ${sc.wall.p === k ? 'on' : ''}" data-wp="${k}">${n}</button>`).join('')}<div class="sw">${G.WALL_COLORS.map(col => `<button class="swc ${sc.wall.c === col ? 'on' : ''}" data-wc="${col}" style="background:${col}"></button>`).join('')}</div></div>
        <div class="wf"><b>Sol</b>${Object.entries(G.FLOORS).map(([k, n]) => `<button class="chip ${sc.floor.p === k ? 'on' : ''}" data-fp="${k}">${n}</button>`).join('')}<div class="sw">${G.FLOOR_COLORS.map(col => `<button class="swc ${sc.floor.c === col ? 'on' : ''}" data-fc="${col}" style="background:${col}"></button>`).join('')}</div></div>`;
    } else {
      Object.entries(G.FURN).filter(([k, d]) => d.cat === decoCat && !d.fixed).forEach(([k, d]) => {
        const st = Object.assign({}, d.st || {});
        let svg = '';
        try { svg = G.svg.wrap(d.w, d.h, d.svg(st, d.c || '#cccccc', {}) + (d.front ? d.front(st, d.c || '#ccc', {}) : ''), `-10 -10 ${d.w + 20} ${d.h + 20}`); } catch (e) { svg = ''; }
        h += `<button class="dcard" data-buy="${k}"><div class="dthumb">${svg}</div><i>${d.n}</i><b>${G.FREE ? 'Gratuit' : d.price + '🪙'}</b></button>`;
      });
    }
    bar.innerHTML = h + '</div>';
    bar.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { decoCat = b.dataset.c; G.sfx('click'); U.openDecoBar(); });
    bar.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
      const k = b.dataset.buy, d = G.FURN[k];
      if (!G.spend(d.price)) return;
      const x = G.clamp(G.camCenter() + G.rand(-120, 120), d.w / 2, G.W() - d.w / 2);
      const y = d.wall ? d.y : d.free ? 560 : d.layer === 1 ? 694 : G.FLOOR + 10;
      const f = G.spawn('f', k, { x, y });
      G.burst(x, y - d.h / 2, '✨', 6); G.sfx('tada');
      if (d.free) G.settle();
      G.save();
    });
    const sc = G.S.scenes[G.S.cur];
    const apply = () => { G.drawBg(); G.sfx('pop'); U.openDecoBar(); G.save(); };
    bar.querySelectorAll('[data-wp]').forEach(b => b.onclick = () => { sc.wall.p = b.dataset.wp; apply(); });
    bar.querySelectorAll('[data-wc]').forEach(b => b.onclick = () => { sc.wall.c = b.dataset.wc; apply(); });
    bar.querySelectorAll('[data-fp]').forEach(b => b.onclick = () => { sc.floor.p = b.dataset.fp; apply(); });
    bar.querySelectorAll('[data-fc]').forEach(b => b.onclick = () => { sc.floor.c = b.dataset.fc; apply(); });
  };
  U.sellFurniture = (f) => {
    const d = G.FURN[f.t];
    if (d.fixed || d.door) { G.toast('Impossible de retirer ça !'); G.sfx('error'); return; }
    U.confirm(`Retirer « ${d.n} » ?`, () => { G.burst(f.x, f.y - d.h / 2, '💨', 6); G.del(f); G.sfx('swoosh'); G.settle(); G.save(); }, 'Retirer', 'Garder');
  };
  U.decoTools = (f) => {
    U.closeFloating();
    const d = G.FURN[f.t];
    const el = G.el('div', 'floating decotools');
    el.innerHTML = `<b>${d.n}</b>${d.c ? '<button data-a="color">🎨 Couleur</button>' : ''}<button data-a="flip">↔️ Retourner</button>${d.fixed || d.door ? '' : `<button data-a="sell">🗑️ Retirer</button>`}<button data-a="x">✖</button>`;
    el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      G.sfx('click');
      if (a === 'color') {
        const pal = A.colors.concat(['#d9995e', '#a5683a', '#f4f4f4']);
        const i = pal.indexOf(f.c || d.c);
        f.c = pal[(i + 1) % pal.length]; G.redraw(f);
      }
      if (a === 'flip') { f.flip = !f.flip; G.redraw(f); G.surfDirty(); G.cur.forEach(o => { if ((o.seat && o.seat.f === f.id) || o.in === f.id) G.place(o); }); G.settle(); }
      if (a === 'sell') { U.closeFloating(); U.sellFurniture(f); }
      if (a === 'x') U.closeFloating();
    });
    $('#ui').appendChild(el);
    floating = el;
  };

  // ---------- DESSIN ----------
  U.drawing = () => {
    G.cancelDrag();
    const cols = ['#222222', '#ffffff', '#e63946', '#ff9f43', '#ffd23f', '#3ccf91', '#2ec4b6', '#4aa3ff', '#9b6dff', '#ff7fb3', '#8b5a2b', '#9aa5b1'];
    const stamps = ['⭐', '❤️', '🌸', '🐱', '🌈', '☀️', '🦄', '🚀'];
    const m = U.panel('drawp', `<div class="maphead"><h2>🎨 Atelier dessin</h2><button class="btn" data-close>✖</button></div>
      <canvas width="800" height="400"></canvas>
      <div class="dtools"><div class="sw">${cols.map((c, i) => `<button class="swc ${i === 0 ? 'on' : ''}" data-col="${c}" style="background:${c}"></button>`).join('')}</div>
      <div class="chips"><button class="chip" data-sz="4">Fin</button><button class="chip on" data-sz="10">Moyen</button><button class="chip" data-sz="24">Gros</button><button class="chip" data-er>🧽 Gomme</button>${stamps.map(s => `<button class="chip" data-st="${s}">${s}</button>`).join('')}</div>
      <div class="row center"><button class="btn" data-bg>🖼️ Fond</button><button class="btn red" data-clear>🗑️ Effacer</button><button class="btn green" data-save>💾 Accrocher</button></div></div>`);
    const cv = m.p.querySelector('canvas'), ctx = cv.getContext('2d');
    const bgs = ['#ffffff', '#2f5d3a', '#fff6c2', '#d6f1ff', '#ffd6e0', '#1d1033'];
    let bg = 0, col = '#222222', sz = 10, eraser = false, stamp = null;
    const fill = () => { ctx.fillStyle = bgs[bg]; ctx.fillRect(0, 0, 800, 400); };
    fill();
    if (G.S.drawing) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, 800, 400); im.src = G.S.drawing; }
    let drawing = false, lx = 0, ly = 0;
    const pos = ev => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * 800, (ev.clientY - r.top) / r.height * 400]; };
    cv.addEventListener('pointerdown', ev => {
      ev.preventDefault(); cv.setPointerCapture(ev.pointerId);
      const [x, y] = pos(ev);
      if (stamp) { ctx.font = (sz * 4 + 20) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(stamp, x, y); G.sfx('pop'); return; }
      drawing = true; lx = x; ly = y; dot(x, y);
    });
    cv.addEventListener('pointermove', ev => { if (!drawing) return; const [x, y] = pos(ev); line(lx, ly, x, y); lx = x; ly = y; });
    cv.addEventListener('pointerup', () => drawing = false);
    function dot(x, y) { ctx.fillStyle = eraser ? bgs[bg] : col; ctx.beginPath(); ctx.arc(x, y, sz / 2, 0, 7); ctx.fill(); }
    function line(a, b, c, d) { ctx.strokeStyle = eraser ? bgs[bg] : col; ctx.lineWidth = sz; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
    m.p.querySelectorAll('[data-col]').forEach(b => b.onclick = () => { col = b.dataset.col; eraser = false; stamp = null; m.p.querySelectorAll('[data-col]').forEach(x => x.classList.toggle('on', x === b)); m.p.querySelectorAll('[data-er],[data-st]').forEach(x => x.classList.remove('on')); });
    m.p.querySelectorAll('[data-sz]').forEach(b => b.onclick = () => { sz = +b.dataset.sz; m.p.querySelectorAll('[data-sz]').forEach(x => x.classList.toggle('on', x === b)); });
    m.p.querySelector('[data-er]').onclick = (ev) => { eraser = !eraser; stamp = null; ev.currentTarget.classList.toggle('on', eraser); };
    m.p.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { stamp = stamp === b.dataset.st ? null : b.dataset.st; eraser = false; m.p.querySelectorAll('[data-st],[data-er]').forEach(x => x.classList.toggle('on', x.dataset.st === stamp && stamp)); });
    m.p.querySelector('[data-bg]').onclick = () => { bg = (bg + 1) % bgs.length; fill(); };
    m.p.querySelector('[data-clear]').onclick = () => { fill(); G.sfx('swoosh'); };
    m.p.querySelector('[data-save]').onclick = () => {
      G.S.drawing = cv.toDataURL('image/jpeg', 0.75);
      G.cur.forEach(f => { if (f.k === 'f' && G.FURN[f.t].drawing) G.redraw(f); });
      G.sfx('tada'); G.emit('draw'); G.toast('🖼️ Ton dessin est accroché ! (tableaux, chevalets, cadres)');
      m.close(); G.save();
    };
  };

  // ---------- ÉCRAN TITRE ----------
  U.title = () => {
    const has = G.load();
    const t = G.el('div', 'title');
    let parade = '';
    for (let i = 0; i < 6; i++) parade += `<div class="tav" style="animation-delay:${i * 0.15}s">${A.render(A.random({ age: G.pick(['enfant', 'adulte', 'ado', 'bebe', 'senior']) }), { expr: G.pick(['happy', 'joy', 'love', 'silly', 'cool']) })}</div>`;
    t.innerHTML = `<div class="tlogo"><span>Mini</span><span>Ville</span></div><p>Crée tes personnages, explore la ville et invente tes histoires !</p>
      <div class="tparade">${parade}</div>
      <div class="row center">${has && G.S.started ? '<button class="btn green big" data-go>▶ Continuer</button><button class="btn big" data-new>✨ Nouvelle partie</button>' : '<button class="btn green big" data-new>▶ Jouer</button>'}</div>`;
    document.body.appendChild(t);
    const start = () => { t.classList.add('out'); setTimeout(() => t.remove(), 600); };
    const go = t.querySelector('[data-go]');
    if (go) go.onclick = () => { G.audio.init(); G.sfx('tada'); start(); U.boot(); };
    t.querySelector('[data-new]').onclick = () => {
      G.audio.init(); G.sfx('tada');
      const fresh = () => { G.wipe(); G.S = G.newState(); start(); U.newGame(); };
      if (has && G.S.started) U.confirm('Commencer une nouvelle partie ? L\'ancienne sera effacée.', fresh, 'Oui', 'Non');
      else fresh();
    };
  };
  U.newGame = () => {
    G.S.cur = 'salon';
    G.buildScene();
    U.creator(null, 'corps', (look, name) => {
      const S = G.S;
      const me = G.spawn('c', 'perso', { look, name, x: 900, y: G.FLOOR });
      S.player = me.id;
      const fam = [A.random({ age: 'adulte' }), A.random({ age: 'adulte' }), A.random({ age: 'bebe' })];
      G.spawn('c', 'perso', { look: fam[0], x: 1180, y: 600, seat: null });
      G.spawn('c', 'perso', { look: fam[1], x: 620, y: G.FLOOR });
      const baby = G.spawn('c', 'perso', { look: fam[2], x: 1100, y: G.FLOOR, name: G.pick(['Lilou', 'Timi', 'Bobo', 'Nounou']) });
      G.spawn('p', 'chien', { x: 1350, y: 680, name: 'Biscuit' });
      // installer quelques personnes
      const sofa = G.cur.find(e => e.t === 'canape'), arm = G.cur.find(e => e.t === 'fauteuil');
      const others = G.cur.filter(e => e.k === 'c' && e !== me);
      if (arm && others[0]) G.seat(others[0], arm, 0);
      if (sofa && baby) G.seat(baby, sofa, 2);
      S.started = true;
      G.fillQuests();
      S.lastDaily = new Date().toDateString();
      G.burst(900, 450, '✨', 10);
      U.updateTop(true); U.renderTray();
      G.save();
      setTimeout(() => U.tutorial(), 600);
    });
  };
  U.tutorial = () => {
    const tips = [
      ['✋', 'Glisse et dépose', 'Attrape les personnages, les animaux et les objets avec le doigt ou la souris. Lâche-les sur un lit, une chaise, une baignoire...'],
      ['👆', 'Touche tout !', 'Touche les meubles pour les utiliser : frigo, télé, lampes, four, douche, piano, arbres...'],
      ['🍎', 'Donne des objets', 'Lâche la nourriture sur un personnage pour qu\'il mange. Pareil pour les chapeaux, potions, savons...'],
      ['👝', 'La poche', 'Lâche un personnage ou un objet dans la poche en haut pour l\'emmener ailleurs. Ou fais-le passer par une porte !'],
      ['🗺️', 'La carte', 'Explore le parc, les magasins, l\'école, l\'hôpital... et débloque la plage, la disco et l\'arcade !'],
      ['🛠️', 'Décore', 'Le mode déco te permet d\'acheter, déplacer et colorer des meubles, et de changer les murs et les sols.'],
    ];
    let i = 0;
    const m = U.panel('small tuto', '<div class="tt"></div>');
    const draw = () => {
      const [ic, h, txt] = tips[i];
      m.p.querySelector('.tt').innerHTML = `<div class="tic">${ic}</div><h2>${h}</h2><p class="txt">${txt}</p><div class="dots">${tips.map((x, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div><div class="row center"><button class="btn" data-skip>Passer</button><button class="btn green" data-next>${i < tips.length - 1 ? 'Suivant ▶' : 'C\'est parti !'}</button></div>`;
      m.p.querySelector('[data-next]').onclick = () => { G.sfx('click'); i++; if (i >= tips.length) m.close(); else draw(); };
      m.p.querySelector('[data-skip]').onclick = () => m.close();
    };
    draw();
  };
  U.boot = () => {
    const S = G.S;
    G.audio.st.sfx = S.set.sfx; G.audio.st.music = S.set.music;
    if (!G.SCENES[S.cur]) S.cur = 'salon';
    G.fillQuests();
    G.buildScene();
    U.updateTop(true); U.renderTray();
    const today = new Date().toDateString();
    if (S.lastDaily !== today) {
      S.lastDaily = today;
      setTimeout(() => {
        const m = U.alert('🎁 Cadeau du jour !', `<div class="bigemo">🎁</div>Merci de revenir à MiniVille !<br><b>+50 🪙</b> et un cadeau surprise dans ta poche !`, 'Merci !');
        G.S.coins += 50; U.updateTop(true);
        const g = G.spawn('i', 'cadeau', { sc: 'tray' }); if (S.tray.length < 8) { S.tray.push(g.id); U.renderTray(); } else G.del(g);
        G.sfx('tada'); G.save();
      }, 700);
    }
  };

  // ---------- INIT ----------
  U.init = () => {
    $('#btnMap').onclick = () => U.map();
    $('#btnPacks').onclick = () => U.packs();
    $('#btnQuests').onclick = () => { G.sfx('click'); U.quests(); };
    $('#btnSettings').onclick = () => { G.sfx('click'); U.settings(); };
    $('#btnPeople').onclick = () => { G.sfx('click'); U.people(); };
    $('#btnNew').onclick = () => { G.sfx('click'); U.creator(null); };
    $('#btnDeco').onclick = () => U.toggleDeco();
    $('#btnPhoto').onclick = () => G.photo();
    $('#locName').onclick = () => U.map();
    $('#coins').onclick = () => { G.sfx('click'); U.quests(); };
    U.renderTray();
  };
})();
