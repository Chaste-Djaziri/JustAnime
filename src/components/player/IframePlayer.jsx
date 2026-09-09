/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";
import { getCleanEpisodeId, findEpisodeIndex } from "@/src/helper/episodeHelper";

export default function IframePlayer({
  episodeId,
  serverName,
  servertype = "sub",
  activeServer,
  animeInfo,
  episodeNum,
  episodes,
  playNext,
  autoNext,
  autoPlay = false,
}) {
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const continueWatchingRef = useRef({ currentTime: 0, duration: 0 });

  const currentEpisodeIndex = findEpisodeIndex(episodes, episodeId);
  const currentEpNum =
    episodeNum ||
    (currentEpisodeIndex >= 0 ? episodes[currentEpisodeIndex]?.episode_no ?? episodes[currentEpisodeIndex]?.number : 1) ||
    1;

  // Extract MAL ID from animeInfo or server URL
  const malId =
    animeInfo?.malId ||
    animeInfo?.malID ||
    animeInfo?.animeInfo?.malId ||
    animeInfo?.animeInfo?.malID ||
    activeServer?.url?.match(/\/stream\/mal\/(\d+)/)?.[1] ||
    0;

  useEffect(() => {
    setLoading(true);
    setIframeLoaded(false);

    let finalUrl = "";
    const directUrl = activeServer?.url || "";

    // 1. If server URL is already a ZokoAnime stream
    if (directUrl.includes("zokoanime.video")) {
      // Ensure current episode and track are properly applied
      const match = directUrl.match(/\/stream\/([^/]+)\/([^/]+)\/(\d+)\/([^/?]+)/);
      if (match) {
        const [, source, id] = match;
        finalUrl = `https://zokoanime.video/stream/${source}/${id}/${currentEpNum}/${servertype}?color=35d5bf${
          autoPlay ? "&autoplay=true" : ""
        }`;
      } else {
        finalUrl = directUrl.includes("?color=")
          ? directUrl
          : `${directUrl}${directUrl.includes("?") ? "&" : "?"}color=35d5bf`;
      }
    }
    // 2. If server is named ZokoAnime or we can use ZokoAnime with MAL ID
    else if (
      serverName?.toLowerCase().includes("zoko") ||
      (activeServer?.serverName?.toLowerCase().includes("zoko"))
    ) {
      if (malId) {
        finalUrl = `https://zokoanime.video/stream/mal/${malId}/${currentEpNum}/${servertype}?color=35d5bf${
          autoPlay ? "&autoplay=true" : ""
        }`;
      } else if (directUrl.startsWith("http")) {
        finalUrl = directUrl;
      }
    }
    // 3. Other direct iframe servers (Megaplay, Vidstream, VidPlay, etc.)
    else if (directUrl.startsWith("http")) {
      finalUrl = directUrl;
    }
    // 4. Fallback to ZokoAnime if MAL ID exists
    else if (malId) {
      finalUrl = `https://zokoanime.video/stream/mal/${malId}/${currentEpNum}/${servertype}?color=35d5bf${
        autoPlay ? "&autoplay=true" : ""
      }`;
    }
    // 5. Legacy baseURL fallback
    else {
      const baseURL =
        serverName?.toLowerCase() === "hd-4"
          ? import.meta.env.VITE_BASE_IFRAME_URL_2 || "https://vidwish.live/stream/s-2"
          : import.meta.env.VITE_BASE_IFRAME_URL || "https://megaplay.buzz/stream/s-2";
      finalUrl = `${baseURL}/${episodeId}/${servertype}`;
    }

    setIframeSrc(finalUrl);
  }, [
    episodeId,
    servertype,
    serverName,
    activeServer,
    animeInfo,
    currentEpNum,
    malId,
    autoPlay,
  ]);

  // PostMessage listener for player progress and episode completion (ZokoAnime & standard)
  useEffect(() => {
    const handleMessage = (event) => {
      // 1. ZokoAnime player events
      if (event.origin === "https://zokoanime.video") {
        const { type, payload } = event.data || {};
        switch (type) {
          case "progress": {
            if (payload?.currentTime && payload?.duration) {
              continueWatchingRef.current = {
                currentTime: payload.currentTime,
                duration: payload.duration,
              };
            }
            break;
          }
          case "complete": {
            if (
              autoNext &&
              currentEpisodeIndex >= 0 &&
              currentEpisodeIndex < (episodes?.length || 0) - 1
            ) {
              const nextEp = episodes[currentEpisodeIndex + 1];
              const nextId = getCleanEpisodeId(nextEp);
              if (nextId) playNext(nextId);
            }
            break;
          }
          case "error": {
            console.error("ZokoAnime playback error:", payload);
            break;
          }
        }
        return;
      }

      // 2. Standard / legacy iframe players
      const { currentTime, duration } = event.data || {};
      if (typeof currentTime === "number" && typeof duration === "number") {
        continueWatchingRef.current = { currentTime, duration };
        if (
          currentTime >= duration &&
          currentEpisodeIndex >= 0 &&
          currentEpisodeIndex < (episodes?.length || 0) - 1 &&
          autoNext
        ) {
          const nextEp = episodes[currentEpisodeIndex + 1];
          const nextId = getCleanEpisodeId(nextEp);
          if (nextId) playNext(nextId);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [autoNext, currentEpisodeIndex, episodes, playNext]);

  // Save continue watching when leaving or changing episodes
  useEffect(() => {
    return () => {
      const continueWatching =
        JSON.parse(localStorage.getItem("continueWatching")) || [];
      const newEntry = {
        id: animeInfo?.id,
        data_id: animeInfo?.data_id || animeInfo?.id,
        episodeId,
        episodeNum: currentEpNum,
        adultContent: animeInfo?.adultContent,
        poster: animeInfo?.poster,
        title: animeInfo?.title,
        japanese_title: animeInfo?.japanese_title,
        currentTime: continueWatchingRef.current.currentTime || 0,
        duration: continueWatchingRef.current.duration || 0,
      };
      if (!newEntry.id && !newEntry.data_id) return;
      const keyId = newEntry.data_id || newEntry.id;
      const existingIndex = continueWatching.findIndex(
        (item) => (item.data_id || item.id) === keyId
      );
      if (existingIndex !== -1) {
        continueWatching[existingIndex] = {
          ...continueWatching[existingIndex],
          ...newEntry,
        };
      } else {
        continueWatching.push(newEntry);
      }
      localStorage.setItem("continueWatching", JSON.stringify(continueWatching));
    };
  }, [episodeId, servertype, animeInfo, currentEpNum]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Loader Overlay */}
      <div
        className={`absolute inset-0 flex justify-center items-center bg-black bg-opacity-70 z-10 transition-opacity duration-300 ${
          loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <BouncingLoader />
      </div>

      {iframeSrc && (
        <iframe
          key={`${episodeId}-${servertype}-${serverName}-${iframeSrc}`}
          src={iframeSrc}
          allow="fullscreen; autoplay"
          allowFullScreen
          className={`w-full h-full border-0 transition-opacity duration-500 ${
            iframeLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => {
            setIframeLoaded(true);
            setTimeout(() => setLoading(false), 600);
          }}
        />
      )}
    </div>
  );
}

