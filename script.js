/**
 * ================================================
 * KIMETSU NO YAIBA — QUIZ DEFINITIVO (v2.0)
 * script.js
 *
 * Mejoras v2.0:
 *  - Pool Trivia expandido a 40 preguntas
 *  - Sistema de puntaje / ranking con localStorage
 *  - Bonus de velocidad en Trivia
 *  - Transiciones animadas entre pantallas
 *  - Shake en respuesta incorrecta
 *  - showScreen unificado (elimina duplicado de minijuegos.js)
 *  - Lazy init de minijuegos
 *  - Tateti: caras SVG de Rengoku y Akaza
 * ================================================
 */

'use strict';

// ================================================
// 1. ESTADO GLOBAL
// ================================================
const GameState = {
  currentMode:          null,
  currentQuestionIndex: 0,
  score:                0,
  personalityPoints:    {},
  questions:            [],
  answeredCorrectly:    false,
  questionStartTime:    0,       // para bonus de velocidad
  timeBonus:            0,       // bonus acumulado
};

// ================================================
// 2. SISTEMA DE RANKING — localStorage
// ================================================
const Ranking = (function () {
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

  function clear() { localStorage.removeItem(KEY); }

  return { save, getTop, clear };
})();

// ================================================
// 3. BANCO DE PREGUNTAS — TRIVIA GENERAL (40 Qs)
// ================================================
const TRIVIA_POOL = [
  // — Originales —
  {
    question: "¿Cuál es el verdadero nombre completo de Inosuke?",
    options: ["Hashibira Inosuke","Kamado Inosuke","Agatsuma Inosuke","Inosuke Yushiro"],
    answerIndex: 0
  },
  {
    question: "¿Qué color tiene la hoja de la espada de Zenitsu Agatsuma?",
    options: ["Rojo","Amarillo","Azul oscuro","Naranja"],
    answerIndex: 1
  },
  {
    question: "¿Cuál es el rango máximo en la Corporación de Cazadores de Demonios?",
    options: ["Kanoe","Taisho","Hashira (Pilar)","Mizunoto"],
    answerIndex: 2
  },
  {
    question: "¿Cuántas formas conoce Tanjiro de la Respiración del Agua?",
    options: ["8","10","12","15"],
    answerIndex: 1
  },
  {
    question: "¿Qué demonio convirtió a Nezuko en un demonio?",
    options: ["Doma","Akaza","Muzan Kibutsuji","Kokushibo"],
    answerIndex: 2
  },
  {
    question: "¿Cómo se llama la técnica exclusiva de Tanjiro que hereda del arco del Distrito del Entretenimiento?",
    options: ["Danza del Dios del Fuego","Danza de las Llamas Hinokami Kagura","Respiración del Sol","Forma del Dios del Sol"],
    answerIndex: 1
  },
  {
    question: "¿Qué rango de Luna Demoníaca ocupa Akaza?",
    options: ["Luna Superior Cuatro","Luna Superior Dos","Luna Superior Tres","Luna Superior Uno"],
    answerIndex: 2
  },
  {
    question: "¿Quién es el maestro de Tanjiro durante el entrenamiento inicial?",
    options: ["Giyu Tomioka","Sakonji Urokodaki","Rengoku Kyojuro","Tengen Uzui"],
    answerIndex: 1
  },
  {
    question: "¿Qué tiene de especial la sangre de Nezuko?",
    options: [
      "Puede regenerarse sin comer humanos",
      "Su sangre quema y daña a los demonios",
      "Es inmune a la luz solar desde el inicio",
      "Puede crear ilusiones"
    ],
    answerIndex: 1
  },
  {
    question: "¿Cómo se llama la técnica relámpago de Zenitsu?",
    options: [
      "Primera Forma: Rayo en el Cielo",
      "Primera Forma: Trueno Thunderclap y Flash",
      "Sexta Forma: Dios del Trueno Constante",
      "Tercera Forma: Rayo Volador"
    ],
    answerIndex: 1
  },
  {
    question: "¿Cuál es el rango de Tanjiro al ingresar a la Corporación?",
    options: ["Hinoto","Mizunoto","Kanoto","Tsuchinoto"],
    answerIndex: 1
  },
  {
    question: "¿Quién es el Pilar del Amor?",
    options: ["Shinobu Kocho","Kanao Tsuyuri","Mitsuri Kanroji","Aoi Kanzaki"],
    answerIndex: 2
  },
  {
    question: "¿Cuántas Lunas Superiores existen?",
    options: ["Cuatro","Cinco","Seis","Siete"],
    answerIndex: 2
  },
  {
    question: "¿Cuál fue el oficio de la familia Kamado?",
    options: ["Agricultores","Herreros","Vendedores de carbón","Pescadores"],
    answerIndex: 2
  },
  {
    question: "¿Qué técnica usa Rengoku en su batalla final contra Akaza?",
    options: [
      "Novena Forma: Llamarada Carmesí",
      "Novena Forma: Purgatorio Llameante",
      "Décima Forma: Sol Abrasador",
      "Octava Forma: Sol en el Cielo"
    ],
    answerIndex: 1
  },
  {
    question: "¿Cuál es el estilo de espada de Tengen Uzui?",
    options: [
      "Swords in tandem / Sin forma especial",
      "Cuchillos kunai / Forma del ninja",
      "Katana dual con cadenas / Técnica de la Explosión",
      "Espadas mellizas / Modo Melodía Explosiva"
    ],
    answerIndex: 3
  },
  {
    question: "¿Quién es el Pilar más joven de la historia?",
    options: ["Kanao Tsuyuri","Muichiro Tokito","Tanjiro Kamado","Inosuke Hashibira"],
    answerIndex: 1
  },
  {
    question: "¿Qué demonio derrota Tanjiro en el Monte Natagumo?",
    options: ["Rui (Luna Inferior Cinco)","Doma (Luna Superior Dos)","Susamaru","Yahaba"],
    answerIndex: 0
  },
  {
    question: "¿Cómo combate Shinobu dado que no puede decapitar demonios?",
    options: [
      "Explosivos de veneno en la hoja",
      "Veneno de wisteria inyectado con su espada",
      "Ilusiones para confundirlos",
      "Red de hilos explosivos"
    ],
    answerIndex: 1
  },
  {
    question: "¿Cuál es el nombre del tren del Arco del Tren?",
    options: ["Tren Kimetsu","Tren Mugen","Tren Enmu","Tren Kagura"],
    answerIndex: 1
  },
  {
    question: "¿Qué le sucede a Nezuko al exponerse al sol al final del Arco del Distrito?",
    options: [
      "Muere inmediatamente",
      "Se convierte en humana al instante",
      "Sobrevive y se vuelve resistente a la luz solar",
      "Pierde sus poderes demoníacos"
    ],
    answerIndex: 2
  },
  {
    question: "¿Quién entrenó a Giyu Tomioka y a Sabito?",
    options: ["Yoriichi Tsugikuni","Kagaya Ubuyashiki","Sakonji Urokodaki","Tengen Uzui"],
    answerIndex: 2
  },
  // — Nuevas —
  {
    question: "¿Cómo se llama el hermano mayor de Muichiro Tokito?",
    options: ["Yuichiro","Genya","Sabito","Makomo"],
    answerIndex: 0
  },
  {
    question: "¿Cuál es la respiración original de la que derivan todas las demás?",
    options: ["Respiración del Agua","Respiración del Sol","Respiración del Fuego","Respiración del Viento"],
    answerIndex: 1
  },
  {
    question: "¿Quién es el hermano de Sanemi Shinazugawa también cazador de demonios?",
    options: ["Genya Shinazugawa","Muichiro Tokito","Kanao Tsuyuri","Sabito"],
    answerIndex: 0
  },
  {
    question: "¿Qué habilidad única posee Genya Shinazugawa?",
    options: [
      "Puede usar dos respiraciones a la vez",
      "Absorbe poderes de los demonios al comerlos",
      "Es inmune al veneno demoníaco",
      "Puede ver los hilos del destino"
    ],
    answerIndex: 1
  },
  {
    question: "¿Cuántos hijos tenía Kagaya Ubuyashiki?",
    options: ["Dos","Tres","Cuatro","Cinco"],
    answerIndex: 3
  },
  {
    question: "¿Dónde transcurre el Arco del Distrito del Entretenimiento?",
    options: ["Tokio","Yoshiwara","Asakusa","Kioto"],
    answerIndex: 1
  },
  {
    question: "¿Qué tipo de hilo usa Kokushibo en sus ataques?",
    options: ["Hilo de seda demoníaca","Hilo de luna","Hilo de sangre","Hilo de niebla"],
    answerIndex: 1
  },
  {
    question: "¿Qué posición ocupa Doma en las Lunas Superiores?",
    options: ["Luna Superior Uno","Luna Superior Dos","Luna Superior Tres","Luna Superior Cuatro"],
    answerIndex: 1
  },
  {
    question: "¿Cómo se llama la técnica final de Tanjiro contra Muzan?",
    options: [
      "Danza del Dios del Fuego: Decimotercera Forma",
      "Hinokami Kagura: Forma del Amanecer",
      "Respiración del Sol: Décima Forma",
      "Danza Celestial del Fuego"
    ],
    answerIndex: 0
  },
  {
    question: "¿Qué era Yoriichi Tsugikuni antes de convertirse en cazador?",
    options: ["Samurái","Monje budista","Herrero","Campesino"],
    answerIndex: 0
  },
  {
    question: "¿Quién es la compañera de Tengen Uzui que infiltra el Distrito del Entretenimiento?",
    options: ["Makio, Suma y Hinatsuru","Kanao, Aoi y Kiyo","Mitsuri, Shinobu y Kanao","Suma, Aoi y Hinatsuru"],
    answerIndex: 0
  },
  {
    question: "¿De qué enfermedad sufre la familia Ubuyashiki?",
    options: [
      "Una maldición vinculada al linaje de Muzan",
      "Tuberculosis hereditaria",
      "Envenenamiento por sangre demoníaca",
      "Una enfermedad de los ojos"
    ],
    answerIndex: 0
  },
  {
    question: "¿Cuál fue la primera técnica que dominó Tanjiro de la Respiración del Agua?",
    options: ["Décima Forma: Constante Lluvia","Primera Forma: Corte de Superficie del Agua","Sexta Forma: Torbellino","Undécima Forma"],
    answerIndex: 1
  },
  {
    question: "¿Qué objeto lleva siempre Nezuko consigo durante la mayor parte de la historia?",
    options: ["Una cesta de bambú","Una caja de madera","Un frasco de medicina","Una máscara de demonio"],
    answerIndex: 1
  },
  {
    question: "¿Cómo se llama el estado especial de Nezuko en el que crece su poder demoníaco?",
    options: ["Modo Bestia","Forma Adulta Demoníaca","Nezuko desatada","Transformación Berserk"],
    answerIndex: 1
  },
  {
    question: "¿A qué clan pertenece Kokushibo antes de convertirse en demonio?",
    options: ["Clan Ubuyashiki","Clan Tsugikuni","Clan Kamado","Clan Shinazugawa"],
    answerIndex: 1
  },
  {
    question: "¿Qué herramienta usa Gyomei Himejima en lugar de una katana estándar?",
    options: [
      "Dos hachas encadenadas",
      "Un hacha y una bola con cadena con púas",
      "Una lanza de piedra",
      "Un mazo gigante"
    ],
    answerIndex: 1
  },
  {
    question: "¿Quién protege a Tanjiro durante el Arco de la Aldea de los Herreros?",
    options: ["Mitsuri Kanroji","Muichiro Tokito","Obanai Iguro","Giyu Tomioka"],
    answerIndex: 1
  }
];

