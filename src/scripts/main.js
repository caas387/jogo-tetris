import { Board } from './board.js';
import { TETROMINOS, rotate } from './tetromino.js';
import { getRandomInt, checkCollision } from './utils.js';

const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const muteBtn = document.getElementById('muteBtn');

const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold');
const holdCtx = holdCanvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const SQ = 30;

let board, tetromino, nextTetromino, score, level, lines, dropTimer, paused, gameOver;
let holdTetromino = null;
let canHold = true;
let muted = false;

const sounds = {
    move: new Audio('https://cdn.jsdelivr.net/gh/rafaelalmeidatk/tetris-sounds/move.mp3'),
    rotate: new Audio('https://cdn.jsdelivr.net/gh/rafaelalmeidatk/tetris-sounds/rotate.mp3'),
    drop: new Audio('https://cdn.jsdelivr.net/gh/rafaelalmeidatk/tetris-sounds/drop.mp3'),
    line: new Audio('https://cdn.jsdelivr.net/gh/rafaelalmeidatk/tetris-sounds/line.mp3'),
    gameover: new Audio('https://cdn.jsdelivr.net/gh/rafaelalmeidatk/tetris-sounds/gameover.mp3')
};

function playSound(name) {
    if (!muted && sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].play();
    }
}

function resetGame() {
    board = new Board(COLS, ROWS);
    score = 0;
    level = 1;
    lines = 0;
    paused = false;
    gameOver = false;
    holdTetromino = null;
    canHold = true;
    tetromino = randomTetromino();
    nextTetromino = randomTetromino();
    updateHUD();
    updateScreen();
    loop();
}

function randomTetromino() {
    const idx = getRandomInt(0, TETROMINOS.length);
    const t = TETROMINOS[idx];
    return {
        shape: t.shape.map(row => [...row]),
        color: t.color,
        x: Math.floor(COLS / 2) - Math.ceil(t.shape[0].length / 2),
        y: -t.shape.length + 1
    };
}

function drawTetromino(t, context = ctx, offsetX = 0, offsetY = 0, size = SQ) {
    t.shape.forEach((row, dy) => {
        row.forEach((val, dx) => {
            if (val) {
                context.fillStyle = t.color;
                context.fillRect((t.x + dx + offsetX) * size, (t.y + dy + offsetY) * size, size, size);
                context.strokeStyle = '#111';
                context.strokeRect((t.x + dx + offsetX) * size, (t.y + dy + offsetY) * size, size, size);
            }
        });
    });
}

function drawNextTetromino() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    const t = nextTetromino;
    const size = 30;
    t.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                nextCtx.fillStyle = t.color;
                nextCtx.fillRect(x * size + 15, y * size + 15, size, size);
                nextCtx.strokeStyle = '#111';
                nextCtx.strokeRect(x * size + 15, y * size + 15, size, size);
            }
        });
    });
}

function drawHoldTetromino() {
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (!holdTetromino) return;
    const t = holdTetromino;
    const size = 30;
    t.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                holdCtx.fillStyle = t.color;
                holdCtx.fillRect(x * size + 15, y * size + 15, size, size);
                holdCtx.strokeStyle = '#111';
                holdCtx.strokeRect(x * size + 15, y * size + 15, size, size);
            }
        });
    });
}

function updateHUD() {
    scoreEl.textContent = `Score: ${score}`;
    levelEl.textContent = `Level: ${level}`;
    linesEl.textContent = `Linhas: ${lines}`;
}

function updateScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(ctx, SQ);
    drawTetromino(tetromino);
    drawNextTetromino();
    drawHoldTetromino();
}

function drop() {
    if (!move(0, 1)) {
        board.merge(tetromino);
        const cleared = board.sweep();
        if (cleared) {
            score += [0, 40, 100, 300, 1200][cleared] * level;
            lines += cleared;
            playSound('line');
            if (lines >= level * 10) {
                level++;
            }
        }
        tetromino = nextTetromino;
        nextTetromino = randomTetromino();
        canHold = true;
        if (checkCollision(board, tetromino)) {
            gameOver = true;
            clearTimeout(dropTimer);
            playSound('gameover');
            alert('Game Over!');
        }
    } else {
        playSound('drop');
    }
    updateHUD();
    updateScreen();
}

function move(dx, dy) {
    if (!checkCollision(board, tetromino, dx, dy)) {
        tetromino.x += dx;
        tetromino.y += dy;
        playSound('move');
        updateScreen();
        return true;
    }
    return false;
}

function rotateTetromino() {
    const rotated = rotate(tetromino.shape);
    if (!checkCollision(board, tetromino, 0, 0, rotated)) {
        tetromino.shape = rotated;
        playSound('rotate');
        updateScreen();
    }
}

function holdCurrentTetromino() {
    if (!canHold) return;
    playSound('move');
    if (!holdTetromino) {
        holdTetromino = {
            shape: tetromino.shape.map(row => [...row]),
            color: tetromino.color
        };
        tetromino = nextTetromino;
        nextTetromino = randomTetromino();
    } else {
        [holdTetromino, tetromino] = [
            {
                shape: tetromino.shape.map(row => [...row]),
                color: tetromino.color
            },
            {
                shape: holdTetromino.shape.map(row => [...row]),
                color: holdTetromino.color,
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

function loop() {
    if (paused || gameOver) return;
    dropTimer = setTimeout(() => {
        drop();
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
muteBtn.onclick = () => {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
};

// Touch controls
document.getElementById('leftBtn').onclick = () => move(-1, 0);
document.getElementById('rightBtn').onclick = () => move(1, 0);
document.getElementById('downBtn').onclick = () => move(0, 1);
document.getElementById('rotateBtn').onclick = () => rotateTetromino();
document.getElementById('dropBtn').onclick = () => { while (move(0, 1)) {} drop(); };
document.getElementById('holdBtn').onclick = () => holdCurrentTetromino();

resetGame();