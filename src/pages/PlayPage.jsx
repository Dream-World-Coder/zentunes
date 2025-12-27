import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ytd } from "../services/ytData";
import "../styles/play.scss";

export default function PlayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

    // Initialize or re-load player when ID changes
    const onPlayerReady = () => {
      const isPlaylist = id.startsWith("PL");

      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: isPlaylist ? null : id,
        playerVars: {
          autoplay: 1,
          listType: isPlaylist ? "playlist" : null,
          list: isPlaylist ? id : null,
        },
        events: {
          onStateChange: (event) => {
            // YT.PlayerState.ENDED is 0
            if (event.data === 0 && recommendations.length > 0) {
              const nextId =
                recommendations[0].id.videoId ||
                recommendations[0].id.playlistId;
              navigate(`/watch/${nextId}`);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      onPlayerReady();
    } else {
      window.onYouTubeIframeAPIReady = onPlayerReady;
    }

    return () => {
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [id, recommendations, navigate]);

  useEffect(() => {
    const fetchRecs = async () => {
      setIsLoading(true);
      const isPlaylist = id.startsWith("PL");
      const recs = isPlaylist
        ? await ytd.searchYouTubeSongs("popular music")
        : await ytd.getSimilarSongs(id);

      setRecommendations(recs);
      setIsLoading(false);
    };

    fetchRecs();
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <>
      <Helmet>
        <title>Playing Song | Zentunes</title>
      </Helmet>

      <Header />

      <main className="container play-container">
        <section className="player-section">
          <div className="video-wrapper">
            <div id="youtube-player"></div>
          </div>
        </section>

        <section className="recommendations-section">
          <h3 className="isri">Up Next</h3>
          {isLoading ? (
            <div className="loader">Finding more tunes...</div>
          ) : (
            <div className="rec-grid">
              {recommendations.map((item) => {
                const itemId = item.id.videoId || item.id.playlistId;
                return (
                  <div
                    key={itemId}
                    className="rec-card"
                    onClick={() => navigate(`/watch/${itemId}`)}
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

      <Footer />
    </>
  );
}
