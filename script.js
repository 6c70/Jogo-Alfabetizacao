/**
 * Jogo da Forca - Português para Estrangeiros
 */

const categories = [
    { name: 'Frutas', file: 'data/frutas.json' },
    { name: 'Animais', file: 'data/animais.json' },
    { name: 'Objetos', file: 'data/objetos.json' },
    { name: 'Transporte', file: 'data/transporte.json' },
    { name: 'Casa', file: 'data/casa.json' },
    { name: 'Saúde', file: 'data/saude.json' },
    { name: 'Cidadania', file: 'data/cidadania.json' },
    { name: 'Estados', file: 'data/estados.json' },
    { name: 'Profissões', file: 'data/profissoes.json' }
];

let selectedWord = {};
let guessedLetters = [];
let mistakes = 0;
const maxMistakes = 6;
let currentPlayer = "";

// Elementos do DOM
const wordDisplay = document.getElementById('word-display');
const categoryDisplay = document.getElementById('category-display');
const categorySelect = document.getElementById('category-select');
const hintDisplay = document.getElementById('hint-display');
const errorCountDisplay = document.getElementById('error-count');
const keyboard = document.getElementById('keyboard');
const resultModal = document.getElementById('result-modal');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const revealedWordDisplay = document.getElementById('revealed-word');
const wordMeaningDisplay = document.getElementById('word-meaning');
const resetBtn = document.getElementById('reset-btn');
const hintBtn = document.getElementById('hint-btn');
const autoHintToggle = document.getElementById('auto-hint-toggle');
const playAgainBtn = document.getElementById('play-again-btn');

// Elementos de Jogador e Ranking Removidos

const hangmanParts = [
    'head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'
];

// Inicialização
async function initGame() {
    try {
        categoryDisplay.textContent = 'Carregando...';
        hintDisplay.textContent = 'Dica: Clique em uma letra para começar.';
        hintBtn.disabled = false;
        
        // Obter categoria selecionada
        let category;
        const selectedValue = categorySelect.value;
        
        if (selectedValue === 'random') {
            category = categories[Math.floor(Math.random() * categories.length)];
        } else {
            category = categories.find(c => c.name === selectedValue);
        }
        
        // Carregar palavras da categoria
        const response = await fetch(category.file);
        const wordList = await response.json();
        
        // Escolher palavra aleatória da lista
        const wordData = wordList[Math.floor(Math.random() * wordList.length)];
        
        selectedWord = {
            word: wordData.word.toUpperCase(),
            category: category.name,
            meaning: wordData.meaning
        };
        
        guessedLetters = [];
        mistakes = 0;

        // Resetar UI
        updateUI();
        createKeyboard();
        resetHangman();
        resultModal.classList.add('hidden');

        // Check for automatic hint
        if (autoHintToggle.checked) {
            showHint();
        }
    } catch (error) {
        console.error('Erro ao carregar palavras:', error);
        categoryDisplay.textContent = 'Erro ao carregar';
    }
}

function updateUI() {
    // Exibir categoria
    categoryDisplay.textContent = selectedWord.category;
    
    // Exibir palavra (com underscores)
    wordDisplay.innerHTML = '';
    const word = selectedWord.word;
    
    for (let char of word) {
        const slot = document.createElement('div');
        slot.classList.add('letter-slot');
        
        if (guessedLetters.includes(char) || char === ' ' || char === '-' || char === '!') {
            slot.textContent = char;
            slot.classList.add('revealed');
        } else {
            slot.textContent = '';
        }
        
        wordDisplay.appendChild(slot);
    }

    // Exibir erros
    errorCountDisplay.textContent = mistakes;
    
    // Checar vitória/derrota
    checkGameStatus();
}

function createKeyboard() {
    keyboard.innerHTML = '';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÇ';
    
    for (let char of letters) {
        const button = document.createElement('button');
        button.textContent = char;
        button.classList.add('key');
        button.addEventListener('click', () => handleGuess(char, button));
        keyboard.appendChild(button);
    }
}

function handleGuess(letter, button) {
    if (guessedLetters.includes(letter)) return;
    
    guessedLetters.push(letter);
    button.disabled = true;

    if (selectedWord.word.includes(letter)) {
        button.classList.add('correct');
        updateUI();
    } else {
        button.classList.add('wrong');
        mistakes++;
        showHangmanPart();
        updateUI();
    }
}

function showHangmanPart() {
    const partId = hangmanParts[mistakes - 1];
    if (partId) {
        const element = document.getElementById(partId);
        if (element) element.classList.add('visible');
    }
}

function resetHangman() {
    hangmanParts.forEach(partId => {
        const element = document.getElementById(partId);
        if (element) element.classList.remove('visible');
    });
}

function checkGameStatus() {
    if (!selectedWord.word) return;

    // Vitória
    const wordWithoutSpecials = selectedWord.word.replace(/[ -!]/g, '');
    const isWon = [...wordWithoutSpecials].every(char => guessedLetters.includes(char));
    
    if (isWon) {
        showResult(true);
    } 
    // Derrota
    else if (mistakes >= maxMistakes) {
        showResult(false);
    }
}

function showHint() {
    if (selectedWord && selectedWord.meaning) {
        hintDisplay.textContent = `Dica: ${selectedWord.meaning}`;
        hintBtn.disabled = true;
    }
}

function showResult(isWon) {
    resultModal.classList.remove('hidden');
    
    if (isWon) {
        resultTitle.textContent = 'Parabéns! 🎉';
        resultTitle.style.color = 'var(--success)';
        resultMessage.textContent = 'Você acertou a palavra!';
    } else {
        resultTitle.textContent = 'Que pena! 😢';
        resultTitle.style.color = 'var(--error)';
        resultMessage.textContent = 'A palavra era:';
    }
    
    revealedWordDisplay.textContent = selectedWord.word;
    wordMeaningDisplay.textContent = selectedWord.meaning ? `Significado: ${selectedWord.meaning}` : '';
}


// Event Listeners
resetBtn.addEventListener('click', initGame);
hintBtn.addEventListener('click', showHint);
playAgainBtn.addEventListener('click', initGame);


// Teclado físico
document.addEventListener('keydown', (e) => {
    if (resultModal.classList.contains('hidden')) {
        const key = e.key.toUpperCase();
        if (/^[A-ZÇ]$/.test(key)) {
            const buttons = document.querySelectorAll('.key');
            buttons.forEach(btn => {
                if (btn.textContent === key && !btn.disabled) {
                    handleGuess(key, btn);
                }
            });
        }
    }
});

// Iniciar o jogo
initGame();
