import axios from "axios";

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

export default async function getRecentEpisodesPage(page = 1) {
  const consumet_base_url = import.meta.env.VITE_BASE_CONSUMET_URL;
  if (!consumet_base_url) {
    throw new Error("Missing VITE_BASE_CONSUMET_URL");
  }

  const recentUrl = new URL("anime/animekai/recent-episodes", consumet_base_url);
  recentUrl.searchParams.set("page", String(page));
  const { data } = await axios.get(recentUrl.toString());

  return {
    results: Array.isArray(data?.results)
      ? data.results.map(mapRecentEpisodeItem)
      : [],
    currentPage: Number(data?.currentPage || page),
    totalPages: Number(data?.totalPages || 1),
    hasNextPage: Boolean(data?.hasNextPage),
  };
}
