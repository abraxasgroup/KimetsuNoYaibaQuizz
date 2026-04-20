/**
 * ================================================
 * KIMETSU NO YAIBA — QUIZ DEFINITIVO
 * script.js
 *
 * Estructura:
 *  1. Estado global (GameState)
 *  2. Banco de preguntas (Trivia, Respiración, Hashira, Luna)
 *  3. Resultados posibles para cada test de personalidad
 *  4. Lógica de navegación y renderizado
 *  5. Lógica de puntuación
 *  6. Efectos visuales (partículas)
 * ================================================
 */

'use strict';

// ================================================
// 1. ESTADO GLOBAL
// ================================================
const GameState = {
  currentMode: null,         // 'trivia' | 'respiracion' | 'hashira' | 'luna'
  currentQuestionIndex: 0,
  score: 0,                  // Sólo Trivia
  personalityPoints: {},     // Test de personalidad: { categoria: puntos }
  questions: [],             // Preguntas activas para esta partida
  answeredCorrectly: false,  // Trivia: si la última respuesta fue correcta
};

// ================================================
// 2. BANCO DE PREGUNTAS — TRIVIA GENERAL
// (Pool de 22 preguntas; se seleccionan 10 al azar)
// ================================================
const TRIVIA_POOL = [
  {
    question: "¿Cuál es el verdadero nombre completo de Inosuke?",
    options: ["Hashibira Inosuke", "Kamado Inosuke", "Agatsuma Inosuke", "Inosuke Yushiro"],
    answerIndex: 0
  },
  {
    question: "¿Qué color tiene la hoja de la espada de Zenitsu Agatsuma?",
    options: ["Rojo", "Amarillo", "Azul oscuro", "Naranja"],
    answerIndex: 1
  },
  {
    question: "¿Cuál es el rango máximo en la Corporación de Cazadores de Demonios?",
    options: ["Kanoe", "Taisho", "Hashira (Pilar)", "Mizunoto"],
    answerIndex: 2
  },
  {
    question: "¿Cuántas formas conoce Tanjiro de la Respiración del Agua?",
    options: ["8", "10", "12", "15"],
    answerIndex: 1
  },
  {
    question: "¿Qué demonio convirtió a Nezuko en un demonio?",
    options: ["Doma", "Akaza", "Muzan Kibutsuji", "Kokushibo"],
    answerIndex: 2
  },
  {
    question: "¿Cómo se llama la técnica exclusiva de Tanjiro que hereda del arco del Distrito del Entretenimiento?",
    options: ["Danza del Dios del Fuego", "Danza de las Llamas Hinokami Kagura", "Respiración del Sol", "Forma del Dios del Sol"],
    answerIndex: 1
  },
  {
    question: "¿Qué rango de Luna Demoníaca ocupa Akaza?",
    options: ["Luna Superior Cuatro", "Luna Superior Dos", "Luna Superior Tres", "Luna Superior Uno"],
    answerIndex: 2
  },
  {
    question: "¿Quién es el maestro de Tanjiro, Zenitsu e Inosuke durante el arco inicial?",
    options: ["Giyu Tomioka", "Sakonji Urokodaki", "Rengoku Kyojuro", "Tengen Uzui"],
    answerIndex: 1
  },
  {
    question: "¿Qué tiene de especial la sangre de Nezuko que la hace diferente a otros demonios?",
    options: [
      "Puede regenerarse sin comer humanos",
      "Su sangre quema y daña a los demonios",
      "Es inmune a la luz solar desde el inicio",
      "Puede crear ilusiones con su sangre"
    ],
    answerIndex: 1
  },
  {
    question: "¿Cómo se llama la técnica que usa Zenitsu con la Respiración del Trueno?",
    options: [
      "Primera Forma: Rayo en el Cielo",
      "Primera Forma: Trueno Thunderclap y Flash",
      "Sexta Forma: Dios del Trueno Constante",
      "Tercera Forma: Rayo Volador"
    ],
    answerIndex: 1
  },
  {
    question: "¿Cuál es el rango de Tanjiro al ingresar a la Corporación de Cazadores?",
    options: ["Hinoto", "Mizunoto", "Kanoto", "Tsuchinoto"],
    answerIndex: 1
  },
  {
    question: "¿Quién es el Pilar del Amor en la Corporación de Cazadores?",
    options: ["Shinobu Kocho", "Kanao Tsuyuri", "Mitsuri Kanroji", "Aoi Kanzaki"],
    answerIndex: 2
  },
  {
    question: "¿Cuántos hermanos tiene Muzan Kibutsuji en sus tropas de las Lunas Superiores?",
    options: ["Cuatro", "Cinco", "Seis", "Siete"],
    answerIndex: 2
  },
  {
    question: "¿Cuál fue el oficio de la familia Kamado antes de que fueran atacados?",
    options: ["Agricultores", "Herreros", "Vendedores de carbón", "Pescadores"],
    answerIndex: 2
  },
  {
    question: "¿Qué técnica usa Rengoku Kyojuro en su batalla contra Akaza en el Tren Mugen?",
    options: [
      "Novena Forma: Llamarada Carmesí",
      "Novena Forma: Purgatorio Llameante",
      "Décima Forma: Sol Abrasador",
      "Octava Forma: Sol en el Cielo"
    ],
    answerIndex: 1
  },
  {
    question: "¿Cómo se llama la espada que Tengen Uzui utiliza para combatir? ¿Cuál es su forma especial?",
    options: [
      "Swords in tandem / Sin forma especial",
      "Cuchillos kunaix / Forma del ninja",
      "Katana dual con cadenas / Técnica de la Explosión",
      "Espadas mellizas / Modo Melodía Explosiva"
    ],
    answerIndex: 3
  },
  {
    question: "¿Quién es el Pilar más joven de la historia de la Corporación de Cazadores?",
    options: ["Kanao Tsuyuri", "Muichiro Tokito", "Tanjiro Kamado", "Inosuke Hashibira"],
    answerIndex: 1
  },
  {
    question: "¿Qué demonio es derrotado por Tanjiro en el Arco del Monte Natagumo?",
    options: ["Rui (Luna Inferior Cinco)", "Doma (Luna Superior Dos)", "Susamaru", "Yahaba"],
    answerIndex: 0
  },
  {
    question: "¿Qué utiliza Shinobu Kocho para combatir a los demonios dado que no puede decapitarlos?",
    options: [
      "Explosivos de veneno en la hoja",
      "Veneno de wisteria inyectado con su espada",
      "Ilusiones para confundirlos",
      "Red de hilos explosivos"
    ],
    answerIndex: 1
  },
  {
    question: "¿Cuál es el nombre del tren protagonista del Arco del Tren Mugen?",
    options: ["Tren Kimetsu", "Tren Mugen", "Tren Enmu", "Tren Kagura"],
    answerIndex: 1
  },
  {
    question: "¿Qué le sucede a Nezuko cuando se expone a la luz solar al final del Arco del Distrito del Entretenimiento?",
    options: [
      "Muere inmediatamente",
      "Se convierte en humana al instante",
      "Sobrevive y se vuelve resistente a la luz solar",
      "Pierde sus poderes demoníacos"
    ],
    answerIndex: 2
  },
  {
    question: "¿Quién entrenó a Giyu Tomioka y a Sabito antes de la selección final?",
    options: ["Yoriichi Tsugikuni", "Kagaya Ubuyashiki", "Sakonji Urokodaki", "Tengen Uzui"],
    answerIndex: 2
  }
];

