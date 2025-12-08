console.log("Let's write some JS code!");

let currentSong = new Audio();
let songs = [];
let currentIndex = 0;

async function getSongs() {
    const res = await fetch("http://127.0.0.1:3000/songs/");
    const html = await res.text();

    // parse the directory listing HTML
    const div = document.createElement("div");
    div.innerHTML = html;
    const anchors = div.getElementsByTagName("a");

    const arr = [];
    for (let a of anchors) {
        if (!a.href) continue;
        // decode href (in case there are encoded chars)
        const decoded = decodeURIComponent(a.href);

        // Remove any path (handles both forward slash and backslash)
        // Example inputs this will fix:
        //   http://127.0.0.1:3000/songs/Chanakya - Rishab.mp3
        //   \songs\Chanakya - Rishab.mp3
        //   /songs/Chanakya - Rishab.mp3
        const filenameOnly = decoded.replace(/.*[\\/]/, ""); // removes everything through the last slash or backslash

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

function playMusic(trackFilename) {
    if (!trackFilename) return;
    console.log("Playing (filename):", trackFilename);

    // Use encodeURIComponent for the filename portion of the URL
    const url = "http://127.0.0.1:3000/songs/" + encodeURIComponent(trackFilename);
    currentSong.src = url;
    currentSong.play().catch(err => console.warn("Play rejected:", err));

    updateSongInfo(trackFilename);
    highlightCurrentSong();
}

async function main() {
    songs = await getSongs();

    const songUL = document.querySelector(".songList ul");
    if (!songUL) {
        console.error("No .songList ul element found in DOM");
        return;
    }

    // clear any existing children (safe-guard)
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
            playMusic(songFilename); // pass the sanitized filename only
        });

        songUL.appendChild(li);
    });

    // Hook up bottom controls if they exist
    const playBtn = document.getElementById("play");
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("previous");

    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (currentSong.paused) currentSong.play();
            else currentSong.pause();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (!songs.length) return;
            currentIndex = (currentIndex + 1) % songs.length;
            playMusic(songs[currentIndex]);
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (!songs.length) return;
            currentIndex = (currentIndex - 1 + songs.length) % songs.length;
            playMusic(songs[currentIndex]);
        });
    }
}

main();
