import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request) {
  const headerList = await headers();
  const host = headerList.get("host");
  const referer = headerList.get("referer");

  // 1. Basic Domain Lockdown
  // Only allow requests if they come from your own domain
  // Note: During local development, host will be 'localhost:3000'
  const isAllowed =
    host === "zentunes.vercel.app" ||
    host?.startsWith("localhost:") ||
    (referer && referer.includes("zentunes.vercel.app"));

  if (!isAllowed) {
    return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const videoId = searchParams.get("videoId");

  const API_KEY = process.env.GOOGLE_CLOUD_API_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "API Key missing on server" },
      { status: 500 },
    );
  }

  const LIMIT = 10;

  try {
    // Logic for Similar Songs (Recommendation)
    if (videoId) {
      const detailRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`,
      );
      const detailData = await detailRes.json();

      if (!detailData.items?.length) return NextResponse.json([]);

      const { title, tags } = detailData.items[0].snippet;
      const cleanTitle = title.replace(/[([].*?[\])]/g, "").trim();
      const searchQuery = tags
        ? `${cleanTitle} ${tags.slice(0, 3).join(" ")}`
        : cleanTitle;

      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video,playlist&maxResults=${LIMIT}&key=${API_KEY}`,
      );
      const data = await searchRes.json();
      return NextResponse.json(data.items || []);
    }

    // Logic for Standard Search
    if (query) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video,playlist&maxResults=${LIMIT}&key=${API_KEY}`,
      );
      const data = await response.json();
      return NextResponse.json(data.items || []);
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
