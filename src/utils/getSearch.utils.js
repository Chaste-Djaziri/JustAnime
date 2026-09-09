import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config";
import { mapConsumetAnimeList } from "../helper/animeMapper";

const getSearch = async (keyword, page = 1) => {
  const legacyApiUrl = import.meta.env.VITE_API_URL;

  // 1. Try Consumet search endpoint (/:query?page=...)
  try {
    const cleanKeyword = encodeURIComponent(keyword || "");
    const url = new URL(
      getConsumetAnimeUrl(cleanKeyword),
      window.location.origin
    );
    url.searchParams.set("page", String(page));

    const response = await axios.get(url.toString());
    if (response.data) {
      const data = mapConsumetAnimeList(response.data);
      const totalPage =
        Number(response.data.totalPages) ||
        (response.data.hasNextPage ? Number(page) + 1 : Number(page)) ||
        1;

      return {
        data,
        totalPage,
      };
    }
  } catch (consumetErr) {
    console.warn("Consumet getSearch failed, trying legacy API:", consumetErr);
  }

  // 2. Fallback to legacy API
  if (legacyApiUrl) {
    try {
      const response = await axios.get(
        `${legacyApiUrl}/search?keyword=${keyword}&page=${page}`
      );
      return response.data.results;
    } catch (err) {
      console.error("Error fetching search from legacy API:", err);
      throw err;
    }
  }

  return { data: [], totalPage: 1 };
};

export default getSearch;
