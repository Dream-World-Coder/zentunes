import CategoryPage from "../../components/CategoryPage";
import musicsData from "../MusicPage/musics";

export default function Home() {
    const helmetObj = {
        title: "Home",
        description: "Welcome",
        robotsTxt: "index, follow",
        currentUrl: "https://zentunes.netlify.app",
        cannonical: "https://zentunes.netlify.app",
        previewImagePath: "/preview-image.png",
        mainEntityType: "WebPage",
    };
    const pageHeading = helmetObj.title;
    const pageDescription = helmetObj.description;
    const musicsList = musicsData["home"];

    return (
        <CategoryPage
            helmetObj={helmetObj}
            pageHeading={pageHeading}
            pageDescription={pageDescription}
            musicsList={musicsList}
        />
    );
}