// ================================================
// 3. BANCO DE PREGUNTAS — TEST DE RESPIRACIÓN
// Categorías: Agua, Fuego, Trueno, Bestia, Insecto
// ================================================
const RESPIRACION_QUESTIONS = [
  {
    question: "¿Cómo reaccionas ante un problema repentino?",
    options: [
      { text: "Analizo la situación con calma antes de actuar.", points: { Agua: 2 } },
      { text: "¡Me lanzo de cabeza con toda mi energía!", points: { Fuego: 2 } },
      { text: "Me paralizo un instante, pero actúo con velocidad explosiva.", points: { Trueno: 2 } },
      { text: "Mi instinto me guía antes de que piense.", points: { Bestia: 2 } }
    ]
  },
  {
    question: "¿Cuál describe mejor tu rol en un equipo?",
    options: [
      { text: "El escudo: protejo y sostengo al grupo.", points: { Agua: 2 } },
      { text: "El líder: enciendo la llama y motivo a todos.", points: { Fuego: 2 } },
      { text: "El ejecutor veloz: actúo cuando nadie más puede.", points: { Trueno: 2 } },
      { text: "El solitario: prefiero pelear solo, a mi manera.", points: { Bestia: 2 } },
      { text: "El estratega: analizo debilidades y diseño el plan.", points: { Insecto: 2 } }
    ]
  },
  {
    question: "Un enemigo mucho más fuerte que tú se acerca. ¿Qué haces?",
    options: [
      { text: "Busco adaptarme a su estilo y encontrar una apertura.", points: { Agua: 2 } },
      { text: "Avanzo sin dudar. Mi voluntad supera el miedo.", points: { Fuego: 2 } },
      { text: "Un solo golpe fulminante antes de que reaccione.", points: { Trueno: 2 } },
      { text: "Lo domino con pura presión física y salvajismo.", points: { Bestia: 2 } },
      { text: "Le inyecto lentamente duda y agotamiento con pequeños golpes.", points: { Insecto: 2 } }
    ]
  },
  {
    question: "¿Cuál es tu mayor fortaleza en el combate?",
    options: [
      { text: "Mi fluidez y capacidad para desviar ataques.", points: { Agua: 2 } },
      { text: "Mi potencia y determinación implacable.", points: { Fuego: 2 } },
      { text: "Mi velocidad incomparable en el momento decisivo.", points: { Trueno: 2 } },
      { text: "Mi dureza física y resistencia al dolor.", points: { Bestia: 2 } },
      { text: "Mi precisión quirúrgica y conocimiento del cuerpo enemigo.", points: { Insecto: 2 } }
    ]
  },
  {
    question: "¿Qué elemento natural te atrae más?",
    options: [
      { text: "El río: tranquilo, pero poderoso e imparable.", points: { Agua: 2 } },
      { text: "El volcán: energía indomable, calor y transformación.", points: { Fuego: 2 } },
      { text: "La tormenta: velocidad, tensión y descarga perfecta.", points: { Trueno: 2 } },
      { text: "El bosque salvaje: instintivo, libre y sin reglas.", points: { Bestia: 2 } },
      { text: "El jardín de flores: belleza que oculta veneno.", points: { Insecto: 2 } }
    ]
  },
  {
    question: "¿Cómo describes tu relación con las emociones?",
    options: [
      { text: "Las controlo como corrientes de agua: fluyen pero no me arrastran.", points: { Agua: 2 } },
      { text: "Arden dentro de mí y me impulsan hacia adelante siempre.", points: { Fuego: 2 } },
      { text: "Me paralizan hasta el momento preciso, luego desaparecen.", points: { Trueno: 2 } },
      { text: "¿Emociones? Solo siento el impulso de avanzar y ganar.", points: { Bestia: 2 } },
      { text: "Las disimulo con una sonrisa mientras planifico mi siguiente movimiento.", points: { Insecto: 2 } }
    ]
  }
];

