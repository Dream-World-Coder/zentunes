import { useAudioPlayer } from "../contexts/AudioPlayerContext";

import playNextIcon from "../assets/images/play-next.svg";
import shuffleIcon from "../assets/images/shuffle.svg";
import repeatIcon from "../assets/images/repeat.svg";
import noneIcon from "../assets/images/none.svg";

import "../styles/playOptions.scss";

export default function PlayOptions() {
    const { activeOption, setActiveOption } = useAudioPlayer();

    return (
        <div className="play-next-options">
            <div
                className={`play-next ${activeOption === "true" ? "active" : ""}`}
                onClick={() => setActiveOption("true")}
                style={{ cursor: "pointer" }}
            >
                <img src={playNextIcon} alt="play next" />
            </div>
            <div
                className={`shuffle ${activeOption === "shuffle" ? "active" : ""}`}
                onClick={() => setActiveOption("shuffle")}
                style={{ cursor: "pointer" }}
            >
                <img src={shuffleIcon} alt="shuffle" />
            </div>
            <div
                className={`repeat ${activeOption === "repeat" ? "active" : ""}`}
                onClick={() => setActiveOption("repeat")}
                style={{ cursor: "pointer" }}
            >
                <img src={repeatIcon} alt="repeat" />
            </div>
            <div
                className={`none ${activeOption === "false" ? "active" : ""}`}
                onClick={() => setActiveOption("false")}
                style={{ cursor: "pointer" }}
            >
                <img src={noneIcon} alt="none" />
            </div>
        </div>
    );
}
