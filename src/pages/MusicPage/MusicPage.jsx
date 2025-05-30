import { useEffect } from "react";
import { useParams } from "react-router-dom";
import CategoryPage from "../../components/CategoryPage";
import NotFoundPage from "../NotFound";
import { useAudioPlayer } from "../../contexts/AudioPlayerContext";
import musicsPageData from "./music-page-data";

export default function MusicPage() {
    let { category } = useParams();
    category = category.toLowerCase();
    const pageData = musicsPageData[category];

    const {
        validPaths,
        musicsList,
        isPlaylistLoading,
        loadPlaylists,
        setCurrentAudio,
    } = useAudioPlayer();

    useEffect(() => {
        if (category) {
            loadPlaylists(category.toLowerCase());
        }
        setCurrentAudio({
            index: null,
            title: "",
            duration: 0,
            currentTime: 0,
            audioRef: null,
        });
    }, [category]);

    if (!validPaths.includes(category)) return <NotFoundPage />;

    const helmetObj = {
        title: pageData.title || "",
        description: pageData.description || "",
        robotsTxt: pageData.robotsTxt || "",
        currentUrl: pageData.currentUrl || "",
        cannonicalUrl: pageData.currentUrl || "",
        previewImagePath: pageData.previewImagePath || "",
        mainEntityType: pageData.mainEntityType || "",
    };

    const pageHeading = pageData.title;
    const pageDescription = pageData.description;

    return (
        <CategoryPage
            helmetObj={helmetObj}
            pageHeading={pageHeading}
            pageDescription={pageDescription}
            musicsList={musicsList}
            loading={isPlaylistLoading}
        />
    );
}
