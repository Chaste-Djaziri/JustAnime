import axios from "axios";

/**
 * Fetch MyAnimeList user profile and anime list using Jikan API v4
 */
export async function fetchMALUserAnime(username) {
  if (!username) throw new Error("MyAnimeList username is required");
  const cleanUsername = String(username).trim();

  // 1. Fetch user profile stats
  let userProfile = {
    name: cleanUsername,
    avatar: null,
    statistics: {
      anime: {
        count: 0,
        meanScore: 0,
        episodesWatched: 0,
        daysWatched: 0,
      },
    },
  };

  try {
    const userRes = await axios.get(
      `https://api.jikan.moe/v4/users/${encodeURIComponent(cleanUsername)}/full`
    );
    if (userRes.data?.data) {
      const u = userRes.data.data;
      userProfile = {
        name: u.username || cleanUsername,
        avatar: u.images?.jpg?.image_url || u.images?.webp?.image_url || null,
        statistics: {
          anime: {
            count: u.statistics?.anime?.total_entries || 0,
            meanScore: u.statistics?.anime?.mean_score || 0,
            episodesWatched: u.statistics?.anime?.episodes_watched || 0,
            daysWatched: u.statistics?.anime?.days_watched || 0,
          },
        },
      };
    }
  } catch (profileErr) {
    console.warn("Could not fetch full MAL profile from Jikan:", profileErr.message);
  }

  // 2. Fetch user animelist from Jikan
  try {
    const listRes = await axios.get(
      `https://api.jikan.moe/v4/users/${encodeURIComponent(cleanUsername)}/animelist`
    );

    const rawList = listRes.data?.data || [];
    const entries = rawList.map((item) => {
      const entry = item.entry || item;
      return {
        id: entry.mal_id,
        mediaId: entry.mal_id,
        score: item.score || 0,
        status: normalizeMALStatus(item.status),
        progress: item.episodes_watched || item.num_watched_episodes || 0,
        media: {
          idMal: entry.mal_id,
          title: {
            romaji: entry.title || "",
            english: entry.title_english || entry.title || "",
            native: entry.title_japanese || "",
          },
          coverImage: {
            large:
              entry.images?.jpg?.large_image_url ||
              entry.images?.jpg?.image_url ||
              entry.images?.webp?.large_image_url ||
              "",
          },
          episodes: entry.episodes || null,
          format: entry.type || "TV",
          status: entry.status || "",
        },
      };
    });

    return {
      user: userProfile,
      entries,
    };
  } catch (jikanErr) {
    console.warn("Jikan animelist failed, attempting direct MAL JSON:", jikanErr.message);

    // Fallback: direct MAL load.json
    try {
      const fallbackRes = await axios.get(
        `https://myanimelist.net/animelist/${encodeURIComponent(cleanUsername)}/load.json?offset=0&status=7`
      );
      if (Array.isArray(fallbackRes.data)) {
        const entries = fallbackRes.data.map((item) => ({
          id: item.anime_id,
          mediaId: item.anime_id,
          score: item.score || 0,
          status: normalizeMALStatus(item.status),
          progress: item.num_watched_episodes || 0,
          media: {
            idMal: item.anime_id,
            title: {
              romaji: item.anime_title || "",
              english: item.anime_title_eng || item.anime_title || "",
              native: "",
            },
            coverImage: {
              large: item.anime_image_path || "",
            },
            episodes: item.anime_num_episodes || null,
            format: item.anime_media_type_string || "TV",
            status: item.anime_airing_status_string || "",
          },
        }));

        return {
          user: userProfile,
          entries,
        };
      }
    } catch (fallbackErr) {
      console.error("MAL fallback failed:", fallbackErr.message);
    }

    throw new Error(
      `Could not import from MyAnimeList for user "${cleanUsername}". Please verify the username is public.`
    );
  }
}

function normalizeMALStatus(status) {
  if (!status) return "CURRENT";
  const s = String(status).toLowerCase();
  if (s === "1" || s.includes("watch") || s === "currently_watching") return "CURRENT";
  if (s === "2" || s.includes("complete")) return "COMPLETED";
  if (s === "3" || s.includes("hold")) return "PAUSED";
  if (s === "4" || s.includes("drop")) return "DROPPED";
  if (s === "6" || s.includes("plan")) return "PLANNING";
  return "CURRENT";
}
