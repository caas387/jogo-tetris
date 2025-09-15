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

    draw(ctx, squareSize) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                ctx.fillStyle = this.grid[y][x] || '#222';
                ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
                ctx.strokeStyle = '#111';
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
                    if (y >= 0) this.grid[y][x] = tetromino.color;
                }
            });
        });
    }

    sweep() {
        let lines = 0;
        this.grid = this.grid.filter(row => {
            if (row.every(cell => cell)) {
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