// ================================================
// 4. BANCO DE PREGUNTAS — TEST DE RESPIRACIÓN
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
      { text: "Le inyecto lentamente duda y agotamiento.", points: { Insecto: 2 } }
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

const RESPIRACION_RESULTS = {
  Agua:    { name:"Respiración del Agua",    description:"Tu alma fluye como el agua: tranquila en la superficie, pero extraordinariamente poderosa cuando se lo propone. Eres protector, adaptable y tremendamente leal.", tags:["Tranquilo","Adaptable","Protector","Leal"], color:"#2E86AB" },
  Fuego:   { name:"Respiración de la Llama", description:"¡Tu corazón arde como una llama que nunca se apaga! Eres apasionado, extrovertido y un líder nato que inspira a todos a su alrededor.", tags:["Apasionado","Líder","Enérgico","Inquebrantable"], color:"#E74C3C" },
  Trueno:  { name:"Respiración del Trueno",  description:"Eres veloz como un rayo, aunque a veces dudes de ti mismo. Cuando llega el momento decisivo, algo en tu interior despierta y superas todos tus miedos.", tags:["Veloz","Leal","Dualidad","Explosivo"], color:"#F39C12" },
  Bestia:  { name:"Respiración de la Bestia",description:"Salvaje, instintivo y completamente libre. Rechazas las reglas y los caminos establecidos para crear los tuyos propios.", tags:["Salvaje","Instintivo","Competitivo","Libre"], color:"#27AE60" },
  Insecto: { name:"Respiración del Insecto", description:"Estratégico, analítico y letalmente preciso. Tus rivales subestiman tu fuerza porque la ocultas detrás de una apariencia amable.", tags:["Estratégico","Analítico","Preciso","Resiliente"], color:"#8E44AD" }
};