// Resultados del test de Respiración
const RESPIRACION_RESULTS = {
  Agua: {
    name: "Respiración del Agua",
    img: "giyu.png",
    description: "Tu alma fluye como el agua: tranquila en la superficie, pero extraordinariamente poderosa cuando se lo propone. Eres protector, adaptable y tremendamente leal. No buscas el conflicto, pero cuando llega, lo enfrentas con una gracia y serenidad que desconcierta a tus rivales.",
    tags: ["Tranquilo", "Adaptable", "Protector", "Leal"],
    color: "#2E86AB"
  },
  Fuego: {
    name: "Respiración de la Llama",
    img: "rengoku.png",
    description: "¡Tu corazón arde como una llama que nunca se apaga! Eres apasionado, extrovertido y un líder nato que inspira a todos a su alrededor. No conoces la palabra rendirse. Tu energía es contagiosa y tu determinación, imposible de quebrar.",
    tags: ["Apasionado", "Líder", "Enérgico", "Inquebrantable"],
    color: "#E74C3C"
  },
  Trueno: {
    name: "Respiración del Trueno",
    img: "zenitsu.png",
    description: "Eres veloz como un rayo, aunque a veces dudes de ti mismo. Cuando llega el momento decisivo, algo en tu interior despierta y superas todos tus miedos con una velocidad sobrehumana. Eres más fuerte de lo que crees, y los más cercanos a ti lo saben perfectamente.",
    tags: ["Veloz", "Leal", "Dualidad", "Explosivo"],
    color: "#F39C12"
  },
  Bestia: {
    name: "Respiración de la Bestia",
    img: "inosuke.png",
    description: "Salvaje, instintivo y completamente libre. Rechazas las reglas y los caminos establecidos para crear los tuyos propios. Tu competitividad no tiene límites y tu cuerpo se ha adaptado a condiciones extremas. No temes a nada porque confías absolutamente en tus sentidos.",
    tags: ["Salvaje", "Instintivo", "Competitivo", "Libre"],
    color: "#27AE60"
  },
  Insecto: {
    name: "Respiración del Insecto",
    img: "shinobu.png",
    description: "Estratégico, analítico y letalmente preciso. Tus rivales subestiman tu fuerza porque la ocultas detrás de una apariencia amable. Conoces la anatomía de los problemas mejor que nadie y siempre tienes un plan, aunque sonrías como si no tuvieras ninguno.",
    tags: ["Estratégico", "Analítico", "Preciso", "Resiliente"],
    color: "#8E44AD"
  }
};

// ================================================
// 4. BANCO DE PREGUNTAS — TEST HASHIRA
// Categorías: Giyu, Mitsuri, Obanai, Sanemi, Muichiro, Gyomei, Shinobu, Rengoku, Uzui
// ================================================
const HASHIRA_QUESTIONS = [
  {
    question: "Alguien a quien debes proteger está en peligro. ¿Cuál es tu primera reacción?",
    options: [
      { text: "Me interpongo entre él y el peligro en silencio.", points: { Giyu: 3 } },
      { text: "Grito de emoción y cargo con todo mi amor.", points: { Mitsuri: 3 } },
      { text: "Evalúo la situación con ojos fríos y actúo con precisión.", points: { Obanai: 3 } },
      { text: "Avanzo furioso sin dudar ni un segundo.", points: { Sanemi: 3 } }
    ]
  },
  {
    question: "¿Cómo sueles lidiar con tus sentimientos dolorosos?",
    options: [
      { text: "Los encierra en silencio. La soledad es mi escudo.", points: { Giyu: 3, Muichiro: 2 } },
      { text: "Los expreso con todo el corazón; la vida es demasiado corta.", points: { Mitsuri: 3 } },
      { text: "Los transformo en disciplina y entrenamiento constante.", points: { Muichiro: 3 } },
      { text: "Los convierto en oración y gratitud silenciosa.", points: { Gyomei: 3 } }
    ]
  },
  {
    question: "¿Cuál es el propósito más profundo de tu fortaleza?",
    options: [
      { text: "Proteger a los débiles que no pueden protegerse solos.", points: { Giyu: 2, Gyomei: 2 } },
      { text: "Amar y ser amada; la alegría de vivir plenamente.", points: { Mitsuri: 3 } },
      { text: "Ser un instrumento de la justicia divina.", points: { Gyomei: 3 } },
      { text: "Demostrar que nadie puede superar mi voluntad.", points: { Sanemi: 3, Uzui: 2 } }
    ]
  },
  {
    question: "¿Cómo describes tu estilo de combate ideal?",
    options: [
      { text: "Fluido, constante y letal como el agua.", points: { Giyu: 3 } },
      { text: "Flexible y acrobático; aprovecho cada ángulo.", points: { Mitsuri: 3 } },
      { text: "Serpenteante e imprevisible; mi hoja engaña.", points: { Obanai: 3 } },
      { text: "Brutal y directo: sin rodeos, pura fuerza.", points: { Sanemi: 3 } },
      { text: "Veloz, eficiente y sin un movimiento de más.", points: { Muichiro: 3 } },
      { text: "Explosivo y extravagante al máximo nivel.", points: { Uzui: 3 } }
    ]
  },
  {
    question: "¿Qué actitud tienes frente a quienes son más débiles que tú?",
    options: [
      { text: "Respeto su esfuerzo en silencio aunque no lo digo.", points: { Giyu: 2, Muichiro: 1 } },
      { text: "Los animo con todo mi entusiasmo.", points: { Mitsuri: 3 } },
      { text: "Los entreno sin piedad; la debilidad es peligrosa.", points: { Obanai: 2, Sanemi: 2 } },
      { text: "Rezo por su crecimiento y los guío con paciencia.", points: { Gyomei: 3 } },
      { text: "Espero que alcancen mi nivel; la competencia me divierte.", points: { Uzui: 2 } }
    ]
  },
  {
    question: "¿Cuál es tu mayor conflicto interior?",
    options: [
      { text: "La soledad que cargo por una pérdida que nunca olvidaré.", points: { Giyu: 3 } },
      { text: "No sentirme suficientemente amada o valiosa.", points: { Mitsuri: 3 } },
      { text: "Un pasado oscuro que transformé en propósito y devoción.", points: { Obanai: 3 } },
      { text: "La rabia que no puedo apagar aunque quiera hacerlo.", points: { Sanemi: 3 } },
      { text: "Recuerdos que se desvanecen; no sé quién soy realmente.", points: { Muichiro: 3 } },
      { text: "Equilibrar el honor de mi familia con mi propia felicidad.", points: { Uzui: 3 } }
    ]
  },
  {
    question: "Frente a un demonio que fue humano y sufrió, ¿cuál es tu postura?",
    options: [
      { text: "Lo elimino. El pasado no justifica el daño presente.", points: { Giyu: 1, Obanai: 2, Sanemi: 3 } },
      { text: "Siento empatía por su historia, pero cumplo mi deber.", points: { Mitsuri: 2, Gyomei: 3 } },
      { text: "Su sufrimiento lo entiendo, pero la amenaza debe terminar.", points: { Muichiro: 3 } },
      { text: "Enfrento la situación con extravagancia y la máxima dignidad.", points: { Uzui: 3 } }
    ]
  }
];

