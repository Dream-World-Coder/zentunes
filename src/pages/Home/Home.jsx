import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
// import { History } from "lucide-react";
import PropTypes from "prop-types";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
// import { getLastSearches } from "../../services/historyTracker";
import { navItems } from "../../assets/data/navItems";

import "../../styles/home.scss";

function HomePage({ helmetObj }) {
  // const lastPages = getLastRoutes()
  //   ?.filter((i) => i?.includes("music"))
  //   .slice(0, 3);

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
        <h2 className="heading__home isr">Zentunes</h2>
        <p className="description">Listen to songs without ads.</p>

        {/* {lastPages?.length > 0 && (
          <div className="lastViewedPages">
            <h2 className="isri">Recently Visited</h2>
            <div className="pages">
              {lastPages.map((i, j) => (
                <NavLink to={i} key={j} className="pages__child">
                  <History className="circ" size={16} />

                  {i !== "miscellaneous"
                    ? pretty(i.split("/").pop())
                    : "Gentle Tunes"}
                </NavLink>
              ))}
            </div>
          </div>
        )}*/}

        <div className="allGenres">
          <h2 className="isri">Genres</h2>
          <div className="genres">
            {allGenres?.map((item) => (
              <NavLink to={item.href} key={item.href} className="genres__child">
                {item.title}
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
