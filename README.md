# 鬼滅の刃 — Kimetsu no Yaiba Quiz Definitivo

Un juego web interactivo de Kimetsu no Yaiba (Demon Slayer) con múltiples modos de juego, efectos 3D, voces japonesas y premios de katana.

---

## Modos de juego

### 🏯 Trivia por Arcos
Responde preguntas de conocimiento divididas en 5 arcos del manga/anime. Cada partida baraja y selecciona 10 preguntas distintas del pool de cada arco para que nunca sea igual. Hay timer de 15 segundos, vidas, racha de aciertos y puntuación con bonus.

- **Monte Sabiduría** — Arco del entrenamiento (Iniciado)
- **Tren Mugen** — Arco del Pilar de la Llama (Cazador)
- **Distrito del Entretenimiento** — Arco de Tengen Uzui (Élite)
- **Aldea de los Herreros** — Arco de Muichiro (Hashira)
- **Batalla Final** — Castillo del Infinito (Legendario)

### ♟️ Tateti — Rengoku vs Akaza
Tres en raya con ilustraciones de los personajes. Juega como Rengoku (X) contra la IA Akaza (O). Al ganar, se muestra la katana premio con animación.

### ⚒️ Forja tu Nichirin
Diseña tu propia katana Nichirin eligiendo:
- **Color de hoja** — 10 Respiraciones (Agua, Fuego, Trueno, Viento, Niebla, Insecto, Amor, Serpiente, Sonido, Sol)
- **Forma del Tsuba** — Circular, Cuadrada, Floral, Hexagonal
- **Color del Ito** — 8 colores de envoltorio del mango

Vista previa en canvas en tiempo real y botón para descargar la katana como imagen PNG.

### 🪢 Ahorcado
Adivina personajes y términos del universo KNY (30 palabras en pool, selección aleatoria cada partida). Teclado virtual, dibujo del ahorcado en canvas, y katana premio al ganar.

### 🃏 Cartas Nichirin
Memory game con 6 personajes (12 cartas). Encuentra los pares. Efectos 3D Bandai-style:
- Tilt perspectivo con el mouse
- Volteo animado con CSS 3D
- Efecto holográfico con shimmer al hacer match
- Partículas de celebración al acertar
- Premio katana al completar el tablero

### 💧🏯🌙 Tests de Personalidad
- **¿Qué Respiración eres?** — Agua, Fuego, Trueno, Bestia, Insecto
- **¿Qué Pilar eres?** — Descubre tu Hashira interior
- **¿Qué Luna Demoníaca eres?** — Para quienes abrazan la oscuridad

---

## Características técnicas

- **Sin dependencias** — HTML + CSS + JavaScript puro, un solo archivo
- **Voces japonesas** — Web Speech API con `lang='ja-JP'` para efectos de voz
- **Responsive** — Funciona en móvil y desktop
- **Animaciones CSS** — Hero animado, patrones de respiración, partículas
- **Canvas 2D** — Dibujo del ahorcado y la katana Nichirin
- **Fuentes** — Cinzel + Crimson Pro de Google Fonts

---

## Imágenes necesarias

Para el funcionamiento completo, las siguientes imágenes deben estar en la misma carpeta que `index.html`:

| Archivo | Uso |
|---|---|
| `tanjiro.png` | Hero + Carta de memoria |
| `rengoku.png` | Carta de memoria |
| `zenitsu.png` | Carta de memoria |
| `nezuko.png` | Carta de memoria |
| `akaza.png` | Carta de memoria |
| `giyu.png` | Carta de memoria |
| `rengokutateti.jpg` | Ficha de Rengoku en Tateti |
| `akazatateti.jpg` | Ficha de Akaza en Tateti |
| `katarengoku.jpg` | Premio katana al ganar Tateti |
| `katana_tanjiro.jpg` | Premio katana (Ahorcado / Tateti CPU gana) |
| `katana_zenitsu.jpg` | Premio katana al completar Cartas |
| `card_tanjiro.jpg` | Carta coleccionable desbloqueada |
| `tanjirosorprendido.png` | Overlay de respuesta incorrecta |

---

## Cómo ejecutar

Abre `index.html` directamente en el navegador. No requiere servidor ni instalación.

Para las voces japonesas, Chrome y Edge con idioma japonés instalado dan el mejor resultado.

---

## Créditos

Fan project de Kimetsu no Yaiba (© Koyoharu Gotouge / Shueisha). Todos los personajes y marcas pertenecen a sus respectivos dueños.
