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
    {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        fruit: 'uva',
        img: 'frutas/uva.png'
    },
    {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        fruit: 'pera',
        img: 'frutas/pera.png'
    },
    {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        fruit: 'melancia',
        img: 'frutas/melancia.png'
    },
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        fruit: 'maca',
        img: 'frutas/maca.png'
    },
    {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        fruit: 'laranja',
        img: 'frutas/laranja.png'
    },
    {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        fruit: 'banana',
        img: 'frutas/banana.png'
    },
    {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        fruit: 'abacaxi',
        img: 'frutas/abacaxi.png'
    }
];

export function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

export default Tetromino;