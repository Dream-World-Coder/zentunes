import { useEffect, useRef, useState, useCallback, memo } from "react";
import PropTypes from "prop-types";
import { Music } from "lucide-react";

import { useAudioPlayer } from "../contexts/AudioPlayerContext";

import "../styles/music.scss";

import playBtn from "../assets/images/play.svg";
import pauseBtn from "../assets/images/pause.svg";

const AudioItem = memo(function AudioItem({
    src,
    title,
    mediaType = "audio/mpeg",
    index,
}) {
    const { currentAudio, setCurrentAudio, onAudioEnd } = useAudioPlayer();

    const audioRef = useRef(null);
    const progressBarRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(
        currentAudio.index === index ? true : false,
    );
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [timeDisplay, setTimeDisplay] = useState("00:00");

    // format time helper, int -> str
    const formatTime = useCallback((time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }, []);

    // handle time updates
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setTimeDisplay(formatTime(audio.currentTime));
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [formatTime]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (currentAudio.index === index) {
            // This is the current audio - play this
            if (!isPlaying) {
                audio.play();
                setIsPlaying(true);
            }
        } else {
            // This is not the current audio - pause this
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            }
        }
    }, [currentAudio.index, index, isPlaying]);

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
    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            setCurrentAudio((prev) => ({
                ...prev,
                index: null,
                title: "",
                duration: 0,
                currentTime: 0,
                audioRef: null,
            }));
        } else {
            // Set as current audio
            setCurrentAudio((prev) => ({
                ...prev,
                index: index,
                title: title || "no title",
                duration,
                currentTime,
                audioRef: audioRef.current,
            }));

            // Actually play the audio - THIS IS MISSING!
            // may add useEffect
            audio.play();
            setIsPlaying(true);
        }
    };

    // handle progressbar change
    const handleProgressChange = (e) => {
        const audio = audioRef.current;
        if (audio) {
            const newTime = parseFloat(e.target.value);
            audio.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    return (
        <div className="music no-select">
            <div
                className="audio-player link"
                style={{
                    translate: "none",
                    rotate: "none",
                    scale: "none",
                    transform: "translate(0px, 0px)",
                }}
            >
                <figure>
                    <figcaption>
                        <Music className="ms" />
                        <span>{title || "no title"}</span>
                    </figcaption>
                    <div className="audio-controls">
                        <audio
                            ref={audioRef}
                            className="audio"
                            preload="metadata"
                            // the play-pause is controlled manually now, with audio.play() & audio.pause()
                            // should add an useEffect for automation
                        >
                            <source src={src} type={mediaType} />
                            This audio is not supported by your browser.
                        </audio>
                        <div
                            className="playPauseBtn"
                            onClick={handlePlayPause}
                            style={{ cursor: "pointer" }}
                        >
                            <img
                                src={playBtn}
                                alt="play music"
                                className="playIcon"
                                style={{
                                    display: isPlaying ? "none" : "block",
                                }}
                            />
                            <img
                                src={pauseBtn}
                                alt="pause music"
                                className="pauseIcon"
                                style={{
                                    display: isPlaying ? "block" : "none",
                                }}
                            />
                        </div>
                        <input
                            ref={progressBarRef}
                            className={`progressBar ${isPlaying ? "player-is-active" : ""}`}
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            step="0.1"
                            onChange={handleProgressChange}
                        />
                        <div
                            className={`timeDisplay ${isPlaying ? "player-is-active" : ""}`}
                        >
                            {timeDisplay}
                        </div>
                    </div>
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
    src: PropTypes.string,
    title: PropTypes.string,
    mediaType: PropTypes.string,
    index: PropTypes.number,
};
export default AudioItem;
