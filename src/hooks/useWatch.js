/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import getNextEpisodeSchedule from "../utils/getNextEpisodeSchedule.utils";
import getServers from "../utils/getServers.utils";
import getStreamInfo from "../utils/getStreamInfo.utils";

export const useWatch = (animeId, initialEpisodeId) => {
  const [error, setError] = useState(null);
  const [buffering, setBuffering] = useState(true);
  const [streamInfo, setStreamInfo] = useState(null);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [episodes, setEpisodes] = useState(null);
  const [animeInfoLoading, setAnimeInfoLoading] = useState(false);
  const [totalEpisodes, setTotalEpisodes] = useState(null);
  const [servers, setServers] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [isFullOverview, setIsFullOverview] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [intro, setIntro] = useState(null);
  const [outro, setOutro] = useState(null);
  const [episodeId, setEpisodeId] = useState(null);
  const [activeEpisodeNum, setActiveEpisodeNum] = useState(null);
  const [activeServerId, setActiveServerId] = useState(null);
  const [activeServerType, setActiveServerType] = useState(null);
  const [activeServerName, setActiveServerName] = useState(null);
  const [serverLoading, setServerLoading] = useState(true);
  const [nextEpisodeSchedule, setNextEpisodeSchedule] = useState(null);
  const isServerFetchInProgress = useRef(false);
  const isStreamFetchInProgress = useRef(false);

  useEffect(() => {
    setEpisodes(null);
    setEpisodeId(null);
    setActiveEpisodeNum(null);
    setServers(null);
    setActiveServerId(null);
    setStreamInfo(null);
    setStreamUrl(null);
    setSubtitles([]);
    setThumbnail(null);
    setIntro(null);
    setOutro(null);
    setBuffering(true);
    setServerLoading(true);
    setError(null);
    setAnimeInfo(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    isServerFetchInProgress.current = false;
    isStreamFetchInProgress.current = false;
  }, [animeId]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setAnimeInfoLoading(true);
        const animeData = await getAnimeInfo(animeId, false);
        setAnimeInfo(animeData);
        setEpisodes(animeData?.episodes || []);
        setTotalEpisodes(animeData?.totalEpisodes || animeData?.episodes?.length || 0);
        const episodeParam = initialEpisodeId;
        const normalizedEpisodes = animeData?.episodes || [];
        const byId = normalizedEpisodes.find((ep) => ep.id === episodeParam);
        const byNumber = normalizedEpisodes.find(
          (ep) => String(ep.number) === String(episodeParam)
        );
        const fallback = normalizedEpisodes[0];
        setEpisodeId((byId || byNumber || fallback)?.id || null);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(err.message || "An error occurred.");
      } finally {
        setAnimeInfoLoading(false);
      }
    };
    fetchInitialData();
  }, [animeId]);

  useEffect(() => {
    const fetchNextEpisodeSchedule = async () => {
      try {
        const data = await getNextEpisodeSchedule(animeId);
        setNextEpisodeSchedule(data);
      } catch (err) {
        console.error("Error fetching next episode schedule:", err);
      }
    };
    fetchNextEpisodeSchedule();
  }, [animeId]);

  useEffect(() => {
    if (!episodes || !episodeId) {
      setActiveEpisodeNum(null);
      return;
    }
    const activeEpisode = episodes.find(
      (episode) => episode.id === episodeId
    );
    const newActiveEpisodeNum = activeEpisode ? activeEpisode.number : null;
    if (activeEpisodeNum !== newActiveEpisodeNum) {
      setActiveEpisodeNum(newActiveEpisodeNum);
    }
  }, [episodeId, episodes]);

  useEffect(() => {
    if (!episodeId || !episodes || isServerFetchInProgress.current) return;

    const fetchServers = async () => {
      isServerFetchInProgress.current = true;
      setServerLoading(true);
      try {
        const subServers = await getServers(episodeId, false);
        const dubServers = animeInfo?.hasDub
          ? await getServers(episodeId, true)
          : [];

        const toServerParam = (server) => {
          if (server?.url) {
            try {
              const hostname = new URL(server.url).hostname;
              const parts = hostname.split(".");
              return parts.length > 1 ? parts[parts.length - 2] : hostname;
            } catch (err) {
              return null;
            }
          }
          if (server?.name) {
            return server.name
              .toLowerCase()
              .replace(/server/gi, "")
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, "");
          }
          return null;
        };

        const normalizeServer = (server, type) => ({
          type,
          data_id: `${type}:${server.url || server.name}`,
          serverName: server.name,
          serverParam: toServerParam(server),
        });

        const normalizedServers = [
          ...((Array.isArray(subServers) ? subServers : []).map((server) =>
            normalizeServer(server, "sub")
          )),
          ...((Array.isArray(dubServers) ? dubServers : []).map((server) =>
            normalizeServer(server, "dub")
          )),
        ];

        const savedServerName = localStorage.getItem("server_name");
        const savedServerType = localStorage.getItem("server_type");
        const initialServer =
          normalizedServers.find(
            (s) => s.serverName === savedServerName && s.type === savedServerType
          ) ||
          normalizedServers.find((s) => s.serverName === savedServerName) ||
          normalizedServers.find((s) => s.type === savedServerType) ||
          normalizedServers[0];

        setServers(normalizedServers);
        setActiveServerType(initialServer?.type);
        setActiveServerName(initialServer?.serverName);
        setActiveServerId(initialServer?.data_id);
      } catch (error) {
        console.error("Error fetching servers:", error);
        setError(error.message || "An error occurred.");
      } finally {
        setServerLoading(false);
        isServerFetchInProgress.current = false;
      }
    };
    fetchServers();
  }, [episodeId, episodes, animeInfo]);
  // Fetch stream info only when episodeId, activeServerId, and servers are ready
  useEffect(() => {
    if (
      !episodeId ||
      !activeServerId ||
      !servers ||
      isServerFetchInProgress.current ||
      isStreamFetchInProgress.current
    )
      return;
    const fetchStreamInfo = async () => {
      isStreamFetchInProgress.current = true;
      setBuffering(true);
      try {
        const server = servers.find((srv) => srv.data_id === activeServerId);
        if (server) {
          const data = await getStreamInfo(
            episodeId,
            server.serverParam,
            server.type === "dub"
          );
          setStreamInfo(data);
          const sources = Array.isArray(data?.sources) ? data.sources : [];
          const preferredSource =
            sources.find((source) => source.isM3U8) || sources[0];
          setStreamUrl(preferredSource?.url || null);
          setIntro(null);
          setOutro(null);
          setSubtitles([]);
          setThumbnail(null);
        } else {
          setError("No server found with the activeServerId.");
        }
      } catch (err) {
        console.error("Error fetching stream info:", err);
        setError(err.message || "An error occurred.");
      } finally {
        setBuffering(false);
        isStreamFetchInProgress.current = false;
      }
    };
    fetchStreamInfo();
  }, [episodeId, activeServerId, servers]);

  return {
    error,
    buffering,
    serverLoading,
    streamInfo,
    animeInfo,
    episodes,
    nextEpisodeSchedule,
    animeInfoLoading,
    totalEpisodes,
    servers,
    streamUrl,
    isFullOverview,
    setIsFullOverview,
    subtitles,
    thumbnail,
    intro,
    outro,
    episodeId,
    setEpisodeId,
    activeEpisodeNum,
    setActiveEpisodeNum,
    activeServerId,
    setActiveServerId,
    activeServerType,
    setActiveServerType,
    activeServerName,
    setActiveServerName,
  };
};
