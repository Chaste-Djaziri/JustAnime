import axios from "axios";

export default async function getServers(episodeId, dub = false) {
  try {
    const baseUrl = import.meta.env.VITE_BASE_CONSUMET_URL;
    const url = new URL(`anime/animekai/servers/${episodeId}`, baseUrl);
    url.searchParams.set("dub", dub ? "true" : "false");
    const response = await axios.get(url.toString());
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}
