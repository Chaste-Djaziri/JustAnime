export const CONSUMET_BASE_URL =
  import.meta.env.VITE_CONSUMET_URL ||
  import.meta.env.VITE_BASE_CONSUMET_URL ||
  "/consumet";

export const AVAILABLE_PROVIDERS = [
  { id: "hianime", name: "HiAnime (hianime.at)" },
  { id: "justanime", name: "JustAnime (justanime.to)" },
];

export const getActiveProvider = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("justanime_preferred_source");
    if (stored) return stored;
  }
  return import.meta.env.VITE_CONSUMET_PROVIDER || "hianime";
};

export const setActiveProvider = (provider) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("justanime_preferred_source", provider);
    window.dispatchEvent(new Event("justanime_source_change"));
  }
};

export const CONSUMET_PROVIDER = getActiveProvider();

/**
 * Returns the URL for the active consumet anime provider.
 * Example: "/consumet/anime/hianime" or "/consumet/anime/justanime"
 */
export function getConsumetAnimeUrl(endpoint = "", explicitProvider = null) {
  const base = CONSUMET_BASE_URL.replace(/\/$/, "");
  const provider = (explicitProvider || getActiveProvider()).replace(
    /^\/|\/$/g,
    ""
  );
  const cleanEndpoint = endpoint ? `/${endpoint.replace(/^\//, "")}` : "";
  return `${base}/anime/${provider}${cleanEndpoint}`;
}

