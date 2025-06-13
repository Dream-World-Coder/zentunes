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
  getAudioMetadataFromURI1,
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
    "nature",
    "classical",
    "bangla_retro",
    "bangla_new",
    "rabindra_sangeet",
    "hindi_retro",
    "hindi_new",
    "religious",
    "miscellaneous",
  ];

  /** ------ * current playlist * -----------------------
    --------------------------------------- */
  const [currentPlaylist, setCurrentPlaylist] = useState(null); //array, just {name, totalSongs} will work fine
  const [musicsList, setMusicsList] = useState([]); // the musics list array
  const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);

  /**
   * it always loads from local files
   */
  const loadPlaylists = async (genre) => {
    if (!validPaths.includes(genre)) {
      setMusicsList([]);
      return;
    }

    try {
      setIsPlaylistLoading(true);

      const genreSongs = [];

      const result = await Filesystem.readdir({
        path: `audios/${genre}`,
        // directory: Directory[import.meta.env.VITE_DIR],
        directory: Directory.Data,
      });

      for (const file of result.files) {
        const filename = file.name;
        const fileUrl = Capacitor.convertFileSrc(file.uri);

        const metaObj1 = await getAudioMetadataFromURI1(fileUrl, file.name);
        const dur = await getAudioDurationFromURI(fileUrl);

        const duration = dur
          ? Math.floor(dur)
          : Math.floor(metaObj1.duration || 1);

        genreSongs.push({
          title: metaObj1.title || getFormattedTitle(filename),
          src: fileUrl,
          mediaType: getMediaTypeFromFilename(filename),
          duration,
          audioId: window.crypto.randomUUID(),
        });
      }

      console.log(`genreSongs: ${JSON.stringify(genreSongs, null, 2)}`);

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
  };

  /** ------ * play next options * -----------------------
    --------------------------------------- */
  const [activeOption, setActiveOption] = useState("false"); // [true, false, shuffle, repeat]
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
  const handleOptionClick = (option) => {
    setActiveOption(option);
    localStorage.setItem("playNext", option);
  };

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

  async function onCurrentAudioEnd() {
    setTimeout(() => {
      switch (activeOption) {
        case "true":
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
          break;

        case "shuffle":
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
          break;

        case "repeat":
          // audioRef = audioRef.current in Audio.jsx
          currentAudio.audioRef
            ? currentAudio.audioRef.play()
            : document
                .getElementById(currentAudio?.audioId || "null__audio")
                ?.play();
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
    }, 250);
  }
  const onAudioEnd = useCallback(onCurrentAudioEnd, [
    currentAudio,
    activeOption,
    currentPlaylist,
    musicsList,
  ]);

  // update CapacitorMusicControls as soon as currentAudio newly renders
  useEffect(() => {
    (async function () {
      // old destroy
      CapacitorMusicControls.updateIsPlaying({ isPlaying: false });
      await CapacitorMusicControls.destroy();

      if (!currentAudio?.title?.trim()) return;

      try {
        await CapacitorMusicControls.create({
          track: currentAudio.title || "unknown track",
          artist: "unknown artist",
          album: "unknown album",
          cover: "file:///android_asset/public/favicon.png",

          isPlaying: true,
          dismissable: true,

          hasPrev: false,
          hasNext: false,
          hasClose: true,

          duration: Math.floor(currentAudio.duration) || 240,
          elapsed: 0,
          ticker: "Now playing",

          notificationIcon: "notification",
        });
        CapacitorMusicControls.updateIsPlaying({ isPlaying: true });
      } catch (error) {
        console.error("Failed to create music controls:", error);
      }
    })();
  }, [currentAudio]);

  useEffect(() => {
    async function handleControlsEvent(action) {
      const message = action?.message;
      console.log("message: " + message);

      // no actions now ***
      switch (message) {
        case "music-controls-pause":
          // currentAudio?.audioRef?.pause();
          // setCurrentAudio((prev) => ({ ...prev, isPaused: true }));
          CapacitorMusicControls.updateIsPlaying({ isPlaying: false });
          break;

        case "music-controls-play":
          // currentAudio?.audioRef?.play();
          // setCurrentAudio((prev) => ({ ...prev, isPaused: false }));
          CapacitorMusicControls.updateIsPlaying({ isPlaying: true });
          break;

        case "music-controls-destroy":
          currentAudio?.audioRef?.pause();
          setCurrentAudio({
            index: null,
            title: "",
            duration: 0,
            currentTime: 0,
            audioRef: null,
            isPaused: true,
          });
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
