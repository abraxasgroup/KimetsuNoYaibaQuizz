/**
 * Utilidades comunes para Kimetsu no Yaiba Quiz.
 */
'use strict';

// Barajar array (Fisher-Yates)
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mostrar a Tanjiro sorprendido (overlay global)
function mostrarTanjiroSorprendido(callback) {
  const overlay = document.getElementById('tanjiro-surprised-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  const img = overlay.querySelector('img');
  if (img) {
    img.style.animation = 'none';
    img.offsetHeight; // reflow
    img.style.animation = 'shake-wrong 0.5s ease';
  }
  setTimeout(() => {
    overlay.style.display = 'none';
    if (typeof callback === 'function') callback();
  }, 1500);
}

// Animación de shake para respuestas incorrectas
function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake-wrong 0.4s ease';
  el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
}

// Inyectar CSS de shake una sola vez
(function injectShakeCSS() {
  if (document.getElementById('kny-shake-style')) return;
  const style = document.createElement('style');
  style.id = 'kny-shake-style';
  style.textContent = `
    @keyframes shake-wrong {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-8px) rotate(-1deg); }
      40%      { transform: translateX(8px)  rotate(1deg); }
      60%      { transform: translateX(-5px); }
      80%      { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
})();

// Exponer globalmente
window.KNYUtils = {
  shuffleArray,
  mostrarTanjiroSorprendido,
  shakeElement
};
