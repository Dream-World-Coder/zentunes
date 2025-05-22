import CategoryPage from "../../components/CategoryPage";
import NotFoundPage from "../NotFound";
import { useParams } from "react-router-dom";
import musicsData from "./musics";
import musicsPageData from "./music-page-data";

export default function MusicPage() {
    let { category } = useParams();
    category = category.toLowerCase();

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
    if (!validPaths.includes(category)) return <NotFoundPage />;

    const pageData = musicsPageData[category];
    const musicsList = musicsData[category];

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
        />
    );
}
