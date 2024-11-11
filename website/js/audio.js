const audioes = document.querySelectorAll("audio.audio");
const audioControls = document.querySelectorAll(".audio-controls");
const playPauseBtns = document.querySelectorAll(".playPauseBtn");
const playIcons = document.querySelectorAll(".playIcon");
const pauseIcons = document.querySelectorAll(".pauseIcon");
const progressBars = document.querySelectorAll(".progressBar");
const timeDisplays = document.querySelectorAll(".timeDisplay");

const playNextDuration = 5000;

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
        if (playNext === "false") {
          setTimeout(() => {
            resetMusicPlayer(index);
          }, playNextDuration);
          return;
        } else if (playNext === "true") {
          setTimeout(() => {
            resetMusicPlayer(index);
            audio = audioes[index + 1];
            audio.play();
            playIcons[index + 1].style.display = "none";
            pauseIcons[index + 1].style.display = "block";
            progressBars[index + 1].classList.add("player-is-active");
            timeDisplays[index + 1].classList.add("player-is-active");
          }, playNextDuration);
        } else if (playNext === "repeat") {
          setTimeout(() => {
            resetMusicPlayer(index);
            audio = audioes[index];
            audio.play();
            playIcons[index].style.display = "none";
            pauseIcons[index].style.display = "block";
            progressBars[index].classList.add("player-is-active");
            timeDisplays[index].classList.add("player-is-active");
          }, playNextDuration);
        } else if (playNext === "shuffle") {
          let k;
          do {
            k = Math.floor(Math.random() * audioes.length); // randint(0, len)
          } while (k === index); // Recalculate if same

          console.log(`k = ${k}`);
          setTimeout(() => {
            resetMusicPlayer(index);
            audio = audioes[k];
            audio.play();
            playIcons[k].style.display = "none";
            pauseIcons[k].style.display = "block";
            progressBars[k].classList.add("player-is-active");
            timeDisplays[k].classList.add("player-is-active");
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
