const API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;

export const ytd = {
  /**
   * Fetches YouTube search results for songs (videos and playlists only).
   */
  searchYouTubeSongs: async (query) => {
    const baseUrl = "https://www.googleapis.com/youtube/v3/search";
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video,playlist",
      maxResults: 10,
      key: API_KEY,
    });

    try {
      const response = await fetch(`${baseUrl}?${params}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error("Failed to fetch YouTube results:", error);
      return [];
    }
  },

  /**
   * Gets recommended songs based on a specific video ID.
   * @param {string} videoId - The ID of the video to find recommendations for.
   */
  getSimilarSongs: async (videoId) => {
    const videoDetailsUrl = "https://www.googleapis.com/youtube/v3/videos";

    try {
      // 1. Get the video metadata (Title and Tags)
      const detailParams = new URLSearchParams({
        part: "snippet",
        id: videoId,
        key: API_KEY,
      });

      const detailRes = await fetch(`${videoDetailsUrl}?${detailParams}`);
      const detailData = await detailRes.json();

      if (!detailData.items?.length) return [];

      const { title, tags } = detailData.items[0].snippet;

      // 2. Construct a query using the title and the first few tags
      // We clean the title a bit to remove common non-search terms
      const cleanTitle = title.replace(/[([].*?[\])]/g, "").trim();
      const searchQuery = tags
        ? `${cleanTitle} ${tags.slice(0, 3).join(" ")}`
        : cleanTitle;

      // 3. Re-use the search logic to find similar content
      return await ytd.searchYouTubeSongs(searchQuery);
    } catch (error) {
      console.error("Failed to fetch similar songs:", error);
      return [];
    }
  },
};
