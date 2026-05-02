/**
 * Kimetsu no Yaiba — Trivia por Arcos
 * v1.5 Refactorizado: usa Router, Utils, y Tanjiro sorprendido global.
 */
'use strict';

const ARCOS = [
  { id: 'monte', nombre: '⛰️ Monte Sabiduría', dificultad: 'Iniciado', ptsBase: 100, color: '#2E86AB', preguntas: [] },
  { id: 'tren', nombre: '🚂 Tren Mugen', dificultad: 'Cazador', ptsBase: 150, color: '#E74C3C', preguntas: [] },
  { id: 'distrito', nombre: '🏮 Distrito del Entretenimiento', dificultad: 'Élite', ptsBase: 200, color: '#8E44AD', preguntas: [] },
  { id: 'aldea', nombre: '⚒️ Aldea de los Herreros', dificultad: 'Hashira', ptsBase: 250, color: '#F39C12', preguntas: [] },
  { id: 'final', nombre: '🌑 Batalla Final', dificultad: 'Legendario', ptsBase: 350, color: '#C0392B', preguntas: [] }
];

// Llenar preguntas (igual que antes, pero copia aquí el contenido completo)
(function llenarPreguntas() {
  ARCOS[0].preguntas = [ /* ... */ ];
  // ... resto de arcos
})();

let arcoState = {
  arcoActual: 0,
  preguntaActual: 0,
  vidas: 3,
  puntaje: 0,
  racha: 0,
  timer: null,
  tiempoInicio: 0,
  juegoTerminado: false,
  arcosCompletados: []
};

(function cargarProgreso() {
  try {
    const saved = JSON.parse(localStorage.getItem('trivia-arcos-progreso'));
    if (saved) arcoState.arcosCompletados = saved.arcosCompletados || [];
  } catch(e) {}
})();

function guardarProgreso() {
  localStorage.setItem('trivia-arcos-progreso', JSON.stringify({
    arcosCompletados: arcoState.arcosCompletados
  }));
}

function limpiarTimer() {
  if (arcoState.timer) {
    clearInterval(arcoState.timer);
    arcoState.timer = null;
  }
}

function mostrarPantalla() {
  limpiarTimer();
  const screen = document.getElementById('trivia-arcos-screen');
  // ... misma implementación de hub
  // Usar KimetsuRouter.showScreen al volver
}

function iniciarArco() {
  arcoState.preguntaActual = 0;
  arcoState.vidas = 3;
  arcoState.puntaje = 0;
  arcoState.racha = 0;
  arcoState.juegoTerminado = false;
  renderPregunta();
}

function renderPregunta() {
  limpiarTimer();
  const arco = ARCOS[arcoState.arcoActual];
  const q = arco.preguntas[arcoState.preguntaActual];
  // ... crear layout con botones y timer
  // Al responder mal: KNYUtils.mostrarTanjiroSorprendido(() => { perderVida(); });
  // Al responder bien: sumar puntos, avanzar con setTimeout
}

function perderVida() {
  arcoState.vidas--;
  if (arcoState.vidas <= 0) {
    arcoPerdido();
  } else {
    arcoState.preguntaActual++;
    if (arcoState.preguntaActual >= ARCOS[arcoState.arcoActual].preguntas.length) {
      arcoCompleto();
    } else {
      renderPregunta();
    }
  }
}

function arcoPerdido() { /* ... */ }
function arcoCompleto() { /* ... */ }

// Registrar listener del botón de arcos
document.addEventListener('DOMContentLoaded', () => {
  const btnArcos = document.getElementById('btn-arcos');
  if (btnArcos) {
    btnArcos.addEventListener('click', () => {
      arcoState.arcoActual = arcoState.arcosCompletados.length;
      if (arcoState.arcoActual > 4) arcoState.arcoActual = 4;
      KimetsuRouter.showScreen('trivia-arcos-screen');
      mostrarPantalla();
    });
  }
});
