document.addEventListener('DOMContentLoaded', () => {
    const difficulty = getDifficultyFromURL(); // Fonction pour obtenir la difficulté depuis l'URL
    const mode = getModeFromURL(); // Fonction pour obtenir le mode de jeu depuis l'URL

    let aiLevel;
    if (difficulty === 'easy') {
        aiLevel = 1;
    } else if (difficulty === 'medium') {
        aiLevel = 2;
    } else if (difficulty === 'hard') {
        aiLevel = 3;
    }

    const cells = document.querySelectorAll('.cell');
    const resetBtn = document.querySelector('.reset .button');
    const currentTurn = document.querySelector('.current-turn');
    const player1score = document.querySelector('.score1');
    const player2score = document.querySelector('.score2');
    const draw = document.querySelector('.draw');
    const messageContent = document.querySelector('.content');
    const overlay = document.getElementById('overlay');
    const closeButton = document.getElementById('close');
    const highScoreDisplay = document.querySelector('.highscore');

    const winCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    let computer = (mode === 'computer');
    let turn = true;
    let usedCells = [];
    let emptyCells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let winner = false;
    let ties = 0;
    let gameCount = 0;

    let player1 = {
        symbol: '<i class="fa fa-close"></i>',
        played: [],
        score: 0
    }

    let player2 = {
        symbol: '<i class="fa fa-circle-o"></i>',
        played: [],
        score: 0
    }

    // Initialisation du high score depuis localStorage
    let highScore = localStorage.getItem('ticTacToeHighScore') || 0;
    let highScorePlayer = localStorage.getItem('ticTacToeHighScorePlayer') || 'Player 1';
    highScoreDisplay.textContent = `Highscore: ${highScore} (${highScorePlayer})`;

    checkTurn();

    for (let i = 0; i < cells.length; i++) {
        cells[i].addEventListener('click', () => {
            if (isEmpty(i)) {
                if (turn) {
                    addSymbols(player1, i);
                    emptyCells.splice(emptyCells.indexOf(i), 1);
                    checkWin(player1);
                    turn = false;
                    checkTurn();
                    if (computer) {
                        setTimeout(() => aiPlay(), 500);
                    }
                } else if (!computer) {
                    addSymbols(player2, i);
                    emptyCells.splice(emptyCells.indexOf(i), 1);
                    checkWin(player2);
                    turn = true;
                    checkTurn();
                }
            } else {
                alert('Cell already used!');
            }
        });
    }

    function addSymbols(player, i) {
        cells[i].innerHTML = player.symbol;
        player.played.push(i);
        usedCells.push(i);
    }

    function checkWin(player) {
        if (!winner) {
            winCombos.some(combo => {
                if (combo.every(index => player.played.includes(index))) {
                    player.score++;
                    winner = true;
                    showScore();
                    setTimeout(() => {
                        showMessage(player, winner);
                    }, 200);
                }
            })
        }

        if (!winner && usedCells.length === 9) {
            ties++;
            showScore();
            setTimeout(() => {
                showMessage(player);
            }, 200);
        }
    }

    function isEmpty(i) {
        return !usedCells.includes(i);
    }

    function reset() {
        cells.forEach(cell => {
            cell.innerHTML = '';
        })

        winner = false;
        turn = true;
        player1.played = [];
        player2.played = [];
        usedCells = [];
        emptyCells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        checkTurn();
    }

    resetBtn.addEventListener('click', reset);

    function checkTurn() {
        if (turn) {
            currentTurn.innerHTML = player1.symbol;
        } else {
            currentTurn.innerHTML = player2.symbol;
        }
    }

    function showScore() {
        player1score.textContent = player1.score;
        player2score.textContent = player2.score;
        draw.textContent = ties;
    }

    closeButton.addEventListener('click', () => {
        overlay.style.display = 'none';
        reset();
        showScore();
    })

    function showMessage(player, winner) {
        overlay.style.display = 'flex';
        if (winner) {
            messageContent.innerHTML = player.symbol + ` is the <h2>winner<h2>`;
        } else {
            messageContent.innerHTML = `This is a <h2>draw<h2>`;
        }
        reset();
        gameCount++;
        if (computer) {
            aiLevel = Math.min(3, Math.floor(gameCount / 5) + 1); // Le niveau de l'IA augmente tous les 5 jeux
        }
        // Mise à jour du high score après chaque partie
        updateHighScore();
    }

    function aiPlay() {
        if (computer && !winner && !turn) {
            if (aiLevel === 1) {
                aiEasy();
            } else if (aiLevel === 2) {
                aiMedium();
            } else {
                aiHard();
            }
        }
    }

    function aiEasy() {
        let randomIndex = Math.floor(Math.random() * emptyCells.length);
        let cellIndex = emptyCells[randomIndex];
        makeMove(cellIndex);
    }

    function aiMedium() {
        // Il essaye de gagner
        for (let combo of winCombos) {
            let play = findBestMove(combo, player2);
            if (play !== null) {
                makeMove(play);
                return;
            }
        }

        // Il essaye de bloquer
        for (let combo of winCombos) {
            let block = findBestMove(combo, player1);
            if (block !== null) {
                makeMove(block);
                return;
            }
        }

        // Sinon il joue aléatoirement
        aiEasy();
    }

    function aiHard() {
        let bestScore = -Infinity;
        let bestMove;
        for (let i = 0; i < emptyCells.length; i++) {
            let index = emptyCells[i];
            player2.played.push(index);
            usedCells.push(index);
            let score = minimax(false);
            player2.played.pop();
            usedCells.pop();
            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        }
        makeMove(bestMove);
    }

    function makeMove(index) {
        addSymbols(player2, index);
        emptyCells.splice(emptyCells.indexOf(index), 1);
        checkWin(player2);
        turn = true;
        checkTurn();
    }

    function findBestMove(combo, player) {
        let positions = combo.filter(index => player.played.includes(index));
        let empty = combo.filter(index => !usedCells.includes(index));
        if (positions.length === 2 && empty.length === 1) {
            return empty[0];
        }
        return null;
    }

    function minimax(isMaximizing) {
        if (checkWinner(player2)) return 10;
        if (checkWinner(player1)) return -10;
        if (usedCells.length === 9) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < emptyCells.length; i++) {
                let index = emptyCells[i];
                player2.played.push(index);
                usedCells.push(index);
                let score = minimax(false);
                player2.played.pop();
                usedCells.pop();
                bestScore = Math.max(score, bestScore);
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < emptyCells.length; i++) {
                let index = emptyCells[i];
                player1.played.push(index);
                usedCells.push(index);
                let score = minimax(true);
                player1.played.pop();
                usedCells.pop();
                bestScore = Math.min(score, bestScore);
            }
            return bestScore;
        }
    }

    function checkWinner(player) {
        return winCombos.some(combo => combo.every(index => player.played.includes(index)));
    }

    // Mise à jour du high score dans localStorage
    function updateHighScore() {
        if (player1.score > highScore) {
            highScore = player1.score;
            highScorePlayer = 'Player 1';
        } else if (player2.score > highScore) {
            highScore = player2.score;
            highScorePlayer = 'Player 2';
        }
        localStorage.setItem('ticTacToeHighScore', highScore);
        localStorage.setItem('ticTacToeHighScorePlayer', highScorePlayer);
        highScoreDisplay.textContent = `Highscore: ${highScore} (${highScorePlayer})`;
    }

    // Appel de la fonction pour initialiser le high score au chargement
    updateHighScore();
});

// Fonction getDifficultyFromURL ajoutée pour obtenir la difficulté à partir de l'URL
function getDifficultyFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('difficulty') || 'easy'; // Par défaut à 'easy' si aucun paramètre trouvé
}

// Fonction getModeFromURL ajoutée pour obtenir le mode de jeu à partir de l'URL
function getModeFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') || 'player'; // Par défaut à 'player' si aucun paramètre trouvé
}
