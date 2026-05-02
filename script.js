/**
 * ================================================
 * KIMETSU NO YAIBA — QUIZ DEFINITIVO (v2.0)
 * script.js
 * ================================================
 */
'use strict';

// ── Estado global ──
const GameState = {
  currentMode: null, currentQuestionIndex: 0, score: 0,
  personalityPoints: {}, questions: [], answeredCorrectly: false,
  questionStartTime: 0, timeBonus: 0,
};

// ── Ranking localStorage ──
const Ranking = (function () {
  const KEY = 'kimetsu_ranking_v2';
  function getAll() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
  function save(name, score, mode) {
    const all = getAll();
    all.push({ name: name.trim().slice(0,18) || 'Cazador', score, mode, date: Date.now() });
    all.sort((a,b) => b.score - a.score);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0,50)));
  }
  function getTop(mode, n=5) { return getAll().filter(r => r.mode === mode).slice(0,n); }
  return { save, getTop };
})();

// ── Trivia Pool (40 preguntas) ──
const TRIVIA_POOL = [
  { question:"¿Cuál es el verdadero nombre completo de Inosuke?", options:["Hashibira Inosuke","Kamado Inosuke","Agatsuma Inosuke","Inosuke Yushiro"], answerIndex:0 },
  { question:"¿Qué color tiene la hoja de la espada de Zenitsu?", options:["Rojo","Amarillo","Azul oscuro","Naranja"], answerIndex:1 },
  { question:"¿Cuál es el rango máximo en la Corporación de Cazadores?", options:["Kanoe","Taisho","Hashira (Pilar)","Mizunoto"], answerIndex:2 },
  { question:"¿Cuántas formas conoce Tanjiro de la Respiración del Agua?", options:["8","10","12","15"], answerIndex:1 },
  { question:"¿Qué demonio convirtió a Nezuko?", options:["Doma","Akaza","Muzan Kibutsuji","Kokushibo"], answerIndex:2 },
  { question:"¿Cómo se llama la técnica especial de Tanjiro del Distrito del Entretenimiento?", options:["Danza del Dios del Fuego","Danza de las Llamas Hinokami Kagura","Respiración del Sol","Forma del Dios del Sol"], answerIndex:1 },
  { question:"¿Qué rango de Luna Demoníaca ocupa Akaza?", options:["Luna Superior Cuatro","Luna Superior Dos","Luna Superior Tres","Luna Superior Uno"], answerIndex:2 },
  { question:"¿Quién es el maestro de Tanjiro en el entrenamiento inicial?", options:["Giyu Tomioka","Sakonji Urokodaki","Rengoku Kyojuro","Tengen Uzui"], answerIndex:1 },
  { question:"¿Qué tiene de especial la sangre de Nezuko?", options:["Puede regenerarse sin comer humanos","Su sangre quema y daña a los demonios","Es inmune a la luz solar desde el inicio","Puede crear ilusiones"], answerIndex:1 },
  { question:"¿Cómo se llama la técnica relámpago de Zenitsu?", options:["Primera Forma: Rayo en el Cielo","Primera Forma: Trueno Thunderclap y Flash","Sexta Forma: Dios del Trueno Constante","Tercera Forma: Rayo Volador"], answerIndex:1 },
  { question:"¿Cuál es el rango de Tanjiro al ingresar a la Corporación?", options:["Hinoto","Mizunoto","Kanoto","Tsuchinoto"], answerIndex:1 },
  { question:"¿Quién es el Pilar del Amor?", options:["Shinobu Kocho","Kanao Tsuyuri","Mitsuri Kanroji","Aoi Kanzaki"], answerIndex:2 },
  { question:"¿Cuántas Lunas Superiores existen?", options:["Cuatro","Cinco","Seis","Siete"], answerIndex:2 },
  { question:"¿Cuál fue el oficio de la familia Kamado?", options:["Agricultores","Herreros","Vendedores de carbón","Pescadores"], answerIndex:2 },
  { question:"¿Qué técnica usa Rengoku en su batalla final contra Akaza?", options:["Novena Forma: Llamarada Carmesí","Novena Forma: Purgatorio Llameante","Décima Forma: Sol Abrasador","Octava Forma: Sol en el Cielo"], answerIndex:1 },
  { question:"¿Cuál es el estilo de espada de Tengen Uzui?", options:["Swords in tandem / Sin forma especial","Cuchillos kunai / Forma del ninja","Katana dual con cadenas / Técnica de la Explosión","Espadas mellizas / Modo Melodía Explosiva"], answerIndex:3 },
  { question:"¿Quién es el Pilar más joven de la historia?", options:["Kanao Tsuyuri","Muichiro Tokito","Tanjiro Kamado","Inosuke Hashibira"], answerIndex:1 },
  { question:"¿Qué demonio derrota Tanjiro en el Monte Natagumo?", options:["Rui (Luna Inferior Cinco)","Doma (Luna Superior Dos)","Susamaru","Yahaba"], answerIndex:0 },
  { question:"¿Cómo combate Shinobu dado que no puede decapitar demonios?", options:["Explosivos de veneno en la hoja","Veneno de wisteria inyectado con su espada","Ilusiones para confundirlos","Red de hilos explosivos"], answerIndex:1 },
  { question:"¿Cuál es el nombre del tren del Arco del Tren?", options:["Tren Kimetsu","Tren Mugen","Tren Enmu","Tren Kagura"], answerIndex:1 },
  { question:"¿Qué le sucede a Nezuko al exponerse al sol al final del Arco del Distrito?", options:["Muere inmediatamente","Se convierte en humana al instante","Sobrevive y se vuelve resistente a la luz solar","Pierde sus poderes demoníacos"], answerIndex:2 },
  { question:"¿Quién entrenó a Giyu Tomioka y a Sabito?", options:["Yoriichi Tsugikuni","Kagaya Ubuyashiki","Sakonji Urokodaki","Tengen Uzui"], answerIndex:2 },
  { question:"¿Cómo se llama el hermano mayor de Muichiro Tokito?", options:["Yuichiro","Genya","Sabito","Makomo"], answerIndex:0 },
  { question:"¿Cuál es la respiración original de la que derivan todas las demás?", options:["Respiración del Agua","Respiración del Sol","Respiración del Fuego","Respiración del Viento"], answerIndex:1 },
  { question:"¿Quién es el hermano de Sanemi Shinazugawa también cazador?", options:["Genya Shinazugawa","Muichiro Tokito","Kanao Tsuyuri","Sabito"], answerIndex:0 },
  { question:"¿Qué habilidad única posee Genya Shinazugawa?", options:["Puede usar dos respiraciones a la vez","Absorbe poderes de los demonios al comerlos","Es inmune al veneno demoníaco","Puede ver los hilos del destino"], answerIndex:1 },
  { question:"¿Cuántos hijos tenía Kagaya Ubuyashiki?", options:["Dos","Tres","Cuatro","Cinco"], answerIndex:3 },
  { question:"¿Dónde transcurre el Arco del Distrito del Entretenimiento?", options:["Tokio","Yoshiwara","Asakusa","Kioto"], answerIndex:1 },
  { question:"¿Qué tipo de hilo usa Kokushibo en sus ataques?", options:["Hilo de seda demoníaca","Hilo de luna","Hilo de sangre","Hilo de niebla"], answerIndex:1 },
  { question:"¿Qué posición ocupa Doma en las Lunas Superiores?", options:["Luna Superior Uno","Luna Superior Dos","Luna Superior Tres","Luna Superior Cuatro"], answerIndex:1 },
  { question:"¿Cómo se llama la técnica final de Tanjiro contra Muzan?", options:["Danza del Dios del Fuego: Decimotercera Forma","Hinokami Kagura: Forma del Amanecer","Respiración del Sol: Décima Forma","Danza Celestial del Fuego"], answerIndex:0 },
  { question:"¿Qué era Yoriichi Tsugikuni antes de convertirse en cazador?", options:["Samurái","Monje budista","Herrero","Campesino"], answerIndex:0 },
  { question:"¿Quiénes son las esposas de Tengen Uzui que infiltran el Distrito?", options:["Makio, Suma y Hinatsuru","Kanao, Aoi y Kiyo","Mitsuri, Shinobu y Kanao","Suma, Aoi y Hinatsuru"], answerIndex:0 },
  { question:"¿De qué sufre la familia Ubuyashiki?", options:["Una maldición vinculada al linaje de Muzan","Tuberculosis hereditaria","Envenenamiento por sangre demoníaca","Una enfermedad de los ojos"], answerIndex:0 },
  { question:"¿Cuál fue la primera técnica que dominó Tanjiro de la Respiración del Agua?", options:["Décima Forma: Constante Lluvia","Primera Forma: Corte de Superficie del Agua","Sexta Forma: Torbellino","Undécima Forma"], answerIndex:1 },
  { question:"¿Qué objeto lleva siempre Nezuko consigo?", options:["Una cesta de bambú","Una caja de madera","Un frasco de medicina","Una máscara de demonio"], answerIndex:1 },
  { question:"¿Cómo se llama el estado especial de Nezuko en el que crece su poder demoníaco?", options:["Modo Bestia","Forma Adulta Demoníaca","Nezuko desatada","Transformación Berserk"], answerIndex:1 },
  { question:"¿A qué clan pertenece Kokushibo antes de convertirse en demonio?", options:["Clan Ubuyashiki","Clan Tsugikuni","Clan Kamado","Clan Shinazugawa"], answerIndex:1 },
  { question:"¿Qué herramienta usa Gyomei Himejima en lugar de una katana estándar?", options:["Dos hachas encadenadas","Un hacha y una bola con cadena con púas","Una lanza de piedra","Un mazo gigante"], answerIndex:1 },
  { question:"¿Quién protege a Tanjiro durante el Arco de la Aldea de los Herreros?", options:["Mitsuri Kanroji","Muichiro Tokito","Obanai Iguro","Giyu Tomioka"], answerIndex:1 },
];