// Resultados del test de Hashira
const HASHIRA_RESULTS = {
  Giyu: {
    name: "Giyu Tomioka",
    img: "giyu.png",
    description: "Pilar del Agua. Reservado, profundo y tremendamente leal a pesar de su exterior frío. Cargas una soledad que pocos comprenden, pero dentro de ti arde una protección inquebrantable por aquellos que valoras. Tu silencio habla más que mil palabras.",
    tags: ["Reservado", "Leal", "Protector", "Agua"],
    color: "#2E86AB"
  },
  Mitsuri: {
    name: "Mitsuri Kanroji",
    img: "mitsuri.png",
    description: "Pilar del Amor. Apasionada, empática y vibrante como un campo en flor. Tu fortaleza no reside en la dureza, sino en la inmensa capacidad de querer con todo tu ser. Amas la vida plenamente y eso mismo te convierte en una guerrera extraordinaria.",
    tags: ["Apasionada", "Empática", "Amor", "Vibrante"],
    color: "#FF6B9D"
  },
  Obanai: {
    name: "Obanai Iguro",
    img: "obanai.png",
    description: "Pilar de la Serpiente. Frío, preciso y profundamente complejo. Tu exterior intimidante oculta un interior que ha sufrido enormemente y ha convertido ese sufrimiento en disciplina absoluta. Eres más sensible de lo que aparentas.",
    tags: ["Preciso", "Frío", "Complejo", "Serpiente"],
    color: "#6C3483"
  },
  Sanemi: {
    name: "Sanemi Shinazugawa",
    img: "sanemi.png",
    description: "Pilar del Viento. Explosivo, sin filtros y con una intensidad que asusta a primera vista. Pero detrás de esa furia vive alguien que ha perdido demasiado y protege con una ferocidad que no tiene comparación. Tu rabia es también tu amor.",
    tags: ["Intenso", "Feroz", "Viento", "Explosivo"],
    color: "#27AE60"
  },
  Muichiro: {
    name: "Muichiro Tokito",
    img: "muichiro.png",
    description: "Pilar de la Niebla. Distante, eficiente y misterioso. Tus recuerdos fragmentados te hacen enigmático incluso para ti mismo. Pero cuando actúas, lo haces con una precisión y fluidez sobrehumanas que no deja duda de tu poder excepcional.",
    tags: ["Distante", "Eficiente", "Niebla", "Misterioso"],
    color: "#5DADE2"
  },
  Gyomei: {
    name: "Gyomei Himejima",
    img: "gyomei.png",
    description: "Pilar de la Piedra. El más poderoso de los Hashira. Tu fe es tan sólida como tu cuerpo, y tu gentileza tan profunda como tu fuerza. Conviertes la tragedia en compasión y la tristeza en oración constante. Eres el pilar que todos los demás admiraron en silencio.",
    tags: ["Poderoso", "Compasivo", "Fe", "Piedra"],
    color: "#A9A9A9"
  },
  Shinobu: {
    name: "Shinobu Kocho",
    img: "shinobu.png",
    description: "Pilar del Insecto. Tu sonrisa oculta una mente que analiza y planifica constantemente. Cargas un dolor enorme con elegancia y nunca permites que te paralice. Eres la prueba de que la inteligencia y la voluntad superan a la fuerza bruta.",
    tags: ["Estratégica", "Elegante", "Insecto", "Resiliente"],
    color: "#8E44AD"
  },
  Rengoku: {
    name: "Rengoku Kyojuro",
    img: "rengoku.png",
    description: "Pilar de la Llama. Tu alma arde con una pasión que ilumina a todos los que te rodean. Eres el corazón del grupo: entusiasta, honesto y capaz de encontrar belleza y propósito incluso en los momentos más oscuros. ¡Que tus llamas ardan por siempre!",
    tags: ["Apasionado", "Inspirador", "Llama", "Líder"],
    color: "#E74C3C"
  },
  Uzui: {
    name: "Tengen Uzui",
    img: "uzui.png",
    description: "Pilar del Sonido. Extravagante, carismático y con un nivel de carisma que pocos pueden igualar. Equilibras el deber del clan con la felicidad personal, y peleas con la misma intensidad con la que vives: a todo volumen, sin disculpas.",
    tags: ["Extravagante", "Carismático", "Sonido", "Libre"],
    color: "#F39C12"
  }
};

