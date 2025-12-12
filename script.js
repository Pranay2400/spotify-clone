console.log("Let's write some JS code!");

let currentSong = new Audio();
let songs = [];
let currentIndex = 0;
let currentFolder = "cs"; // Default folder

const BASE_URL = "https://spotifyclone.free.nf"; 

// Convert seconds → mm:ss
function secondToMinSec(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Fetch all MP3 files dynamically based on selected folder
async function getSongs(folder = "cs") {
    const res = await fetch(`/songs/${folder}/`);
    const html = await res.text();



    const div = document.createElement("div");
    div.innerHTML = html;
    const anchors = div.getElementsByTagName("a");

    const arr = [];
    for (let a of anchors) {
        const decoded = decodeURIComponent(a.href);
        const filename = decoded.replace(/.*[\\/]/, "");
        if (filename.toLowerCase().endsWith(".mp3")) {
            arr.push(filename);
        }
    }
    console.log("Songs Found:", arr);
    return arr;
}

function updateSongInfo(track) {
    const title = track.replace(/\.mp3$/i, "").replace(/_/g, " ");
    document.querySelector(".songinfo").textContent = title;
}

function highlightCurrentSong() {
    document.querySelectorAll(".songList li").forEach((li, i) => {
        const musicIcon = li.querySelector("img.invert");
        const playText = li.querySelector(".playnow span");
        const playIcon = li.querySelector(".playnow img");

        if (i === currentIndex) {
            li.style.backgroundColor = "#1fdf64";
            li.style.color = "black";
            musicIcon.style.filter = playIcon.style.filter = "invert(0)";
            playText.style.color = "black";
        } else {
            li.style.backgroundColor = "transparent";
            li.style.color = "white";
            musicIcon.style.filter = playIcon.style.filter = "invert(1)";
            playText.style.color = "white";
        }
    });
}

function updatePlayButton() {
    const btn = document.getElementById("play");
    btn.src = currentSong.paused ? "play.svg" : "pause.svg";
}

function playMusic(trackFilename, pause = false) {
    if (!trackFilename) return;

    currentSong.src = `/songs/${currentFolder}/${trackFilename}`;

    if (!pause) currentSong.play();
    updatePlayButton();
    updateSongInfo(trackFilename);
    highlightCurrentSong();
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
}

async function main(folder = "cs") {
    currentFolder = folder;  // Update folder state

    songs = await getSongs(folder);
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    songs.forEach((song, i) => {
        const cleanName = song.replace(/\.mp3$/i, "");
        const li = document.createElement("li");
        li.innerHTML = `
            <img class="invert" src="music.svg">
            <div class="info"><div>${cleanName}</div></div>
            <div class="playnow">
                <span>Play</span>
                <img class="invert" src="play.svg">
            </div>`;
        li.addEventListener("click", () => {
            currentIndex = i;
            playMusic(song);
        });
        songUL.appendChild(li);
    });

    // Auto load first song without playing
    if (songs.length > 0) {
        currentIndex = 0;
        playMusic(songs[0], true);
    }

    updatePlayButton();
    highlightCurrentSong();
}

async function displayAlbums() {
    console.log("Displaying Albums…");

    let root = await fetch("/songs/");
    let html = await root.text();

    let div = document.createElement("div");
    div.innerHTML = html;
    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; // clear existing

    let folders = Array.from(anchors).filter(a =>
        a.href.includes("/songs/") &&
        !a.href.toLowerCase().endsWith(".mp3")
    );

    for (let a of folders) {
        let folder = decodeURIComponent(a.href.split("/").slice(-2)[0]);
        if (!folder) continue;

        try {
            // Fetch metadata
            let metaReq = await fetch(`/songs/${folder}/info.json`);
            let meta = await metaReq.json();

            // Add card HTML
            cardContainer.innerHTML += `
                <div class="card" data-folder="${folder}">
                    <div class="play">
                        <img src="play.svg" class="invert">
                    </div>
                    <img src="${BASE_URL}/songs/${folder}/cover.jpg" alt="Album Cover">
                    <h2>${meta.title}</h2>
                    <p>${meta.description}</p>
                </div>
            `;
        } catch (err) {
            console.warn(`Missing info.json or cover.jpg in: ${folder}`);
        }
    }

    // Card click → load folder songs
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            console.log("Loading songs from:", folder);

            songs = await getSongs(folder);
            if (songs.length > 0) {
                currentIndex = 0;
                playMusic(songs[0]); // Autoplay first song in album
            }
        });
    });
}


// Controls
document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused) currentSong.play();
    else currentSong.pause();
    updatePlayButton();
});

document.getElementById("next").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % songs.length;
    playMusic(songs[currentIndex]);
});

document.getElementById("previous").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    playMusic(songs[currentIndex]);
});

// Song Time + Seekbar
currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").textContent =
        `${secondToMinSec(currentSong.currentTime)} / ${secondToMinSec(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
        `${(currentSong.currentTime / currentSong.duration) * 100}%`;
});

document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width);
    currentSong.currentTime = currentSong.duration * percent;
});

// Volume Control
document.querySelector(".range input").addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
});

// Playlist Switch via card
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", async () => {
        const folder = card.dataset.folder;
        await main(folder);
    });
});

document.querySelector(".volume > img").addEventListener("click", e => {
    let img = e.target;

    if (img.getAttribute("data-muted") !== "true") {
        img.src = "mute.svg";
        img.setAttribute("data-muted", "true");
        currentSong.volume = 0;
    } else {
        img.src = "volume.svg";
        img.setAttribute("data-muted", "false");
        currentSong.volume = 0.10;
    }
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


// First load
main();
