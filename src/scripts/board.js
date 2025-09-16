export class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = this.createBoard();
    }

    createBoard() {
        return Array.from({ length: this.height }, () => Array(this.width).fill(0));
    }

    reset() {
        this.grid = this.createBoard();
    }

    draw(ctx, squareSize, fruitImages) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const fruit = this.grid[y][x];
                if (fruit && fruitImages[fruit]) {
                    ctx.drawImage(fruitImages[fruit], x * squareSize, y * squareSize, squareSize, squareSize);
                } else {
                    ctx.fillStyle = '#222';
                    ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
                }
                ctx.strokeStyle = '#333';
                ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
            }
        }
    }

    merge(tetromino) {
        tetromino.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const x = tetromino.x + dx;
                    const y = tetromino.y + dy;
                    if (y >= 0) this.grid[y][x] = tetromino.fruit;
                }
            });
        });
    }

    sweep() {
        let lines = 0;
        this.grid = this.grid.filter(row => {
            const firstFruit = row[0];
            if (
                firstFruit &&
                row.every(cell => cell === firstFruit)
            ) {
                lines++;
                return false;
            }
            return true;
        });
        while (this.grid.length < this.height) {
            this.grid.unshift(Array(this.width).fill(0));
        }
        return lines;
    }

    isGameOver() {
        return this.grid[0].some(cell => cell);
    }
}