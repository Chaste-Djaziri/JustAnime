import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config";

export default async function getServers(animeId, episodeId) {
  const legacyApiUrl = import.meta.env.VITE_API_URL;

  // 1. Try Consumet servers endpoint
  try {
    const targetEpisodeId = episodeId ? encodeURIComponent(episodeId) : "";
    const url = getConsumetAnimeUrl(`servers/${targetEpisodeId}`);
    const response = await axios.get(url);
    const rawServers =
      response.data?.results || (Array.isArray(response.data) ? response.data : []);

    if (rawServers.length > 0) {
      return rawServers.map((server, index) => {
        const serverName = server.serverName || server.name || `Server ${index + 1}`;
        const type = server.type || "sub";
        const uniqueId = `${serverName.toLowerCase().replace(/\s+/g, "-")}-${type}-${index}`;
        return {
          serverName,
          type,
          data_id: String(server.data_id || uniqueId),
          server_id: String(server.server_id || server.id || uniqueId),
          url: server.url || "",
        };
      });
    }
  } catch (consumetErr) {
    console.warn("Consumet getServers failed, checking legacy API:", consumetErr);
  }

  // 2. Fallback to legacy API
  if (legacyApiUrl) {
    try {
      const response = await axios.get(
        `${legacyApiUrl}/servers/${animeId}?ep=${episodeId}`
      );
      return response.data.results;
    } catch (error) {
      console.error("Error fetching servers from legacy API:", error);
      throw error;
    }
  }

  return [];
}

