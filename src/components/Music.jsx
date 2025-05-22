import { useEffect, useRef, useState, useCallback } from "react";
import { Music } from "lucide-react";
import { usePlayOptions } from "../hooks/playOptions";
import PropTypes from "prop-types";

import "../styles/music.scss";

import playBtn from "../assets/images/play.svg";
import pauseBtn from "../assets/images/pause.svg";

// Global audio manager to handle multiple audio instances
class AudioManager {
    static instance = null;
    static currentAudio = null;
    static currentIndex = -1;
    static audioInstances = [];
    static callbacks = new Map();

    static getInstance() {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    static registerAudio(audio, index, callbacks) {
        AudioManager.audioInstances[index] = audio;
        AudioManager.callbacks.set(index, callbacks);
    }

    static unregisterAudio(index) {
        delete AudioManager.audioInstances[index];
        AudioManager.callbacks.delete(index);
    }

    static pauseAll() {
        AudioManager.audioInstances.forEach((audio, index) => {
            if (audio && !audio.paused) {
                audio.pause();
                const callbacks = AudioManager.callbacks.get(index);
                if (callbacks) {
                    callbacks.onPause();
                }
            }
        });
    }

    static playAudio(index, playOption) {
        const audio = AudioManager.audioInstances[index];
        if (!audio) return;

        // Pause all other audio
        AudioManager.pauseAll();

        // Play selected audio
        AudioManager.currentAudio = audio;
        AudioManager.currentIndex = index;

        const callbacks = AudioManager.callbacks.get(index);
        if (callbacks) {
            callbacks.onPlay();
        }

        audio.play();

        // Handle audio end based on play option
        const handleEnded = () => {
            setTimeout(() => {
                callbacks.onEnded();

                switch (playOption) {
                    case "true": // Play next
                        AudioManager.playNext();
                        break;
                    case "repeat": // Repeat current
                        AudioManager.repeatCurrent();
                        break;
                    case "shuffle": // Shuffle
                        AudioManager.playShuffle();
                        break;
                    case "false": // None - stop
                    default:
                        AudioManager.stopAll();
                        break;
                }
            }, 5000); // 5s delay
        };

        // Remove previous event listeners and add new one
        audio.removeEventListener("ended", handleEnded);
        audio.addEventListener("ended", handleEnded);
    }

    static playNext() {
        const nextIndex = AudioManager.currentIndex + 1;
        if (
            nextIndex < AudioManager.audioInstances.length &&
            AudioManager.audioInstances[nextIndex]
        ) {
            const callbacks = AudioManager.callbacks.get(nextIndex);
            if (callbacks) {
                callbacks.onPlay();
            }
            AudioManager.audioInstances[nextIndex].play();
            AudioManager.currentIndex = nextIndex;
            AudioManager.currentAudio = AudioManager.audioInstances[nextIndex];
        }
    }

    static repeatCurrent() {
        if (AudioManager.currentAudio && AudioManager.currentIndex >= 0) {
            const callbacks = AudioManager.callbacks.get(
                AudioManager.currentIndex,
            );
            if (callbacks) {
                callbacks.onPlay();
            }
            AudioManager.currentAudio.currentTime = 0;
            AudioManager.currentAudio.play();
        }
    }

    static playShuffle() {
        const availableIndices = Object.keys(AudioManager.audioInstances)
            .map(Number)
            .filter((index) => index !== AudioManager.currentIndex);

        if (availableIndices.length > 0) {
            const randomIndex =
                availableIndices[
                    Math.floor(Math.random() * availableIndices.length)
                ];
            const callbacks = AudioManager.callbacks.get(randomIndex);
            if (callbacks) {
                callbacks.onPlay();
            }
            AudioManager.audioInstances[randomIndex].play();
            AudioManager.currentIndex = randomIndex;
            AudioManager.currentAudio =
                AudioManager.audioInstances[randomIndex];
        }
    }

    static stopAll() {
        AudioManager.pauseAll();
        AudioManager.currentAudio = null;
        AudioManager.currentIndex = -1;
    }
}

export default function AudioItem({
    src,
    title,
    mediaType = "audio/mpeg",
    index = 0,
}) {
    const { activeOption } = usePlayOptions();
    const audioRef = useRef(null);
    const progressBarRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [timeDisplay, setTimeDisplay] = useState("00:00");

    // Format time helper
    const formatTime = useCallback((time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }, []);

    // Audio callbacks for AudioManager
    const audioCallbacks = useCallback(
        () => ({
            onPlay: () => {
                setIsPlaying(true);
                setIsActive(true);
            },
            onPause: () => {
                setIsPlaying(false);
                setIsActive(false);
            },
            onEnded: () => {
                setIsPlaying(false);
                setIsActive(false);
            },
        }),
        [],
    );

    // Register audio with AudioManager
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            AudioManager.registerAudio(audio, index, audioCallbacks());

            return () => {
                AudioManager.unregisterAudio(index);
            };
        }
    }, [index, audioCallbacks]);

    // Handle time updates
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

    // Handle play/pause click
    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            setIsActive(false);
        } else {
            AudioManager.playAudio(index, activeOption);
        }
    };

    // Handle progress bar change
    const handleProgressChange = (e) => {
        const audio = audioRef.current;
        if (audio) {
            const newTime = parseFloat(e.target.value);
            audio.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    return (
        <div className="music">
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
                            className={`progressBar ${isActive ? "player-is-active" : ""}`}
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            step="0.1"
                            onChange={handleProgressChange}
                        />
                        <div
                            className={`timeDisplay ${isActive ? "player-is-active" : ""}`}
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
}
AudioItem.propTypes = {
    src: PropTypes.string,
    title: PropTypes.string,
    mediaType: PropTypes.string,
    index: PropTypes.number,
};
