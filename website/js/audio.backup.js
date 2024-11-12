const audioes = document.querySelectorAll("audio.audio");
const audioControls = document.querySelectorAll(".audio-controls");
const playIcons = document.querySelectorAll(".playIcon");
const pauseIcons = document.querySelectorAll(".pauseIcon");
const progressBars = document.querySelectorAll(".progressBar");
const timeDisplays = document.querySelectorAll(".timeDisplay");

const playNextDuration = 5000;

function removeActiveClass() {
  [...progressBars, ...timeDisplays].forEach((item) =>
    item.classList.remove("player-is-active"),
  );
}

function pauseAnyContinuingAudio() {
  audioes.forEach((audio, index) => {
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      progressBars[index].value = 0;
      timeDisplays[index].textContent = "00:00";
      togglePlayPauseIcons(index, false);
    }
  });
}

function resetMusicPlayer(index) {
  togglePlayPauseIcons(index, false);
  removeActiveClass();
}

function uiSetupForNewMusic(index) {
  togglePlayPauseIcons(index, true);
  progressBars[index].classList.add("player-is-active");
  timeDisplays[index].classList.add("player-is-active");
}

function togglePlayPauseIcons(index, isPlaying) {
  playIcons[index].style.display = isPlaying ? "none" : "block";
  pauseIcons[index].style.display = isPlaying ? "block" : "none";
}

function handlePlayNext(audio, index) {
  const playNext = localStorage.getItem("playNext");

  if (playNext === "false") {
    setTimeout(() => resetMusicPlayer(index), playNextDuration);
  } else if (playNext === "true" && index < audioes.length - 1) {
    setTimeout(() => {
      resetMusicPlayer(index);
      audioes[index + 1].play();
      uiSetupForNewMusic(index + 1);
    }, playNextDuration);
  } else if (playNext === "repeat") {
    setTimeout(() => {
      resetMusicPlayer(index);
      audio.play();
      uiSetupForNewMusic(index);
    }, playNextDuration);
  } else if (playNext === "shuffle") {
    let k;
    do {
      k = Math.floor(Math.random() * audioes.length);
    } while (k === index);
    setTimeout(() => {
      resetMusicPlayer(index);
      audioes[k].play();
      uiSetupForNewMusic(k);
    }, playNextDuration);
  } else {
    localStorage.setItem("playNext", "false");
  }
}

audioControls.forEach((audioControl, index) => {
  let audio = audioes[index];
  audioControl.addEventListener("click", () => {
    if (audio.paused) {
      pauseAnyContinuingAudio();
      audio.play();
      uiSetupForNewMusic(index);

      const handleEnded = () => handlePlayNext(audio, index);
      audio.removeEventListener("ended", handleEnded);
      audio.addEventListener("ended", handleEnded);
    } else {
      audio.pause();
      resetMusicPlayer(index);
    }
  });
});

audioes.forEach((audio, index) => {
  const progressBar = progressBars[index];
  const timeDisplay = timeDisplays[index];

  audio.addEventListener("timeupdate", () => {
    progressBar.value = audio.currentTime;
    progressBar.max = audio.duration;
    const minutes = Math.floor(audio.currentTime / 60);
    const seconds = Math.floor(audio.currentTime % 60);
    timeDisplay.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  });

  progressBar.addEventListener("input", () => {
    audio.currentTime = progressBar.value;
  });
});