// ================================================
// 5. BANCO DE PREGUNTAS — LUNA DEMONÍACA
// Categorías: Kokushibo, Doma, Akaza, Hantengu, Gyokko, Daki
// ================================================
const LUNA_QUESTIONS = [
  {
    question: "¿Cómo enfrentas la envidia cuando ves a alguien más poderoso que tú?",
    options: [
      { text: "La transformo en disciplina eterna. La superaré con siglos de práctica.", points: { Kokushibo: 3 } },
      { text: "Los amo profundamente... y los absorbo para que sean parte de mí.", points: { Doma: 3 } },
      { text: "Lucho contra ellos inmediatamente. El combate es la única respuesta.", points: { Akaza: 3 } },
      { text: "Me fragmento internamente de miedo, pero nunca lo demuestro.", points: { Hantengu: 3 } },
      { text: "Los considero incapaces de apreciar la verdadera belleza. Los elimino.", points: { Gyokko: 3 } },
      { text: "Seducción y astucia. Los manipulo hasta que no quede nada.", points: { Daki: 3 } }
    ]
  },
  {
    question: "¿Qué harías para sobrevivir si estuvieras en el límite absoluto?",
    options: [
      { text: "Negarme a morir por pura voluntad. He sobrevivido siglos; sobreviviré esto.", points: { Kokushibo: 3 } },
      { text: "Nada. El dolor no existe para mí. Sigo adelante con mi sonrisa.", points: { Doma: 3 } },
      { text: "Luchar con cada célula de mi ser hasta el último aliento.", points: { Akaza: 3 } },
      { text: "Esconderme, dividirnos, encontrar la grieta por donde escapar.", points: { Hantengu: 3 } },
      { text: "Crear algo tan bello y aterrador que el enemigo se paralice.", points: { Gyokko: 3 } },
      { text: "Usar a los que me rodean como escudo. Ellos están para servirme.", points: { Daki: 3 } }
    ]
  },
  {
    question: "¿Cuál es tu relación con el poder?",
    options: [
      { text: "Es el único propósito verdadero. Lo he perseguido durante toda la eternidad.", points: { Kokushibo: 3 } },
      { text: "El poder me permite dar amor a todos los que consuma.", points: { Doma: 2, Gyokko: 1 } },
      { text: "El combate es la única forma de existir plenamente.", points: { Akaza: 3 } },
      { text: "El poder es lo único que me protege del miedo que me devora.", points: { Hantengu: 3 } },
      { text: "El poder me da derecho a crear y destruir lo feo de este mundo.", points: { Gyokko: 3 } },
      { text: "Es una herramienta para obtener lo que quiero. Nada más.", points: { Daki: 3 } }
    ]
  },
  {
    question: "¿Qué pérdida del pasado aún te persigue?",
    options: [
      { text: "La rivalidad con mi hermano que consumió mi humanidad entera.", points: { Kokushibo: 3 } },
      { text: "Ninguna. No recuerdo el dolor; nunca lo he sentido de verdad.", points: { Doma: 3 } },
      { text: "La persona que amé y que me enseñó que el amor termina en muerte.", points: { Akaza: 3 } },
      { text: "El terror constante que nunca me dejó en paz desde que nací.", points: { Hantengu: 3 } },
      { text: "El rechazo de quienes no supieron apreciar mi arte extraordinario.", points: { Gyokko: 3 } },
      { text: "Un pasado de miseria que juré que nunca volvería a repetirse.", points: { Daki: 3 } }
    ]
  },
  {
    question: "¿Cómo ves a los humanos que te rodean?",
    options: [
      { text: "Inferiores, efímeros. Mero ruido ante mi existencia eterna.", points: { Kokushibo: 3 } },
      { text: "Los amo a todos. Por eso debo salvarlos consumiéndolos.", points: { Doma: 3 } },
      { text: "Solo los fuertes merecen mi atención. Los débiles no existen.", points: { Akaza: 3 } },
      { text: "Amenazas potenciales. Podría atacarme en cualquier momento.", points: { Hantengu: 3 } },
      { text: "Son incapaces de comprender la belleza. Su existencia me ofende.", points: { Gyokko: 3 } },
      { text: "Son herramientas o peligros. Yo decido cuáles merecen existir.", points: { Daki: 3 } }
    ]
  },
  {
    question: "¿Cuál es tu verdad más oscura?",
    options: [
      { text: "Sacrifiqué todo lo que era por un poder que nunca fue suficiente.", points: { Kokushibo: 3 } },
      { text: "Soy incapaz de sentir nada verdadero y lo he aceptado con calma.", points: { Doma: 3 } },
      { text: "El combate es lo único que me queda porque perdí razones para vivir.", points: { Akaza: 3 } },
      { text: "Cada una de mis emociones ha tomado vida propia y me han vuelto inestable.", points: { Hantengu: 3 } },
      { text: "Destruyo lo bello porque no soporto que otros lo posean.", points: { Gyokko: 3 } },
      { text: "Uso el amor como arma porque fue la única arma que tuve de niña.", points: { Daki: 3 } }
    ]
  }
];

