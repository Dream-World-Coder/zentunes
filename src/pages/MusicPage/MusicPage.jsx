import { useEffect } from "react";
import { useParams } from "react-router-dom";
import CategoryPage from "../../components/CategoryPage";
import NotFoundPage from "../NotFound";
import { useAudioPlayer } from "../../contexts/AudioPlayerContext";
import musicsPageData from "./music-page-data";
import {
    genreExistsLocally,
    downloadGenreSongs,
} from "../../services/musicStorage";

export default function MusicPage() {
    let { genre } = useParams();
    genre = genre.toLowerCase();
    const pageData = musicsPageData[genre];

    const {
        validPaths,
        musicsList,
        isPlaylistLoading,
        setIsPlaylistLoading,
        loadPlaylists,
        setCurrentAudio,
    } = useAudioPlayer();

    useEffect(() => {
        const checkAndDownloadIfNeeded = async () => {
            if (!validPaths.includes(genre)) return;

            const exists = await genreExistsLocally(genre);
            if (!exists) {
                const confirm = window.confirm(
                    `Songs for "${genre}" not found on device. Download now?`,
                );
                if (confirm) {
                    try {
                        setIsPlaylistLoading(true);
                        await downloadGenreSongs(genre);
                        await loadPlaylists(genre);
                    } catch (e) {
                        console.error("Download failed:", e);
                    } finally {
                        setIsPlaylistLoading(false);
                    }
                }
            } else {
                loadPlaylists(genre);
            }
        };
        checkAndDownloadIfNeeded();

        setCurrentAudio({
            index: null,
            title: "",
            duration: 0,
            currentTime: 0,
            audioRef: null,
        });
    }, [genre]);

    if (!validPaths.includes(genre)) return <NotFoundPage />;

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
