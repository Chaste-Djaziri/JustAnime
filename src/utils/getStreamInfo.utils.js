import axios from "axios";

export default async function getStreamInfo(episodeId, serverParam, dub = false) {
  const baseUrl = import.meta.env.VITE_BASE_CONSUMET_URL;
  try {
    const url = new URL(`anime/animekai/watch/${episodeId}`, baseUrl);
    if (serverParam) {
      url.searchParams.set("server", serverParam);
    }
    if (dub) {
      url.searchParams.set("dub", "true");
    }
    try {
      const response = await axios.get(url.toString());
      return response.data;
    } catch (error) {
      if (serverParam) {
        const fallbackUrl = new URL(`anime/animekai/watch/${episodeId}`, baseUrl);
        if (dub) {
          fallbackUrl.searchParams.set("dub", "true");
        }
        const fallbackResponse = await axios.get(fallbackUrl.toString());
        return fallbackResponse.data;
      }
      throw error;
    }
  } catch (error) {
    console.error("Error fetching stream info:", error);
    return error;
  }
}
