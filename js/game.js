'use strict';
// ===== Moteur du jeu : état, rendu, physique, glisser-déposer, interactions =====
(() => {
  const A = G.avatar;
  const SAVE_KEY = 'miniville-save-v1';
  G.DAY = 480;           // durée d'une journée en secondes réelles
  G.GRAV = 2600;
  G.now = 0;
  G.deco = false;
  G.lightsDirty = true;
  let surfDirty = true, surfCache = [];

  // ---------- ÉTAT ----------
  G.newState = () => ({
    v: 1, coins: 250, day: 1, time: 0.36, weather: 'soleil', ents: {}, scenes: {}, tray: [], cur: 'salon', cam: {},
    unlocked: {}, owned: [], quests: [], qdone: 0, drawing: null, lastDaily: null, set: { sfx: true, music: true },
    started: false, player: null, counters: {}
  });
  G.S = G.newState();
  G.save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.S)); } catch (e) { } };
  G.load = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      G.S = Object.assign(G.newState(), s);
      return true;
    } catch (e) { return false; }
  };
  G.wipe = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } };

  const defOf = e => e.k === 'f' ? G.FURN[e.t] : e.k === 'i' ? G.ITEMS[e.t] : e.k === 'p' ? G.PETS[e.t] : null;
  G.defOf = defOf;
  G.cur = [];
  G.dom = new Map();
  const ents = () => G.S.ents;
  G.ent = id => G.S.ents[id];
  G.sceneDef = () => G.SCENES[G.S.cur];
  G.W = () => G.SCENES[G.S.cur].W;

  // ---------- CIEL / TEMPS ----------
  const SKY = [
    [0, '#0b1030', '#25305e'], [0.21, '#0b1030', '#25305e'], [0.26, '#ff9a8b', '#ffd6a5'], [0.32, '#5ec8ff', '#c8f0ff'],
    [0.72, '#5ec8ff', '#c8f0ff'], [0.78, '#ff7e5f', '#feb47b'], [0.84, '#1b1d4a', '#3b2f6e'], [1, '#0b1030', '#25305e']
  ];
  G.skyNow = () => {
    const tm = G.S.time;
    let i = 0; while (i < SKY.length - 2 && tm > SKY[i + 1][0]) i++;
    const a = SKY[i], b = SKY[i + 1], k = G.clamp((tm - a[0]) / (b[0] - a[0] || 1), 0, 1);
    return { top: G.mix(a[1], b[1], k), bot: G.mix(a[2], b[2], k), night: tm < 0.25 || tm > 0.81 };
  };
  G.darkness = () => {
    const tm = G.S.time;
    if (tm < 0.21 || tm > 0.86) return 1;
    if (tm < 0.3) return 1 - (tm - 0.21) / 0.09;
    if (tm > 0.76) return (tm - 0.76) / 0.1;
    return 0;
  };
  G.isNight = () => G.darkness() > 0.5;
  G.clockStr = () => {
    const h = Math.floor(G.S.time * 24), m = Math.floor((G.S.time * 24 - h) * 60 / 10) * 10;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // ---------- CRÉATION D'ENTITÉS ----------
  G.spawn = (k, t, props = {}) => {
    const e = Object.assign({ id: G.uid(), k, t, sc: G.S.cur, x: 500, y: G.FLOOR, st: {} }, props);
    if (k === 'f') {
      const d = G.FURN[t];
      e.st = Object.assign(JSON.parse(JSON.stringify(d.st || {})), props.st || {});
      if (typeof e.st.stock === 'string') e.st.stock = e.st.stock.split(' ').map(x => ({ t: 'i', k: x, p: G.ITEMS[x].p || 1 }));
    }
    if (k === 'c') {
      e.look = e.look || A.random();
      e.name = e.name || G.pick(A.NAMES);
      e.stats = e.stats || { faim: G.ri(55, 90), energie: G.ri(55, 90), proprete: G.ri(60, 95), fun: G.ri(55, 90) };
      e.expr = e.expr || 'auto';
    }
    if (k === 'p') {
      e.name = e.name || G.pick(G.PET_NAMES);
      e.stats = e.stats || { faim: 80, fun: 80 };
      e.dir = 1;
    }
    if (k === 'i' && t === 'tirelire') e.st.coins = e.st.coins || 0;
    G.S.ents[e.id] = e;
    if (e.sc === G.S.cur) { G.cur.push(e); mk(e); if (k === 'f') surfDirty = true; }
    return e;
  };
  G.del = (e) => {
    if (!e) return;
    // les objets tenus/rangés suivent
    if (e.k === 'c' || e.k === 'p') Object.values(ents()).forEach(i => { if (i.held === e.id) { i.held = null; if (i.sc === G.S.cur) G.fall(i, 0, -100); } });
    if (e.k === 'f') Object.values(ents()).forEach(i => { if (i.in === e.id) { i.in = null; G.place(i); if (i.sc === G.S.cur) G.fall(i, G.rand(-100, 100), -300); } if (i.seat && i.seat.f === e.id) { i.seat = null; G.fall(i, 0, 0); } });
    delete G.S.ents[e.id];
    G.cur = G.cur.filter(x => x !== e);
    rmDom(e);
    const ti = G.S.tray.indexOf(e.id); if (ti >= 0) { G.S.tray.splice(ti, 1); G.ui && G.ui.renderTray(); }
    if (e.k === 'f') { surfDirty = true; G.lightsDirty = true; }
  };

  G.initScene = (id) => {
    const S = G.S, d = G.SCENES[id];
    if (S.scenes[id] && S.scenes[id].init) return;
    S.scenes[id] = { init: true, wall: Object.assign({}, d.wall || {}), floor: Object.assign({}, d.floor || {}) };
    const made = {};
    (d.ents || []).forEach(([type, x, o]) => {
      o = o || {};
      const fd = G.FURN[type];
      if (!fd) { console.warn('meuble inconnu', type); return; }
      const y = o.y != null ? o.y : (fd.wall ? fd.y : G.FLOOR);
      const f = G.spawn('f', type, { sc: id, x, y, st: o.st, c: o.c, flip: o.flip });
      (made[type] = made[type] || []).push(f);
    });
    Object.entries(d.cont || {}).forEach(([type, list]) => {
      const f = made[type] && made[type][0]; if (!f) return;
      list.forEach((it, i) => G.spawn('i', it, { sc: id, in: f.id, slot: i }));
    });
    (d.items || []).forEach(([type, x, y]) => G.spawn('i', type, { sc: id, x, y }));
    (d.npcs || []).forEach(n => G.spawn('c', 'perso', { sc: id, x: n.x, y: n.y || 660, name: n.name, look: A.random(Object.assign({ age: 'adulte' }, n.look)), npc: true }));
  };

  // ---------- DOM ----------
  const world = () => G.$('#world');
  function mk(e) {
    if (G.dom.has(e.id)) return;
    const el = G.el('div', 'ent k' + e.k);
    el.dataset.id = e.id;
    const inner = G.el('div', 'inner');
    el.appendChild(inner);
    const rec = { el, inner, front: null, key: '', pos: '' };
    const d = defOf(e);
    if (e.k === 'f' && d.front) {
      rec.front = G.el('div', 'ent front');
      rec.front.dataset.id = e.id;
      rec.front.appendChild(G.el('div', 'inner'));
      G.$('#ents').appendChild(rec.front);
    }
    G.dom.set(e.id, rec);
    G.$('#ents').appendChild(el);
    G.redraw(e);
    G.place(e);
  }
  function rmDom(e) {
    const rec = G.dom.get(e.id);
    if (!rec) return;
    rec.el.remove(); if (rec.front) rec.front.remove();
    if (rec.bubble) rec.bubble.remove(); if (rec.think) rec.think.remove();
    G.dom.delete(e.id);
  }
  G.rmDom = rmDom;
  const sizeOf = e => {
    if (e.k === 'f') { const d = G.FURN[e.t]; return { w: d.w, h: d.h }; }
    if (e.k === 'i') { const s = G.ITEMS[e.t].sz || 54; return { w: s, h: s }; }
    if (e.k === 'p') return { w: 86, h: 86 };
    return A.size(e.look);
  };
  G.sizeOf = sizeOf;

  G.redraw = (e) => {
    const rec = G.dom.get(e.id);
    if (!rec) return;
    const d = defOf(e);
    if (e.k === 'f') {
      const k = e.c || d.c || '#cccccc';
      rec.inner.innerHTML = G.svg.wrap(d.w, d.h, d.svg(e.st, k, e));
      rec.inner.style.transform = e.flip ? 'scaleX(-1)' : '';
      if (rec.front) { rec.front.firstChild.innerHTML = G.svg.wrap(d.w, d.h, d.front(e.st, k, e)); rec.front.firstChild.style.transform = e.flip ? 'scaleX(-1)' : ''; }
      // présentoirs (objets à prendre)
      rec.el.querySelectorAll('.stock').forEach(s => s.remove());
      if (d.stock || e.st.stock) {
        const stock = e.st.stock || d.stock;
        stock.forEach((s, i) => {
          const pos = d.spos[i]; if (!pos) return;
          const lx = e.flip ? d.w - pos[0] : pos[0];
          const sd = s.t === 'p' ? G.PETS[s.k] : G.ITEMS[s.k];
          const sz = s.t === 'p' ? 62 : Math.min(48, (sd.sz || 54) * 0.85);
          const st = G.el('div', 'stock', (sd.svg ? G.ITEM_SVG[sd.svg]() : `<span>${sd.e}</span>`) + (sd.b ? `<em>${sd.b}</em>` : '') + (s.p ? `<b>${s.p}🪙</b>` : ''));
          st.dataset.i = i; st.dataset.f = e.id;
          st.style.cssText = `left:${lx - sz / 2}px;top:${pos[1] - sz}px;width:${sz}px;height:${sz}px;font-size:${sz * 0.82}px`;
          rec.el.appendChild(st);
        });
      }
      if (d.door) {
        const dest = G.SCENES[e.st.to];
        if (dest) rec.el.insertAdjacentHTML('beforeend', `<div class="doorlabel">${dest.ic} ${dest.n}</div>`);
      }
    } else if (e.k === 'i') {
      const s = d.sz || 54;
      const sc = e.bite ? (1 - e.bite * 0.25) : 1;
      rec.inner.innerHTML = d.svg ? G.ITEM_SVG[d.svg](e.st) : `<div class="emo" style="font-size:${s * 0.86}px;transform:scale(${sc})">${d.e}${d.b ? `<i>${d.b}</i>` : ''}</div>`;
      if (e.ck) rec.inner.insertAdjacentHTML('beforeend', `<div class="cookbar"><div style="width:${Math.min(100, e.ck / 3 * 100)}%"></div></div>`);
    } else if (e.k === 'p') {
      rec.inner.innerHTML = `<div class="emo pet" style="font-size:74px">${d.e}</div>`;
      rec.inner.style.transform = `scaleX(${e.dir < 0 ? 1 : -1})`;
    } else if (e.k === 'c') {
      const o = charRenderOpts(e);
      rec.key = JSON.stringify(o);
      rec.inner.innerHTML = A.render(e.look, o);
    }
    rec.pos = '';
  };
  function slotOf(e) {
    if (!e.seat) return null;
    const f = G.S.ents[e.seat.f];
    if (!f || f.sc !== e.sc) { e.seat = null; return null; }
    const d = G.FURN[f.t], s = d.slots[e.seat.i];
    const lx = f.flip ? d.w - s.x : s.x;
    return { f, s, d, x: f.x - d.w / 2 + lx, y: f.y - d.h + s.y };
  }
  G.slotOf = slotOf;
  const poseOf = e => {
    if (e.free) return e.free;
    const so = slotOf(e);
    if (so) return so.s.p || 'sit';
    return 'stand';
  };
  function charRenderOpts(c) {
    const so = slotOf(c);
    return { pose: poseOf(c), expr: exprOf(c), xray: !!(so && so.s.a === 'xray'), sick: !!c.sick };
  }
  function exprOf(c) {
    if (c._drag) return 'surprised';
    if (c.eat) return 'eat';
    if (c.tmpExpr && G.now < c.tmpUntil) return c.tmpExpr;
    const so = slotOf(c);
    if (so && (so.s.a === 'sleep')) return 'sleep';
    if (c.expr && c.expr !== 'auto') return c.expr;
    if (c.dancing) return 'joy';
    const st = c.stats; if (!st) return 'happy';
    const low = Math.min(st.faim, st.energie, st.proprete, st.fun);
    if (low < 15) return 'sad';
    if (so && (so.s.a === 'swing' || so.s.a === 'slide' || so.s.a === 'wash')) return 'joy';
    return 'happy';
  }
  G.tmpExpr = (c, ex, ms = 1500) => { c.tmpExpr = ex; c.tmpUntil = G.now + ms; };

  // coordonnées du coin haut-gauche d'une entité
  function boxOf(e) {
    const sz = sizeOf(e);
    if (e.k === 'f') return { l: e.x - sz.w / 2, t: e.y - sz.h, w: sz.w, h: sz.h };
    if (e.k === 'i') {
      if (e.held) {
        const c = G.S.ents[e.held];
        if (c && c.k === 'c') {
          const hp = handPos(c);
          return { l: hp.x - sz.w / 2, t: hp.y - sz.h * 0.62, w: sz.w, h: sz.h };
        }
        if (c && c.k === 'p') { const b = boxOf(c); return { l: b.l + b.w * 0.5 - sz.w / 2, t: b.t + 30, w: sz.w, h: sz.h }; }
        e.held = null;
      }
      if (e.in) {
        const f = G.S.ents[e.in];
        if (f) {
          const d = G.FURN[f.t], s = d.cont.slots[e.slot] || d.cont.slots[0];
          const lx = f.flip ? d.w - s[0] : s[0];
          return { l: f.x - d.w / 2 + lx - sz.w / 2, t: f.y - d.h + s[1] - sz.h, w: sz.w, h: sz.h };
        }
        e.in = null;
      }
      return { l: e.x - sz.w / 2, t: e.y - sz.h, w: sz.w, h: sz.h };
    }
    if (e.k === 'p') {
      const so = slotOf(e);
      if (so) return { l: so.x - sz.w / 2, t: so.y - sz.h + 6, w: sz.w, h: sz.h };
      return { l: e.x - sz.w / 2, t: e.y - sz.h, w: sz.w, h: sz.h };
    }
    // personnage
    const u = sz.h / 262;
    const so = slotOf(e);
    const pose = poseOf(e);
    let x = e.x, y = e.y;
    if (so) { x = so.x; y = so.y; }
    if (pose === 'lie') return { l: x - sz.w / 2, t: y - sz.h / 2, w: sz.w, h: sz.h, lie: 1, u };
    if (pose === 'sit') return { l: x - sz.w / 2, t: y - A.PT.hipSit * u, w: sz.w, h: sz.h, u };
    return { l: x - sz.w / 2, t: y - A.PT.foot * u, w: sz.w, h: sz.h, u };
  }
  G.boxOf = boxOf;
  function handPos(c) {
    const b = boxOf(c), u = b.u;
    if (b.lie) return { x: b.l + b.w / 2 + 40 * u, y: b.t + b.h / 2 - 20 * u };
    return { x: b.l + A.PT.hand[0] * u, y: b.t + A.PT.hand[1] * u };
  }
  function headPos(e) {
    const b = boxOf(e);
    if (e.k !== 'c') return { x: b.l + b.w / 2, y: b.t };
    const u = b.u;
    if (b.lie) return { x: b.l + b.w / 2 - 50 * u, y: b.t + b.h / 2 - 40 * u };
    return { x: b.l + A.PT.head[0] * u, y: b.t + 30 * u };
  }
  G.headPos = headPos;
  function zOf(e) {
    if (e._drag) return 9000;
    const d = defOf(e);
    if (e.k === 'f') return d.wall ? 100 + (d.free ? 50 : 0) : d.layer === 1 ? 300 : d.free ? 3200 + Math.round(e.y) : 1000 + Math.round(e.y);
    if (e.k === 'i') { if (e.held) { const c = G.S.ents[e.held]; return c ? zOf(c) + 1 : 5000; } if (e.in) return 4900; return 5000 + Math.round(e.y); }
    const so = slotOf(e);
    return 4000 + Math.round(so ? so.y : e.y) + (e.k === 'p' ? 2 : 0);
  }
  G.place = (e) => {
    const rec = G.dom.get(e.id);
    if (!rec) return;
    const b = boxOf(e);
    const hidden = e.k === 'i' && e.in && !(G.S.ents[e.in] && G.S.ents[e.in].st.open);
    const key = `${b.l.toFixed(1)}|${b.t.toFixed(1)}|${zOf(e)}|${b.lie ? 1 : 0}|${hidden}`;
    if (key === rec.pos) return;
    rec.pos = key;
    const s = rec.el.style;
    s.left = b.l + 'px'; s.top = b.t + 'px'; s.width = b.w + 'px'; s.height = b.h + 'px';
    s.zIndex = zOf(e);
    s.display = hidden ? 'none' : '';
    if (e.k === 'c') {
      rec.el.classList.toggle('lying', !!b.lie);
    }
    if (rec.front) {
      const fs = rec.front.style;
      fs.left = s.left; fs.top = s.top; fs.width = s.width; fs.height = s.height;
      fs.zIndex = 6000 + Math.round(e.y);
    }
  };

  // ---------- SCÈNE ----------
  let camX = 0, scale = 1, offX = 0, offY = 0;
  G.getView = () => ({ camX, scale, offX, offY });
  G.buildScene = () => {
    const S = G.S, d = G.sceneDef();
    G.initScene(S.cur);
    G.$('#ents').innerHTML = '';
    G.$('#fx').innerHTML = '';
    G.$('#lights').innerHTML = '';
    G.dom.clear();
    G.cur = Object.values(ents()).filter(e => e.sc === S.cur);
    world().style.width = d.W + 'px';
    G.drawBg();
    // ordre : meubles d'abord
    G.cur.filter(e => e.k === 'f').forEach(mk);
    G.cur.filter(e => e.k !== 'f').forEach(mk);
    surfDirty = true; G.lightsDirty = true;
    camX = S.cam[S.cur] != null ? S.cam[S.cur] : Math.max(0, d.W / 2 - innerWidth / scale / 2);
    G.resize();
    G.updateMusic();
    G.ui && G.ui.onScene();
  };
  G.drawBg = () => {
    const S = G.S, d = G.sceneDef(), sc = S.scenes[S.cur];
    const bg = G.$('#bg');
    if (d.type === 'room') { bg.innerHTML = G.roomBg(d.W, sc); G.$('#sky').style.display = 'none'; }
    else { bg.innerHTML = G.outdoorBg(d.W, sc, d); G.$('#sky').style.display = ''; G.updateSky(); }
    world().classList.toggle('outdoor', d.type !== 'room');
  };
  G.updateSky = () => {
    const s = G.skyNow(), sky = G.$('#sky');
    sky.style.background = `linear-gradient(${s.top}, ${s.bot} 75%)`;
    const tm = G.S.time;
    const sun = G.$('#sun'), moon = G.$('#moon');
    const dayP = (tm - 0.22) / 0.62; // 0..1 pendant la journée
    if (dayP > 0 && dayP < 1) { sun.style.display = ''; sun.style.left = (5 + dayP * 90) + '%'; sun.style.top = (55 - Math.sin(dayP * Math.PI) * 45) + '%'; }
    else sun.style.display = 'none';
    const nP = ((tm + 1 - 0.82) % 1) / 0.42;
    if (nP > 0 && nP < 1) { moon.style.display = ''; moon.style.left = (5 + nP * 90) + '%'; moon.style.top = (55 - Math.sin(nP * Math.PI) * 45) + '%'; }
    else moon.style.display = 'none';
    G.$('#stars').style.opacity = G.darkness();
  };
  G.resize = () => {
    const d = G.sceneDef();
    scale = Math.max(innerHeight / G.H, innerWidth / d.W);
    offY = innerHeight - G.H * scale;
    clampCam();
  };
  function clampCam() {
    const d = G.sceneDef();
    const vw = innerWidth / scale;
    camX = G.clamp(camX, 0, Math.max(0, d.W - vw));
    offX = -camX * scale;
    world().style.transform = `translate(${offX}px, ${offY}px) scale(${scale})`;
    G.$('#sky').style.transform = `translate(${-Math.min(600, camX * scale * 0.15)}px, 0)`;
    G.S.cam[G.S.cur] = camX;
  }
  G.panBy = dx => { camX += dx; clampCam(); };
  G.camCenter = () => camX + innerWidth / scale / 2;
  G.toWorld = (cx, cy) => ({ x: (cx - offX) / scale, y: (cy - offY) / scale });

  G.go = (id) => {
    if (!G.SCENES[id]) return;
    if (G.drag) endDrag(null, true);
    G.S.cam[G.S.cur] = camX;
    G.S.cur = id;
    G.buildScene();
    G.emit('visit', id);
    G.save();
  };

  // ---------- SURFACES & PHYSIQUE ----------
  function surfaces() {
    if (!surfDirty) return surfCache;
    surfCache = [];
    G.cur.forEach(f => {
      if (f.k !== 'f') return;
      const d = G.FURN[f.t];
      (d.surf || []).forEach(s => {
        const x1 = f.flip ? d.w - s.x2 : s.x1, x2 = f.flip ? d.w - s.x1 : s.x2;
        surfCache.push({ x1: f.x - d.w / 2 + x1, x2: f.x - d.w / 2 + x2, y: f.y - d.h + s.y, f, cook: s.cook, bounce: s.bounce });
      });
    });
    surfDirty = false;
    return surfCache;
  }
  G.surfDirty = () => { surfDirty = true; };
  G.fall = (e, vx = 0, vy = 0) => {
    e.fall = true; e.vx = vx; e.vy = vy; e.surf = null; e.bn = 0;
    const d = defOf(e);
    if (e.k === 'i' && d.float) { e.floating = true; }
    e.fy = e.y >= G.FTOP - 10 ? G.clamp(e.y, G.FTOP, G.FBOT) : G.FLOOR + G.rand(-4, 10);
    if (e.y >= G.FTOP - 10 && Math.abs(vy) < 200 && Math.abs(vx) < 200 && !e.floating) { e.y = e.fy; land(e, null, 0); }
  };
  function land(e, s, impact) {
    e.fall = false; e.vx = 0; e.vy = 0; e.surf = s ? s.f.id : null; e.cook = s && s.cook;
    if (e.k === 'c' || e.k === 'p') {
      const rec = G.dom.get(e.id);
      if (rec && impact > 400) { rec.inner.classList.remove('land'); void rec.inner.offsetWidth; rec.inner.classList.add('land'); G.sfx('land'); }
      if (e.k === 'c' && impact > 1900) { G.say(e, G.pick(['Aïe !', 'Ouille !', 'Ouf !', 'Hé doucement !'])); G.tmpExpr(e, 'angry', 1500); }
    } else if (impact > 300) G.sfx('drop');
  }
  function physics(e, dt) {
    const d = defOf(e), W = G.W();
    if (e.floating) {
      e.vy = -140; e.vx *= 0.97;
      e.x += e.vx * dt; e.y += e.vy * dt;
      e.x = G.clamp(e.x, 30, W - 30);
      const outdoor = G.sceneDef().type !== 'room';
      if (outdoor && e.y < -80) { G.del(e); return; }
      if (!outdoor && e.y < 150) { e.y = 150; e.fall = false; e.floating = false; e.surf = 'ceil'; }
      return;
    }
    const py = e.y;
    e.vy += G.GRAV * dt;
    e.x += e.vx * dt; e.y += e.vy * dt;
    const half = sizeOf(e).w / 2 * 0.5;
    if (e.x < half) { e.x = half; e.vx = Math.abs(e.vx) * 0.5; }
    if (e.x > W - half) { e.x = W - half; e.vx = -Math.abs(e.vx) * 0.5; }
    if (e.vy <= 0) return;
    let hit = null, hy = Infinity;
    for (const s of surfaces()) {
      if (py <= s.y + 1 && e.y >= s.y && e.x >= s.x1 && e.x <= s.x2 && s.y < hy) { hit = s; hy = s.y; }
    }
    if (!hit && e.y >= e.fy) { hit = { y: e.fy, floor: 1 }; hy = e.fy; }
    if (!hit) return;
    const impact = e.vy;
    e.y = hy;
    if (hit.bounce && e.bn < 6) {
      e.bn++; e.vy = -Math.max(1250, impact * 0.85); e.vx *= 0.6; G.sfx('boing');
      if (e.k === 'c') { G.tmpExpr(e, 'joy', 1200); G.emit('bounce'); }
      return;
    }
    if (e.k === 'i' && d.ball && impact > 320) { e.vy = -impact * 0.62; e.vx *= 0.85; G.sfx('boing'); G.emit('bounce'); return; }
    if (e.k === 'i' && d.roll && Math.abs(e.vx) > 40 && hit.floor) { e.vy = 0; e.vx *= 0.96; e.y = hy; if (Math.abs(e.vx) > 40) return; }
    land(e, hit.floor ? null : hit, impact);
  }
  function settle() {
    const ss = surfaces();
    G.cur.forEach(e => {
      if (e.k === 'f' || e.fall || e.held || e.in || e.seat || e._drag || e.free || e.surf === 'ceil') return;
      if (e.y >= G.FTOP - 2) return;
      const ok = ss.some(s => Math.abs(s.y - e.y) < 3 && e.x >= s.x1 && e.x <= s.x2);
      if (!ok) G.fall(e, 0, 0);
    });
  }
  G.settle = () => { surfDirty = true; settle(); };

  // ---------- EFFETS VISUELS ----------
  G.fxAt = (x, y, ch, kind = 'up') => {
    const el = G.el('div', 'fx ' + kind, ch);
    el.style.left = x + 'px'; el.style.top = y + 'px';
    if (kind === 'fall' || kind === 'drop') el.style.setProperty('--dx', G.rand(-40, 40) + 'px');
    else el.style.setProperty('--dx', G.rand(-30, 30) + 'px');
    G.$('#fx').appendChild(el);
    setTimeout(() => el.remove(), 1600);
  };
  G.burst = (x, y, ch, n = 6) => { for (let i = 0; i < n; i++) setTimeout(() => G.fxAt(x + G.rand(-30, 30), y + G.rand(-20, 20), ch, 'burst'), i * 40); };
  G.say = (e, txt, ms = 2400) => {
    const rec = G.dom.get(e.id); if (!rec) return;
    if (!rec.bubble) { rec.bubble = G.el('div', 'bubble'); G.$('#fx').appendChild(rec.bubble); }
    rec.bubble.textContent = txt;
    rec.bubble.style.display = '';
    rec.bubble.classList.remove('pop'); void rec.bubble.offsetWidth; rec.bubble.classList.add('pop');
    clearTimeout(rec.bt);
    rec.bt = setTimeout(() => { if (rec.bubble) rec.bubble.style.display = 'none'; }, ms);
    posBubbles(e);
  };
  G.sayAt = (f, txt) => {
    const el = G.el('div', 'bubble pop', G.esc(txt));
    const b = boxOf(f);
    el.style.left = (b.l + b.w / 2) + 'px'; el.style.top = (b.t - 10) + 'px';
    G.$('#fx').appendChild(el);
    setTimeout(() => el.remove(), 2200);
  };
  function posBubbles(e) {
    const rec = G.dom.get(e.id); if (!rec) return;
    if (!rec.bubble && !rec.think) return;
    const hp = headPos(e);
    if (rec.bubble) { rec.bubble.style.left = hp.x + 'px'; rec.bubble.style.top = (hp.y - 20) + 'px'; }
    if (rec.think) { rec.think.style.left = (hp.x + 40) + 'px'; rec.think.style.top = (hp.y - 10) + 'px'; }
  }
  G.shakeEnt = (e) => {
    const rec = G.dom.get(e.id); if (!rec) return;
    rec.inner.classList.remove('shake'); void rec.inner.offsetWidth; rec.inner.classList.add('shake');
  };
  G.toast = (msg, ms = 2200) => {
    const t = G.el('div', 'toast', msg);
    G.$('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), ms);
    setTimeout(() => t.remove(), ms + 500);
  };
  G.addCoins = (n, x, y) => {
    G.S.coins += n;
    G.sfx('coin');
    if (x != null) G.fxAt(x, y, `+${n}🪙`, 'coin');
    G.ui && G.ui.updateTop(true);
  };
  G.spend = (n) => {
    if (n <= 0) return true;
    if (G.S.coins < n) { G.toast('Pas assez de pièces 🪙 ! Fais des missions et des jeux.'); G.sfx('error'); return false; }
    G.S.coins -= n; G.sfx('coin'); G.ui && G.ui.updateTop(true);
    G.emit('buy');
    return true;
  };
  G.nearChar = (x, dist) => {
    let best = null, bd = dist;
    G.cur.forEach(e => { if (e.k === 'c') { const dd = Math.abs((slotOf(e) || e).x - x); if (dd < bd) { bd = dd; best = e; } } });
    return best;
  };
  G.musicOn = () => !!G.audio.mode;
  G.updateMusic = () => {
    let m = G.S.set.music ? 'normal' : null;
    G.cur.forEach(f => { if (f.k === 'f' && f.st.on) { const d = G.FURN[f.t]; if (d.music === 'disco') m = 'disco'; else if (d.music === 'radio' && m !== 'disco') m = 'radio'; } });
    if (m === 'radio' || m === 'disco') G.audio.st.music = true; else G.audio.st.music = G.S.set.music;
    G.audio.setMusic(m);
    const disco = G.cur.some(f => f.k === 'f' && G.FURN[f.t].disco && f.st.on);
    world().classList.toggle('disco', disco);
    G.discoOn = disco;
    G.cur.forEach(f => { if (f.t === 'enceinte') G.redraw(f); });
  };

  // ---------- DÉTACHER / RATTACHER ----------
  function detach(e) {
    if (e.seat) {
      const so = slotOf(e);
      e.seat = null;
      if (so) {
        if (so.s.a === 'swing') { so.f.st.busy = false; G.redraw(so.f); }
        if (so.s.a === 'xray') G.redraw(e);
      }
    }
    if (e.free) e.free = null;
    e.anim = null;
    if (e.k === 'i') {
      if (e.held) { const c = G.S.ents[e.held]; if (c && c.eat && c.eat.id === e.id) { c.eat = null; } e.held = null; }
      if (e.in) e.in = null;
      e.surf = null; e.ck = 0; e.bite = 0;
    }
    if (e.k === 'c' && e.eat) { const it = G.S.ents[e.eat.id]; e.eat = null; if (it) { it.held = null; } }
    e.fall = false; e.floating = false;
    const rec = G.dom.get(e.id); if (rec) rec.inner.classList.remove('swingc');
  }
  G.detach = detach;
  G.seat = (e, f, i) => {
    detach(e);
    const d = G.FURN[f.t], s = d.slots[i];
    e.seat = { f: f.id, i };
    e.fall = false;
    G.sfx('pop');
    G.redraw(e); G.place(e);
    G.emit('sit');
    const rec = G.dom.get(e.id);
    if (e.k !== 'c') return;
    switch (s.a) {
      case 'sleep': G.say(e, G.pick(['Bonne nuit !', 'Zzz...', 'Fais de beaux rêves !'])); G.emit('sleep'); break;
      case 'wash': if (d.toggle) { f.st.on = true; G.redraw(f); } G.sfx('splash'); G.emit('wash'); G.say(e, G.pick(['Splash !', 'Que c\'est bon !', 'Glou glou'])); break;
      case 'heal': if (e.sick) { G.say(e, 'Docteur, je suis malade...'); e.healT = 0; } else G.say(e, 'Je me repose un peu'); break;
      case 'xray': G.sfx('bip'); G.say(e, 'Tout va bien à l\'intérieur !'); G.emit('xray'); break;
      case 'scale': { const kg = { bebe: 9, enfant: 25, ado: 45, adulte: 65, senior: 62 }[e.look.age] + G.ri(-5, 8); G.say(e, `${kg} kg !`); G.sfx('bip'); break; }
      case 'dress': setTimeout(() => G.ui.creator(e, 'top'), 350); break;
      case 'hair': setTimeout(() => G.ui.creator(e, 'hair'), 350); break;
      case 'toilet': setTimeout(() => { if (e.seat && e.seat.f === f.id) { G.sfx('flush'); G.say(e, 'Pfiou !'); e.stats.fun = Math.min(100, e.stats.fun + 5); } }, 1800); break;
      case 'swing': f.st.busy = true; G.redraw(f); if (rec) { rec.inner.classList.add('swingc'); const b = boxOf(e); const px = f.x - d.w / 2 + 120, py = f.y - d.h + 10; rec.inner.style.transformOrigin = `${px - b.l}px ${py - b.t}px`; } G.emit('swing'); break;
      case 'slide': setTimeout(() => { if (e.seat && e.seat.f === f.id) { const so = slotOf(e); detach(e); e.free = 'sit'; e.x = so.x; e.y = so.y; e.anim = { k: 'slide', t: 0, f: f.id }; G.sfx('swoosh'); G.tmpExpr(e, 'joy', 2000); G.emit('slide'); } }, 600); break;
      case 'relax': G.say(e, 'Ahhh, le soleil !'); break;
    }
  };

  // ---------- ACTIONS : PERSONNAGES ----------
  G.hold = (c, it) => {
    G.cur.forEach(o => { if (o.k === 'i' && o.held === c.id && o !== it) { o.held = null; G.fall(o, G.rand(-100, 100), -300); } });
    it.held = c.id; it.fall = false; it.surf = null; it.in = null;
    G.place(it);
  };
  G.useItem = (c, it) => {
    const d = G.ITEMS[it.t];
    if (d.food) {
      if (c.eat) return false;
      G.hold(c, it);
      c.eat = { id: it.id, t: 0, bites: 0 };
      G.redraw(c);
      return true;
    }
    if (d.heal) {
      if (c.sick) { G.del(it); c.sick = false; G.tmpExpr(c, 'joy', 2000); G.say(c, 'Merci ! Je me sens mieux !'); G.sfx('magic'); G.burst(headPos(c).x, headPos(c).y, '✨'); G.emit('heal'); G.redraw(c); return true; }
      G.say(c, 'Je ne suis pas malade !');
    }
    if (d.clean) {
      c.stats.proprete = Math.min(100, c.stats.proprete + d.clean);
      G.sfx('splash'); const b = boxOf(c); for (let i = 0; i < 6; i++) G.fxAt(b.l + G.rand(10, b.w - 10), b.t + G.rand(40, b.h * 0.7), '🫧', 'up');
      G.say(c, G.pick(['Tout propre !', 'Ça sent bon !', 'Hop, au propre !'])); G.emit('wash'); G.tmpExpr(c, 'joy');
      G.fall(it, G.rand(-120, 120), -400);
      return true;
    }
    if (d.wear) {
      const [slot, val, col] = d.wear;
      c.look[slot] = val; c.look[slot + 'C'] = col;
      G.del(it); G.sfx('magic'); G.redraw(c); G.tmpExpr(c, 'joy', 1500); G.say(c, G.pick(['Trop stylé !', 'Ça me va bien ?', 'J\'adore !'])); G.emit('dress');
      return true;
    }
    if (d.makeup) { c.look.blush = true; G.redraw(c); G.tmpExpr(c, 'love', 2000); G.say(c, 'Magnifique !'); G.burst(headPos(c).x, headPos(c).y + 40, '💖', 4); G.fall(it, 80, -300); G.emit('dress'); return true; }
    if (d.potion) {
      c.look.hairC = G.pick(['#ff7fb3', '#c77dff', '#4aa3ff', '#3ccf91', '#ff9f43', '#ffffff', '#ffd23f']);
      G.del(it); G.redraw(c); G.sfx('magic'); G.burst(headPos(c).x, headPos(c).y, '✨', 8); G.say(c, 'Waouh ! Mes cheveux !'); G.tmpExpr(c, 'surprised', 1600); G.emit('magic');
      return true;
    }
    if (d.wand) {
      c.look.topC = G.pick(A.colors); c.look.bottomC = G.pick(A.colors); c.look.shoesC = G.pick(A.colors);
      G.redraw(c); G.sfx('magic'); G.burst(headPos(c).x, headPos(c).y + 60, '✨', 8); G.tmpExpr(c, 'joy', 1500); G.emit('magic');
      G.fall(it, G.rand(-150, 150), -500); return true;
    }
    if (d.love) { G.hold(c, it); G.tmpExpr(c, 'love', 2500); G.burst(headPos(c).x, headPos(c).y, '❤️', 5); G.sfx('sparkle'); c.stats.fun = Math.min(100, c.stats.fun + 10); return true; }
    if (d.thermo) { G.hold(c, it); G.say(c, c.sick ? '39,2°C... 🤒' : '37,0°C, tout va bien !'); return true; }
    if (d.boo) { G.del(it); c.look.top = 'pyjama'; c.look.topC = '#ffffff'; G.redraw(c); G.say(c, 'BOUH ! 👻'); G.sfx('magic'); G.emit('dress'); return true; }
    G.hold(c, it);
    if (d.fun) { c.stats.fun = Math.min(100, c.stats.fun + d.fun); G.tmpExpr(c, 'joy', 1200); }
    if (d.read) G.say(c, G.pick(['Il était une fois...', 'Quelle belle histoire !', 'Chapitre 1...']));
    G.sfx('pop');
    return true;
  };
  function eatTick(c, dt) {
    const it = G.S.ents[c.eat.id];
    if (!it || it.held !== c.id) { c.eat = null; G.redraw(c); return; }
    c.eat.t += dt;
    const d = G.ITEMS[it.t];
    if (c.eat.t > 0.55) {
      c.eat.t = 0; c.eat.bites++;
      G.sfx(d.drink ? 'drink' : 'eat');
      const hp = headPos(c);
      G.fxAt(hp.x, hp.y + 60, d.drink ? '💧' : '·', 'crumb');
      it.bite = c.eat.bites; G.redraw(it);
      if (c.eat.bites >= 3) {
        G.del(it); c.eat = null;
        c.stats.faim = Math.min(100, c.stats.faim + (d.food || 10));
        if (d.energy) c.stats.energie = Math.min(100, c.stats.energie + d.energy);
        if (d.fun) c.stats.fun = Math.min(100, c.stats.fun + d.fun);
        G.tmpExpr(c, d.fun > 10 ? 'love' : 'joy', 1600);
        G.say(c, G.pick(d.drink ? ['Glou glou !', 'Rafraîchissant !', 'Délicieux !'] : ['Miam !', 'Délicieux !', 'Trop bon !', 'Mmmh !', 'Encore !']));
        G.emit('eat');
        G.redraw(c);
      }
    }
  }
  // ---------- ACTIONS : ANIMAUX ----------
  G.petUse = (p, it) => {
    const d = G.ITEMS[it.t];
    if (d.petfood || d.food) {
      G.del(it); p.stats.faim = Math.min(100, p.stats.faim + 30); p.stats.fun = Math.min(100, p.stats.fun + 10);
      G.sfx('eat'); G.say(p, 'Miam ! ' + (G.PETS[p.t].say || ''), 1600); G.burst(headPos(p).x, headPos(p).y, '❤️', 4); G.emit('pet');
      return true;
    }
    if (d.ball || d.fun) { p.stats.fun = Math.min(100, p.stats.fun + 20); G.sfx(G.PETS[p.t].snd); G.burst(headPos(p).x, headPos(p).y, '💛', 3); G.fall(it, G.rand(-500, 500), -800); G.emit('pet'); return true; }
    return false;
  };
  function petTap(p) {
    const d = G.PETS[p.t];
    G.sfx(d.snd); G.say(p, d.say, 1500); G.burst(headPos(p).x, headPos(p).y, '❤️', 3);
    p.stats.fun = Math.min(100, p.stats.fun + 8);
    const rec = G.dom.get(p.id); if (rec) { rec.inner.classList.remove('hop'); void rec.inner.offsetWidth; rec.inner.classList.add('hop'); }
    G.emit('pet');
  }

  // ---------- ACTIONS : OBJETS ----------
  const GIFT_POOL = ['ours', 'robot', 'couronne', 'baguette', 'potion', 'diamant', 'guitare', 'anniv', 'cupcake', 'lunettes', 'etoile', 'telephone', 'appareil', 'micro', 'bouquet', 'baudruche', 'skate', 'manette', 'chapsorc', 'fantome'];
  function itemTap(it) {
    const d = G.ITEMS[it.t], b = boxOf(it), cx = b.l + b.w / 2, cy = b.t + b.h / 2;
    const holder = it.held && G.S.ents[it.held];
    if (d.gift) {
      G.sfx('tada'); G.burst(cx, cy, '🎉', 6);
      const x = it.x, y = it.y, sc = it.sc, h = it.held;
      G.del(it);
      if (Math.random() < 0.25) { G.addCoins(G.ri(10, 30), cx, cy); }
      else { const n = G.spawn('i', G.pick(GIFT_POOL), { x, y, sc }); if (h && G.S.ents[h]) G.hold(G.S.ents[h], n); else G.fall(n, 0, -600); }
      G.emit('gift'); return;
    }
    if (d.inst) {
      if (d.inst === 'drum') { G.audio.init(); G.audio.noise(0.2, 200, 0.5); G.audio.tone(90, 0.2, 'sine', 0.4, 50); }
      else if (d.inst === 'sing') { if (holder) G.say(holder, G.pick(['La la la ♪', 'Do ré mi ♫', 'Ouh ouh yeah ♪'])); G.sfx('note', G.pick([12, 14, 16, 19])); }
      else G.sfx('note', G.pick(d.inst));
      G.fxAt(cx, cy - 30, G.pick(['🎵', '🎶']), 'note');
      if (holder) G.tmpExpr(holder, 'joy', 900);
      G.emit('music'); return;
    }
    if (d.ball) { detach(it); G.fall(it, G.rand(-600, 600), -1200); G.sfx('boing'); G.emit('bounce'); return; }
    if (d.phone) { G.sfx('ring'); if (holder) setTimeout(() => G.say(holder, G.pick(['Allô ? C\'est Mamie !', 'Allô ? Oui je viens !', 'Coucou, ça va ?'])), 900); else G.sayAt(it, 'Driiing !'); return; }
    if (d.camera) { G.photo(); return; }
    if (d.piggy) {
      if (it.st.coins > 0) { G.addCoins(it.st.coins, cx, cy); it.st.coins = 0; G.redraw(it); G.emit('piggy'); }
      else G.sayAt(it, 'Vide ! Reviens plus tard.');
      return;
    }
    if (d.dice) { G.fxAt(cx, cy - 40, '🎲 ' + G.ri(1, 6), 'up'); G.sfx('click'); detach(it); G.fall(it, G.rand(-200, 200), -500); return; }
    if (d.wand) { G.sfx('magic'); G.burst(cx, cy, '✨', 6); return; }
    if (d.read && holder) { G.say(holder, G.pick(['Il était une fois...', 'Et ils vécurent heureux !', 'Encore une page !'])); holder.stats.fun = Math.min(100, holder.stats.fun + 5); G.emit('read'); return; }
    if (d.boo) { G.sayAt(it, 'Bouh !'); return; }
    if (d.camera) return;
    G.shakeEnt(it); G.sfx('pop');
  }

  // ---------- ACTIONS : MEUBLES ----------
  function furnTap(f, lx, ly) {
    const d = G.FURN[f.t];
    if (d.tap) { d.tap(f, lx, ly); return; }
    if (d.door) { G.sfx('door'); G.go(f.st.to); return; }
    if (d.cont) {
      f.st.open = !f.st.open;
      G.sfx(f.st.open ? 'pop' : 'click');
      G.redraw(f);
      G.cur.forEach(i => { if (i.in === f.id) G.place(i); });
      if (f.st.open) G.emit('open');
      return;
    }
    if (d.toggle) {
      f.st.on = !f.st.on; G.sfx('click'); G.redraw(f); G.lightsDirty = true;
      if (d.music || d.disco) G.updateMusic();
      if (d.cook === undefined && f.st.on && d.surf && d.surf.some(s => s.cook)) G.sfx('sizzle');
      return;
    }
    G.shakeEnt(f);
  }

  // ---------- PLACEMENT VERS SCÈNE / POCHE ----------
  G.moveTo = (e, scId, x) => {
    detach(e);
    G.initScene(scId);
    const was = e.sc === G.S.cur;
    const followers = Object.values(ents()).filter(i => i.held === e.id);
    if (was) { rmDom(e); G.cur = G.cur.filter(o => o !== e); followers.forEach(i => { rmDom(i); G.cur = G.cur.filter(o => o !== i); }); }
    e.sc = scId;
    followers.forEach(i => i.sc = scId);
    if (x == null) {
      const back = Object.values(ents()).find(o => o.sc === scId && o.k === 'f' && G.FURN[o.t].door && o.st.to === (was ? G.S.cur : null));
      const W = G.SCENES[scId].W;
      x = back ? back.x + (back.x < W / 2 ? 150 : -150) : W / 2 + G.rand(-200, 200);
    }
    e.x = x; e.y = G.FLOOR + G.rand(0, 30);
    if (scId === G.S.cur) { G.cur.push(e); mk(e); followers.forEach(i => { G.cur.push(i); mk(i); }); }
    G.save();
  };
  G.toTray = (e) => {
    if (G.S.tray.length >= 8) { G.toast('La poche est pleine !'); return false; }
    detach(e);
    const followers = Object.values(ents()).filter(i => i.held === e.id);
    rmDom(e); G.cur = G.cur.filter(o => o !== e);
    followers.forEach(i => { rmDom(i); G.cur = G.cur.filter(o => o !== i); i.sc = 'tray'; });
    e.sc = 'tray';
    G.S.tray.push(e.id);
    G.sfx('pop');
    G.ui.renderTray();
    return true;
  };
  G.fromTray = (id, ev) => {
    const e = G.S.ents[id]; if (!e) return;
    G.S.tray = G.S.tray.filter(x => x !== id);
    const w = G.toWorld(ev.clientX, ev.clientY);
    e.sc = G.S.cur; e.x = w.x; e.y = w.y + 40;
    G.cur.push(e); mk(e);
    Object.values(ents()).forEach(i => { if (i.held === e.id) { i.sc = G.S.cur; G.cur.push(i); mk(i); } });
    G.ui.renderTray();
    startDrag(e, ev, true);
  };

  // ---------- GLISSER-DÉPOSER ----------
  G.drag = null;
  let pan = null, hlEl = null;
  function entsAt(cx, cy, except) {
    const out = [];
    for (const el of document.elementsFromPoint(cx, cy)) {
      const en = el.closest && el.closest('.ent');
      if (!en) continue;
      const e = G.S.ents[en.dataset.id];
      if (e && e !== except && !out.includes(e)) out.push(e);
    }
    return out;
  }
  function localPt(f, w) {
    const d = G.FURN[f.t];
    let lx = w.x - (f.x - d.w / 2);
    if (f.flip) lx = d.w - lx;
    return { x: lx, y: w.y - (f.y - d.h) };
  }
  function startDrag(e, ev, immediate) {
    const w = G.toWorld(ev.clientX, ev.clientY);
    G.drag = { e, sx: ev.clientX, sy: ev.clientY, ox: w.x - e.x, oy: w.y - e.y, moved: false, vx: 0, vy: 0, lx: w.x, ly: w.y, lt: performance.now(), pid: ev.pointerId };
    if (e.k === 'i' && (e.held || e.in)) { const b = boxOf(e); e.x = b.l + b.w / 2; e.y = b.t + b.h; G.drag.ox = w.x - e.x; G.drag.oy = w.y - e.y; }
    if (e.k === 'c' || e.k === 'p') { const so = slotOf(e); if (so || e.free) { const b = boxOf(e); e.x = b.l + b.w / 2; e.y = b.t + b.h; G.drag.ox = w.x - e.x; G.drag.oy = w.y - e.y; } }
    if (immediate) { G.drag.ox = 0; G.drag.oy = -40; beginMove(); }
  }
  function beginMove() {
    const D = G.drag, e = D.e;
    D.moved = true;
    if (e.k !== 'f') {
      detach(e);
      e._drag = true;
      if (e.k === 'c') G.redraw(e);
      G.sfx('pick');
    }
    const rec = G.dom.get(e.id);
    if (rec) rec.el.classList.add('dragging');
  }
  function onDown(ev) {
    G.audio.init();
    if (ev.button > 0) return;
    if (ev.target.closest('#ui, .panel, .modal, #topbar, #sidebtns')) return;
    const stockEl = ev.target.closest('.stock');
    if (stockEl) {
      const f = G.S.ents[stockEl.dataset.f]; if (!f) return;
      const s = (f.st.stock || G.FURN[f.t].stock)[+stockEl.dataset.i];
      if (G.deco) return;
      if (s.p && !G.spend(s.p)) return;
      const w = G.toWorld(ev.clientX, ev.clientY);
      const e = G.spawn(s.t, s.k, { x: w.x, y: w.y + 30 });
      e.paid = s.p || 0; e.from = f.id;
      if (s.t === 'p') { G.toast(`Bienvenue ${e.name} le ${G.PETS[s.k].n.toLowerCase()} ! 🐾`); G.emit('adopt'); G.sfx('tada'); }
      startDrag(e, ev, true);
      ev.preventDefault();
      return;
    }
    const en = ev.target.closest('.ent');
    if (en) {
      const e = G.S.ents[en.dataset.id];
      if (e) {
        if (e.k === 'f' && !G.deco) { G.drag = { e, tapOnly: true, sx: ev.clientX, sy: ev.clientY }; }
        else startDrag(e, ev);
        ev.preventDefault();
        return;
      }
    }
    pan = { sx: ev.clientX, lx: ev.clientX, moved: false };
    G.ui.closeFloating && G.ui.closeFloating();
  }
  function onMove(ev) {
    if (pan) {
      if (Math.abs(ev.clientX - pan.sx) > 5) pan.moved = true;
      G.panBy(-(ev.clientX - pan.lx) / scale); pan.lx = ev.clientX;
      return;
    }
    const D = G.drag; if (!D) return;
    if (D.tapOnly) {
      if (Math.hypot(ev.clientX - D.sx, ev.clientY - D.sy) > 12) { G.drag = null; pan = { sx: D.sx, lx: ev.clientX, moved: true }; }
      return;
    }
    if (!D.moved && Math.hypot(ev.clientX - D.sx, ev.clientY - D.sy) > 7) beginMove();
    if (!D.moved) return;
    D.cx = ev.clientX; D.cy = ev.clientY;
    moveDragged(ev.clientX, ev.clientY);
    // cible en surbrillance
    const tgt = dropTarget(ev.clientX, ev.clientY);
    const tel = tgt && G.dom.get(tgt.id) ? G.dom.get(tgt.id).el : null;
    if (tel !== hlEl) { if (hlEl) hlEl.classList.remove('hl'); hlEl = tel; if (hlEl) hlEl.classList.add('hl'); }
    G.ui.trayHover(ev.clientX, ev.clientY);
  }
  function moveDragged(cx, cy) {
    const D = G.drag, e = D.e;
    const w = G.toWorld(cx, cy);
    const now = performance.now(), dt = Math.max(1, now - D.lt) / 1000;
    let nx = w.x - D.ox, ny = w.y - D.oy;
    if (e.k === 'f') {
      const d = G.FURN[e.t], W = G.W();
      nx = G.clamp(nx, d.w / 2 - 40, W - d.w / 2 + 40);
      ny = (d.wall || d.free) ? G.clamp(ny, d.h * 0.4, 706) : G.clamp(ny, 626, 706);
      surfDirty = true;
    }
    D.vx = G.lerp(D.vx, (w.x - D.lx) / dt, 0.4); D.vy = G.lerp(D.vy, (w.y - D.ly) / dt, 0.4);
    D.lx = w.x; D.ly = w.y; D.lt = now;
    e.x = nx; e.y = ny;
    G.place(e);
    if (e.k === 'f') G.cur.forEach(o => { if (o.seat && o.seat.f === e.id) G.place(o); if (o.in === e.id) G.place(o); });
  }
  function dropTarget(cx, cy) {
    const D = G.drag, e = D.e;
    if (e.k === 'f') return null;
    const w = G.toWorld(cx, cy);
    if (e.k === 'c' || e.k === 'p') {
      const hits = entsAt(cx, cy, e);
      const door = hits.find(h => h.k === 'f' && G.FURN[h.t].door);
      if (door) return door;
      const s = findSlot(e, w);
      return s ? s.f : null;
    }
    const hits = entsAt(cx, cy, e);
    for (const h of hits) {
      if (h.k === 'c' || h.k === 'p') return h;
      if (h.k === 'f') {
        const d = G.FURN[h.t];
        if (d.trash || d.accept || d.door) return h;
        if (d.cont && h.st.open) return h;
      }
    }
    return null;
  }
  function findSlot(e, w) {
    let best = null, bd = 125;
    G.cur.forEach(f => {
      if (f.k !== 'f') return;
      const d = G.FURN[f.t];
      (d.slots || []).forEach((s, i) => {
        if (s.pet && e.k !== 'p') return;
        if (G.cur.some(o => o !== e && o.seat && o.seat.f === f.id && o.seat.i === i)) return;
        const lx = f.flip ? d.w - s.x : s.x;
        const sx = f.x - d.w / 2 + lx, sy = f.y - d.h + s.y;
        const py = e.k === 'c' && (s.p === 'stand' || s.a === 'xray') ? w.y + 60 : w.y;
        const dist = Math.hypot(sx - w.x, (sy - py) * 0.8);
        if (dist < bd) { bd = dist; best = { f, i }; }
      });
    });
    return best;
  }
  function onUp(ev) {
    if (pan) { pan = null; return; }
    const D = G.drag; if (!D) return;
    if (hlEl) { hlEl.classList.remove('hl'); hlEl = null; }
    G.ui.trayHover(-1, -1);
    if (D.tapOnly || !D.moved) {
      G.drag = null;
      const e = D.e;
      const w = G.toWorld(ev.clientX, ev.clientY);
      if (e.k === 'f') { if (G.deco) G.ui.decoTools(e); else { const lp = localPt(e, w); furnTap(e, lp.x, lp.y); } }
      else if (e.k === 'c') { if (!G.deco) { G.ui.charMenu(e); const r = G.dom.get(e.id); if (r) { r.inner.classList.remove('hop'); void r.inner.offsetWidth; r.inner.classList.add('hop'); } } }
      else if (e.k === 'p') petTap(e);
      else if (e.k === 'i') itemTap(e);
      return;
    }
    endDrag(ev);
  }
  function endDrag(ev, cancel) {
    const D = G.drag; G.drag = null;
    const e = D.e;
    e._drag = false;
    const rec = G.dom.get(e.id);
    if (rec) rec.el.classList.remove('dragging');
    if (e.k === 'c') G.redraw(e);
    if (cancel || !ev) { if (e.k !== 'f') G.fall(e, 0, 0); return; }
    const cx = ev.clientX, cy = ev.clientY, w = G.toWorld(cx, cy);
    const idle = performance.now() - D.lt > 90;
    const vx = idle ? 0 : G.clamp(D.vx, -1600, 1600), vy = idle ? 0 : G.clamp(D.vy, -1800, 1400);
    if (e.k === 'f') {
      surfDirty = true; G.lightsDirty = true;
      if (G.ui.overTrash(cx, cy)) { G.ui.sellFurniture(e); return; }
      G.sfx('drop'); G.settle(); G.save();
      return;
    }
    // poche
    if (G.ui.overTray(cx, cy)) { if (G.toTray(e)) return; }
    // remettre en rayon = remboursement
    if (e.from && e.paid != null) {
      const hits0 = entsAt(cx, cy, e);
      if (hits0.some(h => h.id === e.from)) { if (e.paid) { G.S.coins += e.paid; G.ui.updateTop(true); } G.sfx('pop'); G.del(e); return; }
    }
    e.from = null;
    const hits = entsAt(cx, cy, e);
    if (e.k === 'c' || e.k === 'p') {
      const door = hits.find(h => h.k === 'f' && G.FURN[h.t].door);
      if (door) {
        const to = door.st.to; G.sfx('door'); G.moveTo(e, to);
        G.toast(`${e.name} est parti(e) : ${G.SCENES[to].ic} ${G.SCENES[to].n}`);
        return;
      }
      const s = findSlot(e, w);
      if (s) { G.seat(e, s.f, s.i); return; }
      if (G.deco && G.ui.overTrash(cx, cy) && e.k === 'p') { G.ui.confirm(`Relâcher ${e.name} ?`, () => G.del(e)); }
      G.fall(e, vx * 0.4, vy * 0.5);
      return;
    }
    // objet
    for (const h of hits) {
      if (h.k === 'f') {
        const d = G.FURN[h.t];
        if (d.trash) { const b = boxOf(e); G.burst(b.l + b.w / 2, b.t, '💨', 3); G.sfx('swoosh'); G.del(e); G.emit('trash'); return; }
        if (d.accept) { const r = d.accept(h, e); if (r) return; }
        if (d.door) { const to = h.st.to; G.moveTo(e, to); G.sfx('door'); G.toast(`Objet envoyé : ${G.SCENES[to].n}`); return; }
        if (d.cont && h.st.open) {
          const lp = localPt(h, w), a = d.cont.area;
          if (lp.x >= a[0] && lp.x <= a[2] && lp.y >= a[1] && lp.y <= a[3]) {
            const used = G.cur.filter(o => o.in === h.id).map(o => o.slot);
            let free = -1;
            let bd = Infinity;
            d.cont.slots.forEach((sl, i) => { if (used.includes(i)) return; const dd = Math.hypot(sl[0] - lp.x, sl[1] - lp.y); if (dd < bd) { bd = dd; free = i; } });
            if (free >= 0) { e.in = h.id; e.slot = free; e.fall = false; G.place(e); G.sfx('drop'); return; }
          }
        }
      }
      if (h.k === 'c') { if (G.useItem(h, e)) return; }
      if (h.k === 'p') { if (G.petUse(h, e)) return; }
    }
    G.fall(e, vx, vy);
  }
  G.cancelDrag = () => { if (G.drag) endDrag(null, true); };

  // ---------- BOUCLE ----------
  let last = 0, acc = 0, acc2 = 0;
  function frame(t) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t; G.now = t;
    if (G.S.started && !G.paused) {
      for (const e of G.cur) {
        if (e.fall) physics(e, dt);
        if (e.k === 'c') {
          if (e.eat) eatTick(e, dt);
          if (e.anim && e.anim.k === 'slide') slideTick(e, dt);
        }
        if (e.k === 'p' && !e.fall && !e._drag && !e.seat) petWander(e, dt);
      }
      // autoscroll pendant le glisser
      if (G.drag && G.drag.moved && G.drag.cx != null) {
        const m = 70;
        if (G.drag.cx < m) { G.panBy(-12 / scale); moveDragged(G.drag.cx, G.drag.cy); }
        else if (G.drag.cx > innerWidth - m) { G.panBy(12 / scale); moveDragged(G.drag.cx, G.drag.cy); }
      }
      for (const e of G.cur) {
        if (e.k === 'c') {
          const rec = G.dom.get(e.id);
          if (rec) { const k = JSON.stringify(charRenderOpts(e)); if (k !== rec.key) G.redraw(e); }
        }
        G.place(e);
        posBubbles(e);
      }
      // temps
      G.S.time += dt / G.DAY;
      if (G.S.time >= 1) { G.S.time -= 1; G.S.day++; newDay(); }
      acc += dt; acc2 += dt;
      if (acc >= 1) { acc -= 1; tick1(); }
      if (acc2 >= 0.25) { acc2 = 0; tick4(); }
    }
    requestAnimationFrame(frame);
  }
  function slideTick(c, dt) {
    const a = c.anim, f = G.S.ents[a.f];
    if (!f) { c.anim = null; c.free = null; G.fall(c, 0, 0); return; }
    a.t += dt / 0.9;
    const d = G.FURN[f.t];
    const pts = [[80, 46], [150, 70], [200, 150], [250, 230], [330, 250]];
    const k = Math.min(1, a.t) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(k)), fr = k - i;
    let lx = G.lerp(pts[i][0], pts[i + 1][0], fr), ly = G.lerp(pts[i][1], pts[i + 1][1], fr);
    if (f.flip) lx = d.w - lx;
    c.x = f.x - d.w / 2 + lx; c.y = f.y - d.h + ly;
    if (a.t >= 1) { c.anim = null; c.free = null; c.y = G.FLOOR; c.x += f.flip ? -30 : 30; G.redraw(c); land(c, null, 600); c.stats.fun = Math.min(100, c.stats.fun + 15); G.say(c, 'Youpiii !'); }
  }
  function petWander(p, dt) {
    if (p.surf || p.y < G.FTOP - 5) return;
    p.wt = (p.wt || G.rand(1, 4)) - dt;
    if (p.tx == null && p.wt < 0) {
      p.tx = G.clamp(p.x + G.rand(-260, 260), 60, G.W() - 60); p.wt = G.rand(2, 6);
      const nd = p.tx > p.x ? 1 : -1;
      if (nd !== p.dir) { p.dir = nd; G.redraw(p); }
      const rec = G.dom.get(p.id); if (rec) rec.inner.classList.add('walk');
    }
    if (p.tx != null) {
      const sp = 70 * dt * (p.t === 'tortue' ? 0.3 : 1);
      if (Math.abs(p.tx - p.x) < sp) { p.tx = null; const rec = G.dom.get(p.id); if (rec) rec.inner.classList.remove('walk'); }
      else p.x += Math.sign(p.tx - p.x) * sp;
    }
  }
  function newDay() {
    const S = G.S;
    S.weather = G.pick(['soleil', 'soleil', 'soleil', 'nuages', 'pluie', 'pluie', 'neige']);
    G.toast(`☀️ Jour ${S.day} ! Météo : ${{ soleil: '☀️ soleil', nuages: '⛅ nuageux', pluie: '🌧️ pluie', neige: '❄️ neige' }[S.weather]}`);
    G.ui.updateWeather();
  }
  // chaque 1/4 s : cuisson, lumières
  function tick4() {
    for (const it of G.cur) {
      if (it.k !== 'i' || it.fall || it.held || it.in || !it.surf) continue;
      const f = G.S.ents[it.surf];
      if (!f || !f.st.on || it.cook !== 'fire') continue;
      const d = G.ITEMS[it.t];
      if (!d.cook) continue;
      it.ck = (it.ck || 0) + 0.25;
      if (Math.random() < 0.3) { const b = boxOf(it); G.fxAt(b.l + b.w / 2, b.t, '💨', 'up'); }
      if (Math.random() < 0.1) G.sfx('sizzle');
      if (it.ck >= 3) { it.t = d.cook; it.ck = 0; G.redraw(it); G.sfx('ding'); const b = boxOf(it); G.burst(b.l + b.w / 2, b.t, '✨', 4); G.emit('cook'); }
      else G.redraw(it);
    }
    if (G.lightsDirty) updateLights();
  }
  // chaque seconde : besoins, pousse, temps
  let secs = 0;
  function tick1() {
    const S = G.S;
    secs++;
    const night = G.isNight();
    const rain = S.weather === 'pluie';
    Object.values(ents()).forEach(e => {
      if (e.k === 'c' && e.stats && !e.npc) {
        const st = e.stats;
        const so = e.sc === S.cur ? slotOf(e) : (e.seat ? { s: (G.FURN[(G.S.ents[e.seat.f] || {}).t] || { slots: [] }).slots[e.seat.i] || {} } : null);
        const a = so && so.s ? so.s.a : null;
        st.faim = Math.max(0, st.faim - 0.1);
        st.proprete = Math.max(0, st.proprete - 0.05);
        st.fun = Math.max(0, st.fun - 0.06);
        if (a === 'sleep') { st.energie = Math.min(100, st.energie + 2.5); if (e.sc === S.cur && secs % 2 === 0) { const hp = headPos(e); G.fxAt(hp.x + 20, hp.y - 20, 'z', 'zzz'); } }
        else st.energie = Math.max(0, st.energie - (night ? 0.12 : 0.07));
        if (a === 'wash') { st.proprete = Math.min(100, st.proprete + 7); if (e.sc === S.cur) { const b = boxOf(e); G.fxAt(b.l + G.rand(20, b.w - 20), b.t + G.rand(30, 120), '🫧', 'up'); } }
        if (a === 'swing' || a === 'relax') st.fun = Math.min(100, st.fun + 2);
        if (a === 'heal' && e.sick) { e.healT = (e.healT || 0) + 1; if (e.healT > 4) { e.sick = false; e.healT = 0; if (e.sc === S.cur) { G.say(e, 'Guéri ! Merci docteur !'); G.sfx('magic'); G.redraw(e); } G.emit('heal'); } }
        if (a === 'heal' && !e.sick) st.energie = Math.min(100, st.energie + 1.5);
        if (e.sc === S.cur && e.dancing) { st.fun = Math.min(100, st.fun + 2.5); G.emit('dance'); }
        if (e.sc === S.cur && so && so.s && !a && G.cur.some(f => f.t === 'tv' && f.st.on)) st.fun = Math.min(100, st.fun + 0.6);
        if (!e.sick && st.proprete < 12 && Math.random() < 0.004) { e.sick = true; if (e.sc === S.cur) { G.say(e, 'Atchoum ! 🤧'); G.redraw(e); } }
      }
      if (e.k === 'p' && e.stats) { e.stats.faim = Math.max(0, e.stats.faim - 0.08); e.stats.fun = Math.max(0, e.stats.fun - 0.05); }
      if (e.k === 'i' && e.t === 'tirelire' && secs % 8 === 0 && e.st.coins < 99) { e.st.coins++; if (e.sc === S.cur && e.st.coins % 5 === 0) G.redraw(e); }
      if (e.k === 'f' && e.t === 'potager' && e.st.plots) {
        let ch = false;
        const sd = G.SCENES[e.sc];
        e.st.plots.forEach(pl => {
          if (!pl) return;
          if (rain && sd && sd.type === 'out' && pl.g < 3 && !pl.w) { pl.w = 1; ch = true; }
          if (pl.w && pl.g < 3) { pl.t = (pl.t || 0) + 1; if (pl.t >= 7) { pl.g++; pl.t = 0; pl.w = pl.g < 3 && rain ? 1 : 0; ch = true; } }
        });
        if (ch && e.sc === S.cur) G.redraw(e);
      }
      if (e.k === 'f' && G.FURN[e.t].auto) { const on = G.darkness() > 0.4; if (e.st.on !== on) { e.st.on = on; if (e.sc === S.cur) { G.redraw(e); G.lightsDirty = true; } } }
    });
    // bulles de besoin + danse
    G.cur.forEach(e => {
      if (e.k !== 'c' || e.npc) return;
      const rec = G.dom.get(e.id); if (!rec) return;
      const st = e.stats;
      const need = e.sick ? '🤒' : st.faim < 22 ? '🍔' : st.energie < 22 ? '😴' : st.proprete < 22 ? '🛁' : st.fun < 18 ? '🎈' : null;
      if (need && !(e.seat && slotOf(e) && slotOf(e).s.a === 'sleep')) {
        if (!rec.think) { rec.think = G.el('div', 'think'); G.$('#fx').appendChild(rec.think); }
        rec.think.textContent = need; rec.think.style.display = '';
      } else if (rec.think) rec.think.style.display = 'none';
      const dance = G.discoOn && !e.seat && !e.fall && !e._drag && !e.free;
      if (dance !== !!e.dancing) { e.dancing = dance; rec.inner.classList.toggle('dancing', dance); }
    });
    G.cur.forEach(e => { if (e.k === 'c' && e.npc) { const rec = G.dom.get(e.id); const dance = G.discoOn && !e.seat && !e.fall && !e._drag; if (rec && dance !== !!e.dancing) { e.dancing = dance; rec.inner.classList.toggle('dancing', dance); } } });
    if (secs % 3 === 0) {
      G.cur.forEach(f => { if (f.k === 'f' && G.FURN[f.t].timeDep) G.redraw(f); });
      if (G.sceneDef().type !== 'room') G.updateSky();
      G.lightsDirty = true;
    }
    if (secs % 10 === 0) G.save();
    G.ui.updateTop();
    G.ui.tick && G.ui.tick();
  }
  function updateLights() {
    G.lightsDirty = false;
    const dark = G.darkness();
    const room = G.sceneDef().type === 'room';
    const lights = G.cur.filter(f => f.k === 'f' && G.FURN[f.t].light && f.st.on);
    let a = room ? dark * (lights.length ? 0.28 : 0.55) : dark * 0.55;
    if (G.discoOn) a = Math.max(a, 0.45);
    G.$('#night').style.opacity = a.toFixed(3);
    const L = G.$('#lights');
    L.innerHTML = '';
    lights.forEach(f => {
      const d = G.FURN[f.t], lt = d.light;
      const lx = f.flip ? d.w - lt.x : lt.x;
      const x = f.x - d.w / 2 + lx, y = f.y - d.h + lt.y, r = lt.r;
      const g = G.el('div', 'glow');
      g.style.cssText = `left:${x - r}px;top:${y - r}px;width:${r * 2}px;height:${r * 2}px;opacity:${(0.15 + dark * 0.85).toFixed(2)}`;
      L.appendChild(g);
    });
  }

  // ---------- MISSIONS ----------
  G.QUESTS = [
    { id: 'eat', ev: 'eat', n: 3, txt: 'Donne à manger 3 fois', r: 20 },
    { id: 'sleep', ev: 'sleep', n: 1, txt: 'Mets quelqu\'un au lit', r: 15 },
    { id: 'wash', ev: 'wash', n: 2, txt: 'Lave des personnages 2 fois', r: 15 },
    { id: 'cook', ev: 'cook', n: 2, txt: 'Cuisine 2 plats (four, mixeur, BBQ...)', r: 25 },
    { id: 'buy', ev: 'buy', n: 3, txt: 'Achète 3 choses', r: 20 },
    { id: 'visit', ev: 'visit', n: 3, uniq: 1, txt: 'Visite 3 lieux différents', r: 20 },
    { id: 'gift', ev: 'gift', n: 1, txt: 'Ouvre un cadeau 🎁', r: 15 },
    { id: 'draw', ev: 'draw', n: 1, txt: 'Fais un dessin (tableau ou chevalet)', r: 20 },
    { id: 'plant', ev: 'plant', n: 2, txt: 'Plante 2 graines au potager', r: 15 },
    { id: 'harvest', ev: 'harvest', n: 1, txt: 'Récolte un légume', r: 30 },
    { id: 'dress', ev: 'dress', n: 1, txt: 'Change le look de quelqu\'un', r: 15 },
    { id: 'game', ev: 'game', n: 1, txt: 'Joue à un jeu d\'arcade', r: 25 },
    { id: 'music', ev: 'music', n: 5, txt: 'Joue 5 notes de musique', r: 15 },
    { id: 'pet', ev: 'pet', n: 3, txt: 'Câline ou nourris un animal 3 fois', r: 15 },
    { id: 'create', ev: 'create', n: 1, txt: 'Crée un nouveau personnage', r: 30 },
    { id: 'heal', ev: 'heal', n: 1, txt: 'Soigne un malade', r: 30 },
    { id: 'bounce', ev: 'bounce', n: 3, txt: 'Fais rebondir 3 fois (ballon, trampoline)', r: 10 },
    { id: 'sit', ev: 'sit', n: 5, txt: 'Fais asseoir des gens 5 fois', r: 10 },
    { id: 'dance', ev: 'dance', n: 15, txt: 'Danse 15 s sous la boule disco', r: 25 },
    { id: 'swing', ev: 'swing', n: 1, txt: 'Fais de la balançoire', r: 10 },
    { id: 'slide', ev: 'slide', n: 1, txt: 'Descends le toboggan', r: 10 },
    { id: 'magic', ev: 'magic', n: 1, txt: 'Utilise de la magie (potion, baguette)', r: 20 },
    { id: 'photo', ev: 'photo', n: 1, txt: 'Prends une photo 📸', r: 10 },
    { id: 'adopt', ev: 'adopt', n: 1, txt: 'Adopte un animal', r: 30 },
    { id: 'tv', ev: 'tv', n: 1, txt: 'Allume la télé', r: 5 },
    { id: 'open', ev: 'open', n: 3, txt: 'Ouvre 3 placards ou frigos', r: 10 },
  ];
  G.fillQuests = () => {
    const S = G.S;
    while (S.quests.length < 3) {
      const opts = G.QUESTS.filter(q => !S.quests.some(a => a.id === q.id) && q.id !== S.lastQuest);
      const q = G.pick(opts);
      S.quests.push({ id: q.id, p: 0, seen: [] });
    }
  };
  G.emit = (ev, key) => {
    const S = G.S;
    S.counters[ev] = (S.counters[ev] || 0) + 1;
    let changed = false;
    S.quests.forEach(a => {
      const q = G.QUESTS.find(x => x.id === a.id);
      if (!q || q.ev !== ev || a.done) return;
      if (q.uniq) { if (a.seen.includes(key)) return; a.seen.push(key); }
      a.p++; changed = true;
      if (a.p >= q.n) {
        a.done = true;
        setTimeout(() => {
          G.sfx('tada');
          G.toast(`✅ Mission réussie : ${q.txt} &nbsp;<b>+${q.r} 🪙</b>`, 3200);
          S.coins += q.r; S.qdone++;
          S.quests = S.quests.filter(x => x !== a);
          S.lastQuest = a.id;
          G.fillQuests();
          G.ui.updateTop(true); G.ui.refreshQuests && G.ui.refreshQuests();
          G.save();
        }, 400);
      }
    });
    if (changed) G.ui.refreshQuests && G.ui.refreshQuests();
  };

  // ---------- PHOTO ----------
  G.photo = () => {
    G.sfx('camera');
    const fl = G.el('div', 'flash'); document.body.appendChild(fl);
    document.body.classList.add('photomode');
    setTimeout(() => fl.remove(), 600);
    setTimeout(() => document.body.classList.remove('photomode'), 2500);
    G.emit('photo');
  };

  // ---------- DÉMARRAGE ----------
  G.startEngine = () => {
    addEventListener('pointerdown', onDown, { passive: false });
    addEventListener('pointermove', onMove, { passive: false });
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', () => { pan = null; if (G.drag) endDrag(null, true); });
    addEventListener('resize', () => G.resize());
    addEventListener('wheel', ev => { if (ev.target.closest('.panel, .modal')) return; G.panBy((ev.deltaX || ev.deltaY) / scale); }, { passive: true });
    addEventListener('keydown', ev => {
      if (ev.target.tagName === 'INPUT') return;
      if (ev.key === 'ArrowLeft') G.panBy(-80); if (ev.key === 'ArrowRight') G.panBy(80);
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) G.save(); });
    addEventListener('beforeunload', () => G.save());
    requestAnimationFrame(frame);
  };
})();
