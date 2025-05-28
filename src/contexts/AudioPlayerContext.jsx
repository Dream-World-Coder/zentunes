import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    // useMemo,
} from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import musicsData from "../pages/MusicPage/musics";

const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
    const [currentPlaylist, setCurrentPlaylist] = useState(null); //array, just {name, totalSongs} will work fine
    let { category } = useParams();
    category = category?.toLowerCase();
    useEffect(() => {
        function capitalizeFirstLetter(str) {
            if (!str) {
                return str; // Handle empty strings
            }
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        function capitalizeEachWord(str) {
            if (!str) {
                return str;
            }
            return str
                .split(" ")
                .map((word) => capitalizeFirstLetter(word))
                .join(" ");
        }

        const validPaths = [
            "nature",
            "classical",
            "bangla_retro",
            "bangla_new",
            "rabindra_sangeet",
            "hindi_retro",
            "religious",
            "song_clips",
        ];
        if (!validPaths.includes(category))
            setCurrentPlaylist({
                name: "Home",
                totalSongs: musicsData["home"]?.length,
            });
        else {
            // setCurrentPlaylist(musicsData[category]);
            setCurrentPlaylist({
                name: capitalizeEachWord(category.replace("_", " ")),
                totalSongs: musicsData[category]?.length,
            });
        }

        // handle home page seperately, / & /home, there will be no category there
        // {name:'Home Page',totalSongs : 6}
    }, [category]);

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

    const [currentAudio, setCurrentAudio] = useState({
        index: null, // on music category change[route change] it will be set to null again and everything will be reseted
        title: "",
        duration: 0, //seconds
        currentTime: 0, //seconds
    });

    function onCurrentAudioEnd() {
        setTimeout(() => {
            switch (activeOption) {
                case "true":
                    setCurrentAudio((prev) => ({
                        ...prev,
                        index: (prev.index + 1) % currentPlaylist.totalSongs,
                    }));
                    console.log("\n\n\n-------problem----------\n");
                    console.log(currentAudio);
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
