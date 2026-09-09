import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config";

export default async function getEpisodes(id) {
  const legacyApiUrl = import.meta.env.VITE_API_URL;

  // 1. Try Consumet info endpoint to extract episodes
  try {
    const url = new URL(getConsumetAnimeUrl("info"), window.location.origin);
    url.searchParams.set("id", id);
    const response = await axios.get(url.toString());
    const rawEpisodes =
      response.data?.episodes || response.data?.results?.episodes || [];

    if (rawEpisodes.length > 0) {
      const episodes = rawEpisodes.map((ep) => ({
        id: String(ep.id),
        episode_no: Number(ep.number ?? ep.episode_no ?? 1),
        title: ep.title || `Episode ${ep.number ?? ep.episode_no ?? 1}`,
        filler: Boolean(ep.isFiller ?? ep.filler),
      }));

      return {
        totalEpisodes: episodes.length,
        episodes,
      };
    }
  } catch (consumetErr) {
    console.warn("Consumet getEpisodes failed, checking fallback:", consumetErr);
  }

  // 2. Fallback to legacy API
  if (legacyApiUrl) {
    try {
      const response = await axios.get(`${legacyApiUrl}/episodes/${id}`);
      return response.data.results;
    } catch (error) {
      console.error("Error fetching episodes from legacy API:", error);
      throw error;
    }
  }

  return { totalEpisodes: 0, episodes: [] };
}
