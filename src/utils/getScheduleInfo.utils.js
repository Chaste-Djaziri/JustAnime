import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config";

// In-memory poster cache to avoid duplicate network queries
const posterCache = new Map();

function normalize(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Fetch poster from Kitsu API by title
 */
async function fetchKitsuPoster(title) {
  if (!title) return null;
  const key = normalize(title);
  if (posterCache.has(key)) return posterCache.get(key);

  try {
    const res = await axios.get(
      `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(title)}&page[limit]=1`,
      { timeout: 3500 }
    );
    const anime = res.data?.data?.[0];
    if (anime?.attributes?.posterImage) {
      const p = anime.attributes.posterImage;
      const poster = p.large || p.medium || p.original || p.small || null;
      const score = anime.attributes.averageRating
        ? (parseFloat(anime.attributes.averageRating) / 10).toFixed(1)
        : null;
      const result = { poster, score, format: anime.attributes.subtype || "TV" };
      posterCache.set(key, result);
      return result;
    }
  } catch (_) {
    // Ignore individual Kitsu query errors
  }
  return null;
}

/**
 * Fetch AniList schedule for the date to bulk-enrich posters & metadata
 */
async function fetchAniListSchedule(dateStr) {
  try {
    let targetDate;
    if (dateStr) {
      const [y, m, d] = dateStr.split("-").map(Number);
      targetDate = new Date(y, m - 1, d, 0, 0, 0);
    } else {
      targetDate = new Date();
    }
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
      { headers: { "Content-Type": "application/json", Accept: "application/json" }, timeout: 4000 }
    );

    return anilistRes.data?.data?.Page?.airingSchedules || [];
  } catch (err) {
    console.warn("AniList schedule bulk fetch warning:", err.message);
    return [];
  }
}

/**
 * Enriches a list of schedule items with poster images, scores, and genres
 */
async function enrichScheduleItems(items, dateStr) {
  if (!Array.isArray(items) || items.length === 0) return items;

  // 1. Fetch AniList daily schedule
  const anilistSchedules = await fetchAniListSchedule(dateStr);
  const anilistMedia = anilistSchedules.map((s) => ({
    ...s.media,
    airingAt: s.airingAt,
    episode: s.episode,
  }));

  // 2. Try to match items with AniList media
  const enriched = items.map((item) => {
    if (item.poster) return item;

    const normTitle = normalize(item.title || item.name);
    const normJname = normalize(item.jname || item.japaneseTitle);

    const matched = anilistMedia.find((m) => {
      const romaji = normalize(m.title?.romaji);
      const english = normalize(m.title?.english);
      const native = normalize(m.title?.native);

      return (
        normTitle &&
        (romaji === normTitle ||
          english === normTitle ||
          (romaji && (romaji.includes(normTitle) || normTitle.includes(romaji))) ||
          (english && (english.includes(normTitle) || normTitle.includes(english))) ||
          (normJname && native && (native.includes(normJname) || normJname.includes(native))))
      );
    });

    if (matched) {
      return {
        ...item,
        poster: matched.coverImage?.extraLarge || matched.coverImage?.large || null,
        banner: matched.bannerImage || null,
        genres: matched.genres || item.genres || [],
        score: matched.averageScore ? (matched.averageScore / 10).toFixed(1) : item.score || null,
        format: matched.format || item.format || "TV",
      };
    }

    return item;
  });

  // 3. For any items still lacking posters, query Kitsu in parallel
  const unresolvedIndices = [];
  const kitsuPromises = [];

  enriched.forEach((item, idx) => {
    if (!item.poster && item.title) {
      unresolvedIndices.push(idx);
      kitsuPromises.push(fetchKitsuPoster(item.title));
    }
  });

  if (kitsuPromises.length > 0) {
    const kitsuResults = await Promise.allSettled(kitsuPromises);
    kitsuResults.forEach((res, i) => {
      if (res.status === "fulfilled" && res.value) {
        const itemIdx = unresolvedIndices[i];
        if (enriched[itemIdx]) {
          enriched[itemIdx] = {
            ...enriched[itemIdx],
            poster: res.value.poster || enriched[itemIdx].poster,
            score: enriched[itemIdx].score || res.value.score,
            format: enriched[itemIdx].format || res.value.format,
          };
        }
      }
    });
  }

  return enriched;
}

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

      if (results.length > 0) {
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

        // Enrich with posters from AniList + Kitsu
        return await enrichScheduleItems(mapped, date);
      }
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
        const mapped = results.map((item) => ({
          ...item,
          poster: item.poster || item.image || item.coverImage || null,
        }));
        return await enrichScheduleItems(mapped, date);
      }
    } catch (error) {
      console.error("Legacy schedule error:", error);
    }
  }

  // 3. Fallback directly to AniList GraphQL AiringSchedule
  try {
    const schedules = await fetchAniListSchedule(date);
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