// ── Tests de Personalidad ──
const RESPIRACION_QUESTIONS = [
  { question:"¿Cómo reaccionas ante un problema repentino?", options:[{text:"Analizo la situación con calma antes de actuar.",points:{Agua:2}},{text:"¡Me lanzo de cabeza con toda mi energía!",points:{Fuego:2}},{text:"Me paralizo un instante, pero actúo con velocidad explosiva.",points:{Trueno:2}},{text:"Mi instinto me guía antes de que piense.",points:{Bestia:2}}] },
  { question:"¿Cuál describe mejor tu rol en un equipo?", options:[{text:"El escudo: protejo y sostengo al grupo.",points:{Agua:2}},{text:"El líder: enciendo la llama y motivo a todos.",points:{Fuego:2}},{text:"El ejecutor veloz: actúo cuando nadie más puede.",points:{Trueno:2}},{text:"El solitario: prefiero pelear solo.",points:{Bestia:2}},{text:"El estratega: analizo debilidades.",points:{Insecto:2}}] },
  { question:"Un enemigo mucho más fuerte se acerca. ¿Qué haces?", options:[{text:"Busco adaptarme a su estilo y encontrar una apertura.",points:{Agua:2}},{text:"Avanzo sin dudar. Mi voluntad supera el miedo.",points:{Fuego:2}},{text:"Un solo golpe fulminante antes de que reaccione.",points:{Trueno:2}},{text:"Lo domino con pura presión física.",points:{Bestia:2}},{text:"Le inyecto lentamente duda y agotamiento.",points:{Insecto:2}}] },
  { question:"¿Cuál es tu mayor fortaleza en el combate?", options:[{text:"Mi fluidez y capacidad para desviar ataques.",points:{Agua:2}},{text:"Mi potencia y determinación implacable.",points:{Fuego:2}},{text:"Mi velocidad incomparable en el momento decisivo.",points:{Trueno:2}},{text:"Mi dureza física y resistencia al dolor.",points:{Bestia:2}},{text:"Mi precisión quirúrgica.",points:{Insecto:2}}] },
  { question:"¿Qué elemento natural te atrae más?", options:[{text:"El río: tranquilo pero poderoso.",points:{Agua:2}},{text:"El volcán: energía indomable.",points:{Fuego:2}},{text:"La tormenta: velocidad y descarga perfecta.",points:{Trueno:2}},{text:"El bosque salvaje: instintivo y libre.",points:{Bestia:2}},{text:"El jardín de flores: belleza que oculta veneno.",points:{Insecto:2}}] },
  { question:"¿Cómo describes tu relación con las emociones?", options:[{text:"Las controlo como corrientes de agua.",points:{Agua:2}},{text:"Arden dentro de mí y me impulsan.",points:{Fuego:2}},{text:"Me paralizan hasta el momento preciso.",points:{Trueno:2}},{text:"¿Emociones? Solo siento el impulso de ganar.",points:{Bestia:2}},{text:"Las disimulo con una sonrisa mientras planifico.",points:{Insecto:2}}] },
];
const RESPIRACION_RESULTS = {
  Agua:    { name:"Respiración del Agua",    description:"Tu alma fluye como el agua: tranquila en la superficie, pero extraordinariamente poderosa cuando se lo propone. Eres protector, adaptable y tremendamente leal.", tags:["Tranquilo","Adaptable","Protector","Leal"], color:"#2E86AB" },
  Fuego:   { name:"Respiración de la Llama", description:"¡Tu corazón arde como una llama que nunca se apaga! Eres apasionado, extrovertido y un líder nato que inspira a todos a su alrededor.", tags:["Apasionado","Líder","Enérgico","Inquebrantable"], color:"#E74C3C" },
  Trueno:  { name:"Respiración del Trueno",  description:"Eres veloz como un rayo. Cuando llega el momento decisivo, algo en tu interior despierta y superas todos tus miedos.", tags:["Veloz","Leal","Dualidad","Explosivo"], color:"#F39C12" },
  Bestia:  { name:"Respiración de la Bestia",description:"Salvaje, instintivo y completamente libre. Rechazas las reglas para crear las tuyas propias.", tags:["Salvaje","Instintivo","Competitivo","Libre"], color:"#27AE60" },
  Insecto: { name:"Respiración del Insecto", description:"Estratégico, analítico y letalmente preciso. Tus rivales subestiman tu fuerza porque la ocultas detrás de una apariencia amable.", tags:["Estratégico","Analítico","Preciso","Resiliente"], color:"#8E44AD" },
};