// Resultados del test de Luna Demoníaca
const LUNA_RESULTS = {
  Kokushibo: {
    name: "Kokushibo",
    img: "kokushibo.png",
    description: "Luna Superior Uno. La encarnación de la búsqueda sin fin del poder. Sacrificaste tu humanidad, tu familia y siglos de soledad para convertirte en el demonio más poderoso después del propio Muzan. Nadie conoce la soledad eterna como tú.",
    tags: ["Luna Uno", "Eterno", "Rival fraternal", "Respiración de la Luna"],
    color: "#1A1A2E"
  },
  Doma: {
    name: "Doma",
    img: "doma.png",
    description: "Luna Superior Dos. El vacío absoluto disfrazado de sonrisa radiante. No sientes nada genuino, pero finges el amor más convincente del mundo. Consumes a quienes te rodean creyendo que los salvas. La tragedia es que nunca lo sabrás.",
    tags: ["Luna Dos", "Vacío", "Sonrisa falsa", "Carismático"],
    color: "#4A0E0E"
  },
  Akaza: {
    name: "Akaza",
    img: "akaza.png",
    description: "Luna Superior Tres. El guerrero eterno atrapado en la negación. Convertiste el amor más puro en la rabia más destructiva y la enterraste tan profundo que solo el combate puede recordarte que alguna vez fuiste humano.",
    tags: ["Luna Tres", "Combate", "Negación", "Fuerza pura"],
    color: "#8B0000"
  },
  Hantengu: {
    name: "Hantengu",
    img: "hantengu.png",
    description: "Luna Superior Cuatro. El monstruo más cobarde y el más peligroso por ello. Tus emociones te fragmentaron literalmente en múltiples seres. Cada miedo, cada odio, cada alegría tiene su propia forma. Eres un caos emocional hecho demonio.",
    tags: ["Luna Cuatro", "Cobardía", "Emociones fragmentadas", "Inestable"],
    color: "#5D3A1A"
  },
  Gyokko: {
    name: "Gyokko",
    img: "gyokko.png",
    description: "Luna Superior Cinco. El artista que confunde la belleza con la posesión. Tu concepto del arte es tan retorcido como tu forma misma. Destruyes lo que no puedes controlar y llamas a eso creación. Tu orgullo es tan grande como tu fragilidad.",
    tags: ["Luna Cinco", "Arte oscuro", "Orgullo", "Creación y destrucción"],
    color: "#1B4F72"
  },
  Daki: {
    name: "Daki (y Gyutaro)",
    img: "daki.png",
    description: "Luna Superior Seis. Naciste en la miseria más absoluta y convertiste el sufrimiento en poder de seducción y supervivencia. Eres manipuladora, temible y, en el fondo, el producto de un mundo que nunca te protegió. Tu hermano y tú son inseparables.",
    tags: ["Luna Seis", "Seducción", "Supervivencia", "Dualidad"],
    color: "#6C1A3A"
  }
};

// ================================================
// 6. REFERENCIAS AL DOM
// ================================================
const DOM = {
  menuScreen:    document.getElementById('menu-screen'),
  quizScreen:    document.getElementById('quiz-screen'),
  resultScreen:  document.getElementById('result-screen'),
  modeCards:     document.querySelectorAll('.mode-card'),
  btnBack:       document.getElementById('btn-back'),
  quizModeLabel: document.getElementById('quiz-mode-label'),
  quizProgress:  document.getElementById('quiz-progress'),
  progressFill:  document.getElementById('progress-bar-fill'),
  questionNum:   document.getElementById('question-counter'),
  questionText:  document.getElementById('question-text'),
  optionsGrid:   document.getElementById('options-grid'),
  nextContainer: document.getElementById('next-container'),
  btnNext:       document.getElementById('btn-next'),
  resultCategory:document.getElementById('result-category'),
  resultName:    document.getElementById('result-name'),
  resultScore:   document.getElementById('result-score'),
  resultDesc:    document.getElementById('result-description'),
  resultTags:    document.getElementById('result-tags'),
  resultImg:     document.getElementById('result-img'),
  resultFallback:document.getElementById('result-img-fallback'),
  btnRestart:    document.getElementById('btn-restart'),
  btnMenu:       document.getElementById('btn-menu'),
};

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const MODE_LABELS = {
  trivia:      '⚔️ Trivia',
  respiracion: '💧 Respiración',
  hashira:     '🏯 Hashira',
  luna:        '🌙 Luna Demoníaca'
};

// ================================================
// 7. FUNCIONES DE NAVEGACIÓN
// ================================================

/**
 * Muestra la pantalla indicada y oculta las demás.
 * @param {string} screenId - ID de la sección a mostrar
 */
