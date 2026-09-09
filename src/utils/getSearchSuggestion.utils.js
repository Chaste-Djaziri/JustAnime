import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config";
import { mapConsumetAnimeList } from "../helper/animeMapper";

const getSearchSuggestion = async (keyword) => {
  if (!keyword) return [];
  const legacyApiUrl = import.meta.env.VITE_API_URL;

  // 1. Try Consumet search suggestions
  try {
    const cleanKeyword = encodeURIComponent(keyword);
    const url = getConsumetAnimeUrl(`search-suggestions/${cleanKeyword}`);
    const response = await axios.get(url);
    if (response.data) {
      return mapConsumetAnimeList(response.data);
    }
  } catch (consumetErr) {
    console.warn("Consumet getSearchSuggestion failed, trying legacy API:", consumetErr);
  }

  // 2. Fallback to legacy API
  if (legacyApiUrl) {
    try {
      const response = await axios.get(
        `${legacyApiUrl}/search/suggest?keyword=${keyword}`
      );
      return response.data.results;
    } catch (err) {
      console.error("Error fetching search suggestions from legacy API:", err);
      throw err;
    }
  }

  return [];
};

export default getSearchSuggestion;
