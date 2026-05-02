/**
 * Kimetsu no Yaiba — Quiz principal (Trivia, Respiración, Hashira, Luna)
 * v2.5 Refactorizado: usa Router unificado, Utils, y Tanjiro sorprendido.
 */
'use strict';

// ========== ESTADO ==========
const GameState = {
  currentMode: null,
  currentQuestionIndex: 0,
  score: 0,
  personalityPoints: {},
  questions: [],
  questionStartTime: 0,
  timeBonus: 0
};

// ========== RANKING ==========
const Ranking = (function() {
  const KEY = 'kimetsu_ranking_v2';
  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function save(name, score, mode) {
    const all = getAll();
    all.push({ name: name.trim().slice(0, 18) || 'Cazador', score, mode, date: Date.now() });
    all.sort((a, b) => b.score - a.score);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
  }
  function getTop(mode, n = 5) {
    return getAll().filter(r => r.mode === mode).slice(0, n);
  }
  return { save, getTop };
})();

// ========== PREGUNTAS (mantenidas igual, omito para no alargar) ==========
const TRIVIA_POOL = [ /* ... 40 preguntas ... */ ];
const RESPIRACION_QUESTIONS = [ /* ... */ ];
const HASHIRA_QUESTIONS = [ /* ... */ ];
const LUNA_QUESTIONS = [ /* ... */ ];
const RESPIRACION_RESULTS = { /* ... */ };
const HASHIRA_RESULTS = { /* ... */ };
const LUNA_RESULTS = { /* ... */ };
// [Mantén todos los datos de preguntas exactamente como los tienes en tu script.js original]
// ... (copiar aquí todo el contenido de los arrays de preguntas)

// ========== REFERENCIAS DOM ==========
const DOM = {
  menuScreen: document.getElementById('menu-screen'),
  quizScreen: document.getElementById('quiz-screen'),
  resultScreen: document.getElementById('result-screen'),
  modeCards: document.querySelectorAll('.mode-card[data-mode]'),
  btnBack: document.getElementById('btn-back'),
  quizModeLabel: document.getElementById('quiz-mode-label'),
  quizProgress: document.getElementById('quiz-progress'),
  progressFill: document.getElementById('progress-bar-fill'),
  questionNum: document.getElementById('question-counter'),
  questionText: document.getElementById('question-text'),
  optionsGrid: document.getElementById('options-grid'),
  nextContainer: document.getElementById('next-container'),
  btnNext: document.getElementById('btn-next'),
  resultCategory: document.getElementById('result-category'),
  resultName: document.getElementById('result-name'),
  resultScore: document.getElementById('result-score'),
  resultDesc: document.getElementById('result-description'),
  resultTags: document.getElementById('result-tags'),
  resultImg: document.getElementById('result-img'),
  resultFallback: document.getElementById('result-img-fallback'),
  btnRestart: document.getElementById('btn-restart'),
  btnMenu: document.getElementById('btn-menu'),
};

const LETTERS = ['A','B','C','D','E','F'];
const MODE_LABELS = {
  trivia: '⚔️ Trivia',
  respiracion: '💧 Respiración',
  hashira: '🏯 Hashira',
  luna: '🌙 Luna Demoníaca'
};

// ========== NAVEGACIÓN ==========
function loadMode(mode) {
  GameState.currentMode = mode;
  GameState.currentQuestionIndex = 0;
  GameState.score = 0;
  GameState.timeBonus = 0;
  GameState.personalityPoints = {};

  switch (mode) {
    case 'trivia':
      GameState.questions = shuffleArray(TRIVIA_POOL).slice(0, 10);
      break;
    case 'respiracion':
      ['Agua','Fuego','Trueno','Bestia','Insecto'].forEach(c => GameState.personalityPoints[c] = 0);
      GameState.questions = shuffleArray(RESPIRACION_QUESTIONS);
      break;
    case 'hashira':
      Object.keys(HASHIRA_RESULTS).forEach(c => GameState.personalityPoints[c] = 0);
      GameState.questions = shuffleArray(HASHIRA_QUESTIONS);
      break;
    case 'luna':
      Object.keys(LUNA_RESULTS).forEach(c => GameState.personalityPoints[c] = 0);
      GameState.questions = shuffleArray(LUNA_QUESTIONS);
      break;
  }

  DOM.quizModeLabel.textContent = MODE_LABELS[mode];
  KimetsuRouter.showScreen('quiz-screen');
  renderQuestion();
}

function renderQuestion() {
  const total = GameState.questions.length;
  const idx = GameState.currentQuestionIndex;
  const q = GameState.questions[idx];
  const humanIdx = idx + 1;

  DOM.quizProgress.textContent = `${humanIdx} / ${total}`;
  DOM.questionNum.textContent = `Pregunta ${humanIdx}`;
  DOM.progressFill.style.width = `${(idx / total) * 100}%`;
  DOM.questionText.textContent = q.question;
  DOM.optionsGrid.innerHTML = '';
  DOM.nextContainer.style.display = 'none';
  GameState.questionStartTime = Date.now();

  const options = GameState.currentMode === 'trivia' ? q.options : q.options.map(o => o.text);
  options.forEach((optText, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('data-letter', LETTERS[i]);
    btn.setAttribute('data-index', i);
    btn.textContent = optText;
    btn.addEventListener('click', () => handleAnswer(i, btn));
    DOM.optionsGrid.appendChild(btn);
  });
}

