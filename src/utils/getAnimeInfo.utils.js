import axios from "axios";
import { getConsumetAnimeUrl } from "../config/api.config";
import { mapConsumetAnimeItem } from "../helper/animeMapper";

export function normalizeAnimeInfo(raw) {
  if (!raw) return null;
  // If already in legacy format
  if (raw.data && raw.data.animeInfo) {
    return raw;
  }

  const info = raw.results || raw;
  const showType = info.type || "TV";
  const rawSub = info.sub ?? info.totalEpisodes ?? null;
  const rawDub = info.dub ?? null;

  return {
    data: {
      id: String(info.id || ""),
      title: info.title || "",
      japanese_title:
        info.japaneseTitle || info.japanese_title || info.title || "",
      poster: info.image || info.poster || info.banner || "",
      description: info.description || "",
      adultContent: Boolean(info.isAdult),
      malId: Number(info.malID || info.malId || info.mal_id || 0),
      alId: Number(info.alID || info.alId || info.anilist_id || 0),
      malID: Number(info.malID || info.malId || info.mal_id || 0),
      alID: Number(info.alID || info.alId || info.anilist_id || 0),
      animeInfo: {
        malId: Number(info.malID || info.malId || info.mal_id || 0),
        alId: Number(info.alID || info.alId || info.anilist_id || 0),
        malID: Number(info.malID || info.malId || info.mal_id || 0),
        alID: Number(info.alID || info.alId || info.anilist_id || 0),
        Overview: info.description || "",
        Japanese: info.japaneseTitle || info.japanese_title || "",
        Synonyms: Array.isArray(info.synonyms)
          ? info.synonyms.join(", ")
          : info.synonyms || "",
        Aired: info.aired || info.releaseDate || "",
        Premiered: info.premiered || "",
        Duration: info.duration || "",
        Status: info.status || "",
        "MAL Score": info.malScore || info.score || info.rating || "",
        Genres: Array.isArray(info.genres) ? info.genres : [],
        Studios: Array.isArray(info.studios)
          ? info.studios.join(", ")
          : info.studios || info.studio || "",
        Producers: Array.isArray(info.producers)
          ? info.producers
          : info.producer
          ? [info.producer]
          : [],
        tvInfo: {
          rating: info.rating || "",
          quality: info.quality || "HD",
          sub: rawSub,
          dub: rawDub,
          showType,
          duration: info.duration || "",
        },
      },
      recommended_data: (info.recommendations || [])
        .map(mapConsumetAnimeItem)
        .filter(Boolean),
      charactersVoiceActors: info.charactersVoiceActors || [],
      episodes: (info.episodes || []).map((ep) => ({
        id: ep.id,
        episode_no: ep.number,
        title: ep.title || `Episode ${ep.number}`,
        filler: Boolean(ep.isFiller),
      })),
    },
    seasons: (info.relations || []).map((rel) => ({
      id: rel.id,
      season: rel.title || rel.relationType,
      season_poster: rel.image || "",
    })),
  };
}

export default async function fetchAnimeInfo(id, random = false) {
  const legacyApiUrl = import.meta.env.VITE_API_URL;

  // 1. Try Consumet
  try {
    const targetId = random ? "one-piece" : id; // fallback for random in consumet
    const url = new URL(getConsumetAnimeUrl("info"), window.location.origin);
    url.searchParams.set("id", targetId);

    const response = await axios.get(url.toString());
    if (response.data) {
      return normalizeAnimeInfo(response.data);
    }
  } catch (consumetErr) {
    console.warn("Consumet fetchAnimeInfo failed, trying fallback:", consumetErr);
  }

  // 2. Try legacy API
  if (legacyApiUrl) {
    try {
      if (random) {
        const idRes = await axios.get(`${legacyApiUrl}/random/id`);
        const response = await axios.get(
          `${legacyApiUrl}/info?id=${idRes.data.results}`
        );
        return response.data.results;
      } else {
        const response = await axios.get(`${legacyApiUrl}/info?id=${id}`);
        return response.data.results;
      }
    } catch (error) {
      console.error("Error fetching anime info from legacy API:", error);
      throw error;
    }
  }

  throw new Error("Unable to fetch anime info");
}