const HASHIRA_QUESTIONS = [
  { question:"Alguien a quien debes proteger está en peligro. ¿Cuál es tu primera reacción?", options:[{text:"Me interpongo entre él y el peligro en silencio.",points:{Giyu:3}},{text:"Grito de emoción y cargo con todo mi amor.",points:{Mitsuri:3}},{text:"Evalúo la situación con ojos fríos.",points:{Obanai:3}},{text:"Avanzo furioso sin dudar.",points:{Sanemi:3}}] },
  { question:"¿Cómo sueles lidiar con tus sentimientos dolorosos?", options:[{text:"Los encierro en silencio. La soledad es mi escudo.",points:{Giyu:3,Muichiro:2}},{text:"Los expreso con todo el corazón.",points:{Mitsuri:3}},{text:"Los transformo en disciplina y entrenamiento.",points:{Muichiro:3}},{text:"Los convierto en oración y gratitud.",points:{Gyomei:3}}] },
  { question:"¿Cuál es el propósito más profundo de tu fortaleza?", options:[{text:"Proteger a los débiles que no pueden protegerse solos.",points:{Giyu:2,Gyomei:2}},{text:"Amar y ser amada; la alegría de vivir.",points:{Mitsuri:3}},{text:"Ser un instrumento de la justicia divina.",points:{Gyomei:3}},{text:"Demostrar que nadie puede superar mi voluntad.",points:{Sanemi:3,Uzui:2}}] },
  { question:"¿Cómo describes tu estilo de combate ideal?", options:[{text:"Fluido, constante y letal como el agua.",points:{Giyu:3}},{text:"Flexible y acrobático; aprovecho cada ángulo.",points:{Mitsuri:3}},{text:"Serpenteante e imprevisible.",points:{Obanai:3}},{text:"Brutal y directo: pura fuerza.",points:{Sanemi:3}},{text:"Veloz, eficiente y sin un movimiento de más.",points:{Muichiro:3}},{text:"Explosivo y extravagante.",points:{Uzui:3}}] },
  { question:"¿Qué actitud tenés frente a quienes son más débiles?", options:[{text:"Respeto su esfuerzo en silencio.",points:{Giyu:2,Muichiro:1}},{text:"Los animo con todo mi entusiasmo.",points:{Mitsuri:3}},{text:"Los entreno sin piedad.",points:{Obanai:2,Sanemi:2}},{text:"Rezo por su crecimiento.",points:{Gyomei:3}},{text:"Espero que alcancen mi nivel.",points:{Uzui:2}}] },
  { question:"¿Cuál es tu mayor conflicto interior?", options:[{text:"La soledad que cargo por una pérdida que nunca olvidaré.",points:{Giyu:3}},{text:"No sentirme suficientemente amada.",points:{Mitsuri:3}},{text:"Un pasado oscuro que transformé en propósito.",points:{Obanai:3}},{text:"La rabia que no puedo apagar.",points:{Sanemi:3}},{text:"Recuerdos que se desvanecen.",points:{Muichiro:3}},{text:"Equilibrar el honor de mi familia con mi felicidad.",points:{Uzui:3}}] },
  { question:"Frente a un demonio que fue humano y sufrió, ¿cuál es tu postura?", options:[{text:"Lo elimino. El pasado no justifica el daño presente.",points:{Giyu:1,Obanai:2,Sanemi:3}},{text:"Siento empatía, pero cumplo mi deber.",points:{Mitsuri:2,Gyomei:3}},{text:"Su sufrimiento lo entiendo, pero la amenaza debe terminar.",points:{Muichiro:3}},{text:"Enfrento la situación con extravagancia y dignidad.",points:{Uzui:3}}] },
];
const HASHIRA_RESULTS = {
  Giyu:    { name:"Giyu Tomioka",       description:"Pilar del Agua. Reservado, profundo y leal. Cargas una soledad que pocos comprenden.", tags:["Reservado","Leal","Protector","Agua"], color:"#2E86AB" },
  Mitsuri: { name:"Mitsuri Kanroji",    description:"Pilar del Amor. Apasionada, empática y vibrante. Tu fortaleza reside en querer con todo tu ser.", tags:["Apasionada","Empática","Amor","Vibrante"], color:"#FF6B9D" },
  Obanai:  { name:"Obanai Iguro",       description:"Pilar de la Serpiente. Frío, preciso y profundamente complejo.", tags:["Preciso","Frío","Complejo","Serpiente"], color:"#6C3483" },
  Sanemi:  { name:"Sanemi Shinazugawa", description:"Pilar del Viento. Explosivo, sin filtros. Detrás de esa furia vive alguien que ha perdido demasiado.", tags:["Intenso","Feroz","Viento","Explosivo"], color:"#27AE60" },
  Muichiro:{ name:"Muichiro Tokito",    description:"Pilar de la Niebla. Distante, eficiente y misterioso.", tags:["Distante","Eficiente","Niebla","Misterioso"], color:"#5DADE2" },
  Gyomei:  { name:"Gyomei Himejima",   description:"Pilar de la Piedra. El más poderoso de los Hashira. Tu fe es tan sólida como tu cuerpo.", tags:["Poderoso","Compasivo","Fe","Piedra"], color:"#A9A9A9" },
  Shinobu: { name:"Shinobu Kocho",     description:"Pilar del Insecto. Tu sonrisa oculta una mente que analiza y planifica constantemente.", tags:["Estratégica","Elegante","Insecto","Resiliente"], color:"#8E44AD" },
  Rengoku: { name:"Rengoku Kyojuro",   description:"Pilar de la Llama. Tu alma arde con una pasión que ilumina a todos. ¡Que tus llamas ardan por siempre!", tags:["Apasionado","Inspirador","Llama","Líder"], color:"#E74C3C" },
  Uzui:    { name:"Tengen Uzui",       description:"Pilar del Sonido. Extravagante, carismático. Peleas a todo volumen, sin disculpas.", tags:["Extravagante","Carismático","Sonido","Libre"], color:"#F39C12" },
};

