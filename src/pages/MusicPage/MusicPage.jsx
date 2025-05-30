import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import CategoryPage from "../../components/CategoryPage";
import NotFoundPage from "../NotFound";
import { useAudioPlayer } from "../../contexts/AudioPlayerContext";
import musicsPageData from "./music-page-data";

export default function MusicPage() {
    let { category } = useParams();
    category = category.toLowerCase();
    const pageData = musicsPageData[category];
    const { validPaths } = useAudioPlayer();
    const [musicsList, setMusicsList] = useState([]);
    const [loading, setLoading] = useState(true);

    // fetch musicsList
    useEffect(() => {
        if (!validPaths.includes(category)) return <NotFoundPage />;
        else {
            async function fetchMusicsList() {
                const API_URL = `${import.meta.env.VITE_BACKEND_URL}/audio/list/${category}`;
                setLoading(true);
                try {
                    const res = await fetch(API_URL);
                    const data = await res.json();

                    if (data.audio_data) {
                        setMusicsList(data.audio_data);
                    } else if (data.error) {
                        console.log(`Error:`, data.error);
                    } else {
                        console.log(`unknown response`);
                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    setLoading(false);
                }
            }
            fetchMusicsList();
        }
    }, [category, validPaths]);

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
            loading={loading}
        />
    );
}
