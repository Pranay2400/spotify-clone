console.log("Lets wirte some JS code!");

async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let responese  = await a.text();
    console.log(responese);
    let div = document.createElement("div");
    div.innerHTML = responese;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++)
        {
        const element = as[index];
        if (element.href.endsWith(".mp3"))
            {
            const decoded = decodeURIComponent(element.href);
            const fileName = decoded.substring(decoded.lastIndexOf("/") + 1);
            songs.push(fileName);
            }
        }
    return songs;
}


const playMusic = (track)=>{
    let audio = new Audio("/songs/" + track)
}
async function main() {

    let currentSong;
    let songs = await getSongs();
    console.log(songs);

    const trackDetails = {
        "Chanakya": "Rishab Rikhiram Sharma",
        "Gehra Hua": "Shashwat Sachdev",
        "Kya Mujhe Pyar": "K.K.",
        "Labon Ko": "K.K.",
        "Sundari": "Sanju Rathod"
    };

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];

    for (const song of songs) {
        let cleanName = decodeURIComponent(song)
            .replace(/^\\songs\\/i, "")
            .replace(/_/g, " ")
            .replace(".mp3", "");

        let artist = trackDetails[cleanName] ;


        let li = document.createElement("li");
        li.innerHTML = `
            <li><img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${cleanName}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div></li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        console.log(e.target.getElementsByTagName("div")[0]);
    })

}
main();