// Variable pour le canvas du jeu 
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Dimensions de l'oiseau
let birdWidth = 34; 
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

// Propriétés de l'oiseau
let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

// Tableau des tuyaux
let pipeArray = [];

// Dimensions des tuyaux
let pipeWidth = 80; // Largeur des tuyaux ajustée
let pipeHeight = 400; // Hauteur des tuyaux ajustée
let pipeX = boardWidth;
let pipeY = 0;

// Images des tuyaux
let topPipeImg;
let bottomPipeImg;

// Vitesses de déplacement des objets
let velocityX = -2; // Augmente la vitesse des tuyaux
let velocityY = 0;
let gravity = 0.3; // Augmente légèrement l'effet de la gravité

// États du jeu
let gameStarted = false;
let gameOver = false;

// Scores du jeu
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0; 

// Fonction exécutée lorsque la page s'ouvre
window.onload = function () {
    // Initialisation du canvas
    board = document.getElementById("board_flappy");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Initialisation des images
    birdImg = new Image();
    birdImg.src = "../assets/img/flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "../assets/img/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "../assets/img/bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // Réduit l'intervalle pour une apparition plus fréquente des tuyaux
    document.addEventListener("keydown", moveBird);
    context.font = "30px Arial";
    context.fillStyle = "#000";
    context.textAlign = "center";
    context.fillText("FLAPPY PLANE", boardWidth / 2, boardHeight / 2 - 15);
    context.font = "20px Arial";
    context.fillText("PRESS SPACE TO START", boardWidth / 2, boardHeight / 2 + 15);

    // Met à jour le highscore affiché initialement
    document.getElementById("high-score").innerText = highScore;
}

// Fonction de mise à jour du jeu
function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    if (!gameStarted) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Mise à jour de la position de l'oiseau (avec gravité)
    velocityY += gravity;
    bird.y += velocityY;

    // Vérification si l'oiseau dépasse le haut du canvas
    if (bird.y < 0) {
        bird.y = 0;
        velocityY = 0; 
    }

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Vérification si l'oiseau touche le bas du canvas
    if (bird.y > board.height - bird.height) {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            document.getElementById("high-score").innerText = highScore;
            localStorage.setItem('flappyHighScore', highScore); // Met à jour le highscore dans localStorage
        }
    }

    // Dessin et mise à jour des tuyaux
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Vérification si un tuyau est passé
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
            document.getElementById("current-score").innerText = score;
        }

        // Détection de collision avec l'oiseau
        if (detectCollision(bird, pipe)) {
            gameOver = true;
            if (score > highScore) {
                highScore = score;
                document.getElementById("high-score").innerText = highScore;
                localStorage.setItem('flappyHighScore', highScore); // Met à jour le highscore dans localStorage
            }
        }
    }

    // Suppression des tuyaux hors de l'écran
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Affichage du texte de fin de jeu si nécessaire
    if (gameOver) {
        context.font = "30px Arial";
        context.fillStyle = "#000";
        context.textAlign = "center";
        context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2 - 30);
        context.font = "20px Arial";
        context.fillText("PRESS SPACE TO RESTART", boardWidth / 2, boardHeight / 2 + 10);
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height); // Affiche l'oiseau en fin de jeu
    }
}

// Fonction pour placer les tuyaux sur le canvas
function placePipes() {
    // Ne rien faire si le jeu est terminé ou n'a pas encore commencé
    if (gameOver || !gameStarted) {
        return;
    }

    // Génère une position aléatoire pour le tuyau supérieur
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4; // Réduit l'espace entre les tuyaux pour augmenter la difficulté

    // Crée le tuyau supérieur
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false 
    }

    pipeArray.push(topPipe);

    // Crée le tuyau inférieur
    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace, 
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
 
    pipeArray.push(bottomPipe);
}

// Fonction pour déplacer l'oiseau
function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp") {
        if (!gameStarted) {
            gameStarted = true;
        }
        playSound('../assets/sounds/flappy_jump.mp3');
        velocityY = -7; // Augmente la vitesse de montée de l'oiseau

        if (gameOver) {
            bird.y = birdY; 
            pipeArray = []; 
            score = 0; 
            document.getElementById("current-score").innerText = score; 
            gameOver = false; 
        }
    }
}

// Fonction pour détecter la collision entre deux objets 
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Fonction pour jouer un son
function playSound(src) {
    let sound = new Audio(src); // Crée un nouvel objet Audio avec la source spécifiée
    sound.play(); // Joue le son
}
