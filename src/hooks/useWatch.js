/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import getEpisodes from "@/src/utils/getEpisodes.utils";
import getNextEpisodeSchedule from "../utils/getNextEpisodeSchedule.utils";
import getServers from "../utils/getServers.utils";
import getStreamInfo from "../utils/getStreamInfo.utils";
import {
  getCleanEpisodeId,
  isEpisodeMatch,
} from "@/src/helper/episodeHelper";

export const useWatch = (animeId, initialEpisodeId) => {
  const [error, setError] = useState(null);
  const [buffering, setBuffering] = useState(true);
  const [streamInfo, setStreamInfo] = useState(null);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [episodes, setEpisodes] = useState(null);
  const [animeInfoLoading, setAnimeInfoLoading] = useState(false);
  const [totalEpisodes, setTotalEpisodes] = useState(null);
  const [seasons, setSeasons] = useState(null);
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
    setSeasons(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    isServerFetchInProgress.current = false;
    isStreamFetchInProgress.current = false;
  }, [animeId]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setAnimeInfoLoading(true);
        const [animeData, episodesData] = await Promise.all([
          getAnimeInfo(animeId, false),
          getEpisodes(animeId),
        ]);
        setAnimeInfo(animeData?.data);
        setSeasons(animeData?.seasons);
        const epList = episodesData?.episodes || [];
        setEpisodes(epList);
        setTotalEpisodes(episodesData?.totalEpisodes || epList.length);

        const firstEp = epList.length > 0 ? epList[0] : null;
        const newEpisodeId =
          initialEpisodeId || (firstEp ? getCleanEpisodeId(firstEp) : null);
        setEpisodeId(newEpisodeId);
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
    const activeEpisode = episodes.find((ep) => isEpisodeMatch(ep, episodeId));
    const newActiveEpisodeNum = activeEpisode
      ? activeEpisode.episode_no ?? activeEpisode.number ?? 1
      : null;
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
        const epObj = episodes.find((ep) => isEpisodeMatch(ep, episodeId));
        const targetId = epObj?.id || episodeId;
        const data = await getServers(animeId, targetId);

        let serverList = Array.isArray(data) ? [...data] : [];

        // Extract MAL ID from server URLs or anime info
        let discoveredMalId = animeInfo?.malId || animeInfo?.malID || animeInfo?.animeInfo?.malId || 0;
        for (const s of serverList) {
          const m = s.url?.match(/\/stream\/mal\/(\d+)/);
          if (m && m[1]) {
            discoveredMalId = Number(m[1]);
            break;
          }
        }

        // If ZokoAnime is not explicitly listed, but we have a MAL ID, ensure ZokoAnime is available!
        const currentEpNum = epObj?.episode_no ?? epObj?.number ?? 1;
        if (discoveredMalId > 0) {
          const hasZokoSub = serverList.some((s) => s.serverName === "ZokoAnime" && s.type === "sub");
          const hasZokoDub = serverList.some((s) => s.serverName === "ZokoAnime" && s.type === "dub");

          if (!hasZokoSub) {
            serverList.unshift({
              serverName: "ZokoAnime",
              type: "sub",
              data_id: "zokoanime-sub",
              server_id: "zoko-sub",
              url: `https://zokoanime.video/stream/mal/${discoveredMalId}/${currentEpNum}/sub?color=35d5bf`,
            });
          }
          if (!hasZokoDub) {
            serverList.push({
              serverName: "ZokoAnime",
              type: "dub",
              data_id: "zokoanime-dub",
              server_id: "zoko-dub",
              url: `https://zokoanime.video/stream/mal/${discoveredMalId}/${currentEpNum}/dub?color=35d5bf`,
            });
          }
        }

        // Choose initial server
        const savedServerName = localStorage.getItem("server_name");
        const savedServerType = localStorage.getItem("server_type");
        const initialServer =
          serverList.find((s) => s.serverName === savedServerName && s.type === savedServerType) ||
          serverList.find((s) => s.serverName === savedServerName) ||
          serverList.find((s) => s.serverName === "ZokoAnime" && s.type === (savedServerType || "sub")) ||
          serverList.find((s) => s.serverName === "HD-1" && s.type === (savedServerType || "sub")) ||
          serverList[0];

        setServers(serverList);
        setActiveServerType(initialServer?.type || "sub");
        setActiveServerName(initialServer?.serverName || "ZokoAnime");
        setActiveServerId(initialServer?.data_id || null);
      } catch (error) {
        console.error("Error fetching servers:", error);
        setError(error.message || "An error occurred.");
      } finally {
        setServerLoading(false);
        isServerFetchInProgress.current = false;
      }
    };
    fetchServers();
  }, [episodeId, episodes]);

  // Fetch stream info only when needed (non-iframe servers)
  useEffect(() => {
    if (
      !episodeId ||
      !activeServerId ||
      !servers ||
      isServerFetchInProgress.current ||
      isStreamFetchInProgress.current
    )
      return;

    const server = servers.find((srv) => srv.data_id === activeServerId);

    // If the active server has a direct embed URL (like ZokoAnime or any iframe url), no need to fetch HLS stream
    if (
      server?.url?.startsWith("http") ||
      server?.serverName?.toLowerCase().includes("zoko") ||
      server?.serverName?.toLowerCase() === "hd-1" ||
      server?.serverName?.toLowerCase() === "hd-4" ||
      server?.serverName?.toLowerCase().includes("vidstream") ||
      server?.serverName?.toLowerCase().includes("vidplay")
    ) {
      setBuffering(false);
      return;
    }

    const fetchStreamInfo = async () => {
      isStreamFetchInProgress.current = true;
      setBuffering(true);
      try {
        const epObj = episodes?.find((ep) => isEpisodeMatch(ep, episodeId));
        const targetId = epObj?.id || episodeId;
        const data = await getStreamInfo(
          animeId,
          targetId,
          server?.serverName ? server.serverName.toLowerCase() : "hd-1",
          server?.type ? server.type.toLowerCase() : "sub"
        );
        setStreamInfo(data);
        setStreamUrl(data?.streamingLink?.link?.file || null);
        setIntro(data?.streamingLink?.intro || null);
        setOutro(data?.streamingLink?.outro || null);
        const subList =
          data?.streamingLink?.tracks
            ?.filter((track) => track.kind === "captions")
            .map(({ file, label }) => ({ file, label })) || [];
        setSubtitles(subList);
        const thumbnailTrack = data?.streamingLink?.tracks?.find(
          (track) => track.kind === "thumbnails" && track.file
        );
        if (thumbnailTrack) setThumbnail(thumbnailTrack.file);
      } catch (err) {
        console.warn("Error fetching stream info, falling back to ZokoAnime:", err);
        // Fallback to ZokoAnime if stream info fails
        const zokoServer =
          servers.find((s) => s.serverName === "ZokoAnime" && s.type === activeServerType) ||
          servers.find((s) => s.serverName === "ZokoAnime");
        if (zokoServer) {
          setActiveServerId(zokoServer.data_id);
          setActiveServerName(zokoServer.serverName);
          setActiveServerType(zokoServer.type);
        } else {
          setError(err.message || "An error occurred.");
        }
      } finally {
        setBuffering(false);
        isStreamFetchInProgress.current = false;
      }
    };
    fetchStreamInfo();
  }, [episodeId, activeServerId, servers, activeServerType]);

  const activeServer = servers?.find((srv) => srv.data_id === activeServerId) || null;

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
    seasons,
    servers,
    activeServer,
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

