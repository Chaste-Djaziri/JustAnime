import axios from "axios";

export default async function getServers(episodeId, dub = false) {
  try {
    const baseUrl = import.meta.env.VITE_BASE_CONSUMET_URL;
    const proxyUrl = import.meta.env.VITE_PROXY_URL;
    const url = new URL(`anime/animekai/servers/${episodeId}`, baseUrl);
    if (dub) {
      url.searchParams.set("dub", "true");
    }
    try {
      const response = await axios.get(url.toString());
      return response.data;
    } catch (error) {
      if (proxyUrl) {
        const proxied = `${proxyUrl}${encodeURIComponent(url.toString())}`;
        const response = await axios.get(proxied);
        return response.data;
      }
      throw error;
    }
  } catch (error) {
    console.error(error);
    return error;
  }
}
