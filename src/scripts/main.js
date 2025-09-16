import { Board } from './board.js';
import { TETROMINOS, rotate } from './tetromino.js';
import { getRandomInt, checkCollision } from './utils.js';

const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const timerEl = document.getElementById('timer');
const comboEl = document.getElementById('combo');
const serieEl = document.getElementById('serie');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold');
const holdCtx = holdCanvas.getContext('2d');
const bonusMsg = document.getElementById('bonus-message');
const nextPiecesDiv = document.getElementById('next-pieces');

const COLS = 10;
const ROWS = 20;
const SQ = 30;

let board, tetromino, nextTetromino, nextQueue, score, level, lines, combo, serie, timer, dropTimer, paused, gameOver;
let holdTetromino = null;
let canHold = true;

// Carregar imagens das frutas
const fruitImages = {};
TETROMINOS.forEach(t => {
    const img = new Image();
    img.src = t.img;
    fruitImages[t.fruit] = img;
});

function resetGame() {
    board = new Board(COLS, ROWS);
    score = 0;
    level = 1;
    lines = 0;
    combo = 1;
    serie = 0;
    timer = 0;
    paused = false;
    gameOver = false;
    holdTetromino = null;
    canHold = true;
    nextQueue = [randomTetromino(), randomTetromino(), randomTetromino()];
    tetromino = randomTetromino();
    nextTetromino = nextQueue[0];
    updateHUD();
    updateScreen();
    loop();
}

function randomTetromino() {
    const idx = getRandomInt(0, TETROMINOS.length);
    const t = TETROMINOS[idx];
    return {
        shape: t.shape.map(row => [...row]),
        fruit: t.fruit,
        img: t.img,
        x: Math.floor(COLS / 2) - Math.ceil(t.shape[0].length / 2),
        y: -t.shape.length + 1
    };
}

function drawTetromino(t, context = ctx, offsetX = 0, offsetY = 0, size = SQ) {
    t.shape.forEach((row, dy) => {
        row.forEach((val, dx) => {
            if (val) {
                const img = fruitImages[t.fruit];
                context.drawImage(
                    img,
                    (t.x + dx + offsetX) * size,
                    (t.y + dy + offsetY) * size,
                    size,
                    size
                );
                context.strokeStyle = '#333';
                context.strokeRect((t.x + dx + offsetX) * size, (t.y + dy + offsetY) * size, size, size);
            }
        });
    });
}

function drawNextTetromino() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    const t = nextTetromino;
    t.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                nextCtx.drawImage(fruitImages[t.fruit], x * 20 + 20, y * 20 + 20, 20, 20);
            }
        });
    });
}

function drawHoldTetromino() {
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (!holdTetromino) return;
    const t = holdTetromino;
    t.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                holdCtx.drawImage(fruitImages[t.fruit], x * 20 + 20, y * 20 + 20, 20, 20);
            }
        });
    });
}

function drawNextPiecesPanel() {
    nextPiecesDiv.innerHTML = '';
    nextQueue.forEach(t => {
        const img = document.createElement('img');
        img.src = t.img;
        img.className = 'next-piece-img';
        nextPiecesDiv.appendChild(img);
    });
}

function updateHUD() {
    scoreEl.textContent = `Pontuação: ${score}`;
    levelEl.textContent = `Nível: ${level}`;
    linesEl.textContent = `Linhas: ${lines}`;
    comboEl.textContent = `Combo: x${combo}`;
    serieEl.textContent = `Série: ${serie}`;
    timerEl.textContent = `Tempo: ${timer}`;
}

function updateScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(ctx, SQ, fruitImages);
    drawTetromino(tetromino);
    drawNextTetromino();
    drawHoldTetromino();
    drawNextPiecesPanel();
}

