import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  // useMemo,
} from "react";
import PropTypes from "prop-types";

import {
  getFormattedTitle,
  getMediaTypeFromFilename,
} from "../services/formatting";
import {
  // getAudioMetadata,
  getAudioDurationFromURI,
} from "../services/audioMeta";

import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { CapacitorMusicControls } from "capacitor-music-controls-plugin";

const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  /* ------ * valid paths * -----------------------
    --------------------------------------- */
  // const [validPaths, setValidPaths] = useState([]); useEffect(() => {}, []);
  // fetch validPaths -- no need, cuz as of now they should be fixed bcz of music-page-data, just songs inside will vary
  const validPaths = [
    "home",
    "bangla_retro",
    "bangla_new",
    "rabindra_sangeet",
    "hindi_retro",
    "hindi_new",
    "religious",
  ];

  /** ------ * current playlist * -----------------------
    --------------------------------------- */
  const [currentPlaylist, setCurrentPlaylist] = useState(null); //array, just {name, totalSongs} will work fine
  const [musicsList, setMusicsList] = useState([]); // the musics list array
  const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);

  /**
   * it always loads from local files
   */
  async function loadPlaylists(genre) {
    if (!validPaths.includes(genre)) {
      setMusicsList([]);
      return;
    }

    try {
      setIsPlaylistLoading(true);

      const genreSongs = [];

      const result = await Filesystem.readdir({
        path: `audios/${genre}`,
        // directory: Directory.Data,
        directory: Directory[import.meta.env.VITE_DIR],
      });

      for (const file of result.files) {
        const filename = file.name;
        const fileUrl = Capacitor.convertFileSrc(file.uri);

        // const metaObj = await getAudioMetadata(fileUrl, file.name); // slowing a lot, so removing
        const dur = await getAudioDurationFromURI(fileUrl);

        // const duration = dur
        //   ? Math.floor(dur)
        //   : Math.floor(metaObj.duration || 1);
        const duration = Math.floor(dur || 1);

        genreSongs.push({
          // title: metaObj.title || getFormattedTitle(filename),
          title: getFormattedTitle(filename),
          src: fileUrl,
          mediaType: getMediaTypeFromFilename(filename),
          duration,
          audioId: window.crypto.randomUUID(),
        });
      }

      setMusicsList(genreSongs);
      setCurrentPlaylist({
        name: getFormattedTitle(genre),
        totalSongs: genreSongs.length,
      });
    } catch (err) {
      console.error("Error loading playlist:", err);
      setMusicsList([]);
    } finally {
      setIsPlaylistLoading(false);
    }
  }

  /** ------ * play next options * -----------------------
    --------------------------------------- */
  const [activeOption, setActiveOption] = useState("false"); // [true, false, shuffle, repeat, reverse]
  useEffect(() => {
    const playNextValue = localStorage.getItem("playNext");
    if (playNextValue) {
      setActiveOption(playNextValue);
    } else {
      // default if no value exists
      setActiveOption("false");
      localStorage.setItem("playNext", "false");
    }
  }, []);

  function handleOptionClick(option) {
    setActiveOption(option);
    localStorage.setItem("playNext", option);
  }

  /** ------ * current audio * -----------------------
    --------------------------------------- */
  const [currentAudio, setCurrentAudio] = useState({
    index: null, // on music genre change[route change] it will be set to null again and everything will be reseted
    title: "",
    duration: 0, //seconds
    currentTime: 0,
    audioRef: null, // for repeat only
    audioId: null,
    isPaused: true,
  });

  function handlePlayNext() {
    setCurrentAudio((prev) => {
      const nextIndex = (prev.index + 1) % currentPlaylist.totalSongs;
      const nextSong = musicsList[nextIndex];
      return {
        index: nextIndex,
        title: nextSong.title,
        currentTime: 0,
        duration: nextSong.duration,
        audioId: nextSong.audioId,
        audioRef: null,
        isPaused: false,
      };
    });
  }

  function handlePlayPrev() {
    setCurrentAudio((prev) => {
      const nextIndex =
        (prev.index - 1 + currentPlaylist.totalSongs) %
        currentPlaylist.totalSongs;
      const nextSong = musicsList[nextIndex];
      return {
        index: nextIndex,
        title: nextSong.title,
        currentTime: 0,
        duration: nextSong.duration,
        audioId: nextSong.audioId,
        audioRef: null,
        isPaused: false,
      };
    });
  }

  async function onCurrentAudioEnd() {
    const nextPlayDelay = 1 * 1000;
    switch (activeOption) {
      case "true":
        setTimeout(() => {
          handlePlayNext();
        }, nextPlayDelay);
        break;

      case "reverse":
        setTimeout(() => {
          handlePlayPrev();
        }, nextPlayDelay);
        break;

      case "shuffle":
        setTimeout(() => {
          setCurrentAudio(() => {
            const nextIndex = Math.floor(
              Math.random() * currentPlaylist.totalSongs
            );
            const nextSong = musicsList[nextIndex];
            return {
              index: nextIndex,
              title: nextSong.title,
              currentTime: 0,
              duration: nextSong.duration,
              audioId: nextSong.audioId,
              audioRef: null,
              isPaused: false,
            };
          });
        }, nextPlayDelay);
        break;

      case "repeat":
        // audioRef = audioRef.current in Audio.jsx
        setTimeout(() => {
          if (currentAudio.audioRef) {
            currentAudio.audioRef.currentTime = 0;
            currentAudio.audioRef.play();
          } else {
            const audioElement = document.getElementById(
              currentAudio?.audioId || "null__audio"
            );
            if (audioElement) {
              audioElement.currentTime = 0;
              audioElement.play();
            }
          }
        }, nextPlayDelay);
        break;

      case "false":
        setCurrentAudio({
          index: null,
          title: "",
          currentTime: 0,
          duration: 0,
          audioRef: null,
          audioId: null,
          isPaused: false,
        });
        break;

      default:
        break;
    }
  }
  const onAudioEnd = useCallback(onCurrentAudioEnd, [
    activeOption,
    currentPlaylist,
    musicsList,
  ]);

  // update CapacitorMusicControls as soon as currentAudio newly renders
  useEffect(() => {
    (async function () {
      console.log(
        "detected change in currentAudio, re creating: CapacitorMusicControls."
      );

      // old stop
      // CapacitorMusicControls.updateIsPlaying({ isPlaying: false });

      if (!currentAudio?.title?.trim()) return;

      try {
        await CapacitorMusicControls.create({
          track: currentAudio.title || "unknown track",
          artist: "unknown artist",
          album: "unknown album",
          cover: "file:///android_asset/public/favicon.png",

          isPlaying: true,
          dismissable: false,

          hasPrev: false,
          hasNext: false,
          hasClose: true,

          duration: Math.floor(currentAudio.duration) || 240,
          elapsed: 0,
          ticker: "Now playing",

          notificationIcon: "notification",
        });

        console.log("created new CapacitorMusicControls");
      } catch (error) {
        console.error("Failed to create music controls:", error);
      }
    })();
  }, [currentAudio]);

  // const [oldCurrentAudio, setOldCurrentAudio] = useState(null);

  useEffect(() => {
    async function handleControlsEvent(action) {
      const message = action?.message;
      console.log("message: " + message);

      switch (message) {
        case "music-controls-pause":
          // setCurrentAudio((prev) => ({ ...prev, isPaused: true })); // i dont have intermediate paused state now. play or stop
          // setOldCurrentAudio({ ...currentAudio }); // currentTime = 0 though, so will start from beginning
          setCurrentAudio({
            index: null,
            title: "",
            duration: 0,
            currentTime: 0,
            audioRef: null,
            isPaused: true,
          });
          CapacitorMusicControls.updateIsPlaying({ isPlaying: false });
          await CapacitorMusicControls.destroy(); // stop it entirely as i cannot play from paused state
          break;

        case "music-controls-play":
          // setCurrentAudio((prev) => ({ ...prev, isPaused: false }));
          // setCurrentAudio({ ...oldCurrentAudio });
          /*
          if (oldCurrentAudio?.audioRef) {
            await oldCurrentAudio.audioRef.play();
          } else {
            const audioElement = document.getElementById(
              oldCurrentAudio?.audioId || "null__audio"
            );
            if (audioElement) await audioElement.play();
          }//*/

          // CapacitorMusicControls.updateIsPlaying({ isPlaying: true });
          // first let current Audio update, this will be dobe automatically in useeffect
          break;

        case "music-controls-next":
          /** error, currentPlaylist is null due to some reason */
          // handlePlayNext();
          break;

        case "music-controls-previous":
          // handlePlayPrev();
          break;

        case "music-controls-destroy":
          setCurrentAudio({
            index: null,
            title: "",
            duration: 0,
            currentTime: 0,
            audioRef: null,
            isPaused: true,
          });
          CapacitorMusicControls.updateIsPlaying({ isPlaying: false });
          await CapacitorMusicControls.destroy();
          break;

        default:
          break;
      }
    }

    const handler = (event) => {
      console.log("controlsNotification was fired");
      console.log("event:", JSON.stringify(event, null, 2));
      const info = { message: event.message, position: 0 };
      handleControlsEvent(info);
    };

    document.addEventListener("controlsNotification", handler);

    return () => {
      document.removeEventListener("controlsNotification", handler);
    };
  }, []);

  function pauseOthers() {
    // no need
    // at a time only currentAudio will play
    // everything else will have isPlaying = false
  }

  const value = {
    currentPlaylist,
    setCurrentPlaylist,
    activeOption,
    setActiveOption: handleOptionClick,
    currentAudio,
    setCurrentAudio,
    onAudioEnd,
    pauseOthers,
    validPaths,
    isPlaylistLoading,
    setIsPlaylistLoading,
    musicsList,
    setMusicsList,
    loadPlaylists,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
AudioPlayerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAudioPlayer = () => {
  return useContext(AudioPlayerContext);
};

/*
  The currentaudio will be always playing, so on click and similar events i just have to set the clicked audio as currentaudio
*/
