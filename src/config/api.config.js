export const CONSUMET_BASE_URL =
  import.meta.env.VITE_CONSUMET_URL ||
  import.meta.env.VITE_BASE_CONSUMET_URL ||
  "/consumet";

export const CONSUMET_PROVIDER =
  import.meta.env.VITE_CONSUMET_PROVIDER || "hianime";

/**
 * Returns the URL for the active consumet anime provider.
 * Example: "/consumet/anime/hianime" or "http://localhost:3000/anime/hianime"
 */
export function getConsumetAnimeUrl(endpoint = "") {
  const base = CONSUMET_BASE_URL.replace(/\/$/, "");
  const provider = CONSUMET_PROVIDER.replace(/^\/|\/$/g, "");
  const cleanEndpoint = endpoint ? `/${endpoint.replace(/^\//, "")}` : "";
  return `${base}/anime/${provider}${cleanEndpoint}`;
}
