export const ytd = {
  searchYouTubeSongs: async (query) => {
    try {
      const response = await fetch(
        `/search/api?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) throw new Error("Search request failed");
      return await response.json();
    } catch (error) {
      console.error("Frontend Search Error:", error);
      return [];
    }
  },

  getSimilarSongs: async (videoId) => {
    try {
      const response = await fetch(`/search/api?videoId=${videoId}`);
      if (!response.ok) throw new Error("Recommendation request failed");
      return await response.json();
    } catch (error) {
      console.error("Frontend Rec Error:", error);
      return [];
    }
  },
};
