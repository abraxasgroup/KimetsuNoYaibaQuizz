/**
 * ================================================
 * KIMETSU NO YAIBA — MINIJUEGOS
 * minijuegos.js
 *
 * Módulos:
 *  1. Ahorcado del Cazador
 *  2. Tateti: Demonios vs Cazadores
 *  3. Forja tu Katana
 *
 * Cada módulo expone: init(containerId), destroy()
 * Se comunica con el sistema principal vía:
 *   window.KimetsuRouter.showScreen(id)
 * ================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   ROUTER — extiende el showScreen principal
   para incluir las nuevas pantallas
───────────────────────────────────────────── */
window.KimetsuRouter = (function () {
  // IDs de TODAS las pantallas (originales + nuevas)
  const ALL_SCREENS = [
    'menu-screen',
    'quiz-screen',
    'result-screen',
    'hangman-screen',
    'tateti-screen',
    'katana-screen',
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
      target.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return { showScreen };
})();

/* showScreen en script.js ya fue extendido para cubrir
   todas las pantallas incluyendo las de minijuegos */


/* ═══════════════════════════════════════════════
   MÓDULO 1: AHORCADO DEL CAZADOR
═══════════════════════════════════════════════ */
const Hangman = (function () {

  const WORDS = [
    { word: 'TANJIRO',   hint: 'El protagonista de la historia' },
    { word: 'NEZUKO',    hint: 'Hermana convertida en demonio' },
    { word: 'HINOKAMI',  hint: 'Respiración del dios del fuego' },
    { word: 'KAGURA',    hint: 'Danza sagrada del clan Kamado' },
    { word: 'RENGOKU',   hint: 'Pilar de la Llama' },
    { word: 'SHINOBU',   hint: 'Pilar del Insecto' },
    { word: 'MUZAN',     hint: 'El Demon King' },
    { word: 'AKAZA',     hint: 'Luna Superior Tres' },
    { word: 'INFINITO',  hint: 'Tipo de tren maldito' },
    { word: 'ZENITSU',   hint: 'Pilar del Trueno dormido' },
    { word: 'INOSUKE',   hint: 'Criado por jabalíes' },
    { word: 'HASHIRA',   hint: 'Los nueve pilares' },
    { word: 'KOKUSHIBO', hint: 'Luna Superior Uno' },
    { word: 'GYOMEI',    hint: 'Pilar de la Piedra' },
    { word: 'YORIICHI',  hint: 'El espadachín más poderoso de la historia' },
  ];

  const MAX_ERRORS = 7;

  let state = {
    word:        '',
    hint:        '',
    guessed:     new Set(),
    errors:      0,
    gameOver:    false,
    won:         false,
  };

  // ── Canvas del ahorcado ──
  function drawHangman(canvas, errors) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'round';

    const draw = (fn) => { ctx.beginPath(); fn(); ctx.stroke(); };

    // Estructura
    draw(() => { ctx.moveTo(20, H-10); ctx.lineTo(W-20, H-10); });  // base
    draw(() => { ctx.moveTo(60, H-10); ctx.lineTo(60, 20); });       // poste
    draw(() => { ctx.moveTo(60, 20);   ctx.lineTo(W/2, 20); });      // viga
    draw(() => { ctx.moveTo(W/2, 20);  ctx.lineTo(W/2, 55); });      // soga

    if (errors < 1) return;

    // Partes del cuerpo — estilizadas con trazo rojo
    const cx = W/2;
    const parts = [
      () => { // cabeza
        ctx.beginPath();
        ctx.arc(cx, 72, 17, 0, Math.PI*2);
        ctx.strokeStyle = '#E74C3C';
        ctx.stroke();
        if (errors >= MAX_ERRORS) {
          // ojos X
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          [[cx-8,65,cx-4,69],[cx-4,65,cx-8,69],
           [cx+4,65,cx+8,69],[cx+8,65,cx+4,69]].forEach(([x1,y1,x2,y2]) => {
            ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
          });
          ctx.strokeStyle = '#C0392B';
          ctx.lineWidth = 3;
        }
      },
      () => { draw(() => { ctx.moveTo(cx,89); ctx.lineTo(cx,140); }); },   // cuerpo
      () => { draw(() => { ctx.moveTo(cx,100); ctx.lineTo(cx-30,125); }); }, // brazo izq
      () => { draw(() => { ctx.moveTo(cx,100); ctx.lineTo(cx+30,125); }); }, // brazo der
      () => { draw(() => { ctx.moveTo(cx,140); ctx.lineTo(cx-25,175); }); }, // pierna izq
      () => { draw(() => { ctx.moveTo(cx,140); ctx.lineTo(cx+25,175); }); }, // pierna der
      () => { // corona de Tanjiro — marca roja en la frente al morir
        ctx.beginPath();
        ctx.arc(cx, 65, 5, 0, Math.PI*2);
        ctx.fillStyle = '#C0392B';
        ctx.fill();
      },
    ];

    for (let i = 0; i < errors && i < parts.length; i++) {
      ctx.strokeStyle = '#C0392B';
      ctx.lineWidth   = 3;
      parts[i]();
    }
  }

  // ── Render de la palabra ──
  function renderWord(container) {
    container.innerHTML = state.word.split('').map(ch =>
      `<span class="hm-letter ${state.guessed.has(ch) ? 'revealed' : ''}"
             data-char="${ch}">${state.guessed.has(ch) ? ch : '_'}</span>`
    ).join('');
  }

  // ── Render del teclado ──
  function renderKeyboard(container) {
    const ROWS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];
    container.innerHTML = ROWS.map(row =>
      `<div class="hm-kb-row">${row.split('').map(ch => {
        const correct = state.guessed.has(ch) && state.word.includes(ch);
        const wrong   = state.guessed.has(ch) && !state.word.includes(ch);
        return `<button class="hm-key ${correct?'correct':''} ${wrong?'wrong':''}"
                        data-key="${ch}" ${state.guessed.has(ch)||state.gameOver?'disabled':''}>${ch}</button>`;
      }).join('')}</div>`
    ).join('');
  }

  // ── Procesar letra ──
  function guess(letter, canvas, wordEl, kbEl, statusEl, errorsEl) {
    if (state.gameOver || state.guessed.has(letter)) return;
    state.guessed.add(letter);
    if (!state.word.includes(letter)) state.errors++;

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
        : `💀 Derrotado. La palabra era <strong>${state.word}</strong>`;
    }
  }

  // ── Init ──
  function init() {
    const screen = document.getElementById('hangman-screen');
    const entry  = WORDS[Math.floor(Math.random() * WORDS.length)];
    state = { word: entry.word, hint: entry.hint, guessed: new Set(), errors: 0, gameOver: false, won: false };

    screen.innerHTML = `
      <div class="mini-container">
        <div class="mini-header">
          <button class="btn-back" onclick="KimetsuRouter.showScreen('menu-screen')">← Menú</button>
          <span class="mode-label">⚔️ Ahorcado del Cazador</span>
        </div>

        <div class="hm-layout">
          <div class="hm-left">
            <canvas id="hm-canvas" width="160" height="210" class="hm-canvas"></canvas>
            <p class="hm-hint">Pista: <em id="hm-hint-text">${entry.hint}</em></p>
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

    const canvas  = document.getElementById('hm-canvas');
    const wordEl  = document.getElementById('hm-word');
    const kbEl    = document.getElementById('hm-keyboard');
    const statusEl= document.getElementById('hm-status');
    const errorsEl= document.getElementById('hm-errors');

    drawHangman(canvas, 0);
    renderWord(wordEl);
    renderKeyboard(kbEl);

    // Delegación de eventos en el teclado
    kbEl.addEventListener('click', e => {
      const btn = e.target.closest('.hm-key');
      if (btn) guess(btn.dataset.key, canvas, wordEl, kbEl, statusEl, errorsEl);
    });

    // Teclado físico
    const keyHandler = e => {
      const k = e.key.toUpperCase();
      if (/^[A-ZÁÉÍÓÚÑ]$/.test(k)) guess(k === 'Ñ' ? 'Ñ' : k, canvas, wordEl, kbEl, statusEl, errorsEl);
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
   MÓDULO 2: TATETI — DEMONIOS VS CAZADORES
═══════════════════════════════════════════════ */
const Tateti = (function () {

  const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  let state = {
    board:        Array(9).fill(null), // null | 'X' | 'O'
    playerSymbol: 'X',   // elegido por el jugador
    aiSymbol:     'O',
    currentTurn:  'X',   // quién juega ahora
    gameOver:     false,
    playerFirst:  true,
    playerLabel:  'Cazador',
    aiLabel:      'Demonio',
    playerEmoji:  '🔥',  // Rengoku
    aiEmoji:      '🩸',  // Akaza
  };

  // ── Lógica ──
  function checkWinner(board) {
    for (const [a,b,c] of WINS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c])
        return { winner: board[a], line: [a,b,c] };
    }
    if (board.every(c => c !== null)) return { winner: 'draw' };
    return null;
  }

  // IA: minimax simplificado (siempre óptima)
  function minimax(board, isMax) {
    const res = checkWinner(board);
    if (res) {
      if (res.winner === state.aiSymbol)     return  10;
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

  // ── Render del tablero ──
  function renderBoard(boardEl) {
    boardEl.innerHTML = state.board.map((cell, i) => {
      const sym    = cell === state.playerSymbol ? state.playerEmoji :
                     cell === state.aiSymbol     ? state.aiEmoji : '';
      const cls    = cell ? 'taken' : '';
      const result = checkWinner(state.board);
      const winning = result?.line?.includes(i) ? 'winning-cell' : '';
      return `<div class="tt-cell ${cls} ${winning}" data-idx="${i}">${sym}</div>`;
    }).join('');
  }

  function renderStatus(statusEl) {
    const res = checkWinner(state.board);
    if (!res) {
      const whose = state.currentTurn === state.playerSymbol
        ? `${state.playerEmoji} Tu turno`
        : `${state.aiEmoji} IA pensando...`;
      statusEl.textContent = whose;
      statusEl.className   = 'tt-status';
      return;
    }
    if (res.winner === 'draw') {
      statusEl.textContent = '🤝 Empate legendario';
      statusEl.className   = 'tt-status draw';
    } else if (res.winner === state.playerSymbol) {
      statusEl.textContent = `${state.playerEmoji} ¡${state.playerLabel} victorioso!`;
      statusEl.className   = 'tt-status win';
    } else {
      statusEl.textContent = `${state.aiEmoji} ${state.aiLabel} dominó el tablero`;
      statusEl.className   = 'tt-status lose';
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

    // IA con pequeño delay para sensación de "pensamiento"
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

  // ── Pantalla de selección de bando ──
  function renderSelection(screen) {
    screen.innerHTML = `
      <div class="mini-container">
        <div class="mini-header">
          <button class="btn-back" onclick="KimetsuRouter.showScreen('menu-screen')">← Menú</button>
          <span class="mode-label">♟️ Tateti Kimetsu</span>
        </div>
        <div class="tt-selection">
          <h2 class="tt-sel-title">Elige tu bando</h2>
          <div class="tt-bando-grid">
            <button class="tt-bando-btn" data-side="cazador">
              <div class="tt-bando-emoji">🔥</div>
              <div class="tt-bando-name">Cazador</div>
              <div class="tt-bando-sub">Rengoku Kyojuro</div>
              <div class="tt-bando-desc">Defiendes a la humanidad.<br>Juegas primero.</div>
            </button>
            <div class="tt-vs">VS</div>
            <button class="tt-bando-btn" data-side="demonio">
              <div class="tt-bando-emoji">🩸</div>
              <div class="tt-bando-name">Demonio</div>
              <div class="tt-bando-sub">Akaza</div>
              <div class="tt-bando-desc">Te unes a las sombras.<br>La IA juega primero.</div>
            </button>
          </div>
        </div>
      </div>`;

    screen.querySelectorAll('.tt-bando-btn').forEach(btn => {
      btn.addEventListener('click', () => startGame(btn.dataset.side, screen));
    });
  }

  // ── Iniciar partida ──
  function startGame(side, screen) {
    const playerFirst = side === 'cazador';
    state = {
      board:        Array(9).fill(null),
      playerSymbol: playerFirst ? 'X' : 'O',
      aiSymbol:     playerFirst ? 'O' : 'X',
      currentTurn:  'X',
      gameOver:     false,
      playerFirst,
      playerLabel:  playerFirst ? 'Cazador' : 'Demonio',
      aiLabel:      playerFirst ? 'Demonio' : 'Cazador',
      playerEmoji:  playerFirst ? '🔥' : '🩸',
      aiEmoji:      playerFirst ? '🩸' : '🔥',
    };

    screen.innerHTML = `
      <div class="mini-container">
        <div class="mini-header">
          <button class="btn-back" onclick="KimetsuRouter.showScreen('menu-screen')">← Menú</button>
          <span class="mode-label">♟️ Tateti Kimetsu</span>
        </div>
        <div class="tt-game-layout">
          <div class="tt-legend">
            <span class="tt-leg-item"><span class="tt-leg-ico">${state.playerEmoji}</span> Tú (${state.playerLabel})</span>
            <span class="tt-leg-sep">vs</span>
            <span class="tt-leg-item"><span class="tt-leg-ico">${state.aiEmoji}</span> IA (${state.aiLabel})</span>
          </div>
          <p class="tt-status" id="tt-status"></p>
          <div class="tt-board" id="tt-board"></div>
          <div class="tt-actions">
            <button class="btn-primary"   id="tt-restart">Revancha</button>
            <button class="btn-secondary" id="tt-cambiar">Cambiar bando</button>
          </div>
        </div>
      </div>`;

    const boardEl  = document.getElementById('tt-board');
    const statusEl = document.getElementById('tt-status');

    // Si la IA va primero (jugador eligió demonio)
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
   MÓDULO 3: FORJA TU KATANA
═══════════════════════════════════════════════ */
const KatanaForge = (function () {

  // Colores de hoja (basados en el anime)
  const BLADE_COLORS = [
    { id: 'negro',    label: 'Negro',    hex: '#1a1a1a', glow: '#444444',  lore: 'El color más raro. Portentoso destino.' },
    { id: 'agua',     label: 'Agua',     hex: '#2E86AB', glow: '#5BC8F5',  lore: 'Respiración del Agua — Giyu Tomioka.' },
    { id: 'llama',    label: 'Llama',    hex: '#C0392B', glow: '#FF6B35',  lore: 'Respiración de la Llama — Rengoku.' },
    { id: 'trueno',   label: 'Trueno',   hex: '#F4D03F', glow: '#FFE066',  lore: 'Respiración del Trueno — Zenitsu.' },
    { id: 'insecto',  label: 'Insecto',  hex: '#8E44AD', glow: '#D7A1F9',  lore: 'Respiración del Insecto — Shinobu.' },
    { id: 'viento',   label: 'Viento',   hex: '#27AE60', glow: '#82E0AA',  lore: 'Respiración del Viento — Sanemi.' },
    { id: 'niebla',   label: 'Niebla',   hex: '#85C1E9', glow: '#BEE3F8',  lore: 'Respiración de la Niebla — Muichiro.' },
    { id: 'amor',     label: 'Amor',     hex: '#F1948A', glow: '#FADADD',  lore: 'Respiración del Amor — Mitsuri.' },
    { id: 'piedra',   label: 'Piedra',   hex: '#95A5A6', glow: '#D5D8DC',  lore: 'Respiración de la Piedra — Gyomei.' },
  ];

  // Estilos de tsuba (guarda)
  const TSUBA_STYLES = [
    { id: 'redondo',   label: 'Redonda',    icon: '⬤' },
    { id: 'floral',    label: 'Floral',     icon: '✿' },
    { id: 'hexagonal', label: 'Hexagonal',  icon: '⬡' },
    { id: 'ola',       label: 'Ola',        icon: '〜' },
  ];

  // Colores de ito (vendaje del mango)
  const ITO_COLORS = [
    { id: 'rojo',    label: 'Rojo',    hex: '#C0392B' },
    { id: 'negro',   label: 'Negro',   hex: '#1C1C1C' },
    { id: 'blanco',  label: 'Blanco',  hex: '#F0E6D3' },
    { id: 'verde',   label: 'Verde',   hex: '#1E6B44' },
    { id: 'dorado',  label: 'Dorado',  hex: '#C9A84C' },
    { id: 'azul',    label: 'Azul',    hex: '#2E86AB' },
    { id: 'morado',  label: 'Morado',  hex: '#6C3483' },
    { id: 'rosa',    label: 'Rosa',    hex: '#E91E8C' },
  ];

  let sel = {
    blade:  BLADE_COLORS[0],
    tsuba:  TSUBA_STYLES[0],
    ito:    ITO_COLORS[0],
  };

  // ── DIBUJADO DE LA KATANA ──
  function drawKatana(canvas) {
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const blade  = sel.blade;
    const itoHex = sel.ito.hex;

    // ── Hoja (hoja ancha → punta) ──
    const bladeX     = 80;       // donde empieza la hoja (tras la tsuba)
    const bladeEnd   = W - 30;   // punta
    const bladeTop   = H/2 - 12; // borde superior en la base
    const bladeTip   = H/2;      // punto en la punta
    const bladeBot   = H/2 + 12; // borde inferior en la base

    // Glow de la hoja
    ctx.save();
    ctx.shadowColor = blade.glow;
    ctx.shadowBlur  = 22;

    // Cara principal de la hoja
    const bladeGrad = ctx.createLinearGradient(bladeX, bladeTop, bladeX, bladeBot);
    bladeGrad.addColorStop(0,   blade.hex + 'CC');
    bladeGrad.addColorStop(0.4, blade.hex);
    bladeGrad.addColorStop(0.7, '#ffffff33');
    bladeGrad.addColorStop(1,   blade.hex + '99');

    ctx.beginPath();
    ctx.moveTo(bladeX,    bladeTop);
    ctx.lineTo(bladeEnd,  bladeTip);
    ctx.lineTo(bladeX,    bladeBot);
    ctx.closePath();
    ctx.fillStyle   = bladeGrad;
    ctx.fill();

    // Línea de filo (hamon)
    ctx.beginPath();
    ctx.moveTo(bladeX,   bladeTop + 4);
    ctx.lineTo(bladeEnd, bladeTip);
    ctx.strokeStyle = '#ffffff55';
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Línea decorativa central
    ctx.beginPath();
    ctx.moveTo(bladeX+10,  H/2 - 4);
    ctx.lineTo(bladeEnd-20, H/2);
    ctx.strokeStyle = blade.glow + '88';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.restore();

    // ── Tsuba (guarda) ──
    const tX = bladeX;
    const tY = H/2;
    drawTsuba(ctx, tX, tY, blade.hex, sel.tsuba.id);

    // ── Habaki (collarín) ──
    ctx.fillStyle = '#B8860B';
    ctx.fillRect(bladeX - 14, H/2 - 8, 14, 16);
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 1;
    ctx.strokeRect(bladeX - 14, H/2 - 8, 14, 16);

    // ── Tsuka (mango) con ito ──
    const handleX = 10;
    const handleW = bladeX - 14 - handleX;
    const handleH = 20;
    const handleY = H/2 - handleH/2;

    // Madera base del mango
    const woodGrad = ctx.createLinearGradient(handleX, handleY, handleX, handleY+handleH);
    woodGrad.addColorStop(0,   '#5C3A1E');
    woodGrad.addColorStop(0.5, '#8B5E3C');
    woodGrad.addColorStop(1,   '#3D1F0A');
    ctx.fillStyle   = woodGrad;
    ctx.beginPath();
    ctx.roundRect(handleX, handleY, handleW, handleH, 4);
    ctx.fill();

    // Ito (vendaje diagonal)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(handleX, handleY, handleW, handleH, 4);
    ctx.clip();
    ctx.strokeStyle = itoHex;
    ctx.lineWidth   = 3.5;
    ctx.globalAlpha = 0.75;
    for (let ix = handleX - handleH; ix < handleX + handleW + handleH; ix += 9) {
      ctx.beginPath();
      ctx.moveTo(ix,              handleY - 2);
      ctx.lineTo(ix + handleH,    handleY + handleH + 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Borde del mango
    ctx.strokeStyle = '#1a0a00';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.roundRect(handleX, handleY, handleW, handleH, 4);
    ctx.stroke();

    // Kashira (pomo)
    const kashiraGrad = ctx.createLinearGradient(handleX-8, handleY, handleX-8, handleY+handleH);
    kashiraGrad.addColorStop(0, '#888');
    kashiraGrad.addColorStop(0.5, '#CCC');
    kashiraGrad.addColorStop(1, '#555');
    ctx.fillStyle   = kashiraGrad;
    ctx.beginPath();
    ctx.roundRect(handleX - 8, handleY - 2, 12, handleH + 4, 3);
    ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.lineWidth   = 1;
    ctx.stroke();
  }

  function drawTsuba(ctx, cx, cy, bladeColor, style) {
    ctx.save();
    ctx.shadowColor = bladeColor;
    ctx.shadowBlur  = 12;

    const metalGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
    metalGrad.addColorStop(0,   '#888');
    metalGrad.addColorStop(0.5, '#555');
    metalGrad.addColorStop(1,   '#333');

    ctx.fillStyle   = metalGrad;
    ctx.strokeStyle = bladeColor + 'AA';
    ctx.lineWidth   = 1.5;

    if (style === 'redondo') {
      ctx.beginPath(); ctx.ellipse(cx, cy, 14, 22, 0, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();
      // ranura para la hoja
      ctx.fillStyle = '#111';
      ctx.fillRect(cx - 1, cy - 22, 2, 44);

    } else if (style === 'floral') {
      for (let a = 0; a < 6; a++) {
        const angle = (a * Math.PI*2/6) - Math.PI/2;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(angle)*9, cy + Math.sin(angle)*9, 8, 8, angle, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = '#111';
      ctx.fillRect(cx - 2, cy - 23, 4, 46);

    } else if (style === 'hexagonal') {
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI/3) - Math.PI/6;
        const mx  = cx + Math.cos(ang) * 20;
        const my  = cy + Math.sin(ang) * 20;
        a === 0 ? ctx.moveTo(mx, my) : ctx.lineTo(mx, my);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111';
      ctx.fillRect(cx - 2, cy - 21, 4, 42);

    } else if (style === 'ola') {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 22);
      ctx.bezierCurveTo(cx+18, cy-10, cx+18, cy+10, cx, cy+22);
      ctx.bezierCurveTo(cx-18, cy+10, cx-18, cy-10, cx, cy-22);
      ctx.fill(); ctx.stroke();
      // línea decorativa de ola
      ctx.beginPath();
      ctx.moveTo(cx-8, cy);
      ctx.bezierCurveTo(cx-4, cy-8, cx+4, cy+8, cx+8, cy);
      ctx.strokeStyle = bladeColor + 'CC';
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.fillStyle = '#111';
      ctx.fillRect(cx - 2, cy - 23, 4, 46);
    }

    ctx.restore();
  }

  // ── Init ──
  function init() {
    const screen = document.getElementById('katana-screen');

    screen.innerHTML = `
      <div class="mini-container kf-container">
        <div class="mini-header">
          <button class="btn-back" onclick="KimetsuRouter.showScreen('menu-screen')">← Menú</button>
          <span class="mode-label">⚒️ Forja tu Katana</span>
        </div>

        <div class="kf-layout">
          <!-- Panel izquierdo: controles -->
          <div class="kf-controls">

            <div class="kf-section">
              <h3 class="kf-section-title">Color de Hoja</h3>
              <div class="kf-blade-grid" id="kf-blade-grid">
                ${BLADE_COLORS.map(b =>
                  `<button class="kf-blade-btn ${b.id === sel.blade.id ? 'active' : ''}"
                           data-id="${b.id}" title="${b.label}"
                           style="background:${b.hex}; box-shadow: 0 0 8px ${b.glow}44;">
                   </button>`
                ).join('')}
              </div>
              <p class="kf-lore" id="kf-lore">${sel.blade.lore}</p>
            </div>

            <div class="kf-section">
              <h3 class="kf-section-title">Tsuba (Guarda)</h3>
              <div class="kf-option-row" id="kf-tsuba-row">
                ${TSUBA_STYLES.map(t =>
                  `<button class="kf-opt-btn ${t.id === sel.tsuba.id ? 'active' : ''}" data-id="${t.id}">
                     <span class="kf-opt-icon">${t.icon}</span>
                     <span class="kf-opt-lbl">${t.label}</span>
                   </button>`
                ).join('')}
              </div>
            </div>

            <div class="kf-section">
              <h3 class="kf-section-title">Ito (Vendaje)</h3>
              <div class="kf-ito-grid" id="kf-ito-grid">
                ${ITO_COLORS.map(c =>
                  `<button class="kf-ito-btn ${c.id === sel.ito.id ? 'active' : ''}"
                           data-id="${c.id}" title="${c.label}"
                           style="background:${c.hex};"></button>`
                ).join('')}
              </div>
            </div>

          </div>

          <!-- Panel derecho: canvas -->
          <div class="kf-preview">
            <div class="kf-canvas-wrap">
              <canvas id="kf-canvas" width="480" height="120" class="kf-canvas"></canvas>
            </div>
            <div class="kf-blade-name" id="kf-blade-name">
              Hoja ${sel.blade.label} · Tsuba ${sel.tsuba.label} · Ito ${sel.ito.label}
            </div>
            <button class="btn-primary kf-download" id="kf-download">⬇ Descargar imagen</button>
          </div>
        </div>
      </div>`;

    const canvas      = document.getElementById('kf-canvas');
    const loreEl      = document.getElementById('kf-lore');
    const bladeNameEl = document.getElementById('kf-blade-name');

    function refreshCanvas() {
      drawKatana(canvas);
      bladeNameEl.textContent =
        `Hoja ${sel.blade.label} · Tsuba ${sel.tsuba.label} · Ito ${sel.ito.label}`;
    }
    refreshCanvas();

    // Blade color
    document.getElementById('kf-blade-grid').addEventListener('click', e => {
      const btn = e.target.closest('.kf-blade-btn');
      if (!btn) return;
      sel.blade = BLADE_COLORS.find(b => b.id === btn.dataset.id);
      document.querySelectorAll('.kf-blade-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.id === sel.blade.id));
      loreEl.textContent = sel.blade.lore;
      refreshCanvas();
    });

    // Tsuba
    document.getElementById('kf-tsuba-row').addEventListener('click', e => {
      const btn = e.target.closest('.kf-opt-btn');
      if (!btn) return;
      sel.tsuba = TSUBA_STYLES.find(t => t.id === btn.dataset.id);
      document.querySelectorAll('#kf-tsuba-row .kf-opt-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.id === sel.tsuba.id));
      refreshCanvas();
    });

    // Ito
    document.getElementById('kf-ito-grid').addEventListener('click', e => {
      const btn = e.target.closest('.kf-ito-btn');
      if (!btn) return;
      sel.ito = ITO_COLORS.find(c => c.id === btn.dataset.id);
      document.querySelectorAll('.kf-ito-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.id === sel.ito.id));
      refreshCanvas();
    });

    // Descarga
    document.getElementById('kf-download').addEventListener('click', () => {
      // Dibujamos en canvas más grande para la descarga
      const dlCanvas = document.createElement('canvas');
      dlCanvas.width  = 960;
      dlCanvas.height = 240;
      const dlCtx = dlCanvas.getContext('2d');

      // Fondo oscuro
      dlCtx.fillStyle = '#0A0A0E';
      dlCtx.fillRect(0, 0, 960, 240);

      // Patrón de fondo
      dlCtx.strokeStyle = 'rgba(30,107,68,0.08)';
      dlCtx.lineWidth   = 1;
      for (let x = 0; x < 960; x += 20) { dlCtx.beginPath(); dlCtx.moveTo(x,0); dlCtx.lineTo(x+240,240); dlCtx.stroke(); }
      for (let x = 0; x < 960; x += 20) { dlCtx.beginPath(); dlCtx.moveTo(x,240); dlCtx.lineTo(x+240,0); dlCtx.stroke(); }

      // Escalar katana x2
      dlCtx.save();
      dlCtx.scale(2, 2);
      drawKatana(dlCanvas); // Dibuja directamente al canvas grande (mismo tamaño de coordenadas)
      dlCtx.restore();

      // Texto con el nombre
      dlCtx.font      = '500 18px Cinzel, serif';
      dlCtx.fillStyle = '#C9A84C';
      dlCtx.textAlign = 'center';
      dlCtx.fillText(
        `Hoja ${sel.blade.label.toUpperCase()} · Tsuba ${sel.tsuba.label} · Ito ${sel.ito.label}`,
        480, 225
      );

      const link    = document.createElement('a');
      link.download = `katana-${sel.blade.id}.png`;
      link.href     = canvas.toDataURL('image/png');  // descargamos del canvas original
      link.click();
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════════════
   ARRANQUE — conecta botones del menú con módulos
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // Botones de los nuevos modos en el menú
  const btnHangman = document.getElementById('btn-hangman');
  const btnTateti  = document.getElementById('btn-tateti');
  const btnKatana  = document.getElementById('btn-katana');

  if (btnHangman) {
    btnHangman.addEventListener('click', () => {
      KimetsuRouter.showScreen('hangman-screen');
      Hangman.init();
    });
  }

  if (btnTateti) {
    btnTateti.addEventListener('click', () => {
      KimetsuRouter.showScreen('tateti-screen');
      Tateti.init();
    });
  }

  if (btnKatana) {
    btnKatana.addEventListener('click', () => {
      KimetsuRouter.showScreen('katana-screen');
      KatanaForge.init();
    });
  }
});
