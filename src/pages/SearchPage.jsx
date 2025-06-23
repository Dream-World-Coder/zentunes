import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import Fuse from "fuse.js";

import useHeader from "../components/Header";
import Footer from "../components/Footer";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import { getFormattedTitle as pretty } from "../services/formatting";
import "../styles/search.scss";

export default function SearchPage() {
  const helmetObj = {
    title: "Search Songs",
    description: "search",
  };
  const pageHeading = helmetObj.title;

  const navigate = useNavigate();
  const { Header } = useHeader();
  const { setCurrentAudio, audioCache } = useAudioPlayer();
  const [searchResults, setSearchResults] = useState([]);
  const [searchPart, setSearchPart] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function searchSongs(part) {
    try {
      setIsLoading(true);
      if (!part || !part.trim()) return;
      part = part.trim().toLowerCase();

      let allSongs = [];

      if (audioCache && Object.keys(audioCache).length) {
        for (const genre in audioCache) {
          allSongs.push(...audioCache[genre]);
        }
      } else {
        const file = await Filesystem.readFile({
          path: "audios/audioData.json",
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });
        const data = JSON.parse(file.data) || {};
        for (const genre in data) {
          allSongs.push(...data[genre]);
        }
      }

      const regex = new RegExp(
        part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      const regexMatches = allSongs.filter((song) => regex.test(song.title));

      if (regexMatches.length > 0) {
        setSearchResults(regexMatches);
      } else {
        const fuse = new Fuse(allSongs, {
          keys: ["title"],
          threshold: 0.68,
        });
        const fuzzyResults = fuse.search(part).map((r) => r.item);
        setSearchResults(fuzzyResults);
      }
    } catch (e) {
      console.error("search error", JSON.stringify(e, null, 2));
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setCurrentAudio({
      index: null,
      title: "",
      duration: 0,
      currentTime: 0,
      audioRef: null,
      audioId: null,
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>{helmetObj.title}</title>
        <meta name="description" content={helmetObj.description} />

        <meta property="og:title" content={`${helmetObj.title}`} />
        <meta property="og:description" content={helmetObj.description} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${helmetObj.title}`,
            url: `${window.location.href}`,
            description: `${helmetObj.description}`,
          })}
        </script>
      </Helmet>

      <Header />

      <section className="container">
        <h2 className="heading isr">{pageHeading}</h2>
        <div className="description">
          <div className="search">
            <form
              action=""
              className="search__form"
              onSubmit={async (e) => {
                e.preventDefault();
                await searchSongs(searchPart);
              }}
            >
              <input
                type="text"
                className="search__input"
                placeholder="song title"
                value={searchPart}
                onChange={(e) => setSearchPart(e.target.value)}
              />
              <button
                type="submit"
                className={`search__submitBtn ${isLoading ? "loading" : ""}`}
              >
                {isLoading ? "Searching ..." : "Search"}
              </button>
            </form>

            <div className="search__results">
              <h2>Results</h2>
              <ol
                className={`${searchResults.length === 0 ? "no__res" : ""} ${
                  isLoading ? "loading" : ""
                }`}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((res, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        navigate(`/musics/${res.genre}#${res.audioId || ""}`);
                      }}
                    >
                      <div>
                        {res.title}
                        <strong>
                          • Duration: {(res.duration / 60).toFixed(2)}
                        </strong>
                      </div>
                      <mark>{pretty(res.genre)}</mark>
                    </li>
                  ))
                ) : (
                  <div className="no__res">No Results Found</div>
                )}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