const LUNA_QUESTIONS = [
  { question:"¿Cómo enfrentás la envidia cuando ves a alguien más poderoso?", options:[{text:"La transformo en disciplina eterna.",points:{Kokushibo:3}},{text:"Los amo... y los absorbo para que sean parte de mí.",points:{Doma:3}},{text:"Lucho contra ellos inmediatamente.",points:{Akaza:3}},{text:"Me fragmento internamente de miedo.",points:{Hantengu:3}},{text:"Los elimino. No aprecian la belleza.",points:{Gyokko:3}},{text:"Los manipulo con seducción y astucia.",points:{Daki:3}}] },
  { question:"¿Qué harías para sobrevivir en el límite absoluto?", options:[{text:"Negarme a morir por pura voluntad.",points:{Kokushibo:3}},{text:"Nada. El dolor no existe para mí.",points:{Doma:3}},{text:"Luchar con cada célula hasta el último aliento.",points:{Akaza:3}},{text:"Esconderme y encontrar la grieta por donde escapar.",points:{Hantengu:3}},{text:"Crear algo tan bello que el enemigo se paralice.",points:{Gyokko:3}},{text:"Usar a los que me rodean como escudo.",points:{Daki:3}}] },
  { question:"¿Cuál es tu relación con el poder?", options:[{text:"Es el único propósito verdadero.",points:{Kokushibo:3}},{text:"El poder me permite dar amor a todos los que consuma.",points:{Doma:2,Gyokko:1}},{text:"El combate es la única forma de existir plenamente.",points:{Akaza:3}},{text:"Es lo único que me protege del miedo.",points:{Hantengu:3}},{text:"Me da derecho a crear y destruir lo feo.",points:{Gyokko:3}},{text:"Es una herramienta para obtener lo que quiero.",points:{Daki:3}}] },
  { question:"¿Qué pérdida del pasado aún te persigue?", options:[{text:"La rivalidad con mi hermano que consumió mi humanidad.",points:{Kokushibo:3}},{text:"Ninguna. Nunca sentí el dolor de verdad.",points:{Doma:3}},{text:"La persona que amé y que murió.",points:{Akaza:3}},{text:"El terror constante que nunca me dejó en paz.",points:{Hantengu:3}},{text:"El rechazo de quienes no apreciaron mi arte.",points:{Gyokko:3}},{text:"Un pasado de miseria que juré no repetir.",points:{Daki:3}}] },
  { question:"¿Cómo ves a los humanos que te rodean?", options:[{text:"Inferiores, efímeros. Mero ruido.",points:{Kokushibo:3}},{text:"Los amo a todos. Por eso debo salvarlos consumiéndolos.",points:{Doma:3}},{text:"Solo los fuertes merecen mi atención.",points:{Akaza:3}},{text:"Amenazas potenciales.",points:{Hantengu:3}},{text:"Incapaces de comprender la belleza.",points:{Gyokko:3}},{text:"Herramientas o peligros.",points:{Daki:3}}] },
  { question:"¿Cuál es tu verdad más oscura?", options:[{text:"Sacrifiqué todo por un poder que nunca fue suficiente.",points:{Kokushibo:3}},{text:"Soy incapaz de sentir nada verdadero.",points:{Doma:3}},{text:"El combate es lo único que me queda.",points:{Akaza:3}},{text:"Cada emoción tomó vida propia y me volvió inestable.",points:{Hantengu:3}},{text:"Destruyo lo bello porque no soporto que otros lo posean.",points:{Gyokko:3}},{text:"Uso el amor como arma.",points:{Daki:3}}] },
];
const LUNA_RESULTS = {
  Kokushibo: { name:"Kokushibo",       description:"Luna Superior Uno. Sacrificaste tu humanidad y siglos de soledad para convertirte en el demonio más poderoso después de Muzan.", tags:["Luna Uno","Eterno","Rival fraternal","Respiración de la Luna"], color:"#1A1A2E" },
  Doma:      { name:"Doma",            description:"Luna Superior Dos. El vacío absoluto disfrazado de sonrisa radiante. No sentís nada genuino.", tags:["Luna Dos","Vacío","Sonrisa falsa","Carismático"], color:"#4A0E0E" },
  Akaza:     { name:"Akaza",           description:"Luna Superior Tres. El guerrero eterno atrapado en la negación.", tags:["Luna Tres","Combate","Negación","Fuerza pura"], color:"#8B0000" },
  Hantengu:  { name:"Hantengu",        description:"Luna Superior Cuatro. Tus emociones te fragmentaron literalmente en múltiples seres.", tags:["Luna Cuatro","Cobardía","Emociones fragmentadas","Inestable"], color:"#5D3A1A" },
  Gyokko:    { name:"Gyokko",          description:"Luna Superior Cinco. El artista que confunde la belleza con la posesión.", tags:["Luna Cinco","Arte oscuro","Orgullo","Creación y destrucción"], color:"#1B4F72" },
  Daki:      { name:"Daki (y Gyutaro)",description:"Luna Superior Seis. Convertiste el sufrimiento en poder de seducción y supervivencia.", tags:["Luna Seis","Seducción","Supervivencia","Dualidad"], color:"#6C1A3A" },
};

