// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Clase Ball (Pelota)
class Ball {
    constructor(x, y, radius, speedX, speedY, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color; // Usa el color asignado
        ctx.fill();
        ctx.closePath();
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Colisión con la parte superior e inferior
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.speedY = -this.speedY;
        }
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speedX = -this.speedX; // Cambia dirección al resetear
    }
}

// Clase Paddle (Paleta)
class Paddle {
    constructor(x, y, width, height, isPlayerControlled = false, color = 'white') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isPlayerControlled = isPlayerControlled;
        this.speed = 6; // Un poco más rápido para manejar el doble de alto
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color; // Usa el color asignado
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction == 'up' && this.y > 0) {
            this.y -= this.speed;
        } else if (direction == 'down' && this.y + this.height < canvas.height) {
            this.y += this.speed;
        }
    }

    // Movimiento de la paleta automática (IA)
    autoMove(balls) {
        // La IA sigue a la pelota más cercana
        if (balls.length > 0) {
            let closestBall = balls[0];
            let minDist = Math.abs(balls[0].x - this.x);
            
            for (let i = 1; i < balls.length; i++) {
                let dist = Math.abs(balls[i].x - this.x);
                if (dist < minDist) {
                    minDist = dist;
                    closestBall = balls[i];
                }
            }

            if (closestBall.y < this.y + this.height / 2) {
                this.y -= this.speed;
            } else if (closestBall.y > this.y + this.height / 2) {
                this.y += this.speed;
            }
            // Evitar que la paleta se salga de los bordes
            if (this.y < 0) this.y = 0;
            if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
        }
    }
}

// Clase Game (Controla el juego)
class Game {
    constructor() {
        // Creamos las 5 pelotas con diferentes tamaños, colores y velocidades
        this.balls = [
            new Ball(canvas.width / 2, canvas.height / 2, 20, 3.5, 3.5, 'rgb(255, 0, 0)'),
            new Ball(canvas.width / 2, canvas.height / 2, 12, -4, 2.5, 'rgb(255, 132, 0)'),
            new Ball(canvas.width / 2, canvas.height / 2, 8, 2, -4.5, 'rgb(81, 255, 0)'),
            new Ball(canvas.width / 2, canvas.height / 2, 25, -2.5, 3, 'rgb(0, 255, 238)'),
            new Ball(canvas.width / 2, canvas.height / 2, 3, 5, -5, 'rgb(255, 0, 208)')
        ];

        // Paleta del jugador: Verde y el doble de alto (200px)
        this.paddle1 = new Paddle(0, canvas.height / 2 - 100, 15, 200, true, 'lime'); 
        
        // Paleta de la CPU: Roja
        this.paddle2 = new Paddle(canvas.width - 15, canvas.height / 2 - 50, 15, 100, false, 'red'); 
        
        this.keys = {}; // Para capturar las teclas
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar todas las pelotas
        for (let i = 0; i < this.balls.length; i++) {
            this.balls[i].draw();
        }
        
        this.paddle1.draw();
        this.paddle2.draw();
    }

    update() {
        // Mover todas las pelotas
        for (let i = 0; i < this.balls.length; i++) {
            let ball = this.balls[i];
            ball.move();

            // Colisiones con la paleta 1 (Jugador)
            if (ball.x - ball.radius <= this.paddle1.x + this.paddle1.width &&
                ball.y >= this.paddle1.y &&
                ball.y <= this.paddle1.y + this.paddle1.height &&
                ball.speedX < 0) {
                ball.speedX = -ball.speedX;
            }

            // Colisiones con la paleta 2 (CPU)
            if (ball.x + ball.radius >= this.paddle2.x &&
                ball.y >= this.paddle2.y &&
                ball.y <= this.paddle2.y + this.paddle2.height &&
                ball.speedX > 0) {
                ball.speedX = -ball.speedX;
            }

            // Detectar cuando la pelota sale de los bordes
            if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
                ball.reset();
            }
        }

        // Movimiento de la paleta 1 (Jugador)
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.paddle1.move('up');
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.paddle1.move('down');
        }

        // Movimiento de la paleta 2 (IA)
        this.paddle2.autoMove(this.balls);
    }
}

// Inicializar juego
const game = new Game();

// Captura de teclas
document.addEventListener('keydown', (e) => {
    game.keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    game.keys[e.key] = false;
});

// Bucle del juego
function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();