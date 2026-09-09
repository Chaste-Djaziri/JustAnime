import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config";
import { mapConsumetAnimeList } from "../helper/animeMapper";

const CACHE_KEY_PREFIX = "homeInfoCache_v7";
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export default async function getHomeInfo() {
  const consumetUrl = getConsumetAnimeUrl();
  const legacyApiUrl = import.meta.env.VITE_API_URL;
  const cacheKey = `${CACHE_KEY_PREFIX}:${consumetUrl || legacyApiUrl || "default"}`;
  const currentTime = Date.now();

  const cachedData = JSON.parse(localStorage.getItem(cacheKey) || "null");
  if (
    cachedData &&
    currentTime - cachedData.timestamp < CACHE_DURATION &&
    Array.isArray(cachedData.data?.trending) &&
    cachedData.data.trending.length >= 12 &&
    Array.isArray(cachedData.data?.latest_completed) &&
    cachedData.data.latest_completed.length > 0
  ) {
    return cachedData.data;
  }

  // 1. Try Consumet provider routes
  try {
    const [
      spotlightsRes,
      trendingRes,
      featuredRes,
      topAiringRes,
      mostPopularRes,
      mostFavoriteRes,
      latestCompletedRes,
      latestEpisodeRes,
      recentlyAddedRes,
      topUpcomingRes,
      genresRes,
    ] = await Promise.allSettled([
      axios.get(getConsumetAnimeUrl("spotlight")),
      axios.get(getConsumetAnimeUrl("trending")),
      axios.get(getConsumetAnimeUrl("featured")),
      axios.get(getConsumetAnimeUrl("top-airing")),
      axios.get(getConsumetAnimeUrl("most-popular")),
      axios.get(getConsumetAnimeUrl("most-favorite")),
      axios.get(getConsumetAnimeUrl("latest-completed")),
      axios.get(getConsumetAnimeUrl("recently-updated")),
      axios.get(getConsumetAnimeUrl("recently-added")),
      axios.get(getConsumetAnimeUrl("top-upcoming")),
      axios.get(getConsumetAnimeUrl("genres")),
    ]);

    const spotlights =
      spotlightsRes.status === "fulfilled"
        ? mapConsumetAnimeList(spotlightsRes.value.data)
        : [];
    const trending =
      trendingRes.status === "fulfilled"
        ? mapConsumetAnimeList(trendingRes.value.data)
        : [];

    const featured = featuredRes.status === "fulfilled" ? featuredRes.value.data : null;

    const top_airing =
      featured?.topAiring && featured.topAiring.length > 0
        ? mapConsumetAnimeList(featured.topAiring)
        : topAiringRes.status === "fulfilled"
        ? mapConsumetAnimeList(topAiringRes.value.data)
        : [];
    const most_popular =
      featured?.mostPopular && featured.mostPopular.length > 0
        ? mapConsumetAnimeList(featured.mostPopular)
        : mostPopularRes.status === "fulfilled"
        ? mapConsumetAnimeList(mostPopularRes.value.data)
        : [];
    const most_favorite =
      featured?.mostFavorite && featured.mostFavorite.length > 0
        ? mapConsumetAnimeList(featured.mostFavorite)
        : mostFavoriteRes.status === "fulfilled"
        ? mapConsumetAnimeList(mostFavoriteRes.value.data)
        : [];
    const latest_completed =
      featured?.latestCompleted && featured.latestCompleted.length > 0
        ? mapConsumetAnimeList(featured.latestCompleted)
        : latestCompletedRes.status === "fulfilled"
        ? mapConsumetAnimeList(latestCompletedRes.value.data)
        : [];
    const latest_episode =
      latestEpisodeRes.status === "fulfilled"
        ? mapConsumetAnimeList(latestEpisodeRes.value.data)
        : [];
    const recently_added =
      recentlyAddedRes.status === "fulfilled"
        ? mapConsumetAnimeList(recentlyAddedRes.value.data)
        : latest_episode;
    const top_upcoming =
      topUpcomingRes.status === "fulfilled"
        ? mapConsumetAnimeList(topUpcomingRes.value.data)
        : [];

    let genres = [];
    if (genresRes.status === "fulfilled" && genresRes.value.data) {
      const rawGenres = genresRes.value.data;
      genres = Array.isArray(rawGenres)
        ? rawGenres
        : Array.isArray(rawGenres.results)
        ? rawGenres.results
        : [];
    }

    // If at least spotlights or top_airing or most_popular returned data:
    if (
      spotlights.length > 0 ||
      trending.length > 0 ||
      top_airing.length > 0 ||
      most_popular.length > 0 ||
      latest_episode.length > 0
    ) {
      const formattedData = {
        spotlights,
        trending: trending.length > 0 ? trending.slice(0, 12) : top_airing.slice(0, 12),
        topten: most_popular.slice(0, 10),
        todaySchedule: [],
        top_airing,
        most_popular,
        most_favorite,
        latest_completed,
        latest_episode,
        recently_added,
        top_upcoming,
        genres,
      };

      localStorage.setItem(
        cacheKey,
        JSON.stringify({ data: formattedData, timestamp: currentTime })
      );

      return formattedData;
    }
  } catch (consumetErr) {
    console.warn("Consumet home fetch failed, checking legacy API:", consumetErr);
  }

  // 2. Fallback to legacy API if configured
  if (legacyApiUrl) {
    try {
      const response = await axios.get(`${legacyApiUrl}`);
      if (response.data?.results) {
        const {
          spotlights,
          trending,
          topTen: topten,
          today: todaySchedule,
          topAiring: top_airing,
          mostPopular: most_popular,
          mostFavorite: most_favorite,
          latestCompleted: latest_completed,
          latestEpisode: latest_episode,
          topUpcoming: top_upcoming,
          recentlyAdded: recently_added,
          genres,
        } = response.data.results;

        const dataToCache = {
          data: {
            spotlights,
            trending,
            topten,
            todaySchedule,
            top_airing,
            most_popular,
            most_favorite,
            latest_completed,
            latest_episode,
            top_upcoming,
            recently_added,
            genres,
          },
          timestamp: currentTime,
        };

        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        return dataToCache.data;
      }
    } catch (legacyErr) {
      console.error("Legacy API fetch failed:", legacyErr);
    }
  }

  return null;
}