// ================================================
// 5. BANCO DE PREGUNTAS — TEST HASHIRA
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
      { text: "Los encierro en silencio. La soledad es mi escudo.", points: { Giyu: 3, Muichiro: 2 } },
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

const HASHIRA_RESULTS = {
  Giyu:    { name:"Giyu Tomioka",    description:"Pilar del Agua. Reservado, profundo y tremendamente leal a pesar de su exterior frío. Cargas una soledad que pocos comprenden, pero dentro de ti arde una protección inquebrantable.", tags:["Reservado","Leal","Protector","Agua"], color:"#2E86AB" },
  Mitsuri: { name:"Mitsuri Kanroji", description:"Pilar del Amor. Apasionada, empática y vibrante como un campo en flor. Tu fortaleza no reside en la dureza, sino en la inmensa capacidad de querer con todo tu ser.", tags:["Apasionada","Empática","Amor","Vibrante"], color:"#FF6B9D" },
  Obanai:  { name:"Obanai Iguro",    description:"Pilar de la Serpiente. Frío, preciso y profundamente complejo. Tu exterior intimidante oculta un interior que ha sufrido enormemente y ha convertido ese sufrimiento en disciplina absoluta.", tags:["Preciso","Frío","Complejo","Serpiente"], color:"#6C3483" },
  Sanemi:  { name:"Sanemi Shinazugawa", description:"Pilar del Viento. Explosivo, sin filtros y con una intensidad que asusta a primera vista. Pero detrás de esa furia vive alguien que ha perdido demasiado.", tags:["Intenso","Feroz","Viento","Explosivo"], color:"#27AE60" },
  Muichiro:{ name:"Muichiro Tokito",  description:"Pilar de la Niebla. Distante, eficiente y misterioso. Tus recuerdos fragmentados te hacen enigmático incluso para ti mismo.", tags:["Distante","Eficiente","Niebla","Misterioso"], color:"#5DADE2" },
  Gyomei:  { name:"Gyomei Himejima", description:"Pilar de la Piedra. El más poderoso de los Hashira. Tu fe es tan sólida como tu cuerpo, y tu gentileza tan profunda como tu fuerza.", tags:["Poderoso","Compasivo","Fe","Piedra"], color:"#A9A9A9" },
  Shinobu: { name:"Shinobu Kocho",   description:"Pilar del Insecto. Tu sonrisa oculta una mente que analiza y planifica constantemente. Eres la prueba de que la inteligencia supera a la fuerza bruta.", tags:["Estratégica","Elegante","Insecto","Resiliente"], color:"#8E44AD" },
  Rengoku: { name:"Rengoku Kyojuro", description:"Pilar de la Llama. Tu alma arde con una pasión que ilumina a todos los que te rodean. ¡Que tus llamas ardan por siempre!", tags:["Apasionado","Inspirador","Llama","Líder"], color:"#E74C3C" },
  Uzui:    { name:"Tengen Uzui",     description:"Pilar del Sonido. Extravagante, carismático y con un nivel de carisma que pocos pueden igualar. Peleas a todo volumen, sin disculpas.", tags:["Extravagante","Carismático","Sonido","Libre"], color:"#F39C12" }
};