// ── DOM ──
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
const MODE_LABELS = { trivia:'⚔️ Trivia', respiracion:'💧 Respiración', hashira:'🏯 Hashira', luna:'🌙 Luna Demoníaca' };

// ── Router unificado ──
const ALL_SCREEN_IDS = ['menu-screen','quiz-screen','result-screen','hangman-screen','tateti-screen','katana-screen','arcos-screen','memoria-screen'];

function showScreen(id) {
  ALL_SCREEN_IDS.forEach(sid => {
    const el = document.getElementById(sid);
    if (!el) return;
    el.classList.remove('active');
    el.classList.add('hidden');
  });
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
  window.scrollTo({ top:0, behavior:'smooth' });
}
window.KimetsuRouter = { showScreen };

// ── Carga de modo ──
function loadMode(mode) {
  GameState.currentMode = mode;
  GameState.currentQuestionIndex = 0;
  GameState.score = 0;
  GameState.timeBonus = 0;
  GameState.personalityPoints = {};

  switch (mode) {
    case 'trivia':
      GameState.questions = shuffleArray([...TRIVIA_POOL]).slice(0,10); break;
    case 'respiracion':
      ['Agua','Fuego','Trueno','Bestia','Insecto'].forEach(c => { GameState.personalityPoints[c]=0; });
      GameState.questions = shuffleArray([...RESPIRACION_QUESTIONS]); break;
    case 'hashira':
      Object.keys(HASHIRA_RESULTS).forEach(c => { GameState.personalityPoints[c]=0; });
      GameState.questions = shuffleArray([...HASHIRA_QUESTIONS]); break;
    case 'luna':
      Object.keys(LUNA_RESULTS).forEach(c => { GameState.personalityPoints[c]=0; });
      GameState.questions = shuffleArray([...LUNA_QUESTIONS]); break;
  }
  DOM.quizModeLabel.textContent = MODE_LABELS[mode];
  showScreen('quiz-screen');
  renderQuestion();
}

