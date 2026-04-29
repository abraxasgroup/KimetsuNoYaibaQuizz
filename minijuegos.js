/**
 * ================================================
 * KIMETSU NO YAIBA — MINIJUEGOS v2.0
 * minijuegos.js
 *
 * Módulos:
 *  1. Router extendido
 *  2. Ahorcado del Cazador (mejorado)
 *  3. Tateti: Rengoku vs Akaza (caras en canvas)
 *  4. Forja tu Katana (mejorado)
 *  5. Memoria Nichirin (nuevo)
 *  6. Sistema de Ranking global (localStorage)
 * ================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   ROUTER
───────────────────────────────────────────── */
window.KimetsuRouter = (function () {
  const ALL_SCREENS = [
    'menu-screen', 'quiz-screen', 'result-screen',
    'hangman-screen', 'tateti-screen', 'katana-screen', 'memoria-screen',
  ];
  function showScreen(id) {
    ALL_SCREENS.forEach(sid => {
      const el = document.getElementById(sid);
      if (!el) return;
      el.classList.remove('active');
      el.classList.add('hidden');
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.remove('hidden');
      // Forzar reflow para que la transición funcione
      void target.offsetWidth;
      target.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  return { showScreen };
})();

/* ─────────────────────────────────────────────
   RANKING GLOBAL (localStorage)
───────────────────────────────────────────── */
const Ranking = (function () {
  const KEY = 'kny_ranking_v2';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(records) {
    try { localStorage.setItem(KEY, JSON.stringify(records)); } catch {}
  }

  function add(name, score, mode, time) {
    const records = load();
    records.push({ name, score, mode, time, date: Date.now() });
    records.sort((a, b) => b.score - a.score);
    save(records.slice(0, 20)); // Máximo 20 registros
  }

  function getTop(mode, n = 5) {
    return load().filter(r => !mode || r.mode === mode).slice(0, n);
  }

  function renderPodium(mode, container) {
    const top = getTop(mode, 5);
    if (!top.length) {
      container.innerHTML = '<p style="color:var(--text-muted,#8A7A6A);font-style:italic;text-align:center;font-size:.85rem">Sé el primero en registrar tu puntaje</p>';
      return;
    }
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    container.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-family:var(--font-display,'Cinzel',serif);font-size:.78rem">
        <thead>
          <tr style="color:var(--red,#C0392B);letter-spacing:.1em">
            <th style="padding:.4rem .6rem;text-align:left">#</th>
            <th style="padding:.4rem .6rem;text-align:left">Jugador</th>
            <th style="padding:.4rem .6rem;text-align:right">Puntaje</th>
            <th style="padding:.4rem .6rem;text-align:right">Tiempo</th>
          </tr>
        </thead>
        <tbody>
          ${top.map((r, i) => `
            <tr style="border-top:1px solid rgba(255,255,255,.05);color:var(--text-primary,#F0E6D3)">
              <td style="padding:.4rem .6rem">${medals[i]}</td>
              <td style="padding:.4rem .6rem">${escHtml(r.name)}</td>
              <td style="padding:.4rem .6rem;text-align:right;color:var(--gold,#C9A84C)">${r.score}</td>
              <td style="padding:.4rem .6rem;text-align:right;color:var(--text-muted,#8A7A6A)">${r.time ? r.time + 's' : '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  return { add, getTop, renderPodium };
})();

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */
function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ripple(btn) {
  const r = document.createElement('span');
  r.style.cssText = `
    position:absolute;border-radius:50%;pointer-events:none;
    background:rgba(255,255,255,.25);transform:scale(0);
    width:100px;height:100px;left:50%;top:50%;
    margin-left:-50px;margin-top:-50px;
    animation:kny-ripple .5s ease-out forwards;`;
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(r);
  setTimeout(() => r.remove(), 500);
}

// Inyectar keyframe de ripple una sola vez
if (!document.getElementById('kny-ripple-style')) {
  const s = document.createElement('style');
  s.id = 'kny-ripple-style';
  s.textContent = `
    @keyframes kny-ripple { to { transform:scale(3); opacity:0; } }
    @keyframes kny-shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
    @keyframes kny-popIn  { from{transform:scale(.7);opacity:0} to{transform:scale(1);opacity:1} }
    .screen { transition: opacity .25s ease; }
    .screen.hidden { opacity:0; pointer-events:none; }
    .screen.active { opacity:1; pointer-events:all; }
  `;
  document.head.appendChild(s);
}


/* ═══════════════════════════════════════════════
   MÓDULO 1: AHORCADO DEL CAZADOR v2
═══════════════════════════════════════════════ */
const Hangman = (function () {

  const WORDS = [
    { word: 'TANJIRO',      hint: 'El protagonista, portador de la marca del sol' },
    { word: 'NEZUKO',       hint: 'Hermana convertida en demonio, duerme en una caja' },
    { word: 'HINOKAMI',     hint: 'Respiración del dios del fuego' },
    { word: 'KAGURA',       hint: 'Danza sagrada del clan Kamado' },
    { word: 'RENGOKU',      hint: 'Pilar de la Llama, muere en el Tren Mugen' },
    { word: 'SHINOBU',      hint: 'Pilar del Insecto, usa veneno en lugar de fuerza' },
    { word: 'MUZAN',        hint: 'El Rey Demonio, creador de todos los demonios' },
    { word: 'AKAZA',        hint: 'Luna Superior Tres, odia a los débiles' },
    { word: 'ZENITSU',      hint: 'Solo domina una forma pero la perfecciona al extremo' },
    { word: 'INOSUKE',      hint: 'Criado por jabalíes en el monte' },
    { word: 'HASHIRA',      hint: 'Los nueve pilares de la Corporación' },
    { word: 'KOKUSHIBO',    hint: 'Luna Superior Uno, hermano de Yoriichi' },
    { word: 'GYOMEI',       hint: 'Pilar de la Piedra, el más poderoso de los Hashira' },
    { word: 'YORIICHI',     hint: 'El espadachín más poderoso de la historia, respiración solar' },
    { word: 'NICHIRIN',     hint: 'Espadas que cambian de color con su dueño' },
    { word: 'TAMAYO',       hint: 'Médico demonio aliada de Tanjiro' },
    { word: 'KANAO',        hint: 'Discípula de Shinobu, ojos del color del sol poniente' },
    { word: 'SANEMI',       hint: 'Pilar del Viento, sangre rara que atrae demonios' },
    { word: 'MUICHIRO',     hint: 'Pilar de la Niebla, descendiente de Yoriichi' },
    { word: 'MITSURI',      hint: 'Pilar del Amor, músculos únicos en el mundo' },
    { word: 'OBANAI',       hint: 'Pilar de la Serpiente, espada retorcida' },
    { word: 'DOMA',         hint: 'Luna Superior Dos, incapaz de sentir emociones reales' },
    { word: 'HANTENGU',     hint: 'Luna Superior Cuatro, sus emociones cobran forma propia' },
    { word: 'WISTERIA',     hint: 'Flor letal para los demonios' },
    { word: 'UBUYASHIKI',   hint: 'Líder enfermo de la Corporación de Cazadores' },
  ];

  const MAX_ERRORS = 7;
  let state = {};

  function drawHangman(canvas, errors) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const draw = fn => { ctx.beginPath(); fn(); ctx.stroke(); };

    draw(() => { ctx.moveTo(20, H - 10); ctx.lineTo(W - 20, H - 10); });
    draw(() => { ctx.moveTo(60, H - 10); ctx.lineTo(60, 20); });
    draw(() => { ctx.moveTo(60, 20); ctx.lineTo(W / 2, 20); });
    draw(() => { ctx.moveTo(W / 2, 20); ctx.lineTo(W / 2, 55); });

    if (errors < 1) return;

    const cx = W / 2;
    const parts = [
      () => {
        ctx.beginPath();
        ctx.arc(cx, 72, 17, 0, Math.PI * 2);
        ctx.strokeStyle = '#E74C3C';
        ctx.stroke();
        if (errors >= MAX_ERRORS) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          [[cx - 8, 65, cx - 4, 69], [cx - 4, 65, cx - 8, 69],
           [cx + 4, 65, cx + 8, 69], [cx + 8, 65, cx + 4, 69]].forEach(([x1, y1, x2, y2]) => {
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          });
          ctx.strokeStyle = '#C0392B';
          ctx.lineWidth = 3;
        }
      },
      () => draw(() => { ctx.moveTo(cx, 89); ctx.lineTo(cx, 140); }),
      () => draw(() => { ctx.moveTo(cx, 100); ctx.lineTo(cx - 30, 125); }),
      () => draw(() => { ctx.moveTo(cx, 100); ctx.lineTo(cx + 30, 125); }),
      () => draw(() => { ctx.moveTo(cx, 140); ctx.lineTo(cx - 25, 175); }),
      () => draw(() => { ctx.moveTo(cx, 140); ctx.lineTo(cx + 25, 175); }),
      () => {
        ctx.beginPath();
        ctx.arc(cx, 65, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#C0392B';
        ctx.fill();
      },
    ];

    for (let i = 0; i < errors && i < parts.length; i++) {
      ctx.strokeStyle = '#C0392B';
      ctx.lineWidth = 3;
      parts[i]();
    }
  }

  function renderWord(container) {
    container.innerHTML = state.word.split('').map(ch =>
      `<span class="hm-letter ${state.guessed.has(ch) ? 'revealed' : ''}">${state.guessed.has(ch) ? ch : '_'}</span>`
    ).join('');
  }

  function renderKeyboard(container) {
    const ROWS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];
    container.innerHTML = ROWS.map(row =>
      `<div class="hm-kb-row">${row.split('').map(ch => {
        const correct = state.guessed.has(ch) && state.word.includes(ch);
        const wrong = state.guessed.has(ch) && !state.word.includes(ch);
        return `<button class="hm-key ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}"
                        data-key="${ch}" ${state.guessed.has(ch) || state.gameOver ? 'disabled' : ''}>${ch}</button>`;
      }).join('')}</div>`
    ).join('');
  }

  function guess(letter, canvas, wordEl, kbEl, statusEl, errorsEl) {
    if (state.gameOver || state.guessed.has(letter)) return;
    state.guessed.add(letter);

    if (!state.word.includes(letter)) {
      state.errors++;
      // Animación shake en el canvas
      canvas.style.animation = 'none';
      void canvas.offsetWidth;
      canvas.style.animation = 'kny-shake .4s ease';
    }

    const won = state.word.split('').every(ch => state.guessed.has(ch));
    state.won = won;
    if (won || state.errors >= MAX_ERRORS) state.gameOver = true;

    drawHangman(canvas, state.errors);
    renderWord(wordEl);
    renderKeyboard(kbEl);
    errorsEl.textContent = `Errores: ${state.errors} / ${MAX_ERRORS}`;

    if (state.gameOver) {
      statusEl.className = 'hm-status ' + (won ? 'win' : 'lose');
      statusEl.innerHTML = won
        ? `🔥 ¡Victoria! La palabra era <strong>${state.word}</strong>`
        : `💀 Derrotado. Era <strong>${state.word}</strong>`;
    }
  }

  function init() {
    const screen = document.getElementById('hangman-screen');
    const entry = WORDS[Math.floor(Math.random() * WORDS.length)];
    state = { word: entry.word, hint: entry.hint, guessed: new Set(), errors: 0, gameOver: false, won: false };

    screen.innerHTML = `
      <div class="mini-container">
        <div class="mini-header">
          <button class="btn-back" id="hm-btnback">← Menú</button>
          <span class="mode-label">⚔️ Ahorcado del Cazador</span>
        </div>
        <div class="hm-layout">
          <div class="hm-left">
            <canvas id="hm-canvas" width="160" height="210" class="hm-canvas"></canvas>
            <p class="hm-hint">Pista: <em>${entry.hint}</em></p>
            <p class="hm-errors" id="hm-errors">Errores: 0 / ${MAX_ERRORS}</p>
          </div>
          <div class="hm-right">
            <div class="hm-word-row" id="hm-word"></div>
            <div class="hm-status" id="hm-status"></div>
            <div class="hm-keyboard" id="hm-keyboard"></div>
            <button class="btn-primary hm-restart" id="hm-restart">Nueva Palabra</button>
          </div>
        </div>
      </div>`;

    document.getElementById('hm-btnback').addEventListener('click', () => KimetsuRouter.showScreen('menu-screen'));

    const canvas = document.getElementById('hm-canvas');
    const wordEl = document.getElementById('hm-word');
    const kbEl = document.getElementById('hm-keyboard');
    const statusEl = document.getElementById('hm-status');
    const errorsEl = document.getElementById('hm-errors');

    drawHangman(canvas, 0);
    renderWord(wordEl);
    renderKeyboard(kbEl);

    kbEl.addEventListener('click', e => {
      const btn = e.target.closest('.hm-key');
      if (btn) { ripple(btn); guess(btn.dataset.key, canvas, wordEl, kbEl, statusEl, errorsEl); }
    });

    const keyHandler = e => {
      const k = e.key.toUpperCase();
      if (/^[A-ZÁÉÍÓÚÑ]$/.test(k)) guess(k, canvas, wordEl, kbEl, statusEl, errorsEl);
    };
    document.addEventListener('keydown', keyHandler);

    document.getElementById('hm-restart').addEventListener('click', () => {
      document.removeEventListener('keydown', keyHandler);
      init();
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════════════
   MÓDULO 2: TATETI — RENGOKU VS AKAZA
   Caras dibujadas con Canvas 2D
═══════════════════════════════════════════════ */
const Tateti = (function () {

  const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  let state = {};

  // ── Dibuja la cara de RENGOKU en un canvas ──
  function drawRengoku(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    // Fondo circular cálido
    const bg = ctx.createRadialGradient(cx, cy, 2, cx, cy, W * .48);
    bg.addColorStop(0, '#3D1500');
    bg.addColorStop(1, '#1a0800');
    ctx.beginPath();
    ctx.arc(cx, cy, W * .46, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();

    // Glow llama
    ctx.shadowColor = '#FF6B35';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, W * .46, 0, Math.PI * 2);
    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Cabeza
    ctx.fillStyle = '#F5CBA7';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, W * .28, H * .32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabello amarillo-dorado (flequillo largo característico)
    ctx.fillStyle = '#F4D03F';
    // Parte superior del cabello
    ctx.beginPath();
    ctx.ellipse(cx, cy - H * .22, W * .3, H * .16, 0, Math.PI, 0);
    ctx.fill();
    // Mechones laterales
    ctx.beginPath();
    ctx.ellipse(cx - W * .24, cy - H * .05, W * .1, H * .22, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + W * .24, cy - H * .05, W * .1, H * .22, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Punta del flequillo con degradado rojo-naranja
    const hairGrad = ctx.createLinearGradient(cx - W * .3, cy - H * .35, cx - W * .3, cy + H * .1);
    hairGrad.addColorStop(0, '#F4D03F');
    hairGrad.addColorStop(0.6, '#E67E22');
    hairGrad.addColorStop(1, '#C0392B');
    ctx.fillStyle = hairGrad;
    // Mechones con punta roja
    [[-W*.28, H*.12], [-W*.18, H*.18], [W*.18, H*.18], [W*.28, H*.12]].forEach(([ox, oy]) => {
      ctx.beginPath();
      ctx.ellipse(cx + ox, cy - H * .05 + oy * .5, W * .07, H * .14, ox < 0 ? -.3 : .3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Cejas gruesas y expresivas
    ctx.fillStyle = '#E67E22';
    ctx.beginPath();
    ctx.ellipse(cx - W * .12, cy - H * .08, W * .09, H * .03, -.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + W * .12, cy - H * .08, W * .09, H * .03, .2, 0, Math.PI * 2);
    ctx.fill();

    // Ojos — blancos
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(cx - W * .12, cy - H * .02, W * .08, H * .07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + W * .12, cy - H * .02, W * .08, H * .07, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris — rojo fuego característico de Rengoku
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.arc(cx - W * .12, cy - H * .02, W * .055, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + W * .12, cy - H * .02, W * .055, 0, Math.PI * 2);
    ctx.fill();

    // Pupila
    ctx.fillStyle = '#1a0000';
    ctx.beginPath();
    ctx.arc(cx - W * .12, cy - H * .02, W * .025, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + W * .12, cy - H * .02, W * .025, 0, Math.PI * 2);
    ctx.fill();

    // Brillo en ojos
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.beginPath();
    ctx.arc(cx - W * .1, cy - H * .04, W * .016, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + W * .14, cy - H * .04, W * .016, 0, Math.PI * 2);
    ctx.fill();

    // Nariz pequeña
    ctx.strokeStyle = '#C49A6C';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - W * .03, cy + H * .04);
    ctx.lineTo(cx, cy + H * .07);
    ctx.lineTo(cx + W * .03, cy + H * .04);
    ctx.stroke();

    // Sonrisa entusiasta NN
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy + H * .1, W * .12, .2, Math.PI - .2);
    ctx.stroke();

    // Marcas rojas (rayas características bajo los ojos)
    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    // Izquierda
    ctx.beginPath(); ctx.moveTo(cx - W * .2, cy + H * .04); ctx.lineTo(cx - W * .1, cy + H * .03); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - W * .19, cy + H * .07); ctx.lineTo(cx - W * .1, cy + H * .06); ctx.stroke();
    // Derecha
    ctx.beginPath(); ctx.moveTo(cx + W * .1, cy + H * .03); ctx.lineTo(cx + W * .2, cy + H * .04); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + W * .1, cy + H * .06); ctx.lineTo(cx + W * .19, cy + H * .07); ctx.stroke();

    // Cuello/uniforme naranja
    ctx.fillStyle = '#D35400';
    ctx.fillRect(cx - W * .14, cy + H * .3, W * .28, H * .12);
  }

  // ── Dibuja la cara de AKAZA en un canvas ──
  function drawAkaza(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    // Fondo circular oscuro-azulado
    const bg = ctx.createRadialGradient(cx, cy, 2, cx, cy, W * .48);
    bg.addColorStop(0, '#0D0020');
    bg.addColorStop(1, '#050010');
    ctx.beginPath();
    ctx.arc(cx, cy, W * .46, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();

    // Glow azul/púrpura de Akaza
    ctx.shadowColor = '#8B008B';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, W * .46, 0, Math.PI * 2);
    ctx.strokeStyle = '#6A0DAD';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Cabeza — piel pálida azulada
    ctx.fillStyle = '#D8EAF0';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, W * .28, H * .32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabello rosa/magenta revuelto de Akaza
    ctx.fillStyle = '#FF69B4';
    // Base del cabello
    ctx.beginPath();
    ctx.ellipse(cx, cy - H * .22, W * .3, H * .15, 0, Math.PI, 0);
    ctx.fill();
    // Mechones puntiagudos hacia arriba (estilo punk)
    const spikes = [
      { ox: -W * .2, oy: -H * .3, rx: W * .07, ry: H * .14, angle: -.5 },
      { ox: -W * .08, oy: -H * .35, rx: W * .06, ry: H * .16, angle: -.15 },
      { ox: W * .05, oy: -H * .37, rx: W * .06, ry: H * .16, angle: .1 },
      { ox: W * .18, oy: -H * .33, rx: W * .07, ry: H * .14, angle: .45 },
    ];
    spikes.forEach(s => {
      ctx.beginPath();
      ctx.ellipse(cx + s.ox, cy + s.oy + H * .1, s.rx, s.ry, s.angle, 0, Math.PI * 2);
      ctx.fillStyle = '#FF1493';
      ctx.fill();
    });
    // Lateral izquierdo
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.ellipse(cx - W * .27, cy - H * .05, W * .09, H * .2, -.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + W * .27, cy - H * .05, W * .09, H * .2, .3, 0, Math.PI * 2);
    ctx.fill();

    // TATUAJES característicos de Akaza — líneas azul oscuro
    ctx.strokeStyle = '#1a0050';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    // Tatuaje frente (curvas)
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy - H * .28 + i * H * .045, W * .15, .3, Math.PI - .3);
      ctx.stroke();
    }
    // Tatuaje mejilla izquierda
    ctx.strokeStyle = '#3300AA';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - W * .26 + i * W * .02, cy - H * .02);
      ctx.lineTo(cx - W * .14 + i * W * .02, cy + H * .1);
      ctx.stroke();
    }
    // Tatuaje mejilla derecha (simétrico)
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + W * .14 + i * W * .02, cy - H * .02);
      ctx.lineTo(cx + W * .26 + i * W * .02, cy + H * .1);
      ctx.stroke();
    }

    // Cejas — muy expresivas, anguladas hacia abajo al centro (gesto fiero)
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.save();
    ctx.translate(cx - W * .12, cy - H * .1);
    ctx.rotate(.35);
    ctx.ellipse(0, 0, W * .1, H * .03, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.save();
    ctx.translate(cx + W * .12, cy - H * .1);
    ctx.rotate(-.35);
    ctx.ellipse(0, 0, W * .1, H * .03, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Ojos — blancos con iris azul eléctrico de Akaza
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(cx - W * .12, cy - H * .02, W * .08, H * .07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + W * .12, cy - H * .02, W * .08, H * .07, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris azul característico
    ctx.fillStyle = '#0099FF';
    ctx.beginPath();
    ctx.arc(cx - W * .12, cy - H * .02, W * .055, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + W * .12, cy - H * .02, W * .055, 0, Math.PI * 2);
    ctx.fill();

    // Pupila
    ctx.fillStyle = '#000820';
    ctx.beginPath();
    ctx.arc(cx - W * .12, cy - H * .02, W * .028, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + W * .12, cy - H * .02, W * .028, 0, Math.PI * 2);
    ctx.fill();

    // Brillo
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.beginPath();
    ctx.arc(cx - W * .1, cy - H * .04, W * .018, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + W * .14, cy - H * .04, W * .018, 0, Math.PI * 2);
    ctx.fill();

    // Nariz
    ctx.strokeStyle = '#A0B8C0';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - W * .03, cy + H * .04);
    ctx.lineTo(cx, cy + H * .07);
    ctx.lineTo(cx + W * .03, cy + H * .04);
    ctx.stroke();

    // Expresión seria / ligeramente sonriente (arrogante)
    ctx.strokeStyle = '#99CCDD';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + H * .13, W * .09, .1, Math.PI - .1);
    ctx.stroke();

    // Cuello / uniforme azul oscuro de Akaza
    ctx.fillStyle = '#1A0050';
    ctx.fillRect(cx - W * .14, cy + H * .3, W * .28, H * .12);
  }

  // Genera canvas de Rengoku/Akaza como elemento
  function makeCharCanvas(charType, size = 56) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    c.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;display:block;`;
    if (charType === 'rengoku') drawRengoku(c);
    else drawAkaza(c);
    return c;
  }

  // ── Lógica ──
  function checkWinner(board) {
    for (const [a, b, c] of WINS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c])
        return { winner: board[a], line: [a, b, c] };
    }
    if (board.every(c => c !== null)) return { winner: 'draw' };
    return null;
  }

  function minimax(board, isMax) {
    const res = checkWinner(board);
    if (res) {
      if (res.winner === state.aiSymbol) return 10;
      if (res.winner === state.playerSymbol) return -10;
      return 0;
    }
    const scores = [];
    board.forEach((cell, i) => {
      if (cell) return;
      board[i] = isMax ? state.aiSymbol : state.playerSymbol;
      scores.push(minimax(board, !isMax));
      board[i] = null;
    });
    return isMax ? Math.max(...scores) : Math.min(...scores);
  }

  function aiBestMove(board) {
    let best = -Infinity, move = -1;
    board.forEach((cell, i) => {
      if (cell) return;
      board[i] = state.aiSymbol;
      const score = minimax(board, false);
      board[i] = null;
      if (score > best) { best = score; move = i; }
    });
    return move;
  }

  // Renderiza el tablero con caras en canvas
  function renderBoard(boardEl) {
    boardEl.innerHTML = '';
    state.board.forEach((cell, i) => {
      const div = document.createElement('div');
      const res = checkWinner(state.board);
      const isWinning = res?.line?.includes(i);
      div.className = `tt-cell ${cell ? 'taken' : ''} ${isWinning ? 'winning-cell' : ''}`;
      div.dataset.idx = i;

      if (cell) {
        const charType = cell === state.playerSymbol
          ? state.playerChar
          : state.aiChar;
        const c = makeCharCanvas(charType, 50);
        c.style.pointerEvents = 'none';
        div.appendChild(c);
      }

      boardEl.appendChild(div);
    });
  }

  function renderStatus(statusEl) {
    const res = checkWinner(state.board);
    if (!res) {
      statusEl.textContent = state.currentTurn === state.playerSymbol
        ? `Tu turno — ${state.playerLabel}`
        : `IA pensando... — ${state.aiLabel}`;
      statusEl.className = 'tt-status';
      return;
    }
    if (res.winner === 'draw') {
      statusEl.textContent = '🤝 Empate legendario';
      statusEl.className = 'tt-status draw';
    } else if (res.winner === state.playerSymbol) {
      statusEl.textContent = `¡${state.playerLabel} victorioso!`;
      statusEl.className = 'tt-status win';
    } else {
      statusEl.textContent = `${state.aiLabel} dominó el tablero`;
      statusEl.className = 'tt-status lose';
    }
  }

  function playerMove(idx, boardEl, statusEl) {
    if (state.gameOver || state.board[idx] || state.currentTurn !== state.playerSymbol) return;
    state.board[idx] = state.playerSymbol;

    const res = checkWinner(state.board);
    if (res) { state.gameOver = true; renderBoard(boardEl); renderStatus(statusEl); return; }

    state.currentTurn = state.aiSymbol;
    renderBoard(boardEl);
    renderStatus(statusEl);

    setTimeout(() => {
      const move = aiBestMove([...state.board]);
      if (move !== -1) state.board[move] = state.aiSymbol;
      const res2 = checkWinner(state.board);
      if (res2) state.gameOver = true;
      state.currentTurn = state.playerSymbol;
      renderBoard(boardEl);
      renderStatus(statusEl);
    }, 420);
  }

  // Pantalla de selección con preview de caras
  function renderSelection(screen) {
    screen.innerHTML = `
      <div class="mini-container">
        <div class="mini-header">
          <button class="btn-back" id="tt-btnback">← Menú</button>
          <span class="mode-label">♟️ Tateti Kimetsu</span>
        </div>
        <div class="tt-selection">
          <h2 class="tt-sel-title">Elige tu bando</h2>
          <div class="tt-bando-grid">
            <button class="tt-bando-btn" data-side="rengoku" id="tt-btn-rengoku">
              <div id="tt-prev-rengoku" style="display:flex;justify-content:center;margin-bottom:.4rem"></div>
              <div class="tt-bando-name">Rengoku</div>
              <div class="tt-bando-sub">Pilar de la Llama</div>
              <div class="tt-bando-desc">Defiendes a la humanidad.<br>Juegas primero.</div>
            </button>
            <div class="tt-vs">VS</div>
            <button class="tt-bando-btn" data-side="akaza" id="tt-btn-akaza">
              <div id="tt-prev-akaza" style="display:flex;justify-content:center;margin-bottom:.4rem"></div>
              <div class="tt-bando-name">Akaza</div>
              <div class="tt-bando-sub">Luna Superior Tres</div>
              <div class="tt-bando-desc">Te unes a las sombras.<br>La IA juega primero.</div>
            </button>
          </div>
        </div>
      </div>`;

    document.getElementById('tt-btnback').addEventListener('click', () => KimetsuRouter.showScreen('menu-screen'));

    // Insertar caras en los botones
    document.getElementById('tt-prev-rengoku').appendChild(makeCharCanvas('rengoku', 72));
    document.getElementById('tt-prev-akaza').appendChild(makeCharCanvas('akaza', 72));

    screen.querySelectorAll('.tt-bando-btn').forEach(btn => {
      btn.addEventListener('click', () => startGame(btn.dataset.side, screen));
    });
  }

  function startGame(side, screen) {
    const playerFirst = side === 'rengoku';
    state = {
      board: Array(9).fill(null),
      playerSymbol: playerFirst ? 'X' : 'O',
      aiSymbol: playerFirst ? 'O' : 'X',
      currentTurn: 'X',
      gameOver: false,
      playerFirst,
      playerLabel: playerFirst ? 'Rengoku' : 'Akaza',
      aiLabel: playerFirst ? 'Akaza' : 'Rengoku',
      playerChar: playerFirst ? 'rengoku' : 'akaza',
      aiChar: playerFirst ? 'akaza' : 'rengoku',
    };

    screen.innerHTML = `
      <div class="mini-container">
        <div class="mini-header">
          <button class="btn-back" id="tt-btnback2">← Menú</button>
          <span class="mode-label">♟️ Tateti Kimetsu</span>
        </div>
        <div class="tt-game-layout">
          <div class="tt-legend" id="tt-legend-row" style="display:flex;gap:1rem;align-items:center;justify-content:center;margin-bottom:.5rem"></div>
          <p class="tt-status" id="tt-status"></p>
          <div class="tt-board" id="tt-board"></div>
          <div class="tt-actions">
            <button class="btn-primary" id="tt-restart">Revancha</button>
            <button class="btn-secondary" id="tt-cambiar">Cambiar bando</button>
          </div>
        </div>
      </div>`;

    document.getElementById('tt-btnback2').addEventListener('click', () => KimetsuRouter.showScreen('menu-screen'));

    // Leyenda con caras reales
    const legRow = document.getElementById('tt-legend-row');
    const legP = document.createElement('div');
    legP.style.cssText = 'display:flex;align-items:center;gap:.4rem;font-family:var(--font-display,"Cinzel",serif);font-size:.78rem;color:var(--text-muted,#8A7A6A)';
    legP.appendChild(makeCharCanvas(state.playerChar, 30));
    legP.appendChild(document.createTextNode(` Tú (${state.playerLabel})`));
    const legSep = document.createElement('span');
    legSep.textContent = ' vs ';
    legSep.style.color = 'var(--red,#C0392B)';
    const legA = document.createElement('div');
    legA.style.cssText = legP.style.cssText;
    legA.appendChild(makeCharCanvas(state.aiChar, 30));
    legA.appendChild(document.createTextNode(` IA (${state.aiLabel})`));
    legRow.append(legP, legSep, legA);

    const boardEl = document.getElementById('tt-board');
    const statusEl = document.getElementById('tt-status');

    if (!playerFirst) {
      const move = aiBestMove([...state.board]);
      if (move !== -1) state.board[move] = state.aiSymbol;
      state.currentTurn = state.playerSymbol;
    }

    renderBoard(boardEl);
    renderStatus(statusEl);

    boardEl.addEventListener('click', e => {
      const cell = e.target.closest('.tt-cell');
      if (cell) playerMove(parseInt(cell.dataset.idx), boardEl, statusEl);
    });

    document.getElementById('tt-restart').addEventListener('click', () => startGame(side, screen));
    document.getElementById('tt-cambiar').addEventListener('click', () => renderSelection(screen));
  }

  function init() {
    renderSelection(document.getElementById('tateti-screen'));
  }

  return { init };
})();


/* ═══════════════════════════════════════════════
   MÓDULO 3: FORJA TU KATANA (sin cambios de fondo)
═══════════════════════════════════════════════ */
const KatanaForge = (function () {
  const BLADE_COLORS = [
    { id: 'negro',   label: 'Negro',   hex: '#1a1a1a', glow: '#444444', lore: 'El color más raro. Portentoso destino.' },
    { id: 'agua',    label: 'Agua',    hex: '#2E86AB', glow: '#5BC8F5', lore: 'Respiración del Agua — Giyu Tomioka.' },
    { id: 'llama',   label: 'Llama',   hex: '#C0392B', glow: '#FF6B35', lore: 'Respiración de la Llama — Rengoku.' },
    { id: 'trueno',  label: 'Trueno',  hex: '#F4D03F', glow: '#FFE066', lore: 'Respiración del Trueno — Zenitsu.' },
    { id: 'insecto', label: 'Insecto', hex: '#8E44AD', glow: '#D7A1F9', lore: 'Respiración del Insecto — Shinobu.' },
    { id: 'viento',  label: 'Viento',  hex: '#27AE60', glow: '#82E0AA', lore: 'Respiración del Viento — Sanemi.' },
    { id: 'niebla',  label: 'Niebla',  hex: '#85C1E9', glow: '#BEE3F8', lore: 'Respiración de la Niebla — Muichiro.' },
    { id: 'amor',    label: 'Amor',    hex: '#F1948A', glow: '#FADADD', lore: 'Respiración del Amor — Mitsuri.' },
    { id: 'piedra',  label: 'Piedra',  hex: '#95A5A6', glow: '#D5D8DC', lore: 'Respiración de la Piedra — Gyomei.' },
  ];
  const TSUBA_STYLES = [
    { id: 'redondo',   label: 'Redonda',   icon: '⬤' },
    { id: 'floral',    label: 'Floral',    icon: '✿' },
    { id: 'hexagonal', label: 'Hexagonal', icon: '⬡' },
    { id: 'ola',       label: 'Ola',       icon: '〜' },
  ];
  const ITO_COLORS = [
    { id: 'rojo',   label: 'Rojo',   hex: '#C0392B' },
    { id: 'negro',  label: 'Negro',  hex: '#1C1C1C' },
    { id: 'blanco', label: 'Blanco', hex: '#F0E6D3' },
    { id: 'verde',  label: 'Verde',  hex: '#1E6B44' },
    { id: 'dorado', label: 'Dorado', hex: '#C9A84C' },
    { id: 'azul',   label: 'Azul',   hex: '#2E86AB' },
    { id: 'morado', label: 'Morado', hex: '#6C3483' },
    { id: 'rosa',   label: 'Rosa',   hex: '#E91E8C' },
  ];

  let sel = { blade: BLADE_COLORS[0], tsuba: TSUBA_STYLES[0], ito: ITO_COLORS[0] };

  function drawKatana(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const blade = sel.blade, itoHex = sel.ito.hex;
    const bladeX = 80, bladeEnd = W - 30, bladeTop = H / 2 - 12, bladeTip = H / 2, bladeBot = H / 2 + 12;

    ctx.save();
    ctx.shadowColor = blade.glow;
    ctx.shadowBlur = 22;
    const bladeGrad = ctx.createLinearGradient(bladeX, bladeTop, bladeX, bladeBot);
    bladeGrad.addColorStop(0, blade.hex + 'CC');
    bladeGrad.addColorStop(0.4, blade.hex);
    bladeGrad.addColorStop(0.7, '#ffffff33');
    bladeGrad.addColorStop(1, blade.hex + '99');
    ctx.beginPath();
    ctx.moveTo(bladeX, bladeTop);
    ctx.lineTo(bladeEnd, bladeTip);
    ctx.lineTo(bladeX, bladeBot);
    ctx.closePath();
    ctx.fillStyle = bladeGrad;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bladeX, bladeTop + 4);
    ctx.lineTo(bladeEnd, bladeTip);
    ctx.strokeStyle = '#ffffff55';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    const tX = bladeX, tY = H / 2;
    drawTsuba(ctx, tX, tY, blade.hex, sel.tsuba.id);

    ctx.fillStyle = '#B8860B';
    ctx.fillRect(bladeX - 14, H / 2 - 8, 14, 16);
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 1;
    ctx.strokeRect(bladeX - 14, H / 2 - 8, 14, 16);

    const handleX = 10, handleW = bladeX - 14 - handleX, handleH = 20, handleY = H / 2 - handleH / 2;
    const woodGrad = ctx.createLinearGradient(handleX, handleY, handleX, handleY + handleH);
    woodGrad.addColorStop(0, '#5C3A1E');
    woodGrad.addColorStop(0.5, '#8B5E3C');
    woodGrad.addColorStop(1, '#3D1F0A');
    ctx.fillStyle = woodGrad;
    ctx.beginPath();
    ctx.roundRect(handleX, handleY, handleW, handleH, 4);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(handleX, handleY, handleW, handleH, 4);
    ctx.clip();
    ctx.strokeStyle = itoHex;
    ctx.lineWidth = 3.5;
    ctx.globalAlpha = 0.75;
    for (let ix = handleX - handleH; ix < handleX + handleW + handleH; ix += 9) {
      ctx.beginPath();
      ctx.moveTo(ix, handleY - 2);
      ctx.lineTo(ix + handleH, handleY + handleH + 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    ctx.strokeStyle = '#1a0a00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(handleX, handleY, handleW, handleH, 4);
    ctx.stroke();
    const kashiraGrad = ctx.createLinearGradient(handleX - 8, handleY, handleX - 8, handleY + handleH);
    kashiraGrad.addColorStop(0, '#888');
    kashiraGrad.addColorStop(0.5, '#CCC');
    kashiraGrad.addColorStop(1, '#555');
    ctx.fillStyle = kashiraGrad;
    ctx.beginPath();
    ctx.roundRect(handleX - 8, handleY - 2, 12, handleH + 4, 3);
    ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawTsuba(ctx, cx, cy, bladeColor, style) {
    ctx.save();
    ctx.shadowColor = bladeColor;
    ctx.shadowBlur = 12;
    const metalGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
    metalGrad.addColorStop(0, '#888');
    metalGrad.addColorStop(0.5, '#555');
    metalGrad.addColorStop(1, '#333');
    ctx.fillStyle = metalGrad;
    ctx.strokeStyle = bladeColor + 'AA';
    ctx.lineWidth = 1.5;
    if (style === 'redondo') {
      ctx.beginPath(); ctx.ellipse(cx, cy, 14, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111'; ctx.fillRect(cx - 1, cy - 22, 2, 44);
    } else if (style === 'floral') {
      for (let a = 0; a < 6; a++) {
        const angle = (a * Math.PI * 2 / 6) - Math.PI / 2;
        ctx.beginPath(); ctx.ellipse(cx + Math.cos(angle) * 9, cy + Math.sin(angle) * 9, 8, 8, angle, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = '#111'; ctx.fillRect(cx - 2, cy - 23, 4, 46);
    } else if (style === 'hexagonal') {
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI / 3) - Math.PI / 6;
        const mx = cx + Math.cos(ang) * 20, my = cy + Math.sin(ang) * 20;
        a === 0 ? ctx.moveTo(mx, my) : ctx.lineTo(mx, my);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111'; ctx.fillRect(cx - 2, cy - 21, 4, 42);
    } else if (style === 'ola') {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 22);
      ctx.bezierCurveTo(cx + 18, cy - 10, cx + 18, cy + 10, cx, cy + 22);
      ctx.bezierCurveTo(cx - 18, cy + 10, cx - 18, cy - 10, cx, cy - 22);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111'; ctx.fillRect(cx - 2, cy - 23, 4, 46);
    }
    ctx.restore();
  }

  function init() {
    const screen = document.getElementById('katana-screen');
    screen.innerHTML = `
      <div class="mini-container kf-container">
        <div class="mini-header">
          <button class="btn-back" id="kf-btnback">← Menú</button>
          <span class="mode-label">⚒️ Forja tu Katana</span>
        </div>
        <div class="kf-layout">
          <div class="kf-controls">
            <div class="kf-section">
              <h3 class="kf-section-title">Color de Hoja</h3>
              <div class="kf-blade-grid" id="kf-blade-grid">
                ${BLADE_COLORS.map(b => `<button class="kf-blade-btn ${b.id === sel.blade.id ? 'active' : ''}" data-id="${b.id}" title="${b.label}" style="background:${b.hex};box-shadow:0 0 8px ${b.glow}44;"></button>`).join('')}
              </div>
              <p class="kf-lore" id="kf-lore">${sel.blade.lore}</p>
            </div>
            <div class="kf-section">
              <h3 class="kf-section-title">Tsuba (Guarda)</h3>
              <div class="kf-option-row" id="kf-tsuba-row">
                ${TSUBA_STYLES.map(t => `<button class="kf-opt-btn ${t.id === sel.tsuba.id ? 'active' : ''}" data-id="${t.id}"><span class="kf-opt-icon">${t.icon}</span><span class="kf-opt-lbl">${t.label}</span></button>`).join('')}
              </div>
            </div>
            <div class="kf-section">
              <h3 class="kf-section-title">Ito (Vendaje)</h3>
              <div class="kf-ito-grid" id="kf-ito-grid">
                ${ITO_COLORS.map(c => `<button class="kf-ito-btn ${c.id === sel.ito.id ? 'active' : ''}" data-id="${c.id}" title="${c.label}" style="background:${c.hex};"></button>`).join('')}
              </div>
            </div>
          </div>
          <div class="kf-preview">
            <div class="kf-canvas-wrap"><canvas id="kf-canvas" width="480" height="120" class="kf-canvas"></canvas></div>
            <div class="kf-blade-name" id="kf-blade-name">Hoja ${sel.blade.label} · Tsuba ${sel.tsuba.label} · Ito ${sel.ito.label}</div>
            <button class="btn-primary kf-download" id="kf-download">⬇ Descargar imagen</button>
          </div>
        </div>
      </div>`;

    document.getElementById('kf-btnback').addEventListener('click', () => KimetsuRouter.showScreen('menu-screen'));
    const canvas = document.getElementById('kf-canvas');
    const loreEl = document.getElementById('kf-lore');
    const bladeNameEl = document.getElementById('kf-blade-name');
    const refresh = () => {
      drawKatana(canvas);
      bladeNameEl.textContent = `Hoja ${sel.blade.label} · Tsuba ${sel.tsuba.label} · Ito ${sel.ito.label}`;
    };
    refresh();

    document.getElementById('kf-blade-grid').addEventListener('click', e => {
      const btn = e.target.closest('.kf-blade-btn');
      if (!btn) return;
      sel.blade = BLADE_COLORS.find(b => b.id === btn.dataset.id);
      document.querySelectorAll('.kf-blade-btn').forEach(b => b.classList.toggle('active', b.dataset.id === sel.blade.id));
      loreEl.textContent = sel.blade.lore;
      refresh();
    });
    document.getElementById('kf-tsuba-row').addEventListener('click', e => {
      const btn = e.target.closest('.kf-opt-btn');
      if (!btn) return;
      sel.tsuba = TSUBA_STYLES.find(t => t.id === btn.dataset.id);
      document.querySelectorAll('#kf-tsuba-row .kf-opt-btn').forEach(b => b.classList.toggle('active', b.dataset.id === sel.tsuba.id));
      refresh();
    });
    document.getElementById('kf-ito-grid').addEventListener('click', e => {
      const btn = e.target.closest('.kf-ito-btn');
      if (!btn) return;
      sel.ito = ITO_COLORS.find(c => c.id === btn.dataset.id);
      document.querySelectorAll('.kf-ito-btn').forEach(b => b.classList.toggle('active', b.dataset.id === sel.ito.id));
      refresh();
    });
    document.getElementById('kf-download').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `katana-${sel.blade.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════════════
   MÓDULO 4: MEMORIA NICHIRIN (nuevo)
   Relacionar espadas (colores) con sus Pilares
═══════════════════════════════════════════════ */
const MemoriaNichirin = (function () {

  const PAIRS = [
    { pilar: 'Giyu Tomioka',    color: '#2E86AB', colorName: 'Agua',    emoji: '💧' },
    { pilar: 'Rengoku Kyojuro', color: '#E74C3C', colorName: 'Llama',   emoji: '🔥' },
    { pilar: 'Zenitsu Agatsuma',color: '#F4D03F', colorName: 'Trueno',  emoji: '⚡' },
    { pilar: 'Shinobu Kocho',   color: '#8E44AD', colorName: 'Insecto', emoji: '🦋' },
    { pilar: 'Sanemi',          color: '#27AE60', colorName: 'Viento',  emoji: '🌪️' },
    { pilar: 'Muichiro Tokito', color: '#85C1E9', colorName: 'Niebla',  emoji: '🌫️' },
    { pilar: 'Mitsuri Kanroji', color: '#F1948A', colorName: 'Amor',    emoji: '🌸' },
    { pilar: 'Gyomei Himejima', color: '#95A5A6', colorName: 'Piedra',  emoji: '🪨' },
  ];

  let state = {};

  function init() {
    const screen = document.getElementById('memoria-screen');
    startGame(screen);
  }

  function startGame(screen) {
    // Tomar 6 pares aleatorios
    const selected = shuffleArr(PAIRS).slice(0, 6);
    // Crear cartas: cada par genera 2 cartas (pilar + espada)
    const cards = [];
    selected.forEach((pair, i) => {
      cards.push({ id: i, type: 'pilar',  label: pair.pilar,    emoji: '🏯', color: pair.color, pairId: i });
      cards.push({ id: i + 100, type: 'espada', label: pair.colorName + ' ' + pair.emoji, emoji: '', color: pair.color, pairId: i });
    });
    const shuffled = shuffleArr(cards);

    state = {
      cards: shuffled,
      flipped: [],
      matched: new Set(),
      moves: 0,
      startTime: Date.now(),
      locked: false,
    };

    render(screen);
  }

  function render(screen) {
    screen.innerHTML = `
      <div class="mini-container">
        <div class="mini-header">
          <button class="btn-back" id="mem-btnback">← Menú</button>
          <span class="mode-label">🗡️ Memoria Nichirin</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;font-family:var(--font-display,'Cinzel',serif);font-size:.8rem;color:var(--text-muted,#8A7A6A)">
          <span>Movimientos: <strong id="mem-moves" style="color:var(--gold,#C9A84C)">0</strong></span>
          <span>Pares: <strong id="mem-pairs" style="color:var(--red,#C0392B)">0 / 6</strong></span>
        </div>
        <div id="mem-board" style="
          display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem;
          max-width:520px;margin:0 auto;
        "></div>
        <div id="mem-result" style="margin-top:1.5rem;text-align:center"></div>
      </div>`;

    document.getElementById('mem-btnback').addEventListener('click', () => KimetsuRouter.showScreen('menu-screen'));
    renderCards();
  }

  function renderCards() {
    const board = document.getElementById('mem-board');
    if (!board) return;
    board.innerHTML = '';
    state.cards.forEach((card, idx) => {
      const isFlipped = state.flipped.includes(idx) || state.matched.has(card.pairId);
      const isMatched = state.matched.has(card.pairId);

      const div = document.createElement('div');
      div.style.cssText = `
        aspect-ratio:1;border-radius:8px;cursor:pointer;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        font-family:var(--font-display,'Cinzel',serif);font-size:.62rem;
        text-align:center;padding:.3rem;line-height:1.3;
        transition:transform .3s ease,box-shadow .2s;
        position:relative;transform-style:preserve-3d;
        ${isFlipped
          ? `background:${card.color}22;border:2px solid ${card.color};color:var(--text-primary,#F0E6D3);
             box-shadow:0 0 12px ${card.color}44;transform:rotateY(0deg);`
          : `background:var(--bg-card,#0F1015);border:1px solid rgba(255,255,255,.08);color:transparent;
             box-shadow:none;`}
        ${isMatched ? 'opacity:.6;cursor:default;' : ''}
        animation: kny-popIn .3s ease;
      `;

      if (isFlipped) {
        div.innerHTML = `
          <span style="font-size:1.2rem;margin-bottom:.2rem">${card.type === 'pilar' ? '🏯' : '⚔️'}</span>
          <span>${card.label}</span>`;
      } else {
        div.innerHTML = `<span style="font-size:1.4rem;opacity:.3">❓</span>`;
      }

      if (!isMatched) {
        div.addEventListener('click', () => handleFlip(idx));
      }
      board.appendChild(div);
    });
  }

  function handleFlip(idx) {
    if (state.locked) return;
    if (state.flipped.includes(idx)) return;
    if (state.matched.has(state.cards[idx].pairId)) return;

    state.flipped.push(idx);
    renderCards();

    if (state.flipped.length === 2) {
      state.locked = true;
      state.moves++;
      document.getElementById('mem-moves').textContent = state.moves;

      const [i1, i2] = state.flipped;
      const c1 = state.cards[i1], c2 = state.cards[i2];

      if (c1.pairId === c2.pairId && c1.type !== c2.type) {
        // ¡Par correcto!
        setTimeout(() => {
          state.matched.add(c1.pairId);
          state.flipped = [];
          state.locked = false;
          const pairsEl = document.getElementById('mem-pairs');
          if (pairsEl) pairsEl.textContent = `${state.matched.size} / 6`;
          renderCards();

          if (state.matched.size === 6) {
            const elapsed = Math.round((Date.now() - state.startTime) / 1000);
            const score = Math.max(0, 1000 - state.moves * 30 - elapsed * 2);
            showMemResult(elapsed, score);
          }
        }, 500);
      } else {
        setTimeout(() => {
          state.flipped = [];
          state.locked = false;
          renderCards();
        }, 900);
      }
    }
  }

  function showMemResult(elapsed, score) {
    const res = document.getElementById('mem-result');
    if (!res) return;

    let msg = score > 800 ? '🔥 ¡Maestro Hashira!' : score > 500 ? '⚔️ Buen Cazador' : '💧 Sigue entrenando';

    res.innerHTML = `
      <div style="
        background:var(--bg-card,#0F1015);border:1px solid rgba(192,57,43,.3);
        border-radius:12px;padding:1.5rem;max-width:360px;margin:0 auto;
        font-family:var(--font-display,'Cinzel',serif);
      ">
        <div style="font-size:1.5rem;margin-bottom:.5rem">${msg}</div>
        <div style="color:var(--gold,#C9A84C);font-size:1.2rem;font-weight:700;margin-bottom:.3rem">
          Puntaje: ${score}
        </div>
        <div style="color:var(--text-muted,#8A7A6A);font-size:.8rem;margin-bottom:1rem">
          ${state.moves} movimientos · ${elapsed}s
        </div>
        <div id="mem-ranking-form" style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-bottom:.75rem">
          <input id="mem-name" type="text" maxlength="16" placeholder="Tu nombre"
            style="background:#111;border:1px solid rgba(192,57,43,.3);color:#F0E6D3;
                   font-family:Cinzel,serif;font-size:.78rem;padding:.5rem .75rem;
                   border-radius:4px;width:140px;outline:none;" />
          <button id="mem-save-btn" class="btn-primary" style="padding:.5rem 1rem;font-size:.78rem">
            Guardar
          </button>
        </div>
        <div id="mem-podium" style="margin-bottom:1rem"></div>
        <button id="mem-restart-btn" class="btn-secondary" style="width:100%">Jugar de nuevo</button>
      </div>`;

    Ranking.renderPodium('memoria', document.getElementById('mem-podium'));

    document.getElementById('mem-save-btn').addEventListener('click', () => {
      const name = document.getElementById('mem-name').value.trim() || 'Anónimo';
      Ranking.add(name, score, 'memoria', elapsed);
      document.getElementById('mem-ranking-form').style.display = 'none';
      Ranking.renderPodium('memoria', document.getElementById('mem-podium'));
    });

    document.getElementById('mem-restart-btn').addEventListener('click', () => {
      startGame(document.getElementById('memoria-screen'));
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════════════
   ARRANQUE — conecta botones del menú
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // Agregar pantalla de memoria al DOM si no existe
  if (!document.getElementById('memoria-screen')) {
    const sec = document.createElement('section');
    sec.id = 'memoria-screen';
    sec.className = 'screen hidden';
    document.getElementById('app').appendChild(sec);
  }

  const map = {
    'btn-hangman': () => { KimetsuRouter.showScreen('hangman-screen'); Hangman.init(); },
    'btn-tateti':  () => { KimetsuRouter.showScreen('tateti-screen');  Tateti.init();  },
    'btn-katana':  () => { KimetsuRouter.showScreen('katana-screen');  KatanaForge.init(); },
    'btn-memoria': () => { KimetsuRouter.showScreen('memoria-screen'); MemoriaNichirin.init(); },
  };

  Object.entries(map).forEach(([id, fn]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', fn);
  });
});