// ================================================
// 6. BANCO DE PREGUNTAS — LUNA DEMONÍACA
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
      { text: "Negarme a morir por pura voluntad. He sobrevivido siglos.", points: { Kokushibo: 3 } },
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
      { text: "Es el único propósito verdadero. Lo he perseguido toda la eternidad.", points: { Kokushibo: 3 } },
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

const LUNA_RESULTS = {
  Kokushibo: { name:"Kokushibo",      description:"Luna Superior Uno. La encarnación de la búsqueda sin fin del poder. Sacrificaste tu humanidad, tu familia y siglos de soledad para convertirte en el demonio más poderoso después del propio Muzan.", tags:["Luna Uno","Eterno","Rival fraternal","Respiración de la Luna"], color:"#1A1A2E" },
  Doma:      { name:"Doma",           description:"Luna Superior Dos. El vacío absoluto disfrazado de sonrisa radiante. No sientes nada genuino, pero finges el amor más convincente del mundo.", tags:["Luna Dos","Vacío","Sonrisa falsa","Carismático"], color:"#4A0E0E" },
  Akaza:     { name:"Akaza",          description:"Luna Superior Tres. El guerrero eterno atrapado en la negación. Convertiste el amor más puro en la rabia más destructiva.", tags:["Luna Tres","Combate","Negación","Fuerza pura"], color:"#8B0000" },
  Hantengu:  { name:"Hantengu",       description:"Luna Superior Cuatro. El monstruo más cobarde y el más peligroso por ello. Tus emociones te fragmentaron literalmente en múltiples seres.", tags:["Luna Cuatro","Cobardía","Emociones fragmentadas","Inestable"], color:"#5D3A1A" },
  Gyokko:    { name:"Gyokko",         description:"Luna Superior Cinco. El artista que confunde la belleza con la posesión. Tu concepto del arte es tan retorcido como tu forma misma.", tags:["Luna Cinco","Arte oscuro","Orgullo","Creación y destrucción"], color:"#1B4F72" },
  Daki:      { name:"Daki (y Gyutaro)",description:"Luna Superior Seis. Naciste en la miseria más absoluta y convertiste el sufrimiento en poder de seducción y supervivencia.", tags:["Luna Seis","Seducción","Supervivencia","Dualidad"], color:"#6C1A3A" }
};

// ================================================
// 7. REFERENCIAS AL DOM
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

const LETTERS = ['A','B','C','D','E','F'];

const MODE_LABELS = {
  trivia:      '⚔️ Trivia',
  respiracion: '💧 Respiración',
  hashira:     '🏯 Hashira',
  luna:        '🌙 Luna Demoníaca'
};

