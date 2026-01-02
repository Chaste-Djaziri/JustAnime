import axios from "axios";

export default async function getStreamInfo(episodeId, serverName, dub = false) {
  const baseUrl = import.meta.env.VITE_BASE_CONSUMET_URL;
  try {
    const url = new URL(`anime/animekai/watch/${episodeId}`, baseUrl);
    if (serverName) {
      url.searchParams.set("server", serverName);
    }
    url.searchParams.set("dub", dub ? "true" : "false");
    const response = await axios.get(url.toString());
    return response.data;
  } catch (error) {
    console.error("Error fetching stream info:", error);
    return error;
  }
}
