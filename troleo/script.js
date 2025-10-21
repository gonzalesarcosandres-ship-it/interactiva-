// --- Configuración del Juego ---
const L1_SIZE = 8; // Número de bloques en Caché L1
const RAM_SIZE = 16; // Número total de datos en RAM (incluye los de L1)
const GAME_DURATION = 30; // Duración del juego en segundos
const HIT_POINTS = 10;
const MISS_PENALTY = -5;

// --- Elementos del DOM ---
const l1BlocksContainer = document.getElementById('l1-blocks');
const ramBlocksContainer = document.getElementById('ram-blocks');
const requestedDataElement = document.getElementById('requested-data');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const messageElement = document.getElementById('message');

// --- Variables del Juego ---
let score = 0;
let timeRemaining = GAME_DURATION;
let timerInterval = null;
let gameActive = false;
let allData = []; // Todos los datos posibles (A, B, C...)
let requestedData = '';

// --- Funciones de Utilidad ---

// Genera un array de datos (letras mayúsculas)
function generateAllData() {
    for (let i = 0; i < RAM_SIZE; i++) {
        // Genera letras desde 'A' en adelante
        allData.push(String.fromCharCode(65 + i)); 
    }
}

// Inicializa los bloques de memoria
function initializeMemory() {
    // 1. Obtener una mezcla aleatoria de datos para L1
    const l1Data = allData.slice(0, L1_SIZE).sort(() => 0.5 - Math.random());
    
    // 2. Colocar los bloques en el DOM para L1
    l1BlocksContainer.innerHTML = '';
    l1Data.forEach(data => {
        const block = document.createElement('div');
        block.classList.add('data-block');
        block.textContent = data;
        block.dataset.value = data;
        block.addEventListener('click', () => handleBlockClick(block, data));
        l1BlocksContainer.appendChild(block);
    });

    // 3. Colocar todos los bloques en el DOM para RAM (solo para visualización)
    ramBlocksContainer.innerHTML = '';
    allData.forEach(data => {
        const block = document.createElement('div');
        block.classList.add('data-block');
        // Mostrar 'Caché' si el dato está en L1, sino mostrar el dato real (simulación simple)
        block.textContent = l1Data.includes(data) ? 'Caché' : data; 
        block.dataset.value = data;
        ramBlocksContainer.appendChild(block);
    });
}

// Inicia una nueva solicitud de dato
function newRequest() {
    // Decide aleatoriamente si el dato solicitado será un HIT (en L1) o un MISS (no en L1)
    const isHit = Math.random() < 0.7; // 70% de probabilidad de HIT

    if (isHit) {
        // Selecciona un dato que esté en L1
        const l1Blocks = Array.from(l1BlocksContainer.querySelectorAll('.data-block'));
        requestedData = l1Blocks[Math.floor(Math.random() * l1Blocks.length)].dataset.value;
    } else {
        // Selecciona un dato que esté en RAM pero *no* en L1 (simulando un MISS)
        const l1DataValues = Array.from(l1BlocksContainer.querySelectorAll('.data-block')).map(b => b.dataset.value);
        const ramMissData = allData.filter(data => !l1DataValues.includes(data));
        requestedData = ramMissData[Math.floor(Math.random() * ramMissData.length)];
    }

    requestedDataElement.textContent = requestedData;
    messageElement.textContent = '¡Busca el dato!';
    messageElement.className = 'message';
}

// Maneja el clic en un bloque de la L1
function handleBlockClick(block, data) {
    if (!gameActive) return;

    if (data === requestedData) {
        // Cache HIT (Acierto)
        score += HIT_POINTS;
        messageElement.textContent = `✅ ¡Cache HIT! (+${HIT_POINTS} Pts.)`;
        messageElement.classList.add('hit');
        // El beneficio del Hit es que el dato ya está listo, pasamos al siguiente.
        newRequest(); 
    } else {
        // Fallo: Dato incorrecto
        score += MISS_PENALTY;
        messageElement.textContent = `❌ Dato incorrecto. Intenta de nuevo.`;
        messageElement.classList.add('miss');
    }
    scoreElement.textContent = score;
}

// Maneja el Miss de forma automática (si el tiempo se acaba)
function handleTimeOutMiss() {
    score += MISS_PENALTY;
    messageElement.textContent = `⏰ ¡Tiempo agotado! Cache MISS. (-${-MISS_PENALTY} Pts.)`;
    messageElement.classList.add('miss');
    scoreElement.textContent = score;

    // Simulación: Si es un Miss, se debe cargar el dato desde la RAM a L1 para la siguiente vez
    // En este juego, simplemente generamos una nueva solicitud.
    newRequest(); 
}

// Inicia el contador de tiempo y el ciclo de juego
function startTimer() {
    timeRemaining = GAME_DURATION;
    timerElement.textContent = timeRemaining;
    gameActive = true;
    startButton.disabled = true;

    newRequest(); // Primera solicitud

    timerInterval = setInterval(() => {
        timeRemaining--;
        timerElement.textContent = timeRemaining;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endGame();
        } else if (timeRemaining % 5 === 0) {
            // Cada 5 segundos, simulamos que el tiempo para encontrar el dato se agota
            if (gameActive) { // Solo si no se ha encontrado el dato
                 handleTimeOutMiss();
            }
        }
    }, 1000);
}

// Termina el juego
function endGame() {
    gameActive = false;
    startButton.disabled = false;
    startButton.textContent = 'Volver a Jugar';
    requestedDataElement.textContent = 'FIN';
    messageElement.textContent = `Juego Terminado. Puntuación Final: ${score}`;

    // Desactivar clics en L1 al finalizar
    Array.from(l1BlocksContainer.querySelectorAll('.data-block')).forEach(block => {
        block.style.pointerEvents = 'none';
    });
}

// Inicia el juego desde el principio
function startGame() {
    score = 0;
    scoreElement.textContent = score;
    timeRemaining = GAME_DURATION;
    timerElement.textContent = timeRemaining;
    messageElement.textContent = 'Inicia la simulación...';
    
    // Habilitar clics en L1
    Array.from(l1BlocksContainer.querySelectorAll('.data-block')).forEach(block => {
        block.style.pointerEvents = 'auto';
    });
    
    initializeMemory();
    startTimer();
}

// --- Inicialización ---
generateAllData();
initializeMemory();
startButton.addEventListener('click', startGame);
requestedDataElement.textContent = 'Dato Solicitado';
timerElement.textContent = GAME_DURATION;

// Explica qué es un Cache Hit y Miss en el mensaje inicial
messageElement.innerHTML = `Presiona "Iniciar Simulación". <br> **Cache HIT:** Dato en L1 (rápido). **Cache MISS:** Dato en RAM (lento).`;