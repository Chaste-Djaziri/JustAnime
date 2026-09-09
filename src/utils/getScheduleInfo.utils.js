import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config";

export default async function getSchedInfo(date) {
  const legacyApiUrl = import.meta.env.VITE_API_URL;

  // 1. Try Consumet schedule endpoint (/schedule?date=...)
  try {
    const url = new URL(
      getConsumetAnimeUrl("schedule"),
      window.location.origin
    );
    if (date) {
      url.searchParams.set("date", String(date));
    }

    const response = await axios.get(url.toString());
    if (response.data) {
      const results = Array.isArray(response.data.results)
        ? response.data.results
        : Array.isArray(response.data)
        ? response.data
        : [];
      return results.map((item) => ({
        id: item.id,
        title: item.title || item.name,
        name: item.name || item.title,
        jname: item.japaneseTitle || item.jname,
        time: item.airingTime || item.time,
        episode_no:
          item.episode_no ||
          item.episode ||
          (item.airingEpisode ? item.airingEpisode.replace(/[^\d]/g, "") : "") ||
          "N/A",
        airingEpisode: item.airingEpisode || item.episode_no,
        episode: item.episode || item.episode_no,
      }));
    }
  } catch (consumetErr) {
    console.warn("Consumet getSchedInfo failed, trying legacy API:", consumetErr);
  }

  // 2. Fallback to legacy API
  if (legacyApiUrl) {
    try {
      const response = await axios.get(`${legacyApiUrl}/schedule?date=${date}`);
      return response.data?.results || [];
    } catch (error) {
      console.error("Legacy schedule error:", error);
      return [];
    }
  }

  return [];
}
