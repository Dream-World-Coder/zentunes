import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";
import { History, ChevronRight } from "lucide-react";

import useHeader from "../../components/Header";
import Footer from "../../components/Footer";
import { useAudioPlayer } from "../../contexts/AudioPlayerContext";
import { getLastRoutes } from "../../services/historyTracker";
import { getFormattedTitle as pretty } from "../../services/formatting";

import "../../styles/home.scss";
import { navItems } from "../../assets/data/navItems";

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
        <p className="description">Welcome &apos;Miss. Nomi&apos;</p>

        {lastPages?.length > 0 && (
          <div className="lastViewedPages">
            <h2 className="isri">Recently Visited</h2>
            <div className="pages">
              {lastPages.map((i, j) => (
                <NavLink to={i} key={j} className="pages__child">
                  <History className="circ" size={16} />
                  {pretty(i.split("/").pop())}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        <div className="allGenres">
          <h2 className="isri">All genres</h2>
          <div className="pages">
            {allGenres?.map((item) => (
              <NavLink to={item.href} key={item.href} className="pages__child">
                {item.title}
                <ChevronRight size={16} />
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
  const pageHeading = "Zentunes";

  return <HomePage helmetObj={helmetObj} pageHeading={pageHeading} />;
}
