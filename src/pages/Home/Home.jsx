import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { History } from "lucide-react";
import PropTypes from "prop-types";

import useHeader from "../../components/Header";
import Footer from "../../components/Footer";
import { useAudioPlayer } from "../../contexts/AudioPlayerContext";
import { getLastRoutes } from "../../services/historyTracker";
import { getFormattedTitle as pretty } from "../../services/formatting";
import {
  navItems as n1,
  navItemsSimple as n2,
} from "../../assets/data/navItems";

import "../../styles/home.scss";

function HomePage({ helmetObj, pageHeading }) {
  const { Header } = useHeader();
  const { setCurrentAudio } = useAudioPlayer();

  useEffect(() => {
    // stopping audio if playing [with page change]
    setCurrentAudio({
      index: null,
      title: "",
      duration: 0,
      currentTime: 0,
      audioRef: null,
      audioId: null,
    });
  }, []);

  const lastPages = getLastRoutes()
    ?.filter((i) => i?.includes("music"))
    .slice(0, 3);

  const simpleVersion = JSON.parse(
    localStorage.getItem("simpleVersion") || "false"
  );
  const navItems = simpleVersion ? n2 : n1;
  const allGenres = navItems.find((i) => i.href === "dropdown")?.dropdownItems;

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
        <h2 className="heading__home isr">
          {simpleVersion ? "Zentunes" : pageHeading}
        </h2>
        <p className="description">
          {simpleVersion ? (
            "Welcome 'Miss. Nomi'"
          ) : (
            <>
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
            </>
          )}
        </p>

        {lastPages?.length > 0 && (
          <div className="lastViewedPages">
            <h2 className="isri">Recently Visited</h2>
            <div className="pages">
              {lastPages.map((i, j) => (
                <NavLink to={i} key={j} className="pages__child">
                  <History className="circ" size={16} />

                  {i !== "miscellaneous"
                    ? pretty(i.split("/").pop())
                    : "Gentle Tunes"}

                  {/* <ChevronRight size={16} /> */}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        <div className="allGenres">
          <h2 className="isri">All genres</h2>
          <div className="genres">
            {allGenres?.map((item) => (
              <NavLink to={item.href} key={item.href} className="genres__child">
                {item.title}
                {/* <ChevronRight size={16} /> */}
              </NavLink>
            ))}
          </div>
        </div>
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
