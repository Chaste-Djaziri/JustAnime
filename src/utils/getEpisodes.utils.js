import axios from "axios";

export default async function getEpisodes(id) {
  const baseUrl = import.meta.env.VITE_BASE_CONSUMET_URL;
  try {
    const url = new URL("anime/animekai/info", baseUrl);
    url.searchParams.set("id", id);
    const response = await axios.get(url.toString());
    return {
      episodes: response.data?.episodes || [],
      totalEpisodes: response.data?.totalEpisodes || 0,
    };
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return error;
  }
}