// ── Renderizar pregunta ──
function renderQuestion() {
  const total = GameState.questions.length;
  const idx   = GameState.currentQuestionIndex;
  const q     = GameState.questions[idx];

  DOM.quizProgress.textContent = `${idx+1} / ${total}`;
  DOM.questionNum.textContent  = `Pregunta ${idx+1}`;
  DOM.progressFill.style.width = `${(idx/total)*100}%`;
  DOM.questionText.textContent = q.question;
  DOM.optionsGrid.innerHTML    = '';
  DOM.nextContainer.style.display = 'none';
  GameState.questionStartTime = Date.now();

  const options = GameState.currentMode === 'trivia' ? q.options : q.options.map(o=>o.text);
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

  DOM.optionsGrid.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(12px)';
    setTimeout(() => {
      btn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    }, 60*i);
  });
}

// ── Manejar respuesta ──
function handleAnswer(selectedIndex, clickedBtn) {
  const q    = GameState.questions[GameState.currentQuestionIndex];
  const btns = DOM.optionsGrid.querySelectorAll('.option-btn');
  btns.forEach(b => b.disabled = true);

  if (GameState.currentMode === 'trivia') {
    const correct = q.answerIndex;
    if (selectedIndex === correct) {
      clickedBtn.classList.add('correct');
      GameState.score++;
      const elapsed = (Date.now() - GameState.questionStartTime) / 1000;
      if (elapsed < 5)       GameState.timeBonus += 3;
      else if (elapsed < 10) GameState.timeBonus += 1;
    } else {
      clickedBtn.classList.add('incorrect');
      btns[correct].classList.add('correct');
      shakeElement(clickedBtn);
    }
    btns.forEach((b,i) => { if (i!==selectedIndex && i!==correct) b.classList.add('revealed'); });
  } else {
    const selectedOption = q.options[selectedIndex];
    Object.entries(selectedOption.points).forEach(([cat,pts]) => {
      if (GameState.personalityPoints[cat] !== undefined) GameState.personalityPoints[cat] += pts;
    });
    clickedBtn.classList.add('correct');
    btns.forEach((b,i) => { if (i!==selectedIndex) b.classList.add('revealed'); });
  }
  DOM.nextContainer.style.display = 'flex';
}