// ================================================
// 8. ROUTER UNIFICADO (reemplaza al de minijuegos.js)
// ================================================
const ALL_SCREEN_IDS = [
  'menu-screen','quiz-screen','result-screen',
  'hangman-screen','tateti-screen','katana-screen'
];

function showScreen(id) {
  ALL_SCREEN_IDS.forEach(sid => {
    const el = document.getElementById(sid);
    if (!el) return;
    // Animación de salida
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => {
      el.classList.remove('active');
      el.classList.add('hidden');
      el.style.opacity = '';
      el.style.transform = '';
    }, 180);
  });
  setTimeout(() => {
    const target = document.getElementById(id);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
      target.style.opacity = '0';
      target.style.transform = 'translateY(8px)';
      requestAnimationFrame(() => {
        target.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        target.style.opacity = '1';
        target.style.transform = 'translateY(0)';
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 200);
}

// Exponer globalmente para minijuegos.js
window.KimetsuRouter = { showScreen };

// ================================================
// 9. CARGA DE MODO
// ================================================
function loadMode(mode) {
  GameState.currentMode          = mode;
  GameState.currentQuestionIndex = 0;
  GameState.score                = 0;
  GameState.timeBonus            = 0;
  GameState.personalityPoints    = {};
  GameState.answeredCorrectly    = false;

  switch (mode) {
    case 'trivia':
      GameState.questions = shuffleArray([...TRIVIA_POOL]).slice(0, 10);
      break;
    case 'respiracion':
      ['Agua','Fuego','Trueno','Bestia','Insecto'].forEach(c => { GameState.personalityPoints[c] = 0; });
      GameState.questions = shuffleArray([...RESPIRACION_QUESTIONS]);
      break;
    case 'hashira':
      Object.keys(HASHIRA_RESULTS).forEach(c => { GameState.personalityPoints[c] = 0; });
      GameState.questions = shuffleArray([...HASHIRA_QUESTIONS]);
      break;
    case 'luna':
      Object.keys(LUNA_RESULTS).forEach(c => { GameState.personalityPoints[c] = 0; });
      GameState.questions = shuffleArray([...LUNA_QUESTIONS]);
      break;
  }

  DOM.quizModeLabel.textContent = MODE_LABELS[mode];
  showScreen('quiz-screen');
  renderQuestion();
}

// ================================================
// 10. RENDERIZADO DE PREGUNTAS
// ================================================
function renderQuestion() {
  const total    = GameState.questions.length;
  const idx      = GameState.currentQuestionIndex;
  const q        = GameState.questions[idx];
  const humanIdx = idx + 1;

  DOM.quizProgress.textContent = `${humanIdx} / ${total}`;
  DOM.questionNum.textContent  = `Pregunta ${humanIdx}`;
  DOM.progressFill.style.width = `${(idx / total) * 100}%`;
  DOM.questionText.textContent = q.question;
  DOM.optionsGrid.innerHTML    = '';
  DOM.nextContainer.style.display = 'none';

  // Guardar tiempo de inicio para bonus de velocidad
  GameState.questionStartTime = Date.now();

  const options = GameState.currentMode === 'trivia'
    ? q.options
    : q.options.map(o => o.text);

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

  // Animación escalonada de entrada
  DOM.optionsGrid.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.style.opacity   = '0';
    btn.style.transform = 'translateY(12px)';
    setTimeout(() => {
      btn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      btn.style.opacity    = '1';
      btn.style.transform  = 'translateY(0)';
    }, 60 * i);
  });
}

