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
            songs.push(element.href.split("/songs/")[1]);
            }
        }
    return songs;
}
async function main(){    
    let songs = await getSongs();
    console.log(songs);

    let songUL = document.querySelector(".songList ").getElementsByTagName("ul") [0]
    for (const song of songs){
        songUL.innerHTML = songUL.innerHTML + song;
    }

    var audio = new Audio(songs[0]);
    // audio.play(); 

    audio.addEventListener("loadeddata", () => {
        console.log(audio.duration, audio.currentSrc, audio.currentTime)
    });
}
main();