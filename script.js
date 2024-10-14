console.log("javascript on progress");

let currentsong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "Invalid Input";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://192.168.29.154:5500/${currfolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currfolder}/`)[1]);
    }
  }
  //Show all the songs in the playlist

  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li>
         <img  class="invert"  src="assets/music.svg" alt="mmusic">
         <div class="songinfo">
             <div class="songname">${song.replaceAll("%20", " ")}</div>
             <div class="artist">Ripjaws</div>
         </div>
         <div class="playnow">
             <span>Play Now</span>
             <img  class="invert"  src="assets/play.svg" alt="play">
         </div>
     </li>`;
  }

  //attachment of the Event listner to the songs

  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".songinfo").firstElementChild.innerHTML);
      playmusic(e.querySelector(".songinfo").firstElementChild.innerHTML);
    });
  });
}

const playmusic = (track, pause = false) => {
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "assets/pause.svg";
  }
  document.querySelector(".songnm").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function albums() {
  console.log("display album");
  let a = await fetch(`http://192.168.29.154:5500/songs/`);
  let response = await a.text();
  console.log("The Response is -------------->", response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);
  console.log(array.length);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    console.log(e);

    if (e.href.includes("/songs/")) {
      console.log(e.href.split("/"));
      let folder = e.href.split("/").slice(5)[1];
      let a = await fetch(
        `http://192.168.29.154:5500/songs/${folder}/info.json`
      );
      let response = await a.json();
      console.log(response);
      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        ` <div data-folder="${folder}" class="card">
           <div class="play">
               <img src="assets/button.svg" alt="play">
           </div>
           <img src="/songs/${folder}/cover.jpeg" alt="image">
           <h2>${response.title}</h2>
           <p>${response.description}</p>
            </div>`;
    }
  }
  //play the songs
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    console.log(e);
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

async function main() {
  //Get the List of songs
  await getSongs("songs/bass");
  playmusic(songs[0], true);

  //display different type of album
  albums();

  //attachment of event listner for play pause next
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "assets/pause.svg";
    } else {
      currentsong.pause();
      play.src = "assets/play.svg";
    }
  });

  //song time stamp
  currentsong.addEventListener("timeupdate", () => {
    console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentsong.currentTime
    )} / ${formatTime(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  //add event to the seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let per = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = per + "%";
    currentsong.currentTime = (currentsong.duration * per) / 100;
  });

  //Event listner for the slidebar
  document.querySelector(".slidebar").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0 + "%";
  });

  document.querySelector(".cancel").addEventListener("click", () => {
    document.querySelector(".left").style.left = -100 + "%";
  });

  //adding event listner to previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  //adding event listner to next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });
}

main();
