import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { ytd } from "../services/ytData";

import "../styles/search.scss";

export default function SearchPage() {
  const helmetObj = {
    title: "Search Songs",
    description: "search",
  };
  const pageHeading = helmetObj.title;

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // Get query from URL: /search?query=some+song
  const queryFromUrl = searchParams.get("query") || "";

  const [searchResults, setSearchResults] = useState([]);
  const [searchPart, setSearchPart] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchedSomething, setSearchedSomething] = useState(false);

  // Trigger search whenever the URL query changes
  useEffect(() => {
    if (queryFromUrl) {
      searchSongs(queryFromUrl);
    }
  }, [queryFromUrl]);

  async function searchSongs(part) {
    if (!part.trim()) return;

    setIsLoading(true);
    setSearchedSomething(true);

    try {
      const results = await ytd.searchYouTubeSongs(part);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (searchPart.trim()) {
      // Update URL which triggers the useEffect
      setSearchParams({ query: searchPart });
    }
  };

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
        <div className="search">
          <form className="search__form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              className="search__input"
              placeholder="Search for a song..."
              value={searchPart}
              onChange={(e) => setSearchPart(e.target.value)}
            />
            <button
              type="submit"
              className={`search__submitBtn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "..." : <Search size={20} />}
            </button>
          </form>

          <div className="search__results">
            {searchedSomething && (
              <>
                <h2 className="results-title">
                  {isLoading ? "Searching..." : `Results for "${queryFromUrl}"`}
                </h2>

                {!isLoading && (
                  <ol className="results-list">
                    {searchResults.length > 0 ? (
                      searchResults.map((res) => {
                        const { videoId, playlistId } = res.id;
                        const id = videoId || playlistId;
                        const { title, thumbnails, channelTitle } = res.snippet;

                        return (
                          <li
                            key={id}
                            className="result-item"
                            onClick={() => navigate(`/watch/${id}`)}
                          >
                            <div className="result-item__image">
                              <img src={thumbnails.medium.url} alt={title} />
                            </div>
                            <div className="result-item__info">
                              <h3
                                className="result-item__title"
                                dangerouslySetInnerHTML={{ __html: title }}
                              />
                              <p className="result-item__channel">
                                {channelTitle}
                              </p>
                              <span className="result-item__type">
                                {videoId ? "Video" : "Playlist"}
                              </span>
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <li className="no-results">No songs found.</li>
                    )}
                  </ol>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
