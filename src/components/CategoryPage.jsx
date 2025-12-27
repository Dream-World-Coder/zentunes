import { useEffect, useRef, memo } from "react";
import { Helmet } from "react-helmet-async";
import { gsap } from "gsap";
import PropTypes from "prop-types";

import Header from "./Header";
import Footer from "./Footer";
import AudioItem from "./Audio";
import PlayOptions from "./PlayOptions";

const CategoryPage = memo(function CategoryPage({
  helmetObj,
  pageHeading,
  pageDescription,
  musicsList = [],
  loading,
}) {
  const musicItemsRef = useRef([]);

  /*
   * inspired from: https://www.supah.it/portfolio/
   * credit: Favio Ottoviani
   */
  const isDesktop =
    !/Android/i.test(navigator.userAgent) && window.innerWidth > 1025;

  // Handle mouse enter animation
  const handleMouseEnter = (e, index) => {
    if (!isDesktop) return;

    const music = musicItemsRef.current[index];
    if (!music) return;

    const link = music.querySelector("figcaption");
    const overlay = music.querySelector(".overlay");

    if (!link || !overlay) return;

    // Determine if mouse is entering from top or bottom
    const bounds = music.getBoundingClientRect();
    const top = e.clientY < bounds.y + bounds.height / 2;

    // Animate link movement and overlay scale
    gsap.to(link, {
      x: "2rem",
      duration: 0.5,
      ease: "power3.out",
    });

    gsap.fromTo(
      overlay,
      {
        scaleY: 0,
        transformOrigin: top ? "0 0" : "0 100%",
      },
      {
        scaleY: 1,
        duration: 0.5,
        ease: "power3.out",
      },
    );
  };

  // Handle mouse leave animation
  const handleMouseLeave = (e, index) => {
    if (!isDesktop) return;

    const music = musicItemsRef.current[index];
    if (!music) return;

    const link = music.querySelector("figcaption");
    const overlay = music.querySelector(".overlay");

    if (!link || !overlay) return;

    // Determine if mouse is leaving from top or bottom
    const bounds = music.getBoundingClientRect();
    const top = e.clientY < bounds.y + bounds.height / 2;

    // Reset animations
    gsap.killTweensOf([overlay, link]);

    gsap.to(link, {
      x: 0,
      duration: 0.3,
      ease: "power3.out",
    });

    gsap.to(overlay, {
      scaleY: 0,
      transformOrigin: top ? "0 0" : "0 100%",
      duration: 0.7,
      ease: "power3.out",
    });
  };

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      // Kill all GSAP animations when component unmounts
      musicItemsRef.current.forEach((music) => {
        if (music) {
          const link = music.querySelector("figcaption");
          const overlay = music.querySelector(".overlay");
          if (link && overlay) {
            gsap.killTweensOf([overlay, link]);
          }
        }
      });
    };
  }, []);

  // Set ref for each music item
  const setMusicRef = (el, index) => {
    musicItemsRef.current[index] = el;
  };

  const genre =
    window.location.pathname.split("/").pop() || window.crypto.randomUUID();

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
        <h2 className="heading isr">{pageHeading}</h2>
        <p
          className="description"
          dangerouslySetInnerHTML={{ __html: pageDescription || "" }}
        ></p>

        {musicsList.length > 0 && <PlayOptions />}

        <ul className={`musics ${loading ? "loading" : ""}`}>
          {musicsList.length > 0 &&
            musicsList.map((music, index) => (
              <li
                key={`${genre}-${music.src}`}
                ref={(el) => setMusicRef(el, index)}
                onMouseEnter={(e) => handleMouseEnter(e, index)}
                onMouseLeave={(e) => handleMouseLeave(e, index)}
              >
                <AudioItem
                  src={music.src}
                  title={music.title}
                  mediaType={music.mediaType}
                  index={index}
                />
              </li>
            ))}
        </ul>
      </section>

      <Footer />
    </>
  );
});
CategoryPage.propTypes = {
  helmetObj: PropTypes.object,
  musicsList: PropTypes.array,
  pageHeading: PropTypes.string,
  pageDescription: PropTypes.string,
  loading: PropTypes.bool,
};

export default CategoryPage;
