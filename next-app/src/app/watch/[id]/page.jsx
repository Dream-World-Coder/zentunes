"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { ytd } from "@/services/ytData";
import "../watch.scss";

export default function PlayPage({ params }) {
  const decodedParams = use(params);
  const id = decodedParams.id;
  const isPlaylist = id.startsWith("PL");

  const router = useRouter();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef(null);

  // Load YouTube IFrame API script
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const onPlayerReady = () => {
      if (
        playerRef.current &&
        typeof playerRef.current.destroy === "function"
      ) {
        playerRef.current.destroy();
      }

      // Fix: Only provide videoId if it's NOT a playlist
      const playerConfig = {
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 1,
        },
        events: {
          onStateChange: (event) => {
            if (event.data === 0 && recommendations.length > 0) {
              const nextId =
                recommendations[0].id?.videoId ||
                recommendations[0].snippet?.resourceId?.videoId;
              if (nextId) router.push(`/watch/${nextId}`);
            }
          },
        },
      };

      if (isPlaylist) {
        playerConfig.playerVars.listType = "playlist";
        playerConfig.playerVars.list = id;
      } else {
        playerConfig.videoId = id;
      }

      playerRef.current = new window.YT.Player("youtube-player", playerConfig);
    };

    if (window.YT && window.YT.Player) {
      onPlayerReady();
    } else {
      window.onYouTubeIframeAPIReady = onPlayerReady;
    }

    return () => {
      if (
        playerRef.current &&
        typeof playerRef.current.destroy === "function"
      ) {
        playerRef.current.destroy();
      }
    };
  }, [id, recommendations, router, isPlaylist]);

  // Fetch Playlist Items or Recommendations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (isPlaylist) {
          // Fetch videos from the playlist instead of general recommendations
          // Ensure your ytd service has a method like getPlaylistVideos
          const playlistVideos = await ytd.getPlaylistVideos(id);
          setRecommendations(playlistVideos);
        } else {
          const recs = await ytd.getSimilarSongs(id);
          setRecommendations(recs);
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id, isPlaylist]);

  return (
    <>
      <Head>
        <title>Playing {isPlaylist ? "Playlist" : "Song"} | Zentunes</title>
      </Head>

      <main className="container play-container">
        <section className="player-section">
          <div className="video-wrapper">
            <div id="youtube-player"></div>
          </div>
        </section>

        <section className="recommendations-section">
          <h3 className="isri">{isPlaylist ? "Playlist Tracks" : "Up Next"}</h3>
          {isLoading ? (
            <div className="loader">Loading content...</div>
          ) : (
            <div className="rec-grid">
              {recommendations.map((item) => {
                // Handle different ID structures for search results vs playlist items
                const videoId =
                  item.id?.videoId || item.snippet?.resourceId?.videoId;
                if (!videoId) return null;

                return (
                  <div
                    key={videoId}
                    className="rec-card"
                    onClick={() => router.push(`/watch/${videoId}`)}
                  >
                    <img src={item.snippet.thumbnails.medium.url} alt="" />
                    <div className="rec-card__meta">
                      <h4
                        dangerouslySetInnerHTML={{ __html: item.snippet.title }}
                      />
                      <p>{item.snippet.channelTitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
