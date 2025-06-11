import { useParams } from "react-router-dom";
import CategoryPage from "../../components/CategoryPage";
import NotFoundPage from "../NotFound";
import { useAudioPlayer } from "../../contexts/AudioPlayerContext";
import musicsPageData from "./music-page-data";

export default function MusicPage() {
  let { genre } = useParams();
  genre = genre.toLowerCase();

  const pageData = musicsPageData[genre];
  const { validPaths } = useAudioPlayer();

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
      reloadPresent={true}
    />
  );
}
