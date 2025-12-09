console.log("Let's write some JS code!");

let currentSong = new Audio();
let songs = [];
let currentIndex = 0;

function secondToMinSec(seconds) {
    if (isNaN(seconds) || seconds < 0){    
        return "Invalid input";
    } 
    const mins = Math.floor(seconds / 60);
    const remainingSecs = Math.floor(seconds % 60);

    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = remainingSecs.toString().padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}


async function getSongs() {
    const res = await fetch("http://127.0.0.1:3000/songs/");
    const html = await res.text();

    const div = document.createElement("div");
    div.innerHTML = html;
    const anchors = div.getElementsByTagName("a");

    const arr = [];
    for (let a of anchors) {
        if (!a.href) continue;
        const decoded = decodeURIComponent(a.href);

        const filenameOnly = decoded.replace(/.*[\\/]/, "");

        if (filenameOnly.toLowerCase().endsWith(".mp3")) {
            arr.push(filenameOnly);
        }
    }

    console.log("Files found (sanitized):", arr);
    return arr;
}

function updateSongInfo(track) {
    const title = track.replace(/\.mp3$/i, "").replace(/_/g, " ");
    const infoEl = document.querySelector(".songinfo");
    if (infoEl) infoEl.textContent = title;
}

function highlightCurrentSong() {
    document.querySelectorAll(".songList li").forEach((li, i) => {
        if (i === currentIndex) {
            li.style.backgroundColor = "#1fdf64";
            li.style.color = "black";
        } else {
            li.style.backgroundColor = "transparent";
            li.style.color = "white";
        }
    });
}

function updatePlayButton() {
    const playBtn = document.getElementById("play");
    if (!playBtn) return;

    if (currentSong.paused) {
        playBtn.src = "play.svg";  // show play icon
    } else {
        playBtn.src = "pause.svg"; // show pause icon
    }
}

function playMusic(trackFilename) {
    if (!trackFilename) return;
    console.log("Playing (filename):", trackFilename);

    const url = "http://127.0.0.1:3000/songs/" + encodeURIComponent(trackFilename);
    currentSong.src = url;
    currentSong.play().then(() => updatePlayButton());

    updateSongInfo(trackFilename);
    highlightCurrentSong();
    
function playMusic(trackFilename, pause = false) {
    if (!trackFilename) return;

    // Fixed URL + encoding
    currentSong.src = "http://127.0.0.1:3000/songs/" + encodeURIComponent(trackFilename);

    // Get play button
    const playBtn = document.getElementById("play");

    if (!pause) {
        currentSong.play();
        if (playBtn) playBtn.src = "pause.svg";
    } else {
        currentSong.pause();
        if (playBtn) playBtn.src = "play.svg";
    }
}

function highlightCurrentSong() {
    document.querySelectorAll(".songList li").forEach((li, i) => {
        const musicIcon = li.querySelector("img.invert"); 
        const playText = li.querySelector(".playnow span");
        const playIcon = li.querySelector(".playnow img");

        if (i === currentIndex) {
            li.style.backgroundColor = "#1fdf64";
            li.style.color = "black";

            // change icons to black
            if (musicIcon) musicIcon.style.filter = "invert(0)";
            if (playIcon) playIcon.style.filter = "invert(0)";
            if (playText) playText.style.color = "black";
        } else {
            li.style.backgroundColor = "transparent";
            li.style.color = "white";

            // reset icons to white
            if (musicIcon) musicIcon.style.filter = "invert(1)";
            if (playIcon) playIcon.style.filter = "invert(1)";
            if (playText) playText.style.color = "white";
        }
    });
}

    document.querySelector(".songinfo").innerHTML = trackFilename;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function main() {
    songs = await getSongs();

    const songUL = document.querySelector(".songList ul");
    if (!songUL) {
        console.error("No .songList ul element found in DOM");
        return;
    }


    songUL.innerHTML = "";

    songs.forEach((songFilename, i) => {
        const cleanName = songFilename.replace(/\.mp3$/i, "").replace(/_/g, " ");

        const li = document.createElement("li");
        li.innerHTML = `
            <img class="invert" src="music.svg" alt="Music">
            <div class="info">
                <div>${cleanName}</div>
            </div>
            <div class="playnow">
                <span>Play</span>
                <img class="invert" src="play.svg" alt="Play">
            </div>
        `;

        li.addEventListener("click", () => {
            currentIndex = i;
            playMusic(songFilename);
        });

        songUL.appendChild(li);
    });

    const playBtn = document.getElementById("play");
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("previous");

    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (currentSong.paused) currentSong.play();
            else currentSong.pause();
            updatePlayButton();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % songs.length;
            playMusic(songs[currentIndex]);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + songs.length) % songs.length;
            playMusic(songs[currentIndex]);
        });
    }

    // Reset icon when song ends
    currentSong.addEventListener("ended", updatePlayButton);
    currentSong.addEventListener("pause", updatePlayButton);
    currentSong.addEventListener("play", updatePlayButton);

    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondToMinSec(currentSong.currentTime)} / ${secondToMinSec(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let persent = (e.offsetX/e.target.getBoundingClientRect().width * 100 );
        document.querySelector(".circle").style.left = persent + "%";
        currentSong.currentTime = ((currentSong.duration) * persent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })
    if (songs.length > 0) {
    currentIndex = 0;
    playMusic(songs[currentIndex]);  // load first song
    currentSong.pause(); // don't start music automatically
    updatePlayButton(); // show play.svg icon
}

document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to",e.target.value);
    currentSong.volume = parseInt(e.target.value) / 100;
});
}

main();
