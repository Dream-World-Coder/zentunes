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
    capitalizeEachWord,
    getFormattedTitle,
    getMediaTypeFromFilename,
} from "../services/formatting";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";

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

    /* ------ * current playlist * -----------------------
    --------------------------------------- */
    const [currentPlaylist, setCurrentPlaylist] = useState(null); //array, just {name, totalSongs} will work fine
    const [musicsList, setMusicsList] = useState([]); // the musics list array
    // const [allMusicsList, setAllMusicsList] = useState([]); // cache to store data
    const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);

    // read `Directory.data/audios/${genre}`
    // get songs, for song in songs prepare data:
    // const { uri } = await Filesystem.getUri({
    //     directory: Directory.Data,
    //     path: songPath,
    // });
    // {src: uri, title: getTitleFromFilename(filename), mediaType: getMediaTypeFromFilename(filename)}
    // append them, genreSongs = [ .... ]
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
                directory: Directory.Data,
            });

            for (const file of result.files) {
                const filename = file.name;
                const songPath = `audios/${genre}/${filename}`;

                const { uri } = await Filesystem.getUri({
                    directory: Directory.Data,
                    path: songPath,
                });

                genreSongs.push({
                    src: Capacitor.convertFileSrc(uri),
                    title: getFormattedTitle(filename),
                    mediaType: getMediaTypeFromFilename(filename),
                });
            }

            setMusicsList(genreSongs);
            setCurrentPlaylist({
                name: capitalizeEachWord(genre.replace("_", " ")),
                totalSongs: genreSongs.length,
            });
        } catch (err) {
            console.error("Error loading playlist:", err);
            setMusicsList([]);
        } finally {
            setIsPlaylistLoading(false);
        }
    };

    /* ------ * play next options * -----------------------
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

    /* ------ * current audio * -----------------------
    --------------------------------------- */
    const [currentAudio, setCurrentAudio] = useState({
        index: null, // on music genre change[route change] it will be set to null again and everything will be reseted
        title: "",
        duration: 0, //seconds
        currentTime: 0, //seconds
        audioRef: null,
    });

    function onCurrentAudioEnd() {
        setTimeout(() => {
            switch (activeOption) {
                case "true":
                    setCurrentAudio((prev) => ({
                        ...prev,
                        index: (prev.index + 1) % currentPlaylist.totalSongs,
                    }));
                    // console.log(`currentAudio [previous state]:`, currentAudio);
                    break;
                case "shuffle":
                    setCurrentAudio((prev) => ({
                        ...prev,
                        index: Math.floor(
                            Math.random() * currentPlaylist.totalSongs,
                        ),
                    }));
                    break;
                case "repeat":
                    setCurrentAudio((prev) => ({ ...prev, currentTime: 0 }));
                    currentAudio.audioRef && currentAudio.audioRef.play(); // audioRef = audioRef.current in Audio.jsx
                    break;
                case "false":
                    setCurrentAudio((prev) => ({
                        ...prev,
                        index: null,
                    }));
                    break;
            }
        }, 100);
    }
    const onAudioEnd = useCallback(onCurrentAudioEnd, [
        currentAudio,
        activeOption,
        currentPlaylist,
    ]);

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
