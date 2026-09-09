import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config";

export default async function getStreamInfo(
  animeId,
  episodeId,
  serverName,
  type = "sub"
) {
  const legacyApiUrl = import.meta.env.VITE_API_URL;

  // 1. Try Consumet watch endpoint
  try {
    const targetEpisodeId = episodeId ? encodeURIComponent(episodeId) : "";
    const url = new URL(
      getConsumetAnimeUrl(`watch/${targetEpisodeId}`),
      window.location.origin
    );

    if (serverName) {
      url.searchParams.set("server", serverName);
    }
    if (type === "dub") {
      url.searchParams.set("dub", "true");
      url.searchParams.set("category", "dub");
    } else {
      url.searchParams.set("category", "sub");
    }

    const response = await axios.get(url.toString());
    const data = response.data?.results || response.data;

    if (data && (data.sources || data.streamingLink)) {
      if (data.streamingLink) {
        return data;
      }

      // Convert consumet sources/subtitles to JustAnime structure
      const primarySource =
        data.sources?.find(
          (s) => s.quality === "default" || s.quality === "auto"
        ) || data.sources?.[0];

      const tracks = (data.subtitles || []).map((sub) => ({
        file: sub.url,
        label: sub.lang || "English",
        kind: "captions",
        default: sub.lang?.toLowerCase().includes("english"),
      }));

      // Find thumbnail if present
      const thumb = data.subtitles?.find(
        (s) => s.lang === "thumbnails" || s.url?.endsWith(".vtt")
      );
      if (thumb) {
        tracks.push({
          file: thumb.url,
          label: "Thumbnails",
          kind: "thumbnails",
        });
      }

      return {
        streamingLink: {
          link: {
            file: primarySource?.url || "",
          },
          sources: data.sources || [],
          tracks,
          intro: data.intro || null,
          outro: data.outro || null,
          headers: data.headers || null,
        },
      };
    }
  } catch (consumetErr) {
    console.warn("Consumet getStreamInfo failed, trying fallback:", consumetErr);
  }

  // 2. Fallback to legacy API
  if (legacyApiUrl) {
    try {
      const response = await axios.get(
        `${legacyApiUrl}/stream?id=${animeId}?ep=${episodeId}&server=${serverName}&type=${type}`
      );
      return response.data.results;
    } catch (error) {
      console.error("Error fetching stream info from legacy API:", error);
      throw error;
    }
  }

  throw new Error("Unable to fetch stream info");
}
