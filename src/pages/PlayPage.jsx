import { useState, useEffect } from "react";
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

  // Determine if it's a playlist or video (Playlists usually start with PL)
  const isPlaylist = id.startsWith("PL");
  const embedUrl = isPlaylist
    ? `https://www.youtube.com/embed/videoseries?list=${id}`
    : `https://www.youtube.com/embed/${id}?autoplay=1`;

  useEffect(() => {
    const fetchRecs = async () => {
      setIsLoading(true);
      // If it's a video, get similar. If playlist, we just search generic music.
      const recs = isPlaylist
        ? await ytd.searchYouTubeSongs("popular music")
        : await ytd.getSimilarSongs(id);

      setRecommendations(recs);
      setIsLoading(false);
    };

    fetchRecs();
    window.scrollTo(0, 0);
  }, [id, isPlaylist]);

  return (
    <>
      <Helmet>
        <title>Playing Song</title>
      </Helmet>

      <Header />

      <main className="container play-container">
        <section className="player-section">
          <div className="video-wrapper">
            <iframe
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        <section className="recommendations-section">
          <h3>Up Next</h3>
          {isLoading ? (
            <div className="loader">Loading suggestions...</div>
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
