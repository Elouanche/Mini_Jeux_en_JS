//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 16*32
let boardHeight = tileSize * rows; // 16*32
let context;

//ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight,
}

let shipImg;
let shipVelocityX = tileSize; // ship moving speed

// aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; // number of aliens to defeat
let alienVelocityX = 1; // alien moving speed

// pew pew bullets
let bulletArray = [];
let bulletVelocityY = -10;
let bulletsAvailable = 10;
let baseBullets = 10;

let score = 0;
let highScore = localStorage.getItem('spaceInvadersHighScore') || 0; // Load highscore from localStorage
let gameOver = false;

// Function to update and save the high score
function updateHighScore(newScore) {
    if (newScore > highScore) {
        highScore = newScore;
        localStorage.setItem('spaceInvadersHighScore', highScore);
    }
}

// Function to load the high score on page load
window.onload = function () {
    document.getElementById("high-score").innerText = highScore;
}

// Function to show the high score
function showHighScore() {
    document.getElementById("high-score").innerText = highScore;
}

document.getElementById('playButton').addEventListener('click', function () {
    document.getElementById('playButton').style.display = 'none';
    document.getElementById('board').style.display = 'block';
    startGame();
});

function startGame() {
    board = document.getElementById('board');
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext('2d');

    // load images
    shipImg = new Image();
    shipImg.src = '../assets/img/ship.png';
    shipImg.onload = function () {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = '../assets/img/alien.png';
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener('keydown', moveShip);
    document.addEventListener('keyup', shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, boardWidth, boardHeight);

    // ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // aliens
    for (const element of alienArray) {
        let alien = element;
        if (alien.alive) {
            alien.x += alienVelocityX;

            if (alien.x + alien.width >= boardWidth || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;

                for (const element of alienArray) {
                    element.y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                endGame('Game Over');
                return;
            }
        }
    }

    // bullets
    for (const element of bulletArray) {
        let bullet = element;
        bullet.y += bulletVelocityY;
        context.fillStyle = 'white';
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // bullet collision with aliens
        for (const element of alienArray) {
            let alien = element;
            if (alien.alive && detectCollision(bullet, alien)) {
                alien.alive = false;
                bullet.used = true;
                alienCount--;
                score += 10;
            } else if (bulletsAvailable < 0) {
                endGame('Out of ammo...');
                return;
            }
        }
    }

    // clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift();
    }

    // next level
    if (alienCount == 0) {
        // increase the numbers of aliens
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 2);
        alienVelocityX += 0.2;
        bulletArray = [];
        baseBullets += 10;
        bulletsAvailable = baseBullets;
        alienArray = [];
        createAliens();

        // Update high score
        updateHighScore(score);
    }

    // score
    context.fillStyle = 'white';
    context.font = '24px serif';
    context.fillText('Score: ' + score, 10, 30);

    // bullets available
    context.fillText('Bullets: ' + bulletsAvailable, 10, 60);
}

// Function to move the ship
function moveShip(e) {
    if (gameOver) {
        return;
    }

    if ((e.code == "ArrowLeft" || e.key === "q") && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    } else if ((e.code == "ArrowRight" || e.key === "d") && ship.x + shipVelocityX <= boardWidth - ship.width) {
        ship.x += shipVelocityX;
    }
}

// Create the aliens
function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

// Give the ship the ability to shoot
function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowUp" || e.code == "Space" || e.key === "z") {
        let bullet = {
            x: ship.x + ship.width * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        }
        bulletArray.push(bullet);
        bulletsAvailable--;
    }
}

// Detect collision between bullets and aliens
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

// End the game
function endGame(message) {
    gameOver = true;
    document.getElementById('board').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'block';
    document.getElementById('gameOverText').textContent = message;
    document.getElementById('scoreDisplay').textContent = score;

    // Update high score
    updateHighScore(score);

    // Show high score
    showHighScore();

    // Remove event listeners
    document.removeEventListener('keydown', moveShip);
    document.removeEventListener('keyup', shoot);
}

// Replay the game
document.getElementById('replayButton').addEventListener('click', function () {
    location.reload(); // reload the page
});
