import axios from "axios";

const CACHE_KEY = "homeInfoCache";
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const CACHE_VERSION = 4;

const mapSpotlightItem = (item) => ({
  id: item.id,
  title: item.title,
  japanese_title: item.japaneseTitle ?? item.japanese_title ?? "",
  poster: item.banner ?? item.image ?? "",
  description: item.description ?? "",
  url: item.url,
  tvInfo: {
    showType: item.type,
    releaseDate: item.releaseDate,
    quality: item.quality,
    episodeInfo: {
      sub: item.sub,
      dub: item.dub,
    },
  },
});

const mapRecentEpisodeItem = (item) => ({
  id: item.id,
  title: item.title,
  japanese_title: item.japaneseTitle ?? item.japanese_title ?? "",
  poster: item.image ?? item.poster ?? "",
  releaseDate: item.releaseDate ?? "",
  tvInfo: {
    showType: item.type,
    sub: item.sub ?? (item.subOrDub === "sub" ? item.episodeNumber : null),
    dub: item.dub ?? (item.subOrDub === "dub" ? item.episodeNumber : null),
  },
});

export default async function getHomeInfo() {
  const api_url = import.meta.env.VITE_API_URL;
  const consumet_base_url = import.meta.env.VITE_BASE_CONSUMET_URL;

  const currentTime = Date.now();
  const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));

  if (
    cachedData &&
    cachedData.version === CACHE_VERSION &&
    currentTime - cachedData.timestamp < CACHE_DURATION
  ) {
    return cachedData.data;
  }
  const response = await axios.get(`${api_url}`);
  if (
    !response.data.results ||
    Object.keys(response.data.results).length === 0
  ) {
    return null;
  }
  const {
    spotlights: homeSpotlights,
    trending,
    topTen: topten,
    today: todaySchedule,
    topAiring: top_airing,
    mostPopular: most_popular,
    mostFavorite: most_favorite,
    latestCompleted: latest_completed,
    latestEpisode: homeLatestEpisode,
    topUpcoming: top_upcoming,
    recentlyAdded: recently_added,
    genres,
  } = response.data.results;

  let spotlights = homeSpotlights;
  let latest_episode = homeLatestEpisode;

  if (consumet_base_url) {
    try {
      const spotlightUrl = new URL(
        "anime/animekai/spotlight",
        consumet_base_url
      ).toString();
      const spotlightResponse = await axios.get(spotlightUrl);
      if (Array.isArray(spotlightResponse.data?.results)) {
        spotlights = spotlightResponse.data.results.map(mapSpotlightItem);
      }
    } catch (err) {
      console.error("Error fetching spotlight data:", err);
    }

    try {
      const recentItems = [];
      let page = 1;
      let hasNextPage = true;
      let totalPages = 1;

      while (hasNextPage && page <= totalPages) {
        const recentUrl = new URL(
          "anime/animekai/recent-episodes",
          consumet_base_url
        );
        recentUrl.searchParams.set("page", String(page));
        const recentResponse = await axios.get(recentUrl.toString());
        const results = recentResponse.data?.results;
        if (Array.isArray(results)) {
          recentItems.push(...results.map(mapRecentEpisodeItem));
        }
        hasNextPage = Boolean(recentResponse.data?.hasNextPage);
        totalPages = Number(recentResponse.data?.totalPages || totalPages);
        page += 1;
      }

      if (recentItems.length > 0) {
        latest_episode = recentItems;
      }
    } catch (err) {
      console.error("Error fetching recent episodes:", err);
    }
  }

  const dataToCache = {
    version: CACHE_VERSION,
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

  localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));

  return dataToCache.data;
}
