import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config";
import { mapConsumetAnimeList } from "../helper/animeMapper";

const normalizeCategoryPath = (path) => {
  if (!path) return "";
  const clean = path.replace(/^\//, "").toLowerCase();
  // Map common frontend route aliases to Consumet routes
  const aliases = {
    "most-popular": "most-popular",
    "top-airing": "top-airing",
    "most-favorite": "most-favorite",
    "latest-completed": "latest-completed",
    "recently-updated": "recently-updated",
    "top-upcoming": "top-upcoming",
    "recently-added": "recently-added",
    movies: "movie",
    specials: "special",
  };
  return aliases[clean] || clean;
};

const getCategoryInfo = async (path, page = 1) => {
  const legacyApiUrl = import.meta.env.VITE_API_URL;
  const targetPath = normalizeCategoryPath(path);

  // 1. Try Consumet category route
  try {
    const url = new URL(
      getConsumetAnimeUrl(targetPath),
      window.location.origin
    );
    url.searchParams.set("page", String(page));

    const response = await axios.get(url.toString());
    if (response.data) {
      const data = mapConsumetAnimeList(response.data);
      const totalPages =
        Number(response.data.totalPages) ||
        (response.data.hasNextPage ? Number(page) + 1 : Number(page)) ||
        1;

      return {
        data,
        totalPages,
      };
    }
  } catch (consumetErr) {
    console.warn("Consumet getCategoryInfo failed, trying legacy API:", consumetErr);
  }

  // 2. Fallback to legacy API
  if (legacyApiUrl) {
    try {
      const response = await axios.get(`${legacyApiUrl}/${path}?page=${page}`);
      return response.data.results;
    } catch (err) {
      console.error("Error fetching category info from legacy API:", err);
      throw err;
    }
  }

  return { data: [], totalPages: 1 };
};

export default getCategoryInfo;
