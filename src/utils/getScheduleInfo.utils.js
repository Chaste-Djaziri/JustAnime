import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config";

export default async function getSchedInfo(date) {
  const legacyApiUrl = import.meta.env.VITE_API_URL;

  // 1. Try Consumet schedule endpoint (/schedule?date=...)
  try {
    const url = new URL(
      getConsumetAnimeUrl("schedule"),
      window.location.origin
    );
    if (date) {
      url.searchParams.set("date", String(date));
    }

    const response = await axios.get(url.toString());
    if (response.data) {
      const results = Array.isArray(response.data.results)
        ? response.data.results
        : Array.isArray(response.data)
        ? response.data
        : [];
      const mapped = results.map((item) => ({
        id: item.id,
        title: item.title || item.name,
        name: item.name || item.title,
        jname: item.japaneseTitle || item.jname,
        time: item.airingTime || item.time,
        episode_no:
          item.episode_no ||
          item.episode ||
          (item.airingEpisode ? item.airingEpisode.replace(/[^\d]/g, "") : "") ||
          "N/A",
        airingEpisode: item.airingEpisode || item.episode_no,
        episode: item.episode || item.episode_no,
        poster: item.poster || item.image || item.coverImage || null,
      }));
      if (mapped.length > 0) return mapped;
    }
  } catch (consumetErr) {
    console.warn("Consumet getSchedInfo failed, trying legacy API:", consumetErr);
  }

  // 2. Fallback to legacy API
  if (legacyApiUrl) {
    try {
      const response = await axios.get(`${legacyApiUrl}/schedule?date=${date}`);
      const results = response.data?.results || [];
      if (Array.isArray(results) && results.length > 0) {
        return results.map((item) => ({
          ...item,
          poster: item.poster || item.image || item.coverImage || null,
        }));
      }
    } catch (error) {
      console.error("Legacy schedule error:", error);
    }
  }

  // 3. Fallback to AniList GraphQL AiringSchedule
  try {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = Math.floor(
      new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0).getTime() / 1000
    );
    const endOfDay = startOfDay + 86400;

    const query = `
      query ($start: Int, $end: Int) {
        Page(page: 1, perPage: 50) {
          airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
            id
            airingAt
            episode
            media {
              id
              idMal
              title {
                romaji
                english
                native
              }
              coverImage {
                large
                extraLarge
              }
              bannerImage
              genres
              averageScore
              format
            }
          }
        }
      }
    `;

    const anilistRes = await axios.post(
      "https://graphql.anilist.co",
      { query, variables: { start: startOfDay, end: endOfDay } },
      { headers: { "Content-Type": "application/json", Accept: "application/json" } }
    );

    const schedules = anilistRes.data?.data?.Page?.airingSchedules || [];
    if (schedules.length > 0) {
      return schedules.map((item) => {
        const airDate = new Date(item.airingAt * 1000);
        const timeStr = airDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const title =
          item.media?.title?.english ||
          item.media?.title?.romaji ||
          item.media?.title?.native ||
          "Unknown Title";

        return {
          id: String(item.media?.idMal || item.media?.id),
          anilistId: item.media?.id,
          malId: item.media?.idMal,
          title,
          name: title,
          jname: item.media?.title?.native || item.media?.title?.romaji,
          time: timeStr,
          airingAt: item.airingAt,
          episode_no: String(item.episode),
          airingEpisode: `Episode ${item.episode}`,
          episode: String(item.episode),
          poster:
            item.media?.coverImage?.extraLarge ||
            item.media?.coverImage?.large ||
            null,
          genres: item.media?.genres || [],
          score: item.media?.averageScore
            ? (item.media.averageScore / 10).toFixed(1)
            : null,
          format: item.media?.format || "TV",
        };
      });
    }
  } catch (anilistErr) {
    console.warn("AniList schedule fallback error:", anilistErr.message);
  }

  return [];
}
