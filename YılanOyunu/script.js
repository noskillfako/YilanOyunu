const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const startBtn = document.getElementById("start-btn");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameLoop;
let isPlaying = false;

highScoreElement.textContent = highScore;

function initGame() {
    snake = [
        { x: 10, y: 10 },
    ];
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    isPlaying = true;
    startBtn.textContent = "Yeniden Başlat";
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, 100);
}

function drawGame() {
    clearCanvas();
    moveSnake();
    checkCollision();
    drawFood();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = "#4ade80"; // Bright green head
        } else {
            ctx.fillStyle = "#22c55e"; // Slightly darker body
        }
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#4ade80";
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0;
    });
}

function drawFood() {
    ctx.fillStyle = "#ef4444"; // Red apple
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ef4444";
    
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2, 
        food.y * gridSize + gridSize / 2, 
        gridSize / 2 - 2, 
        0, 
        2 * Math.PI
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

function moveSnake() {
    if (dx === 0 && dy === 0) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
}

function gameOver() {
    clearInterval(gameLoop);
    isPlaying = false;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        highScoreElement.textContent = highScore;
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 30px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("OYUN BİTTİ!", canvas.width / 2, canvas.height / 2 - 15);
    
    ctx.fillStyle = "white";
    ctx.font = "20px Poppins";
    ctx.fillText(`Skorunuz: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

document.addEventListener("keydown", (event) => {
    if (!isPlaying) return;

    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight", "Space"].indexOf(event.code) > -1) {
        event.preventDefault();
    }

    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    
    const W_KEY = 87;
    const A_KEY = 65;
    const S_KEY = 83;
    const D_KEY = 68;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if ((keyPressed === LEFT_KEY || keyPressed === A_KEY) && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if ((keyPressed === UP_KEY || keyPressed === W_KEY) && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if ((keyPressed === RIGHT_KEY || keyPressed === D_KEY) && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if ((keyPressed === DOWN_KEY || keyPressed === S_KEY) && !goingUp) {
        dx = 0;
        dy = 1;
    }
});

startBtn.addEventListener("click", initGame);

clearCanvas();
ctx.fillStyle = "white";
ctx.font = "20px Poppins";
ctx.textAlign = "center";
ctx.fillText("Başlamak için butona tıklayın", canvas.width / 2, canvas.height / 2);

// --- Dokunmatik (Swipe) Kontrolleri ---
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(event) {
    if (!isPlaying) return;
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
}, { passive: false });

canvas.addEventListener('touchmove', function(event) {
    if (isPlaying) {
        event.preventDefault(); // Oynarken ekranın kaymasını engelle
    }
}, { passive: false });

document.addEventListener('touchend', function(event) {
    if (!isPlaying) return;
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 30; // Kaydırma hassasiyeti
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) return;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Yatay kaydırma
        if (deltaX > 0 && !goingLeft) { dx = 1; dy = 0; }
        else if (deltaX < 0 && !goingRight) { dx = -1; dy = 0; }
    } else {
        // Dikey kaydırma
        if (deltaY > 0 && !goingUp) { dx = 0; dy = 1; }
        else if (deltaY < 0 && !goingDown) { dx = 0; dy = -1; }
    }
}

// PWA Servis Çalışanı (Service Worker) Kaydı
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker başarıyla kaydedildi', reg))
            .catch(err => console.error('Service Worker kaydı başarısız oldu', err));
    });
}