function handleAnswer(selectedIndex, clickedBtn) {
  const q = GameState.questions[GameState.currentQuestionIndex];
  const btns = DOM.optionsGrid.querySelectorAll('.option-btn');
  btns.forEach(b => b.disabled = true);

  if (GameState.currentMode === 'trivia') {
    const correct = q.answerIndex;
    if (selectedIndex === correct) {
      clickedBtn.classList.add('correct');
      GameState.score++;
      const elapsed = (Date.now() - GameState.questionStartTime) / 1000;
      if (elapsed < 5) GameState.timeBonus += 3;
      else if (elapsed < 10) GameState.timeBonus += 1;
    } else {
      clickedBtn.classList.add('incorrect');
      btns[correct].classList.add('correct');
      shakeElement(clickedBtn);
      KNYUtils.mostrarTanjiroSorprendido(); // 👈 imagen de sorpresa
    }
    btns.forEach((b, i) => {
      if (i !== selectedIndex && i !== correct) b.classList.add('revealed');
    });
  } else {
    const selectedOption = q.options[selectedIndex];
    Object.entries(selectedOption.points).forEach(([cat, pts]) => {
      if (GameState.personalityPoints[cat] !== undefined)
        GameState.personalityPoints[cat] += pts;
    });
    clickedBtn.classList.add('correct');
    btns.forEach((b, i) => { if (i !== selectedIndex) b.classList.add('revealed'); });
  }

  DOM.nextContainer.style.display = 'flex';
}

function advanceQuestion() {
  GameState.currentQuestionIndex++;
  if (GameState.currentQuestionIndex < GameState.questions.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  let resultData, category = '', scoreLabel = '';

  if (GameState.currentMode === 'trivia') {
    const score = GameState.score;
    const total = GameState.questions.length;
    const bonus = GameState.timeBonus;
    const final = score * 100 + bonus * 10;
    const pct = (score / total) * 100;
    let emoji = pct === 100 ? '🔥' : pct >= 70 ? '⚔️' : pct >= 40 ? '💧' : '😓';
    let msg = pct === 100 ? 'Eres un verdadero Hashira del conocimiento.' :
              pct >= 70 ? 'Gran actuación, Cazador de Demonios.' :
              pct >= 40 ? 'Buen intento. El entrenamiento continúa.' :
              'Vuelve a repasar el anime... ¡ánimo!';
    scoreLabel = `${emoji} ${score}/${total} correctas · Bonus velocidad: +${bonus * 10} · Total: ${final} pts`;
    category = 'Resultado Final';
    resultData = {
      name: 'Tanjiro Kamado', img: 'tanjiro.png',
      description: msg + ' Sigue adelante con la misma determinación que el joven Kamado.',
      tags: [`${score}/${total} correctas`, `${bonus * 10} pts bonus`, `${final} puntos totales`],
      color: '#C0392B'
    };
    // Guardar ranking
    showRankingInput(final, 'trivia');
  } else {
    const winnerCat = getWinnerCategory(GameState.personalityPoints);
    const map = { respiracion: RESPIRACION_RESULTS, hashira: HASHIRA_RESULTS, luna: LUNA_RESULTS };
    resultData = map[GameState.currentMode][winnerCat];
    category = winnerCat;
  }

  DOM.resultCategory.textContent = category;
  DOM.resultName.textContent = resultData.name;
  DOM.resultScore.textContent = scoreLabel;
  DOM.resultDesc.textContent = resultData.description;
  DOM.resultTags.innerHTML = resultData.tags.map(t => `<span class="result-tag">${t}</span>`).join('');
  setupResultImage(resultData.img, resultData.name, resultData.color);
  KimetsuRouter.showScreen('result-screen');
  launchResultParticles(resultData.color || '#C0392B');
  renderRankingWidget(GameState.currentMode);
}

// [funciones auxiliares: getWinnerCategory, setupResultImage, showRankingInput, renderRankingWidget, launchResultParticles, initMenuParticles]
// (mantén las implementaciones originales que ya tienes)

// ========== EVENTOS ==========
DOM.modeCards.forEach(card => {
  card.addEventListener('click', () => {
    const mode = card.getAttribute('data-mode');
    if (mode) loadMode(mode);
  });
});
DOM.btnBack.addEventListener('click', () => KimetsuRouter.showScreen('menu-screen'));
DOM.btnNext.addEventListener('click', advanceQuestion);
DOM.btnRestart.addEventListener('click', () => { if (GameState.currentMode) loadMode(GameState.currentMode); });
DOM.btnMenu.addEventListener('click', () => KimetsuRouter.showScreen('menu-screen'));

// Iniciar partículas del menú
document.addEventListener('DOMContentLoaded', () => {
  initMenuParticles();
});
