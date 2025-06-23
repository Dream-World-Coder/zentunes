import { useEffect, useRef, useState, useCallback, memo } from "react";
import PropTypes from "prop-types";
import {
  Music,
  BoxSelect,
  // RotateCw,
  // RotateCcw,
  Play,
  Pause,
} from "lucide-react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";

import "../styles/music.scss";
// import { CapacitorMusicControls } from "capacitor-music-controls-plugin";

const AudioItem = memo(function AudioItem({
  audioId,
  src,
  title,
  mediaType = "audio/mpeg",
  index,
  selectWindowOpen = false,
  setAudiosToDelete = () => {},
}) {
  const { currentAudio, setCurrentAudio, onAudioEnd } = useAudioPlayer();

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isSelected, setIsSelected] = useState(false);

  const [isPlaying, setIsPlaying] = useState(
    currentAudio.index === index ? true : false
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timeDisplay, setTimeDisplay] = useState("0:00");

  // format time helper, sec:int -> str
  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  // handle time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);

      // if (currentAudio.index === index) {
      //   setCurrentAudio((prev) => ({ ...prev, duration: audio.duration }));
      // }
      // --> no need, implicit duration assign is handled from the musicsList in the context, it will just un-necesserily re-render things
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setTimeDisplay(formatTime(audio.currentTime));
      // if (currentAudio.index === index) {
      // 'if' is not needed as only currentAudio plays at a time

      // setCurrentAudio((prev) => ({
      //   ...prev,
      //   currentTime: audio.currentTime,
      // })); --> if currentAudio is updated the music control obj will also be re-created, thats why avoiding it now.

      // CapacitorMusicControls.updateElapsed({
      //   elapsed: Math.floor(audio.currentTime),
      //   isPlaying: !audio.paused,
      // });
      // }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    const interval = setInterval(() => {
      if (audio?.currentTime) {
        handleTimeUpdate();
      }
    }, 1000);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      clearInterval(interval);
    };
  }, [formatTime]); // ,currentAudio.index, index]);

  // important cuz props are staying same i.guess, so multiple playing at once
  // --------------------------------------------------------------------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentAudio.index === index) {
      // && !currentAudio.isPaused
      if (!isPlaying) {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      }
    }
  }, [currentAudio.index, index, isPlaying]); //currentAudio.isPaused

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (currentAudio.index === index) {
        onAudioEnd();
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentAudio.index, index, onAudioEnd]);

  // handle play/pause & first click
  // onclick pause others & set currentAudio
  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();

      setIsPlaying(false);
      setCurrentAudio({
        index: null,
        title: "",
        duration: 0,
        currentTime: 0,
        audioRef: null,
        audioId: null,
        isPaused: true,
      });
    } else {
      // CASE: any audio play including first time play
      // -----------------------------------------------
      audio.play();

      setIsPlaying(true);
      setCurrentAudio(() => ({
        index: index,
        title: title || "no title",
        duration,
        currentTime,
        audioId,
        audioRef: audioRef.current,
        isPaused: false,
      }));
    }
  };

  // handle progressbar change
  const handleProgressChange = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = parseFloat(e.target.value);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      // setCurrentAudio((prev) => ({ ...prev, currentTime: newTime }));
    }
  };

  return (
    <div
      className={`music no-select ${isSelected ? "selected" : ""}`}
      onClick={() => {
        if (!selectWindowOpen) return;
        setIsSelected(!isSelected);
        if (isSelected) {
          setAudiosToDelete((prev) => [...prev.filter((i) => i.src !== src)]);
        } else {
          setAudiosToDelete((prev) => [
            ...prev.filter((i) => i.src !== src),
            { src, title, index },
          ]);
        }
      }}
    >
      <div
        className="audio-player link"
        style={{
          translate: "none",
          rotate: "none",
          scale: "none",
          transform: "translate(0px, 0px)",
        }}
      >
        <figure className={isPlaying ? "isPlaying" : ""}>
          <figcaption>
            {selectWindowOpen ? (
              <BoxSelect
                size={18}
                className="box-select"
                style={{
                  backgroundColor: isSelected ? "#31511e" : "transparent",
                }}
              />
            ) : (
              <Music className="ms" />
            )}
            <span>{title || "no title"}</span>
          </figcaption>

          {!selectWindowOpen && (
            <div className="audio-controls">
              <audio
                id={audioId}
                ref={audioRef}
                className="audio"
                preload="metadata"
              >
                <source src={src} type={mediaType} />
                This audio is not supported by your browser.
              </audio>

              <div className="playPauseBtn">
                {/* {isPlaying && (
                  <RotateCcw
                    size={16}
                    onClick={(p) => setCurrentTime(p - 10)}
                  />
                )} */}
                {!isPlaying && (
                  <Play
                    size={16}
                    onClick={handlePlayPause}
                    color="#222222"
                    strokeWidth="2px"
                  />
                )}
                {isPlaying && (
                  <Pause
                    size={16}
                    onClick={handlePlayPause}
                    color="#222222"
                    strokeWidth="1px"
                  />
                )}
                {/* {isPlaying && (
                  <RotateCw size={16} onClick={(p) => setCurrentTime(p + 10)} />
                )} */}
              </div>

              <input
                ref={progressBarRef}
                className={`progressBar ${isPlaying ? "player-is-active" : ""}`}
                type="range"
                min="0"
                max={duration || 2}
                value={currentTime}
                step="0.1"
                onChange={handleProgressChange}
              />

              <div
                className={`timeDisplay ${isPlaying ? "player-is-active" : ""}`}
              >
                {timeDisplay} / {formatTime(duration)}
              </div>
            </div>
          )}
        </figure>
      </div>
      <span
        className="overlay"
        style={{
          translate: "none",
          rotate: "none",
          scale: "none",
          transformOrigin: "0px 0px",
          transform: "scale(1, 0)",
        }}
      ></span>
    </div>
  );
});
AudioItem.propTypes = {
  audioId: PropTypes.string,
  src: PropTypes.string,
  title: PropTypes.string,
  mediaType: PropTypes.string,
  index: PropTypes.number,
  selectWindowOpen: PropTypes.bool,
  setAudiosToDelete: PropTypes.func,
};
export default AudioItem;
