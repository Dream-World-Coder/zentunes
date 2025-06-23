import { useEffect, memo } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

import useHeader from "./Header";
import Footer from "./Footer";
import AudioItem from "./Audio";
import PlayOptions from "./PlayOptions";

import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import {
  downloadGenreSongs,
  genreExistsLocally,
} from "../services/musicStorage";

const CategoryPage = memo(function CategoryPage({
  helmetObj,
  pageHeading,
  pageDescription,
  reloadPresent = false,
}) {
  let { genre } = useParams();
  genre = genre?.toLowerCase() || "invalid";

  const { Header, selectWindowOpen, setAudiosToDelete } = useHeader();
  const {
    setIsPlaylistLoading,
    loadPlaylists,
    isPlaylistLoading: loading,
    musicsList,
    setMusicsList,
    setCurrentAudio,
    validPaths,
  } = useAudioPlayer();

  async function fetchSongs(genre) {
    try {
      setIsPlaylistLoading(true);
      await downloadGenreSongs(genre);
      await loadPlaylists(genre);
    } catch (e) {
      console.error(`Download failed for ${genre}:, ${JSON.stringify(e)}`);
    } finally {
      setIsPlaylistLoading(false);
    }
  }

  useEffect(() => {
    const checkAndDownloadIfNeeded = async () => {
      if (!validPaths.includes(genre)) return;

      const exists = await genreExistsLocally(genre);
      if (exists) {
        await loadPlaylists(genre);
      } else {
        await setMusicsList([]);
        return;
      }
    };
    checkAndDownloadIfNeeded();

    setCurrentAudio({
      index: null,
      title: "",
      duration: 0,
      currentTime: 0,
      audioRef: null,
      audioId: null,
    });
  }, [genre]);

  // find the audioId from hash, if exists, then go the 4th parent and hightlight it
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;

    const interval = setInterval(() => {
      const hashValue = window.location.hash.substring(1);
      if (!hashValue) return clearInterval(interval);

      const audioElem = document.getElementById(hashValue);
      if (!audioElem) {
        if (++attempts >= maxAttempts) clearInterval(interval);
        return;
      }

      let targetElm = audioElem;
      for (let i = 0; i < 4 && targetElm; i++) {
        targetElm = targetElm.parentNode;
      }

      if (targetElm) {
        clearInterval(interval);
        targetElm.classList.add("highlight");
        targetElm.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          targetElm.classList.remove("highlight");
        }, 8000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const simpleVersion = JSON.parse(
    localStorage.getItem("simpleVersion") || "false"
  );

  return (
    <>
      <Helmet>
        <title>{helmetObj.title}</title>
        <meta name="description" content={helmetObj.description} />
        <meta name="robots" content={helmetObj.robotsTxt} />
        <meta name="author" content="Subhajit Gorai" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${helmetObj.title}`} />
        <meta property="og:description" content={helmetObj.description} />
        <meta property="og:url" content={`${helmetObj.currentUrl}`} />
        <meta
          property="og:image"
          content={`https://zentunes.vercel.app${helmetObj.previewImagePath}`}
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${helmetObj.title}`} />
        <meta name="twitter:description" content={helmetObj.description} />
        <meta
          name="twitter:image"
          content={`https://zentunes.vercel.app${helmetObj.previewImagePath}`}
        />

        <link rel="canonical" href={helmetObj.cannonicalUrl} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${helmetObj.title}`,
            url: `${helmetObj.currentUrl}`,
            description: `${helmetObj.description}`,
            publisher: {
              "@type": "Person",
              name: "Subhajit Gorai",
              // url: "https://opencanvas.blog/u/subhajit",
              url: "https://myopencanvas.in",
            },
            mainEntity: {
              "@type": `${helmetObj.mainEntityType}`,
            },
          })}
        </script>
      </Helmet>

      <Header />

      <section className="container">
        <h2 className={`heading isr ${simpleVersion ? "simpleVersion" : ""}`}>
          {pageHeading}
        </h2>
        <p
          className={`description ${simpleVersion ? "simpleVersion" : ""}`}
          dangerouslySetInnerHTML={{ __html: pageDescription || "" }}
        ></p>

        {musicsList.length > 0 && reloadPresent && <PlayOptions />}

        <ul className={`musics ${loading ? "loading" : ""}`}>
          {musicsList.length > 0 &&
            reloadPresent &&
            musicsList.map((music, index) => (
              <li key={`${genre}-${music.src}`}>
                <AudioItem
                  audioId={music.audioId}
                  src={music.src}
                  title={music.title}
                  mediaType={music.mediaType}
                  index={index}
                  selectWindowOpen={selectWindowOpen}
                  setAudiosToDelete={setAudiosToDelete}
                />
              </li>
            ))}
          {musicsList.length === 0 && reloadPresent && (
            <div>
              No songs found{" "}
              <button
                onClick={() => {
                  fetchSongs(genre);
                }}
              >
                Reload
              </button>
            </div>
          )}
        </ul>
      </section>

      <Footer />
    </>
  );
});
CategoryPage.propTypes = {
  helmetObj: PropTypes.object,
  pageHeading: PropTypes.string,
  pageDescription: PropTypes.string,
  reloadPresent: PropTypes.bool,
};

export default CategoryPage;
