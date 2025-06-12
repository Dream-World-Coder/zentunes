import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

import useHeader from "../../components/Header";
import Footer from "../../components/Footer";
import AudioItem from "../../components/Audio";
import PlayOptions from "../../components/PlayOptions";
import { useAudioPlayer } from "../../contexts/AudioPlayerContext";
import {
  genreExistsLocally,
  downloadGenreSongs,
} from "../../services/musicStorage";

import "../../styles/home.scss";

function HomePage({ helmetObj, pageHeading }) {
  const { Header, selectWindowOpen, setAudiosToDelete } = useHeader();
  const {
    setIsPlaylistLoading,
    loadPlaylists,
    isPlaylistLoading: loading,
    musicsList,
    setMusicsList,
    setCurrentAudio,
    // setCurrentAudioControl,
  } = useAudioPlayer();

  async function fetchSongs() {
    try {
      setIsPlaylistLoading(true);
      await downloadGenreSongs("home");
      await loadPlaylists("home");
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setIsPlaylistLoading(false);
    }
  }

  useEffect(() => {
    const checkAndDownloadIfNeeded = async () => {
      const exists = await genreExistsLocally("home");

      if (exists) {
        await loadPlaylists("home");
      } else {
        await setMusicsList([]);
        return;
      }
    };
    checkAndDownloadIfNeeded();

    // stopping audio if playing [with page change]
    setCurrentAudio({
      index: null,
      title: "",
      duration: 0,
      currentTime: 0,
      audioRef: null,
    });
  }, []);

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
        <h2 className="heading__home isr">{pageHeading}</h2>
        <p className="description">
          Here you will find a collection of beautiful music filled with
          calmness and nostalgia. Enjoy them to the fullest.
          <br />
          There are multiple collections, such as{" "}
          <NavLink to="/musics/classical" className="home__link">
            Classical
          </NavLink>
          ,{" "}
          <NavLink to="/musics/nature" className="home__link">
            Nature
          </NavLink>
          ,{" "}
          <NavLink to="/musics/bangla_retro" className="home__link">
            Bangla Retro
          </NavLink>
          ,{" "}
          <NavLink to="/musics/rabindra_sangeet" className="home__link">
            Rabindra Sangeet
          </NavLink>{" "}
          etc, be sure to explore them all!
          <br /> Below you will find one song from each of the collections.
          <br />
          <br />
          Thank you for visiting!
        </p>

        {musicsList.length > 0 && <PlayOptions />}

        <ul className={`musics ${loading ? "loading" : ""}`}>
          {musicsList.length > 0 &&
            musicsList.map((music, index) => (
              <li key={`home-${music.src}`}>
                <AudioItem
                  src={music.src}
                  title={music.title}
                  mediaType={music.mediaType}
                  index={index}
                  selectWindowOpen={selectWindowOpen}
                  setAudiosToDelete={setAudiosToDelete}
                />
              </li>
            ))}
          {musicsList.length === 0 && (
            <div>
              No songs found <button onClick={fetchSongs}>Reload</button>
            </div>
          )}
        </ul>
      </section>

      <Footer />
    </>
  );
}
HomePage.propTypes = {
  helmetObj: PropTypes.object,
  pageHeading: PropTypes.string,
};

export default function Home() {
  const helmetObj = {
    title: "Home",
    description: `Zentunes is a digital sanctuary of beautiful music filled with calmness and nostalgia. Escape the noise and enjoy peaceful tunes anytime, anywhere.`,
    robotsTxt: "noindex, nofollow",
    currentUrl: "https://zentunes.vercel.app",
    cannonical: "https://zentunes.vercel.app",
    previewImagePath: "/preview-image.png",
    mainEntityType: "WebPage",
  };
  const pageHeading = "Welcome to Zentunes";

  return <HomePage helmetObj={helmetObj} pageHeading={pageHeading} />;
}
