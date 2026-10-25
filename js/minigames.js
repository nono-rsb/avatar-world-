'use strict';
// ===== Mini-jeux de la salle d'arcade =====
(() => {
  G.MINIGAMES = {
    catch: { n: 'Attrape-fruits', e: '🧺' },
    memory: { n: 'Memory', e: '🃏' },
    mole: { n: 'Tape-taupe', e: '🐹' },
    bubbles: { n: 'Ballons', e: '🎈' },
    simon: { n: 'Simon', e: '🎵' },
  };
  const M = G.mini = {};
  let stop = null;

  function shell(id, help) {
    const g = G.MINIGAMES[id];
    const m = G.ui.panel('gamep', `<div class="maphead"><h2>${g.e} ${g.n}</h2><div class="ghud"><span class="gs">⭐ 0</span><span class="gt"></span></div><button class="btn" data-x>✖</button></div>
      <div class="garea"></div><p class="hint">${help}</p>`, () => { if (stop) stop(); stop = null; });
    m.p.querySelector('[data-x]').onclick = () => m.close();
    return m;
  }
  function finish(m, id, score, coins, again) {
    if (stop) stop(); stop = null;
    coins = Math.max(1, Math.round(coins));
    const area = m.p.querySelector('.garea');
    const end = G.el('div', 'gend', `<div class="bigemo">🏆</div><h2>Score : ${score}</h2><p>Tu gagnes <b>${coins} 🪙</b> !</p><div class="row center"><button class="btn green" data-again>🔁 Rejouer</button><button class="btn" data-q>Quitter</button></div>`);
    area.appendChild(end);
    G.addCoins(coins); G.sfx('tada'); G.emit('game'); G.save();
    end.querySelector('[data-again]').onclick = () => { m.close(); M.open(id); };
    end.querySelector('[data-q]').onclick = () => m.close();
  }
  const setScore = (m, s) => m.p.querySelector('.gs').textContent = '⭐ ' + s;
  const setTime = (m, t) => m.p.querySelector('.gt').textContent = '⏱ ' + Math.ceil(t);

  // ---------- Attrape-fruits ----------
  function catchGame() {
    const m = shell('catch', 'Déplace le panier pour attraper les fruits. Attention aux bombes 💣 !');
    const cv = G.el('canvas'); cv.width = 600; cv.height = 400;
    m.p.querySelector('.garea').appendChild(cv);
    const ctx = cv.getContext('2d');
    let bx = 300, score = 0, time = 30, objs = [], spawnT = 0, last = performance.now(), alive = true, shake = 0;
    const good = ['🍎', '🍌', '🍇', '🍓', '🍉', '🍊', '🍒'];
    cv.addEventListener('pointermove', ev => { const r = cv.getBoundingClientRect(); bx = (ev.clientX - r.left) / r.width * 600; });
    cv.addEventListener('pointerdown', ev => { const r = cv.getBoundingClientRect(); bx = (ev.clientX - r.left) / r.width * 600; });
    function loop(t) {
      if (!alive) return;
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      time -= dt; spawnT -= dt;
      if (spawnT <= 0) {
        spawnT = Math.max(0.3, 0.8 - (30 - time) * 0.015);
        const r = Math.random();
        objs.push({ x: G.rand(30, 570), y: -30, v: G.rand(150, 230) + (30 - time) * 6, e: r < 0.18 ? '💣' : r < 0.26 ? '⭐' : G.pick(good) });
      }
      ctx.fillStyle = '#bde9ff'; ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#7ed957'; ctx.fillRect(0, 360, 600, 40);
      ctx.save(); if (shake > 0) { ctx.translate(G.rand(-6, 6), G.rand(-6, 6)); shake -= dt; }
      ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      objs.forEach(o => { o.y += o.v * dt; ctx.fillText(o.e, o.x, o.y); });
      objs = objs.filter(o => {
        if (o.y > 320 && o.y < 370 && Math.abs(o.x - bx) < 50) {
          if (o.e === '💣') { score = Math.max(0, score - 3); G.sfx('error'); shake = 0.3; }
          else { score += o.e === '⭐' ? 3 : 1; G.sfx(o.e === '⭐' ? 'sparkle' : 'pop'); }
          setScore(m, score); return false;
        }
        return o.y < 420;
      });
      ctx.font = '64px sans-serif'; ctx.fillText('🧺', bx, 345);
      ctx.restore();
      setTime(m, time);
      if (time <= 0) { alive = false; finish(m, 'catch', score, score / 2); return; }
      requestAnimationFrame(loop);
    }
    stop = () => alive = false;
    requestAnimationFrame(loop);
  }

  // ---------- Memory ----------
  function memoryGame() {
    const m = shell('memory', 'Retourne les cartes et trouve les paires !');
    const set = G.pick([['🐶', '🐱', '🐰', '🦊', '🐼', '🦄', '🐸', '🐵'], ['🍎', '🍕', '🍩', '🍓', '🧁', '🍔', '🍉', '🍪'], ['⚽', '🎸', '🚀', '🎈', '🎁', '👑', '🌈', '⭐']]);
    const cards = set.concat(set).sort(() => Math.random() - 0.5);
    const grid = G.el('div', 'memgrid');
    let open = [], found = 0, moves = 0, lock = false, t0 = performance.now(), alive = true;
    cards.forEach((e, i) => {
      const c = G.el('button', 'mcard', `<span>${e}</span>`);
      c.onclick = () => {
        if (lock || c.classList.contains('up')) return;
        c.classList.add('up'); G.sfx('click'); open.push(c);
        if (open.length === 2) {
          moves++; setScore(m, moves + ' coups');
          const [a, b] = open;
          if (a.textContent === b.textContent) { open = []; found++; G.sfx('sparkle'); a.classList.add('ok'); b.classList.add('ok'); if (found === 8) setTimeout(() => finish(m, 'memory', moves + ' coups', G.clamp(44 - (moves - 8) * 2, 8, 40)), 400); }
          else { lock = true; setTimeout(() => { a.classList.remove('up'); b.classList.remove('up'); open = []; lock = false; }, 750); }
        }
      };
      grid.appendChild(c);
    });
    m.p.querySelector('.garea').appendChild(grid);
    const tm = setInterval(() => { if (alive) setTime(m, (performance.now() - t0) / 1000); }, 500);
    stop = () => { alive = false; clearInterval(tm); };
  }

  // ---------- Tape-taupe ----------
  function moleGame() {
    const m = shell('mole', 'Tape les taupes 🐹 dès qu\'elles sortent ! Le lapin doré 🐰 vaut 3 points.');
    const grid = G.el('div', 'molegrid');
    const holes = [];
    for (let i = 0; i < 9; i++) { const h = G.el('button', 'hole', '<span></span>'); grid.appendChild(h); holes.push(h); }
    m.p.querySelector('.garea').appendChild(grid);
    let score = 0, time = 25, alive = true;
    holes.forEach(h => h.onclick = () => {
      if (!h.classList.contains('up')) return;
      score += h.dataset.v === 'gold' ? 3 : 1; setScore(m, score);
      h.classList.remove('up'); h.classList.add('hit'); G.sfx('boing');
      setTimeout(() => h.classList.remove('hit'), 200);
    });
    const pop = () => {
      if (!alive) return;
      const free = holes.filter(h => !h.classList.contains('up'));
      const h = G.pick(free);
      if (h) {
        const gold = Math.random() < 0.12;
        h.dataset.v = gold ? 'gold' : '';
        h.firstChild.textContent = gold ? '🐰' : '🐹';
        h.classList.add('up');
        setTimeout(() => h.classList.remove('up'), Math.max(500, 1100 - (25 - time) * 25));
      }
      setTimeout(pop, Math.max(280, 700 - (25 - time) * 15));
    };
    pop();
    const tm = setInterval(() => { time -= 0.25; setTime(m, time); if (time <= 0) { alive = false; clearInterval(tm); finish(m, 'mole', score, score); } }, 250);
    stop = () => { alive = false; clearInterval(tm); };
  }

  // ---------- Ballons ----------
  function bubblesGame() {
    const m = shell('bubbles', 'Éclate les ballons avant qu\'ils s\'envolent ! Évite les nuages d\'orage ⛈️.');
    const cv = G.el('canvas'); cv.width = 600; cv.height = 400;
    m.p.querySelector('.garea').appendChild(cv);
    const ctx = cv.getContext('2d');
    let objs = [], score = 0, time = 30, spawnT = 0, last = performance.now(), alive = true, fx = [];
    cv.addEventListener('pointerdown', ev => {
      const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 600, y = (ev.clientY - r.top) / r.height * 400;
      for (let i = objs.length - 1; i >= 0; i--) {
        const o = objs[i];
        if (Math.hypot(o.x - x, o.y - y) < 34) {
          objs.splice(i, 1);
          if (o.bad) { score = Math.max(0, score - 3); G.sfx('error'); } else { score += o.gold ? 3 : 1; G.sfx('pop'); }
          fx.push({ x: o.x, y: o.y, t: 0.4, e: o.bad ? '💥' : '✨' });
          setScore(m, score); break;
        }
      }
    });
    function loop(t) {
      if (!alive) return;
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      time -= dt; spawnT -= dt;
      if (spawnT <= 0) { spawnT = G.rand(0.25, 0.6); const r = Math.random(); objs.push({ x: G.rand(40, 560), y: 430, v: G.rand(90, 170) + (30 - time) * 4, w: G.rand(0, 6), bad: r < 0.12, gold: r > 0.92 }); }
      const g = ctx.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, '#ffb3c6'); g.addColorStop(1, '#bde9ff');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 600, 400);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      objs.forEach(o => { o.y -= o.v * dt; o.w += dt * 2; ctx.font = '52px sans-serif'; ctx.fillText(o.bad ? '⛈️' : o.gold ? '🌟' : '🎈', o.x + Math.sin(o.w) * 10, o.y); });
      objs = objs.filter(o => o.y > -40);
      fx.forEach(f => { f.t -= dt; ctx.font = '40px sans-serif'; ctx.globalAlpha = Math.max(0, f.t / 0.4); ctx.fillText(f.e, f.x, f.y); ctx.globalAlpha = 1; });
      fx = fx.filter(f => f.t > 0);
      setTime(m, time);
      if (time <= 0) { alive = false; finish(m, 'bubbles', score, score / 2); return; }
      requestAnimationFrame(loop);
    }
    stop = () => alive = false;
    requestAnimationFrame(loop);
  }

  // ---------- Simon ----------
  function simonGame() {
    const m = shell('simon', 'Regarde et écoute la séquence, puis répète-la !');
    const pads = G.el('div', 'simon');
    const cols = ['#ff5c8a', '#ffd23f', '#3ccf91', '#4aa3ff'], notes = [0, 4, 7, 12], ems = ['🐱', '🌟', '🐸', '🐳'];
    const btns = cols.map((c, i) => { const b = G.el('button', 'pad', ems[i]); b.style.background = c; pads.appendChild(b); return b; });
    m.p.querySelector('.garea').appendChild(pads);
    let seq = [], pos = 0, listen = false, alive = true;
    const flash = i => { btns[i].classList.add('lit'); G.sfx('note', notes[i] + 12); setTimeout(() => btns[i].classList.remove('lit'), 320); };
    const next = () => {
      seq.push(G.ri(0, 3)); pos = 0; listen = false; setScore(m, 'Niveau ' + seq.length);
      seq.forEach((v, k) => setTimeout(() => { if (alive) flash(v); }, 600 + k * 520));
      setTimeout(() => { listen = true; }, 600 + seq.length * 520);
    };
    btns.forEach((b, i) => b.onclick = () => {
      if (!listen) return;
      flash(i);
      if (seq[pos] !== i) { listen = false; G.sfx('error'); setTimeout(() => finish(m, 'simon', 'Niveau ' + (seq.length - 1), (seq.length - 1) * 3), 500); return; }
      pos++;
      if (pos === seq.length) { listen = false; G.sfx('sparkle'); setTimeout(next, 600); }
    });
    stop = () => alive = false;
    setTimeout(next, 400);
  }

  M.open = (id) => {
    G.cancelDrag();
    ({ catch: catchGame, memory: memoryGame, mole: moleGame, bubbles: bubblesGame, simon: simonGame }[id] || catchGame)();
  };
})();
