export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function checkCollision(board, tetromino, offsetX = 0, offsetY = 0, shape = null) {
    const shapeToCheck = shape || tetromino.shape;
    for (let y = 0; y < shapeToCheck.length; y++) {
        for (let x = 0; x < shapeToCheck[y].length; x++) {
            if (shapeToCheck[y][x]) {
                const newX = tetromino.x + x + offsetX;
                const newY = tetromino.y + y + offsetY;
                if (
                    newX < 0 ||
                    newX >= board.width ||
                    newY >= board.height ||
                    (newY >= 0 && board.grid[newY][newX])
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function mergeTetromino(board, tetromino) {
    for (let y = 0; y < tetromino.shape.length; y++) {
        for (let x = 0; x < tetromino.shape[y].length; x++) {
            if (tetromino.shape[y][x] !== 0) {
                board.grid[tetromino.y + y][tetromino.x + x] = tetromino.color;
            }
        }
    }
}