// ── Avanzar ──
function advanceQuestion() {
  GameState.currentQuestionIndex++;
  if (GameState.currentQuestionIndex < GameState.questions.length) renderQuestion();
  else showResult();
}

// ── Mostrar resultado ──
function showResult() {
  let resultData, category='', scoreLabel='';

  if (GameState.currentMode === 'trivia') {
    const score = GameState.score, total = GameState.questions.length;
    const bonus = GameState.timeBonus, final = score*100 + bonus*10;
    const pct   = (score/total)*100;
    const emoji = pct===100?'🔥':pct>=70?'⚔️':pct>=40?'💧':'😓';
    const msg   = pct===100?'Eres un verdadero Hashira del conocimiento.':pct>=70?'Gran actuación, Cazador de Demonios.':pct>=40?'Buen intento. El entrenamiento continúa.':'Volvé a repasar el anime... ¡ánimo!';
    scoreLabel  = `${emoji} ${score}/${total} correctas · Bonus: +${bonus*10} · Total: ${final} pts`;
    category    = 'Resultado Final';
    resultData  = { name:'Tanjiro Kamado', img:'tanjiro.png', description: msg+' Seguí adelante con la misma determinación.', tags:[`${score}/${total} correctas`,`${bonus*10} pts bonus`,`${final} puntos totales`], color:'#C0392B' };
    showRankingInput(final, 'trivia');
  } else {
    const winnerCat = getWinnerCategory(GameState.personalityPoints);
    const map = { respiracion:RESPIRACION_RESULTS, hashira:HASHIRA_RESULTS, luna:LUNA_RESULTS };
    resultData = map[GameState.currentMode][winnerCat];
    category   = winnerCat;
    const catLabel = { respiracion:'✨ Tu Respiración', hashira:'🏯 Tu Pilar', luna:'🌙 Tu Luna Demoníaca' };
    DOM.resultCategory.textContent = catLabel[GameState.currentMode];
  }

  DOM.resultCategory.textContent = category;
  DOM.resultName.textContent     = resultData.name;
  DOM.resultScore.textContent    = scoreLabel;
  DOM.resultDesc.textContent     = resultData.description;
  DOM.resultTags.innerHTML       = resultData.tags.map(t=>`<span class="result-tag">${t}</span>`).join('');
  setupResultImage(resultData.img, resultData.name, resultData.color);
  showScreen('result-screen');
  renderRankingWidget(GameState.currentMode);
  launchResultParticles(resultData.color || '#C0392B');
}

function setupResultImage(imgSrc, altName, fallbackColor) {
  const img=DOM.resultImg, fb=DOM.resultFallback;
  img.classList.remove('hidden'); fb.classList.add('hidden');
  img.alt=altName; img.src=imgSrc;
  img.onerror=()=>{ img.classList.add('hidden'); fb.classList.remove('hidden'); fb.style.background=fallbackColor||'#333'; fb.textContent=altName; };
}