function showScreen(screenId) {
  [DOM.menuScreen, DOM.quizScreen, DOM.resultScreen].forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const target = document.getElementById(screenId);
  target.classList.remove('hidden');
  target.classList.add('active');
  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================
// 8. INICIALIZACIÓN Y CARGA DE MODO
// ================================================

/**
 * Configura el juego para el modo seleccionado y muestra el quiz.
 * @param {string} mode - 'trivia' | 'respiracion' | 'hashira' | 'luna'
 */
function loadMode(mode) {
  // Reiniciar estado
  GameState.currentMode          = mode;
  GameState.currentQuestionIndex = 0;
  GameState.score                = 0;
  GameState.personalityPoints    = {};
  GameState.answeredCorrectly    = false;

  // Seleccionar preguntas según el modo
  switch (mode) {
    case 'trivia':
      GameState.questions = shuffleArray([...TRIVIA_POOL]).slice(0, 10);
      break;
    case 'respiracion':
      // Inicializar puntos de personalidad
      ['Agua', 'Fuego', 'Trueno', 'Bestia', 'Insecto'].forEach(cat => {
        GameState.personalityPoints[cat] = 0;
      });
      GameState.questions = shuffleArray([...RESPIRACION_QUESTIONS]);
      break;
    case 'hashira':
      Object.keys(HASHIRA_RESULTS).forEach(cat => {
        GameState.personalityPoints[cat] = 0;
      });
      GameState.questions = shuffleArray([...HASHIRA_QUESTIONS]);
      break;
    case 'luna':
      Object.keys(LUNA_RESULTS).forEach(cat => {
        GameState.personalityPoints[cat] = 0;
      });
      GameState.questions = shuffleArray([...LUNA_QUESTIONS]);
      break;
  }

  // Actualizar etiqueta del modo
  DOM.quizModeLabel.textContent = MODE_LABELS[mode];

  showScreen('quiz-screen');
  renderQuestion();
}

// ================================================
// 9. RENDERIZADO DE PREGUNTAS
// ================================================

/**
 * Renderiza la pregunta actual en el DOM.
 */
function renderQuestion() {
  const total   = GameState.questions.length;
  const idx     = GameState.currentQuestionIndex;
  const q       = GameState.questions[idx];

  // Actualizar progreso
  const humanIdx = idx + 1;
  DOM.quizProgress.textContent = `${humanIdx} / ${total}`;
  DOM.questionNum.textContent  = `Pregunta ${humanIdx}`;
  DOM.progressFill.style.width = `${(idx / total) * 100}%`;

  // Texto de la pregunta
  DOM.questionText.textContent = q.question;

  // Limpiar opciones previas
  DOM.optionsGrid.innerHTML = '';
  DOM.nextContainer.style.display = 'none';

  // Renderizar opciones
  const options = GameState.currentMode === 'trivia' ? q.options : q.options.map(o => o.text);
  options.forEach((optText, i) => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.setAttribute('data-letter', LETTERS[i]);
    btn.setAttribute('data-index', i);
    btn.setAttribute('role', 'listitem');
    btn.textContent = optText;

    btn.addEventListener('click', () => handleAnswer(i, btn));
    DOM.optionsGrid.appendChild(btn);
  });

  // Animación de entrada escalonada para los botones
  DOM.optionsGrid.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(12px)';
    setTimeout(() => {
      btn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    }, 60 * i);
  });
}

// ================================================
// 10. LÓGICA DE RESPUESTA
// ================================================

/**
 * Maneja la selección de una opción de respuesta.
 * @param {number} selectedIndex - Índice de la opción elegida
 * @param {HTMLElement} clickedBtn - Botón que fue pulsado
 */
function handleAnswer(selectedIndex, clickedBtn) {
  const q    = GameState.questions[GameState.currentQuestionIndex];
  const btns = DOM.optionsGrid.querySelectorAll('.option-btn');

  // Bloquear todos los botones
  btns.forEach(b => b.disabled = true);

  if (GameState.currentMode === 'trivia') {
    // Lógica de Trivia
    const correct = q.answerIndex;
    if (selectedIndex === correct) {
      clickedBtn.classList.add('correct');
      GameState.score++;
    } else {
      clickedBtn.classList.add('incorrect');
      btns[correct].classList.add('correct');
    }
    // Atenuar las demás opciones
    btns.forEach((b, i) => {
      if (i !== selectedIndex && i !== correct) {
        b.classList.add('revealed');
      }
    });
  } else {
    // Lógica de Test de Personalidad
    const selectedOption = q.options[selectedIndex];
    // Sumar puntos a las categorías correspondientes
    Object.entries(selectedOption.points).forEach(([cat, pts]) => {
      if (GameState.personalityPoints[cat] !== undefined) {
        GameState.personalityPoints[cat] += pts;
      }
    });
    // Marcar la selección visualmente
    clickedBtn.classList.add('correct');
    btns.forEach((b, i) => {
      if (i !== selectedIndex) b.classList.add('revealed');
    });
  }

  // Mostrar botón "Siguiente"
  DOM.nextContainer.style.display = 'flex';
}

// ================================================
// 11. AVANCE Y RESULTADO FINAL
// ================================================

/**
 * Avanza a la siguiente pregunta o muestra el resultado.
 */
function advanceQuestion() {
  GameState.currentQuestionIndex++;
  const total = GameState.questions.length;

  if (GameState.currentQuestionIndex < total) {
    renderQuestion();
  } else {
    showResult();
  }
}

/**
 * Calcula el resultado y lo muestra en pantalla.
 */