// ================================================
// 11. LÓGICA DE RESPUESTA
// ================================================
function handleAnswer(selectedIndex, clickedBtn) {
  const q    = GameState.questions[GameState.currentQuestionIndex];
  const btns = DOM.optionsGrid.querySelectorAll('.option-btn');
  btns.forEach(b => b.disabled = true);

  if (GameState.currentMode === 'trivia') {
    const correct = q.answerIndex;
    if (selectedIndex === correct) {
      clickedBtn.classList.add('correct');
      GameState.score++;

      // Bonus de velocidad: hasta +3 pts extra si responde en menos de 5 s
      const elapsed = (Date.now() - GameState.questionStartTime) / 1000;
      if (elapsed < 5)       GameState.timeBonus += 3;
      else if (elapsed < 10) GameState.timeBonus += 1;

    } else {
      clickedBtn.classList.add('incorrect');
      btns[correct].classList.add('correct');
      // Shake en la respuesta incorrecta
      shakeElement(clickedBtn);
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

// ================================================
// 12. AVANCE Y RESULTADO
// ================================================
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
    const pct   = (score / total) * 100;

    let emoji = pct === 100 ? '🔥' : pct >= 70 ? '⚔️' : pct >= 40 ? '💧' : '😓';
    let msg   = pct === 100
      ? 'Eres un verdadero Hashira del conocimiento.'
      : pct >= 70 ? 'Gran actuación, Cazador de Demonios.'
      : pct >= 40 ? 'Buen intento. El entrenamiento continúa.'
      : 'Vuelve a repasar el anime... ¡ánimo!';

    scoreLabel = `${emoji} ${score}/${total} correctas · Bonus velocidad: +${bonus * 10} · Total: ${final} pts`;
    category   = 'Resultado Final';
    resultData = {
      name: 'Tanjiro Kamado', img: 'tanjiro.png',
      description: msg + ' Sigue adelante con la misma determinación que el joven Kamado.',
      tags: [`${score}/${total} correctas`, `${bonus * 10} pts bonus`, `${final} puntos totales`],
      color: '#C0392B'
    };

    // Guardar en ranking
    showRankingInput(final, 'trivia');

  } else {
    const winnerCat = getWinnerCategory(GameState.personalityPoints);
    const map = { respiracion: RESPIRACION_RESULTS, hashira: HASHIRA_RESULTS, luna: LUNA_RESULTS };
    resultData = map[GameState.currentMode][winnerCat];
    category   = winnerCat;
    const catLabel = { respiracion:'✨ Tu Respiración', hashira:'🏯 Tu Pilar', luna:'🌙 Tu Luna Demoníaca' };
    DOM.resultCategory.textContent = catLabel[GameState.currentMode];
  }

  DOM.resultCategory.textContent = category;
  DOM.resultName.textContent      = resultData.name;
  DOM.resultScore.textContent     = scoreLabel;
  DOM.resultDesc.textContent      = resultData.description;
  DOM.resultTags.innerHTML        = resultData.tags.map(t => `<span class="result-tag">${t}</span>`).join('');

  setupResultImage(resultData.img, resultData.name, resultData.color);
  showScreen('result-screen');

  // Mostrar ranking en pantalla de resultado
  renderRankingWidget(GameState.currentMode);

  launchResultParticles(resultData.color || '#C0392B');
}

function setupResultImage(imgSrc, altName, fallbackColor) {
  const img = DOM.resultImg, fb = DOM.resultFallback;
  img.classList.remove('hidden'); fb.classList.add('hidden');
  img.alt = altName; img.src = imgSrc;
  img.onerror = () => {
    img.classList.add('hidden'); fb.classList.remove('hidden');
    fb.style.background = fallbackColor || '#333';
    fb.textContent = altName;
  };
}

// ================================================
// 13. RANKING UI
// ================================================
function showRankingInput(score, mode) {
  // Pequeño modal inline para ingresar nombre
  const container = DOM.resultScreen.querySelector('.result-container');
  if (!container) return;

  // Evitar duplicados
  const prev = container.querySelector('.ranking-input-wrap');
  if (prev) prev.remove();

  const wrap = document.createElement('div');
  wrap.className = 'ranking-input-wrap';
  wrap.style.cssText = `
    display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;
    margin-top:1rem;padding:1rem;
    background:rgba(192,57,43,0.08);
    border:1px solid rgba(192,57,43,0.2);
    border-radius:8px;
  `;
  wrap.innerHTML = `
    <span style="font-family:var(--font-display,'Cinzel',serif);font-size:.8rem;
                 letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;">
      Guardar puntaje
    </span>
    <input id="ranking-name-input" type="text" maxlength="18" placeholder="Tu nombre…"
      style="background:#0a0a0e;border:1px solid rgba(255,255,255,.12);
             border-radius:4px;padding:.5rem .75rem;color:#F0E6D3;
             font-family:var(--font-body,'Crimson Pro',serif);font-size:1rem;flex:1;min-width:120px;" />
    <button id="ranking-save-btn" class="btn-primary" style="padding:.5rem 1.25rem;font-size:.8rem;">
      Guardar
    </button>
  `;
  container.querySelector('.result-actions').before(wrap);

  document.getElementById('ranking-save-btn').addEventListener('click', () => {
    const name = document.getElementById('ranking-name-input').value || 'Cazador';
    Ranking.save(name, score, mode);
    wrap.innerHTML = `<span style="color:#27AE60;font-family:var(--font-display,'Cinzel',serif);
                       font-size:.85rem;letter-spacing:.1em;">
                       ✓ Puntaje guardado como "${name.trim().slice(0,18) || 'Cazador'}"
                     </span>`;
    renderRankingWidget(mode);
  });
}

function renderRankingWidget(mode) {
  if (mode !== 'trivia') return;
  const container = DOM.resultScreen.querySelector('.result-container');
  if (!container) return;

  const prev = container.querySelector('.ranking-widget');
  if (prev) prev.remove();

  const top = Ranking.getTop('trivia', 5);
  if (!top.length) return;

  const medals = ['🥇','🥈','🥉','4.','5.'];
  const widget = document.createElement('div');
  widget.className = 'ranking-widget';
  widget.style.cssText = `
    margin-top:1rem;padding:1rem 1.25rem;
    background:rgba(0,0,0,0.3);
    border:1px solid rgba(201,168,76,0.2);
    border-radius:8px;
  `;
  widget.innerHTML = `
    <h3 style="font-family:var(--font-display,'Cinzel',serif);font-size:.75rem;
               letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:.75rem;">
      🏆 Top Cazadores
    </h3>
    ${top.map((r, i) => `
      <div style="display:flex;align-items:center;gap:.75rem;
                  padding:.35rem 0;border-bottom:1px solid rgba(255,255,255,.05);">
        <span style="font-size:1rem;width:1.5rem;text-align:center;">${medals[i]}</span>
        <span style="flex:1;font-family:var(--font-body,'Crimson Pro',serif);
                     color:#F0E6D3;font-size:.95rem;">${r.name}</span>
        <span style="font-family:var(--font-display,'Cinzel',serif);
                     color:#C9A84C;font-size:.85rem;">${r.score} pts</span>
      </div>
    `).join('')}
  `;
  container.querySelector('.result-actions').before(widget);
}

// ================================================
// 14. TATETI — CARAS SVG DE RENGOKU Y AKAZA
// ================================================
/**
 * Genera un SVG inline que representa la cara estilizada del personaje.
 * Se usa como contenido de las celdas del tablero de Tateti.
 */
function getRengokuSVG(size = 52) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
    <!-- Cara base -->
    <circle cx="26" cy="26" r="22" fill="#1a0a00" stroke="#E74C3C" stroke-width="1.5"/>
    <!-- Cabello rojo-naranja lateral -->
    <ellipse cx="8"  cy="18" rx="7" ry="10" fill="#C0392B" opacity=".9"/>
    <ellipse cx="44" cy="18" rx="7" ry="10" fill="#C0392B" opacity=".9"/>
    <!-- Mechón central -->
    <path d="M18 8 Q26 2 34 8 Q28 14 26 13 Q24 14 18 8Z" fill="#E74C3C"/>
    <!-- Piel -->
    <ellipse cx="26" cy="28" rx="14" ry="16" fill="#D4956A"/>
    <!-- Ojos — Rengoku tiene ojos llamarada -->
    <ellipse cx="20" cy="24" rx="3.5" ry="4" fill="#fff"/>
    <ellipse cx="32" cy="24" rx="3.5" ry="4" fill="#fff"/>
    <circle  cx="20" cy="25" r="2.2" fill="#E74C3C"/>
    <circle  cx="32" cy="25" r="2.2" fill="#E74C3C"/>
    <circle  cx="20.8" cy="24.2" r=".8" fill="#fff"/>
    <circle  cx="32.8" cy="24.2" r=".8" fill="#fff"/>
    <!-- Cejas gruesas -->
    <path d="M16 20 Q20 18 24 20" stroke="#8B1A00" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M28 20 Q32 18 36 20" stroke="#8B1A00" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <!-- Nariz -->
    <ellipse cx="26" cy="29" rx="1.5" ry="1" fill="#B8735A"/>
    <!-- Boca entusiasta -->
    <path d="M20 34 Q26 38 32 34" stroke="#8B1A00" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Cicatriz / marca de llama en mejilla -->
    <path d="M14 30 Q16 28 15 26" stroke="#E74C3C" stroke-width="1" fill="none" opacity=".7"/>
    <!-- Hombros / uniforme Hashira -->
    <path d="M4 50 Q12 40 26 42 Q40 40 48 50" fill="#1a0505"/>
    <rect x="12" y="42" width="28" height="8" rx="2" fill="#2a0808"/>
  </svg>`;
}

function getAkazaSVG(size = 52) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
    <!-- Aura oscura de fondo -->
    <circle cx="26" cy="26" r="24" fill="#1a0010" opacity=".6"/>
    <!-- Cara base -->
    <circle cx="26" cy="26" r="21" fill="#1a0505" stroke="#8B0000" stroke-width="1.5"/>
    <!-- Cabello oscuro con mechones -->
    <path d="M8 14 Q14 4 26 6 Q38 4 44 14 Q38 8 26 10 Q14 8 8 14Z" fill="#1C0000"/>
    <path d="M10 12 Q12 6 20 8 L18 14Z" fill="#2A0000"/>
    <path d="M42 12 Q40 6 32 8 L34 14Z" fill="#2A0000"/>
    <!-- Mechón frontal -->
    <path d="M22 6 Q26 2 30 6 L28 12 Q26 10 24 12Z" fill="#2A0000"/>
    <!-- Piel pálida azulada de demonio -->
    <ellipse cx="26" cy="28" rx="14" ry="15" fill="#C8A8A0"/>
    <!-- Marcas demoníacas / tatuajes azules en la frente -->
    <path d="M18 17 Q22 14 26 17 Q30 14 34 17" stroke="#4169E1" stroke-width="1.2" fill="none" opacity=".9"/>
    <path d="M20 19 Q26 16 32 19" stroke="#6495ED" stroke-width=".8" fill="none" opacity=".7"/>
    <!-- Ojos — Akaza tiene ojos rosas/rubíes amenazantes -->
    <ellipse cx="20" cy="25" rx="4" ry="4.5" fill="#fff"/>
    <ellipse cx="32" cy="25" rx="4" ry="4.5" fill="#fff"/>
    <circle  cx="20" cy="26" r="2.8" fill="#C71585"/>
    <circle  cx="32" cy="26" r="2.8" fill="#C71585"/>
    <circle  cx="20" cy="25" r="1.2" fill="#8B0000"/>
    <circle  cx="32" cy="25" r="1.2" fill="#8B0000"/>
    <circle  cx="20.9" cy="24.5" r=".6" fill="#fff"/>
    <circle  cx="32.9" cy="24.5" r=".6" fill="#fff"/>
    <!-- Cejas oscuras y arqueadas amenazantes -->
    <path d="M15 21 Q20 18 24 21" stroke="#1C0000" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M28 21 Q32 18 37 21" stroke="#1C0000" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- Nariz fina -->
    <ellipse cx="26" cy="30" rx="1.2" ry=".9" fill="#B07060"/>
    <!-- Sonrisa siniestra -->
    <path d="M19 35 Q26 40 33 35" stroke="#8B0000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M21 35 Q26 37 31 35" fill="#3D0000" opacity=".5"/>
    <!-- Marcas rosas en la cara (rasgos demoníacos) -->
    <circle cx="16" cy="28" r="4" fill="#FFB6C1" opacity=".3"/>
    <circle cx="36" cy="28" r="4" fill="#FFB6C1" opacity=".3"/>
    <!-- Cuello y torso oscuro -->
    <path d="M4 52 Q14 42 26 44 Q38 42 48 52" fill="#0D0005"/>
    <rect x="12" y="43" width="28" height="9" rx="2" fill="#1a0010"/>
  </svg>`;
}

