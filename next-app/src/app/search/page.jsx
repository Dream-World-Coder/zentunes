"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import { Search } from "lucide-react";

import { ytd } from "@/services/ytData";
import "./search.scss";

// 1. Move the logic into a separate component
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("query") || "";

  const [searchResults, setSearchResults] = useState([]);
  const [searchPart, setSearchPart] = useState(queryFromUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedSomething, setSearchedSomething] = useState(!!queryFromUrl);

  useEffect(() => {
    if (queryFromUrl) {
      searchSongs(queryFromUrl);
      setSearchPart(queryFromUrl);
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
      router.push(`/search?query=${encodeURIComponent(searchPart.trim())}`);
    }
  };

  return (
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
                        onClick={() => router.push(`/watch/${id}`)}
                      >
                        <div className="result-item__image">
                          <img src={thumbnails.medium.url} alt={title} />
                        </div>
                        <div className="result-item__info">
                          <h3
                            className="result-item__title"
                            dangerouslySetInnerHTML={{ __html: title }}
                          />
                          <p className="result-item__channel">{channelTitle}</p>
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
  );
}

// 2. The main export wraps the content in Suspense
export default function SearchPage() {
  const helmetObj = {
    title: "Search Songs",
    description: "Search for your favorite melodies on Zentunes",
  };

  return (
    <>
      <Head>
        <title>{helmetObj.title}</title>
        <meta name="description" content={helmetObj.description} />
      </Head>

      <section className="container">
        <h2 className="heading isr">{helmetObj.title}</h2>
        <Suspense
          fallback={<div className="loading-state">Loading Search...</div>}
        >
          <SearchContent />
        </Suspense>
      </section>
    </>
  );
}