function showResult() {
  let resultData;
  let category = '';
  let scoreLabel = '';

  if (GameState.currentMode === 'trivia') {
    // Resultado de Trivia
    const score    = GameState.score;
    const total    = GameState.questions.length;
    const pct      = (score / total) * 100;

    let emoji = pct === 100 ? '🔥' : pct >= 70 ? '⚔️' : pct >= 40 ? '💧' : '😓';
    let msg   = pct === 100
      ? 'Eres un verdadero Hashira del conocimiento.'
      : pct >= 70
      ? 'Gran actuación, Cazador de Demonios.'
      : pct >= 40
      ? 'Buen intento. El entrenamiento continúa.'
      : 'Vuelve a repasar el anime... ¡ánimo!';

    scoreLabel = `${emoji} ${score} / ${total}`;
    resultData = {
      name: "Tanjiro Kamado",
      img:  "tanjiro.png",
      description: msg + " Sigue adelante con la misma determinación que el joven Kamado.",
      tags: ["Trivia General", `${score}/${total} correctas`],
      color: "#C0392B"
    };
    category = "Resultado Final";

  } else {
    // Resultado de test de personalidad
    const winnerCat = getWinnerCategory(GameState.personalityPoints);

    const resultMap = {
      respiracion: RESPIRACION_RESULTS,
      hashira:     HASHIRA_RESULTS,
      luna:        LUNA_RESULTS
    };
    resultData = resultMap[GameState.currentMode][winnerCat];
    category   = winnerCat;

    const catLabel = {
      respiracion: '✨ Tu Respiración',
      hashira:     '🏯 Tu Pilar',
      luna:        '🌙 Tu Luna Demoníaca'
    };
    DOM.resultCategory.textContent = catLabel[GameState.currentMode];
  }

  // Renderizar el resultado en el DOM
  DOM.resultCategory.textContent = category;
  DOM.resultName.textContent      = resultData.name;
  DOM.resultScore.textContent     = scoreLabel;
  DOM.resultDesc.textContent      = resultData.description;

  // Tags
  DOM.resultTags.innerHTML = resultData.tags
    .map(t => `<span class="result-tag">${t}</span>`)
    .join('');

  // Imagen con fallback
  setupResultImage(resultData.img, resultData.name, resultData.color);

  // Mostrar pantalla de resultado
  showScreen('result-screen');

  // Lanzar partículas celebratorias
  launchResultParticles(resultData.color || '#C0392B');
}

/**
 * Configura la imagen del resultado con fallback.
 * @param {string} imgSrc - Nombre del archivo de imagen
 * @param {string} altName - Nombre del personaje
 * @param {string} fallbackColor - Color de fondo del fallback
 */
function setupResultImage(imgSrc, altName, fallbackColor) {
  const img      = DOM.resultImg;
  const fallback = DOM.resultFallback;

  img.classList.remove('hidden');
  fallback.classList.add('hidden');

  img.alt = altName;
  img.src = imgSrc;

  img.onerror = () => {
    // Si la imagen no carga, mostramos el fallback de color
    img.classList.add('hidden');
    fallback.classList.remove('hidden');
    fallback.style.background = fallbackColor || '#333';
    fallback.textContent = altName;
  };
}

// ================================================
// 12. LÓGICA DE PUNTUACIÓN DE PERSONALIDAD
// ================================================

/**
 * Determina la categoría ganadora del test de personalidad.
 * En caso de empate, selecciona aleatoriamente entre los empatados.
 * @param {Object} points - Objeto { categoria: puntos }
 * @returns {string} - Nombre de la categoría ganadora
 */
function getWinnerCategory(points) {
  const maxScore = Math.max(...Object.values(points));
  // Filtrar todas las categorías que alcanzaron el máximo (posible empate)
  const winners  = Object.keys(points).filter(cat => points[cat] === maxScore);

  if (winners.length === 1) {
    return winners[0];
  }
  // Desempate aleatorio con pseudo-aleatoriedad justa
  return winners[Math.floor(Math.random() * winners.length)];
}

// ================================================
// 13. UTILIDADES
// ================================================

/**
 * Mezcla un array de forma aleatoria (Fisher-Yates).
 * @param {Array} arr - Array a mezclar
 * @returns {Array} - Array mezclado
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ================================================
// 14. EFECTOS VISUALES — PARTÍCULAS FLOTANTES
// ================================================

/**
 * Inicializa las partículas de fondo del menú.
 */
function initMenuParticles() {
  const container = document.getElementById('particles');
  const colors    = ['#C0392B', '#2E8B57', '#C9A84C', '#6C3483', '#2E86AB'];
  const count     = 25;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');

    const size  = Math.random() * 4 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left  = Math.random() * 100;
    const delay = Math.random() * 12;
    const dur   = Math.random() * 10 + 10;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${left}%;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      opacity: 0;
    `;
    container.appendChild(p);
  }
}

/**
 * Lanza partículas celebratorias en la pantalla de resultado.
 * @param {string} color - Color principal de las partículas
 */
function launchResultParticles(color) {
  const container = document.getElementById('result-particles');
  container.innerHTML = '';

  const colors = [color, '#C9A84C', '#F0E6D3', '#ffffff'];
  const count  = 40;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      width: ${Math.random() * 6 + 2}px;
      height: ${Math.random() * 6 + 2}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float-particle ${Math.random() * 4 + 3}s ease-out both;
      animation-delay: ${Math.random() * 1.5}s;
      opacity: 0;
    `;
    container.appendChild(p);
  }
}

// ================================================
// 15. EVENT LISTENERS
// ================================================

// Clic en tarjetas del menú principal
DOM.modeCards.forEach(card => {
  card.addEventListener('click', () => {
    const mode = card.getAttribute('data-mode');
    loadMode(mode);
  });
});

// Botón "Volver al menú" dentro del quiz
DOM.btnBack.addEventListener('click', () => {
  showScreen('menu-screen');
});

// Botón "Siguiente pregunta"
DOM.btnNext.addEventListener('click', advanceQuestion);

// Botón "Jugar de nuevo"
DOM.btnRestart.addEventListener('click', () => {
  if (GameState.currentMode) {
    loadMode(GameState.currentMode);
  }
});

// Botón "Menú Principal" en resultado
DOM.btnMenu.addEventListener('click', () => {
  showScreen('menu-screen');
});

// ================================================
// 16. INICIALIZACIÓN
// ================================================
initMenuParticles();