// Exponer para minijuegos.js
window.KimetsuSVG = { getRengokuSVG, getAkazaSVG };

// ================================================
// 15. UTILIDADES
// ================================================
function getWinnerCategory(points) {
  const maxScore = Math.max(...Object.values(points));
  const winners  = Object.keys(points).filter(c => points[c] === maxScore);
  return winners.length === 1 ? winners[0] : winners[Math.floor(Math.random() * winners.length)];
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake-wrong 0.4s ease';
  el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
}

// CSS para shake (inyectado una sola vez)
(function injectShakeCSS() {
  if (document.getElementById('kimetsu-shake-css')) return;
  const s = document.createElement('style');
  s.id = 'kimetsu-shake-css';
  s.textContent = `
    @keyframes shake-wrong {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-8px) rotate(-1deg); }
      40%      { transform: translateX(8px)  rotate(1deg); }
      60%      { transform: translateX(-5px); }
      80%      { transform: translateX(5px); }
    }
    .screen {
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
  `;
  document.head.appendChild(s);
})();

// ================================================
// 16. PARTÍCULAS
// ================================================
function initMenuParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const colors = ['#C0392B','#2E8B57','#C9A84C','#6C3483','#2E86AB'];
  for (let i = 0; i < 25; i++) {
    const p    = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 10 + 10}s;
      animation-delay:${Math.random() * 12}s;
      opacity:0;
    `;
    container.appendChild(p);
  }
}

function launchResultParticles(color) {
  const container = document.getElementById('result-particles');
  if (!container) return;
  container.innerHTML = '';
  const colors = [color,'#C9A84C','#F0E6D3','#ffffff'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:${Math.random() * 6 + 2}px;height:${Math.random() * 6 + 2}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:50%;
      left:${Math.random() * 100}%;top:${Math.random() * 100}%;
      animation:float-particle ${Math.random() * 4 + 3}s ease-out both;
      animation-delay:${Math.random() * 1.5}s;
      opacity:0;
    `;
    container.appendChild(p);
  }
}

// ================================================
// 17. EVENT LISTENERS
// ================================================
DOM.modeCards.forEach(card => {
  card.addEventListener('click', () => {
    const mode = card.getAttribute('data-mode');
    if (mode) loadMode(mode);
  });
});

DOM.btnBack.addEventListener('click',    () => showScreen('menu-screen'));
DOM.btnNext.addEventListener('click',    advanceQuestion);
DOM.btnRestart.addEventListener('click', () => { if (GameState.currentMode) loadMode(GameState.currentMode); });
DOM.btnMenu.addEventListener('click',    () => showScreen('menu-screen'));

// ================================================
// 18. INIT
// ================================================
initMenuParticles();
