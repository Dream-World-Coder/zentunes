import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    // useMemo,
} from "react";
import PropTypes from "prop-types";
import { capitalizeEachWord } from "../services/formatting";
import fetchMusicsList from "../services/fetchAudioList";

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
    const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);

    const loadPlaylists = async (genre) => {
        if (!validPaths.includes(genre)) {
            setMusicsList([]);
            return;
        }

        let apiUrl = `${import.meta.env.VITE_BACKEND_URL}/audio/list/${genre}`;
        let musicsData;

        try {
            setIsPlaylistLoading(true);
            musicsData = await fetchMusicsList(apiUrl);
            setMusicsList(musicsData);
        } catch (e) {
            console.log(e);
        } finally {
            setIsPlaylistLoading(false);
        }

        setCurrentPlaylist({
            name: capitalizeEachWord(genre.replace("_", " ")),
            totalSongs: musicsData.length,
        });
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
        musicsList,
        loadPlaylists,
    };

    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
        </AudioPlayerContext.Provider>
    );
};
AudioPlayerProvider.propTypes = { children: PropTypes.node.isRequired };

export const useAudioPlayer = () => {
    return useContext(AudioPlayerContext);
};

/*
    The currentaudio will be always playing, so on click and similar events i just have to set the clicked audio as currentaudio
*/
