export function getRecentSearches() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data = localStorage.getItem("recentSearches");
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Error parsing recent searches:", error);
    return [];
  }
}
