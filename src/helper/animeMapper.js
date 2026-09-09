export const unwrapResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
};

export const mapConsumetAnimeItem = (item) => {
  if (!item) return null;

  const rawSub = item.sub ?? item.episodeNumber ?? item.tvInfo?.sub ?? null;
  const rawDub = item.dub ?? item.tvInfo?.dub ?? null;
  const showType = item.type || item.tvInfo?.showType || "TV";
  const duration = item.duration || item.tvInfo?.duration || "";
  const quality = item.quality || item.tvInfo?.quality || "HD";
  const rating = item.rating || item.tvInfo?.rating || "";
  const releaseDate = item.releaseDate || item.tvInfo?.releaseDate || "";

  return {
    id: String(item.id || ""),
    title: item.title || "",
    japanese_title:
      item.japaneseTitle || item.japanese_title || item.title || "",
    poster: item.image || item.poster || item.banner || "",
    rank: item.rank ?? null,
    description: item.description || "",
    releaseDate,
    type: showType,
    duration,
    tvInfo: {
      showType,
      releaseDate,
      quality,
      duration,
      rating,
      sub: rawSub,
      dub: rawDub,
      episodeInfo: {
        sub: rawSub,
        dub: rawDub,
      },
    },
  };
};

export const mapConsumetAnimeList = (data) => {
  return unwrapResults(data)
    .map(mapConsumetAnimeItem)
    .filter(Boolean);
};
