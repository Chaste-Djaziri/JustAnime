import axios from "axios";

export default async function fetchAnimeInfo(id, random = false) {
  const api_url = import.meta.env.VITE_API_URL;
  const consumet_base_url = import.meta.env.VITE_BASE_CONSUMET_URL;
  try {
    if (random) {
      const randomId = await axios.get(`${api_url}/random/id`);
      const infoUrl = new URL(
        "anime/animekai/info",
        consumet_base_url
      );
      infoUrl.searchParams.set("id", randomId.data.results);
      const response = await axios.get(infoUrl.toString());
      return response.data;
    } else {
      const infoUrl = new URL(
        "anime/animekai/info",
        consumet_base_url
      );
      infoUrl.searchParams.set("id", id);
      const response = await axios.get(infoUrl.toString());
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return error;
  }
}
