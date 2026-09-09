import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config.js";
import { mapConsumetAnimeList } from "../helper/animeMapper.js";

const getFilter = async (filterParams = {}) => {
  try {
    const url = new URL(getConsumetAnimeUrl("filter"), window.location.origin);

    Object.entries(filterParams).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "all" &&
        value !== "default"
      ) {
        if (key === "genres" || key === "genre" || key === "genre[]") {
          if (Array.isArray(value)) {
            value.forEach((val) => {
              if (val) url.searchParams.append("genre[]", String(val));
            });
          } else if (typeof value === "string") {
            value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .forEach((val) => {
                url.searchParams.append("genre[]", val);
              });
          }
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });

    const response = await axios.get(url.toString());
    if (response.data) {
      const data = mapConsumetAnimeList(response.data);
      const totalPage =
        Number(response.data.totalPages) ||
        (response.data.hasNextPage
          ? Number(filterParams.page || 1) + 1
          : Number(filterParams.page || 1)) ||
        1;

      return {
        data,
        totalPage,
      };
    }
  } catch (err) {
    console.error("Error in getFilter:", err);
    throw err;
  }

  return { data: [], totalPage: 1 };
};

export default getFilter;
