//Au moment du chargement de la page accueil, ça load le carousel, ses images et les redirection
document.body.onload = function () {
    nbr = 4; // Nombre d'images (modifier suivant le nombre de jeux)
    p = 0; // savoir à quelle image on débute
    container = document.getElementById("container_carrousel");
    g = document.getElementById("g");
    d = document.getElementById("d");
    container.style.width = (800 * nbr) + "px";
    for (i = 1; i <= nbr; i++) {
        var link = document.createElement("a");
        var gameLink = "";
        switch (i) {
            case 1:
                gameLink = "./templates/flappy-bird.html";
                break;
            case 2:
                gameLink = "./templates/difficulty.html";
                break;
            case 3:
                gameLink = "./templates/2048.html";
                break;
            case 4:
                gameLink = "./templates/spaceinvaders.html"; 
                break;
            default:
                gameLink = "#"; 
        }
        link.href = gameLink; 
        var div = document.createElement("div");
        div.className = "photo";
        div.style.backgroundImage = "url('assets/img/jeu" + i + ".jpg')";
        link.appendChild(div);
        container.appendChild(link);
    }
    afficherMasquer();
    g.onclick = function () {
        if (p > -nbr + 1) p--;
        container.style.transform = "translate(" + p * 800 + "px)";
        container.style.transition = "all 0.5s ease"
        afficherMasquer();
    }

    d.onclick = function () {
        if (p < 0) p++;
        container.style.transform = "translate(" + p * 800 + "px)";
        container.style.transition = "all 0.5s ease"
        afficherMasquer();
    }

    function afficherMasquer() {
        if (p == -nbr + 1)
            g.style.visibility = "hidden";
        else
            g.style.visibility = "visible";
        if (p == 0)
            d.style.visibility = "hidden";
        else
            d.style.visibility = "visible";
    }

    // Fonction pour afficher les highscores
    function showHighScores() {
        document.getElementById("flappy-highscore").innerText = ` ${localStorage.getItem('flappyHighScore') || 0}`;
        document.getElementById("spaceinvaders-highscore").innerText = `${localStorage.getItem('spaceInvadersHighScore') || 0}`;
        document.getElementById("tictactoe-highscore").innerText = `${localStorage.getItem('ticTacToeHighScore') || 0}`;
        document.getElementById("2048-highscore").innerText = `${localStorage.getItem('2048HighScore') || 0}`;
    }
    
    showHighScores();
}

