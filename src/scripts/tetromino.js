class Tetromino {
    constructor(shape) {
        this.shape = shape;
        this.position = { x: 0, y: 0 };
    }

    rotate() {
        this.shape = this.shape[0].map((val, index) =>
            this.shape.map(row => row[index]).reverse()
        );
    }

    move(direction) {
        if (direction === 'left') {
            this.position.x -= 1;
        } else if (direction === 'right') {
            this.position.x += 1;
        } else if (direction === 'down') {
            this.position.y += 1;
        }
    }

    getCoordinates() {
        const coordinates = [];
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    coordinates.push({ x: this.position.x + x, y: this.position.y + y });
                }
            });
        });
        return coordinates;
    }
}

export const TETROMINOS = [
    // I
    {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00f0f0'
    },
    // J
    {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000f0'
    },
    // L
    {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#f0a000'
    },
    // O
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#f0f000'
    },
    // S
    {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00f000'
    },
    // T
    {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#a000f0'
    },
    // Z
    {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#f00000'
    }
];

export function rotate(matrix) {
    // Rotação 90 graus
    return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

export default Tetromino;