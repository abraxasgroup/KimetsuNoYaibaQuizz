/**
 * Kimetsu no Yaiba — Minijuegos (Ahorcado, Tateti, Forja Katana, Memoria)
 * v2.5 Refactorizado: sin router duplicado, usando Router y Utils unificados.
 */
'use strict';

// ========== ACTUALIZAR REFERENCIAS A UTILS ==========
const { shuffleArray, mostrarTanjiroSorprendido } = window.KNYUtils;

// ========== AHORCADO ==========
const Hangman = (function() {
  const WORDS = [ /* ... mismas palabras ... */ ];
  const MAX_ERRORS = 7;
  let state = {};

  function drawHangman(canvas, errors) { /* ... mismo código ... */ }
  function renderWord(container) { /* ... */ }
  function renderKeyboard(container) { /* ... */ }
  function guess(letter, canvas, wordEl, kbEl, statusEl, errorsEl) { /* ... */ }

  function init() {
    const screen = document.getElementById('hangman-screen');
    const entry = WORDS[Math.floor(Math.random() * WORDS.length)];
    state = { word: entry.word, hint: entry.hint, guessed: new Set(), errors: 0, gameOver: false, won: false };

    screen.innerHTML = `...`; // mismo layout
    document.getElementById('hm-btnback').addEventListener('click', () => KimetsuRouter.showScreen('menu-screen'));
    // ... resto de listeners
  }

  return { init };
})();

// ========== TATETI (canvas) ==========
const Tateti = (function() {
  // ... misma implementación con canvas, pero elimina la definición de shuffleArr (usa shuffleArray)
  // ... y en lugar de KimetsuRouter.showScreen usa KimetsuRouter.showScreen (ya unificado)
  // ... Asegúrate de que init() llame a renderSelection()
  return { init };
})();

// ========== FORJA KATANA ==========
const KatanaForge = (function() {
  // ... sin cambios, pero usando KimetsuRouter.showScreen
  return { init };
})();

// ========== MEMORIA NICHIRIN ==========
const MemoriaNichirin = (function() {
  // ... usa shuffleArray de utils, y KimetsuRouter.showScreen
  return { init };
})();

// ========== INICIALIZACIÓN DE BOTONES ==========
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-hangman').addEventListener('click', () => {
    KimetsuRouter.showScreen('hangman-screen');
    Hangman.init();
  });
  document.getElementById('btn-tateti').addEventListener('click', () => {
    KimetsuRouter.showScreen('tateti-screen');
    Tateti.init();
  });
  document.getElementById('btn-katana').addEventListener('click', () => {
    KimetsuRouter.showScreen('katana-screen');
    KatanaForge.init();
  });
  // El botón de memoria no existe en el HTML actual, pero si lo añades:
  const btnMemoria = document.getElementById('btn-memoria');
  if (btnMemoria) {
    btnMemoria.addEventListener('click', () => {
      KimetsuRouter.showScreen('memoria-screen');
      MemoriaNichirin.init();
    });
  }
});
