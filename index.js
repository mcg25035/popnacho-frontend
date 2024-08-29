var main = () => {
    var character = document.getElementsByClassName('character')[0];
    var count = document.getElementsByClassName('count')[0];
    var countNumber = 0;

    var popSounds = [];
    var hmmSounds = [];

    var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    var start = mobile ? "touchstart" : "mousedown";
    var end = mobile ? "touchend" : "mouseup";

    for (var i = 1; i <= 5; i++) {
        var popSound = new Audio(`resources/pop${i}.mp3`);
        popSounds.push(popSound);
        if (i > 3) continue;
        var hmmSound = new Audio(`resources/hmm${i}.mp3`);
        hmmSounds.push(hmmSound);
    }

    var playRandomPopSound = () => {
        var randomIndex = Math.floor(Math.random() * popSounds.length);
        popSounds[randomIndex].play();
    };

    var playRandomHmmSound = () => {
        var randomIndex = Math.floor(Math.random() * hmmSounds.length);
        hmmSounds[randomIndex].play();
    };

    var updateCount = () => {
        count.innerHTML = countNumber;
    };

    var loadCookie = () => {
        var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)count\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        if (cookieValue) {
            countNumber = parseInt(cookieValue);
            updateCount();
        }
    };

    loadCookie();

    document.addEventListener(start, function (event) {
        character.classList.remove("nacho-close");
        character.classList.add("nacho-open");
        countNumber++;
        updateCount();
        playRandomPopSound();
        console.log(countNumber % 100);
        if (countNumber % 100 == 0) {
            playRandomHmmSound();
        }
        if (countNumber % 10 === 0) {
            const expirationDate = new Date();
            expirationDate.setFullYear(expirationDate.getFullYear() + 100); // Set expiration 100 years from now

            document.cookie = `count=${countNumber}; expires=${expirationDate.toUTCString()}; path=/`;
        }

    });

    document.addEventListener(end, function (event) {
        character.classList.remove("nacho-open");
        character.classList.add("nacho-close");

    });
}

document.addEventListener('DOMContentLoaded', main);
