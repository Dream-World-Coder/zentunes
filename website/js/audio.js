const audioes = document.querySelectorAll("audio.audio");
const audioControls = document.querySelectorAll(".audio-controls");
const playIcons = document.querySelectorAll(".playIcon");
const pauseIcons = document.querySelectorAll(".pauseIcon");
const progressBars = document.querySelectorAll(".progressBar");
const timeDisplays = document.querySelectorAll(".timeDisplay");

const playNextDuration = 5000; // 5s delay in Next Song

function removeActiveClass() {
  [...progressBars, ...timeDisplays].forEach((item) => {
    if (item.classList.contains("player-is-active")) {
      item.classList.remove("player-is-active");
    }
  });
}

function pauseAnyContinuingAudio() {
  audioes.forEach((audio, index) => {
    if (!audio.paused) {
      audio.pause();
      // shall i also reset the bar and strting time?
      playIcons[index].style.display = "block";
      pauseIcons[index].style.display = "none";
    }
  });
}

function resetMusicPlayer(index) {
  playIcons[index].style.display = "block";
  pauseIcons[index].style.display = "none";
  removeActiveClass();
}

function uiSetupForNewMusic(index) {
  playIcons[index].style.display = "none";
  pauseIcons[index].style.display = "block";
  progressBars[index].classList.add("player-is-active");
  timeDisplays[index].classList.add("player-is-active");
}

// Toggle play/pause
audioControls.forEach((audioControl, index) => {
  let audio = audioes[index];
  audioControl.addEventListener("click", () => {
    if (audio.paused) {
      pauseAnyContinuingAudio();
      audio.play();
      playIcons[index].style.display = "none";
      pauseIcons[index].style.display = "block";
    } else {
      audio.pause();
      playIcons[index].style.display = "block";
      pauseIcons[index].style.display = "none";
    }

    removeActiveClass();
    progressBars[index].classList.add("player-is-active");
    timeDisplays[index].classList.add("player-is-active");

    // play next song
    // Dont I need to remove the 'ended' eventlistner?
    if (index < audioes.length - 1) {
      audio.addEventListener("ended", () => {
        const playNext = localStorage.getItem("playNext");

        // if `none` is selected.
        if (playNext === "false") {
          setTimeout(() => {
            // remove the ended eventlistner for audio
            resetMusicPlayer(index);
          }, playNextDuration);
          return;
        }

        // If "next" is selcted
        else if (playNext === "true") {
          setTimeout(() => {
            resetMusicPlayer(index);
            // audio.removeEventListener("ended", )
            audio = audioes[index + 1];
            audio.play();
            uiSetupForNewMusic(index + 1);
            // index += 1;
          }, playNextDuration);
        }

        // if same song repeat
        else if (playNext === "repeat") {
          setTimeout(() => {
            // remove eventlistners?
            resetMusicPlayer(index);
            audio = audioes[index];
            audio.play();
            uiSetupForNewMusic(index);
          }, playNextDuration);
        }

        // if random shuffle
        else if (playNext === "shuffle") {
          let k;
          do {
            k = Math.floor(Math.random() * audioes.length); // randint(0, len)
          } while (k === index); // Recalculate if same

          console.log(`k = ${k}`);
          setTimeout(() => {
            resetMusicPlayer(index);
            audio = audioes[k];
            audio.play();
            uiSetupForNewMusic(k);
          }, playNextDuration);
        } else {
          console.log("No play next preference found");
          localStorage.setItem("playNext", "false");
          return;
        }
      });
    }
  });
});

// Update progress bar and time display as audio plays
audioes.forEach((audio, index) => {
  const progressBar = progressBars[index];
  const timeDisplay = timeDisplays[index];

  audio.addEventListener("timeupdate", () => {
    progressBar.value = audio.currentTime;
    progressBar.max = audio.duration;

    const minutes = Math.floor(audio.currentTime / 60);
    const seconds = Math.floor(audio.currentTime % 60);
    timeDisplay.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  });

  // Change audio position based on progress bar
  progressBar.addEventListener("input", () => {
    audio.currentTime = progressBar.value;
  });
});
