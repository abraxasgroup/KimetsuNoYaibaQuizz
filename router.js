/**
 * Router unificado para Kimetsu no Yaiba Quiz.
 * Todos los módulos deben usar KimetsuRouter.showScreen(id).
 */
'use strict';

window.KimetsuRouter = (function() {
  const SCREENS = [
    'menu-screen', 'quiz-screen', 'result-screen',
    'hangman-screen', 'tateti-screen', 'katana-screen',
    'trivia-arcos-screen'
  ];

  function showScreen(id) {
    SCREENS.forEach(sid => {
      const el = document.getElementById(sid);
      if (el) {
        el.classList.remove('active');
        el.classList.add('hidden');
      }
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
