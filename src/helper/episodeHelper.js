/**
 * Cleanly extracts the episode identifier or number from an episode object, id string, or query param.
 * Handles:
 * - HiAnime format: "attack-on-titan-240$episode$4402" -> "4402"
 * - Legacy format: "watch/one-piece?ep=4402" or "?ep=4402" -> "4402"
 * - Plain numeric: "4402" or 4402 -> "4402"
 * - Objects with episode_no or number: { episode_no: 1 } -> "1"
 */
export function getCleanEpisodeId(episodeOrId) {
  if (episodeOrId === null || episodeOrId === undefined) return "";
  
  if (typeof episodeOrId === "object") {
    const rawId = episodeOrId.id ? String(episodeOrId.id) : "";
    if (rawId.includes("$episode$")) {
      return rawId.split("$episode$")[1].split("?")[0].split("&")[0];
    }
    const epMatch = rawId.match(/[?&]ep=([^&]+)/);
    if (epMatch) return epMatch[1];
    if (rawId) return rawId;
    if (episodeOrId.episode_no !== undefined && episodeOrId.episode_no !== null) {
      return String(episodeOrId.episode_no);
    }
    if (episodeOrId.number !== undefined && episodeOrId.number !== null) {
      return String(episodeOrId.number);
    }
    return "";
  }

  const str = String(episodeOrId);
  if (str.includes("$episode$")) {
    return str.split("$episode$")[1].split("?")[0].split("&")[0];
  }
  const epMatch = str.match(/[?&]ep=([^&]+)/);
  if (epMatch) return epMatch[1];
  return str;
}

/**
 * Robustly checks if an episode matches a given target episode id/number.
 */
export function isEpisodeMatch(episode, targetId) {
  if (!episode || targetId === null || targetId === undefined) return false;
  const targetStr = String(targetId);
  const targetClean = getCleanEpisodeId(targetId);

  // Direct id comparison
  if (String(episode.id) === targetStr || String(episode.id) === targetClean) {
    return true;
  }

  // Clean id comparison
  const epClean = getCleanEpisodeId(episode);
  if (epClean && (epClean === targetClean || epClean === targetStr)) {
    return true;
  }

  // Episode number comparison
  const epNum = episode.episode_no ?? episode.number;
  if (epNum !== undefined && epNum !== null) {
    if (String(epNum) === targetStr || String(epNum) === targetClean) {
      return true;
    }
  }

  return false;
}

/**
 * Finds the index of an episode in an array of episodes.
 */
export function findEpisodeIndex(episodes, targetId) {
  if (!Array.isArray(episodes) || episodes.length === 0 || !targetId) return -1;
  return episodes.findIndex((ep) => isEpisodeMatch(ep, targetId));
}