function drop() {
    if (!move(0, 1)) {
        board.merge(tetromino);
        const cleared = board.sweep();
        if (cleared) {
            score += 100 * cleared * level * combo;
            lines += cleared;
            serie += cleared;
            combo = Math.min(combo + 1, 5);
            showBonusMessage(tetromino.fruit, cleared);
            if (lines >= level * 10) {
                level++;
            }
        } else {
            combo = 1;
            serie = 0;
        }
        tetromino = nextQueue.shift();
        nextQueue.push(randomTetromino());
        nextTetromino = nextQueue[0];
        canHold = true;
        if (checkCollision(board, tetromino)) {
            gameOver = true;
            clearTimeout(dropTimer);
            alert('Game Over!');
        }
    }
    updateHUD();
    updateScreen();
}

function move(dx, dy) {
    if (!checkCollision(board, tetromino, dx, dy)) {
        tetromino.x += dx;
        tetromino.y += dy;
        updateScreen();
        return true;
    }
    return false;
}

function rotateTetromino() {
    const rotated = rotate(tetromino.shape);
    if (!checkCollision(board, tetromino, 0, 0, rotated)) {
        tetromino.shape = rotated;
        updateScreen();
    }
}

function holdCurrentTetromino() {
    if (!canHold) return;
    if (!holdTetromino) {
        holdTetromino = {
            shape: tetromino.shape.map(row => [...row]),
            fruit: tetromino.fruit,
            img: tetromino.img
        };
        tetromino = nextQueue.shift();
        nextQueue.push(randomTetromino());
        nextTetromino = nextQueue[0];
    } else {
        [holdTetromino, tetromino] = [
            {
                shape: tetromino.shape.map(row => [...row]),
                fruit: tetromino.fruit,
                img: tetromino.img
            },
            {
                shape: holdTetromino.shape.map(row => [...row]),
                fruit: holdTetromino.fruit,
                img: holdTetromino.img,
                x: Math.floor(COLS / 2) - Math.ceil(holdTetromino.shape[0].length / 2),
                y: -holdTetromino.shape.length + 1
            }
        ];
    }
    tetromino.x = Math.floor(COLS / 2) - Math.ceil(tetromino.shape[0].length / 2);
    tetromino.y = -tetromino.shape.length + 1;
    canHold = false;
    updateScreen();
}

function showBonusMessage(fruit, lines) {
    bonusMsg.textContent = `+${lines * 100} BÔNUS DISPONÍVEL\n${fruit.toUpperCase()}`;
    setTimeout(() => {
        bonusMsg.textContent = '';
    }, 1200);
}

function loop() {
    if (paused || gameOver) return;
    dropTimer = setTimeout(() => {
        drop();
        timer++;
        updateHUD();
        loop();
    }, Math.max(100, 1000 - (level - 1) * 100));
}

document.addEventListener('keydown', (e) => {
    if (paused || gameOver) return;
    switch (e.key) {
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowUp': rotateTetromino(); break;
        case ' ': // Espaço = hard drop
            while (move(0, 1)) {}
            drop();
            break;
        case 'c':
        case 'C':
            holdCurrentTetromino();
            break;
    }
});

startBtn.onclick = () => resetGame();
pauseBtn.onclick = () => {
    paused = !paused;
    if (!paused) loop();
};
resetBtn.onclick = () => resetGame();

// Touch controls
document.getElementById('leftBtn').onclick = () => move(-1, 0);
document.getElementById('rightBtn').onclick = () => move(1, 0);
document.getElementById('downBtn').onclick = () => move(0, 1);
document.getElementById('rotateBtn').onclick = () => rotateTetromino();
document.getElementById('dropBtn').onclick = () => { while (move(0, 1)) {} drop(); };
document.getElementById('holdBtn').onclick = () => holdCurrentTetromino();

// No main.js, ao iniciar:
function resizeCanvas() {
    const boardWrapper = document.querySelector('.board-wrapper');
    const w = boardWrapper.offsetWidth;
    const h = boardWrapper.offsetHeight;
    // Mantém proporção 10x20
    let canvasWidth = w;
    let canvasHeight = w * 2;
    if (canvasHeight > h) {
        canvasHeight = h;
        canvasWidth = h / 2;
    }
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

resetGame();