// ── Ranking UI ──
function showRankingInput(score, mode) {
  const container = DOM.resultScreen.querySelector('.result-container');
  if (!container) return;
  const prev = container.querySelector('.ranking-input-wrap');
  if (prev) prev.remove();
  const wrap = document.createElement('div');
  wrap.className = 'ranking-input-wrap';
  wrap.style.cssText = 'display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;margin-top:1rem;padding:1rem;background:rgba(192,57,43,0.08);border:1px solid rgba(192,57,43,0.2);border-radius:8px;';
  wrap.innerHTML = `
    <span style="font-family:Cinzel,serif;font-size:.8rem;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;">Guardar puntaje</span>
    <input id="ranking-name-input" type="text" maxlength="18" placeholder="Tu nombre…"
      style="background:#0a0a0e;border:1px solid rgba(255,255,255,.12);border-radius:4px;padding:.5rem .75rem;color:#F0E6D3;font-family:'Crimson Pro',serif;font-size:1rem;flex:1;min-width:120px;" />
    <button id="ranking-save-btn" class="btn-primary" style="padding:.5rem 1.25rem;font-size:.8rem;">Guardar</button>`;
  container.querySelector('.result-actions').before(wrap);
  document.getElementById('ranking-save-btn').addEventListener('click', () => {
    const name = document.getElementById('ranking-name-input').value || 'Cazador';
    Ranking.save(name, score, mode);
    wrap.innerHTML = `<span style="color:#27AE60;font-family:Cinzel,serif;font-size:.85rem;letter-spacing:.1em;">✓ Guardado como "${name.trim().slice(0,18)||'Cazador'}"</span>`;
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
  widget.style.cssText = 'margin-top:1rem;padding:1rem 1.25rem;background:rgba(0,0,0,0.3);border:1px solid rgba(201,168,76,0.2);border-radius:8px;';
  widget.innerHTML = `
    <h3 style="font-family:Cinzel,serif;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:.75rem;">🏆 Top Cazadores</h3>
    ${top.map((r,i)=>`
      <div style="display:flex;align-items:center;gap:.75rem;padding:.35rem 0;border-bottom:1px solid rgba(255,255,255,.05);">
        <span style="font-size:1rem;width:1.5rem;text-align:center;">${medals[i]}</span>
        <span style="flex:1;font-family:'Crimson Pro',serif;color:#F0E6D3;font-size:.95rem;">${r.name}</span>
        <span style="font-family:Cinzel,serif;color:#C9A84C;font-size:.85rem;">${r.score} pts</span>
      </div>`).join('')}`;
  container.querySelector('.result-actions').before(widget);
}

// ── Utilidades ──
function getWinnerCategory(points) {
  const max = Math.max(...Object.values(points));
  const winners = Object.keys(points).filter(c => points[c]===max);
  return winners.length===1 ? winners[0] : winners[Math.floor(Math.random()*winners.length)];
}

function shuffleArray(arr) {
  for (let i=arr.length-1; i>0; i--) { const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

function shakeElement(el) {
  el.style.animation='none'; el.offsetHeight;
  el.style.animation='shake-wrong 0.4s ease';
  el.addEventListener('animationend', ()=>{ el.style.animation=''; }, {once:true});
}

(function injectCSS() {
  if (document.getElementById('kimetsu-base-css')) return;
  const s = document.createElement('style');
  s.id = 'kimetsu-base-css';
  s.textContent = `
    @keyframes shake-wrong { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px) rotate(-1deg)} 40%{transform:translateX(8px) rotate(1deg)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
    @keyframes float-particle { 0%{transform:translateY(0) scale(1);opacity:.8} 100%{transform:translateY(-80px) scale(0);opacity:0} }
  `;
  document.head.appendChild(s);
})();

// ── Partículas ──
function initMenuParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const colors = ['#C0392B','#2E8B57','#C9A84C','#6C3483','#2E86AB'];
  for (let i=0; i<25; i++) {
    const p=document.createElement('div'); p.classList.add('particle');
    const size=Math.random()*4+2;
    p.style.cssText=`width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};left:${Math.random()*100}%;animation-duration:${Math.random()*10+10}s;animation-delay:${Math.random()*12}s;opacity:0;`;
    container.appendChild(p);
  }
}

function launchResultParticles(color) {
  const container = document.getElementById('result-particles');
  if (!container) return;
  container.innerHTML='';
  const colors=[color,'#C9A84C','#F0E6D3','#ffffff'];
  for (let i=0; i<40; i++) {
    const p=document.createElement('div');
    p.style.cssText=`position:absolute;width:${Math.random()*6+2}px;height:${Math.random()*6+2}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:50%;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:float-particle ${Math.random()*4+3}s ease-out both;animation-delay:${Math.random()*1.5}s;opacity:0;`;
    container.appendChild(p);
  }
}

// ── Event Listeners ──
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

// ── Init ──
initMenuParticles();
