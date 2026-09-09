import { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import { useWatch } from "@/src/hooks/useWatch";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import IframePlayer from "@/src/components/player/IframePlayer";
import Episodelist from "@/src/components/episodelist/Episodelist";
import website_name from "@/src/config/website";
import Servers from "@/src/components/servers/Servers";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import {
  faClosedCaptioning,
  faMicrophone,
  faCircleExclamation,
  faXmark,
  faFlag,
  faShareNodes,
  faPlay,
  faBell,
  faLayerGroup,
  faChevronRight,
  faCheck,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Skeleton } from "@/src/components/ui/Skeleton/Skeleton";
import Watchcontrols from "@/src/components/watchcontrols/Watchcontrols";
import useWatchControl from "@/src/hooks/useWatchControl";
import Player from "@/src/components/player/Player";
import { getCleanEpisodeId, isEpisodeMatch } from "@/src/helper/episodeHelper";

export default function Watch() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: animeId } = useParams();
  const queryParams = new URLSearchParams(location.search);
  let initialEpisodeId = queryParams.get("ep");
  const { language } = useLanguage();
  const isFirstSet = useRef(true);

  // UI state
  const [showNotice, setShowNotice] = useState(true);
  const [lightsOff, setLightsOff] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const playerSectionRef = useRef(null);
  const [playerHeight, setPlayerHeight] = useState(null);

  const {
    buffering,
    streamInfo,
    streamUrl,
    animeInfo,
    episodes,
    nextEpisodeSchedule,
    totalEpisodes,
    isFullOverview,
    intro,
    outro,
    subtitles,
    thumbnail,
    setIsFullOverview,
    activeEpisodeNum,
    seasons,
    episodeId,
    setEpisodeId,
    activeServerId,
    setActiveServerId,
    servers,
    activeServer,
    activeServerType,
    setActiveServerType,
    activeServerName,
    setActiveServerName,
    serverLoading,
  } = useWatch(animeId, initialEpisodeId);

  const {
    autoPlay,
    setAutoPlay,
    autoSkipIntro,
    setAutoSkipIntro,
    autoNext,
    setAutoNext,
  } = useWatchControl();

  // Synchronize episode list height to match player component exactly on desktop
  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth >= 1024 && playerSectionRef.current) {
        setPlayerHeight(playerSectionRef.current.offsetHeight);
      } else {
        setPlayerHeight(null);
      }
    };

    updateHeight();
    const timer = setTimeout(updateHeight, 300);

    let resizeObserver;
    if (playerSectionRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserver.observe(playerSectionRef.current);
    }
    window.addEventListener("resize", updateHeight);

    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [buffering, streamUrl, servers, episodeId]);

  // Active episode object
  const currentEpObject = useMemo(() => {
    if (!episodes) return null;
    return episodes.find((ep) => isEpisodeMatch(ep, episodeId)) || episodes[0];
  }, [episodes, episodeId]);

  // Update episode route and sync
  useEffect(() => {
    if (!episodes || episodes.length === 0) return;

    const isValidEpisode = episodes.some((ep) => isEpisodeMatch(ep, episodeId));
    if (!episodeId || !isValidEpisode) {
      const fallbackId = getCleanEpisodeId(episodes[0]);
      if (fallbackId && fallbackId !== episodeId) {
        setEpisodeId(fallbackId);
      }
      return;
    }

    const newUrl = `/watch/${animeId}?ep=${episodeId}`;
    if (isFirstSet.current) {
      navigate(newUrl, { replace: true });
      isFirstSet.current = false;
    } else {
      navigate(newUrl);
    }
  }, [episodeId, animeId, navigate, episodes, setEpisodeId]);

  // Document title
  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  }, [animeId, animeInfo]);

  // Fallback redirect if 0 episodes
  useEffect(() => {
    if (totalEpisodes !== null && totalEpisodes === 0) {
      navigate(`/${animeId}`);
    }
  }, [totalEpisodes, animeId, navigate]);

  // Copy share link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const activeEpTitle =
    currentEpObject?.title ||
    (language === "EN" ? animeInfo?.title : animeInfo?.japanese_title) ||
    `Episode ${activeEpisodeNum || 1}`;

  // Next episode countdown string
  const nextEpisodeString = useMemo(() => {
    if (!nextEpisodeSchedule?.nextEpisodeSchedule) {
      return `Episode ${(activeEpisodeNum || 1) + 1} releasing soon`;
    }
    const scheduleDate = new Date(nextEpisodeSchedule.nextEpisodeSchedule);
    const now = new Date();
    const diffMs = scheduleDate.getTime() - now.getTime();
    if (diffMs <= 0) return `Episode ${(activeEpisodeNum || 1) + 1} available now`;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const dateFormatted = scheduleDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `Episode ${(activeEpisodeNum || 1) + 1} in ${days}d ${hours}h - ${dateFormatted}`;
  }, [nextEpisodeSchedule, activeEpisodeNum]);

  // MAL / AL IDs
  const malId =
    animeInfo?.malId ||
    animeInfo?.malID ||
    animeInfo?.animeInfo?.malId ||
    animeInfo?.animeInfo?.malID;
  const alId =
    animeInfo?.alId ||
    animeInfo?.alID ||
    animeInfo?.animeInfo?.alId ||
    animeInfo?.animeInfo?.alID;

  return (
    <div className="w-full min-h-screen bg-[#0a0a0c] text-white font-sans relative pt-16">
      {/* Lights Off Backdrop */}
      {lightsOff && (
        <div
          onClick={() => setLightsOff(false)}
          className="fixed inset-0 z-40 bg-black/90 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Top Notice Bar - Directly Under Header */}
      {showNotice && (
        <div className="w-full bg-[#1e1509] text-orange-400 border-b border-[#3b250d] px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium z-30 shadow-md">
          <div className="flex items-center gap-2.5 max-w-[1920px] mx-auto flex-1">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-orange-500 text-sm shrink-0" />
            <span className="truncate text-orange-300">
              Some servers are under maintenance. Please switch servers if needed.
            </span>
          </div>
          <button
            onClick={() => setShowNotice(false)}
            className="text-orange-400/80 hover:text-white transition-colors p-1"
            title="Dismiss notice"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>
      )}

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c1c1e] text-white border border-white/20 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <FontAwesomeIcon icon={faCheck} className="text-white" />
          <span>Watch link copied to clipboard!</span>
        </div>
      )}

      {/* Main Content Layout - Edge to Edge */}
      <div className="w-full px-1 sm:px-2 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-2.5 items-start">
          {/* Left Column: Player, Controls, Original Servers, Info Bar, Anime Details */}
          <div className="flex flex-col gap-2.5 w-full min-w-0">
            {/* Player Container */}
            <div
              ref={playerSectionRef}
              className={`player-container w-full bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl ${
                lightsOff ? "relative z-50 ring-2 ring-white/40" : "relative"
              }`}
            >
              <div className="w-full relative aspect-video bg-black flex items-center justify-center">
                {!buffering ? (
                  activeServer?.url?.startsWith("http") ||
                  activeServerName?.toLowerCase()?.includes("zoko") ||
                  activeServerName?.toLowerCase() === "hd-1" ||
                  activeServerName?.toLowerCase() === "hd-4" ||
                  activeServerName?.toLowerCase()?.includes("vidstream") ||
                  activeServerName?.toLowerCase()?.includes("vidplay") ||
                  !streamUrl ? (
                    <IframePlayer
                      episodeId={episodeId}
                      servertype={activeServerType}
                      serverName={activeServerName}
                      activeServer={activeServer}
                      animeInfo={animeInfo}
                      episodeNum={activeEpisodeNum}
                      episodes={episodes}
                      playNext={(id) => setEpisodeId(id)}
                      autoNext={autoNext}
                      autoPlay={autoPlay}
                    />
                  ) : (
                    <Player
                      streamUrl={streamUrl}
                      subtitles={subtitles}
                      intro={intro}
                      outro={outro}
                      serverName={activeServerName?.toLowerCase()}
                      thumbnail={thumbnail}
                      autoSkipIntro={autoSkipIntro}
                      autoPlay={autoPlay}
                      autoNext={autoNext}
                      episodeId={episodeId}
                      episodes={episodes}
                      playNext={(id) => setEpisodeId(id)}
                      animeInfo={animeInfo}
                      episodeNum={activeEpisodeNum}
                      streamInfo={streamInfo}
                      onPlaybackError={() => {
                        const zoko =
                          servers?.find(
                            (s) =>
                              s.serverName === "ZokoAnime" &&
                              s.type === activeServerType
                          ) || servers?.find((s) => s.serverName === "ZokoAnime");
                        if (zoko) {
                          setActiveServerId(zoko.data_id);
                          setActiveServerName(zoko.serverName);
                          setActiveServerType(zoko.type);
                        }
                      }}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex justify-center items-center bg-black">
                    <BouncingLoader />
                  </div>
                )}
              </div>

              {/* Player Sub-controls (Autoplay, Auto Skip, Auto Next, Shortcuts, Lights Off, Prev/Next) */}
              <Watchcontrols
                autoPlay={autoPlay}
                setAutoPlay={setAutoPlay}
                autoSkipIntro={autoSkipIntro}
                setAutoSkipIntro={setAutoSkipIntro}
                autoNext={autoNext}
                setAutoNext={setAutoNext}
                episodes={episodes}
                episodeId={episodeId}
                onButtonClick={(id) => setEpisodeId(id)}
                lightsOff={lightsOff}
                onToggleLightsOff={() => setLightsOff((prev) => !prev)}
              />

              {/* Original Servers Section */}
              <div className="border-t border-zinc-800">
                <Servers
                  servers={servers}
                  activeEpisodeNum={activeEpisodeNum}
                  activeServerId={activeServerId}
                  setActiveServerId={setActiveServerId}
                  serverLoading={serverLoading}
                  setActiveServerType={setActiveServerType}
                  activeServerType={activeServerType}
                  setActiveServerName={setActiveServerName}
                />
              </div>
            </div>

            {/* Episode Info & Action Bar */}
            <div className="w-full bg-[#121214] border border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Left: Title, Badges, Overview */}
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
                  {activeEpisodeNum ? `${activeEpisodeNum}. ` : ""}
                  {activeEpTitle}
                </h1>

                {/* Metadata badges row */}
                <div className="flex items-center flex-wrap gap-2 mt-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium">
                    {currentEpObject?.airdate ||
                      animeInfo?.animeInfo?.Aired?.split(" to ")[0] ||
                      "Sep 04, 2026"}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium">
                    <FontAwesomeIcon icon={faClosedCaptioning} className="text-[10px]" />
                    <span>{animeInfo?.animeInfo?.tvInfo?.sub || activeEpisodeNum || 1}</span>
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium">
                    <FontAwesomeIcon icon={faMicrophone} className="text-[10px]" />
                    <span>{animeInfo?.animeInfo?.tvInfo?.dub || activeEpisodeNum || 1}</span>
                  </span>
                </div>

                {/* Episode Synopsis */}
                {currentEpObject?.description && (
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {currentEpObject.description}
                  </p>
                )}
              </div>

              {/* Right: Action Buttons: Report, Share */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-semibold transition-colors"
                >
                  <FontAwesomeIcon icon={faFlag} className="text-[10px]" />
                  <span>Report</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-semibold transition-colors"
                >
                  <FontAwesomeIcon icon={faShareNodes} className="text-[10px]" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Anime Details Card (Black & White Theme) */}
            <div className="w-full bg-[#121214] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Poster & External Links */}
                <div className="flex flex-col items-center sm:items-start shrink-0 gap-3">
                  <div className="w-36 sm:w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-zinc-700 bg-zinc-900">
                    {animeInfo?.poster ? (
                      <img
                        src={animeInfo.poster}
                        alt={animeInfo.title || "Poster"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Skeleton className="w-full h-full" />
                    )}
                  </div>

                  {/* Trailer Button */}
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      (animeInfo?.title || "") + " trailer"
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 px-3 bg-white hover:bg-zinc-200 text-black rounded-lg flex items-center justify-center gap-2 text-xs font-bold tracking-wider transition-colors uppercase"
                  >
                    <span>Trailer</span>
                    <FontAwesomeIcon icon={faPlay} className="text-[10px] text-black" />
                  </a>

                  {/* AL and MAL badges */}
                  <div className="w-full grid grid-cols-2 gap-2">
                    <a
                      href={
                        alId
                          ? `https://anilist.co/anime/${alId}`
                          : `https://anilist.co/search/anime?search=${encodeURIComponent(
                              animeInfo?.title || ""
                            )}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="py-1 px-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-center text-xs font-bold text-zinc-200 hover:text-white transition-colors"
                    >
                      AL
                    </a>
                    <a
                      href={
                        malId
                          ? `https://myanimelist.net/anime/${malId}`
                          : `https://myanimelist.net/anime.php?q=${encodeURIComponent(
                              animeInfo?.title || ""
                            )}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="py-1 px-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-center text-xs font-bold text-zinc-200 hover:text-white transition-colors"
                    >
                      MAL
                    </a>
                  </div>
                </div>

                {/* Right Details: Title, Romaji, B&W Genres, Synopsis, 2-col Metadata Grid */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                      {animeInfo?.title || "Anime Title"}
                    </h2>
                    {animeInfo?.japanese_title && (
                      <p className="text-xs sm:text-sm italic text-zinc-400 mt-1">
                        {animeInfo.japanese_title}
                      </p>
                    )}

                    {/* B&W Genre Pills */}
                    <div className="flex flex-wrap gap-2 mt-3.5">
                      {animeInfo?.animeInfo?.Genres &&
                      animeInfo.animeInfo.Genres.length > 0 ? (
                        animeInfo.animeInfo.Genres.map((genre, idx) => (
                          <Link
                            key={idx}
                            to={`/category/${genre.toLowerCase()}`}
                            className="px-3 py-1 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-white rounded-full text-xs font-semibold transition-colors"
                          >
                            {genre}
                          </Link>
                        ))
                      ) : (
                        <span className="px-3 py-1 bg-zinc-850 text-zinc-200 border border-zinc-700 rounded-full text-xs font-semibold">
                          Anime
                        </span>
                      )}
                    </div>

                    {/* Synopsis */}
                    {animeInfo?.animeInfo?.Overview && (
                      <div className="mt-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        <p>
                          {isFullOverview ||
                          animeInfo.animeInfo.Overview.length <= 260
                            ? animeInfo.animeInfo.Overview
                            : `${animeInfo.animeInfo.Overview.slice(0, 260)}... `}
                          {animeInfo.animeInfo.Overview.length > 260 && (
                            <button
                              onClick={() => setIsFullOverview((prev) => !prev)}
                              className="text-white hover:underline font-semibold ml-1 cursor-pointer transition-colors"
                            >
                              {isFullOverview ? "Show Less" : "Read More"}
                            </button>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 2-Column Metadata Key-Value Table */}
                  <div className="mt-6 pt-5 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">Format:</span>
                        <span className="text-zinc-200 font-semibold">
                          {animeInfo?.animeInfo?.tvInfo?.showType || "TV"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">Status:</span>
                        <span className="text-zinc-200 font-semibold">
                          {animeInfo?.animeInfo?.Status || "Airing"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">Episodes:</span>
                        <span className="text-zinc-200 font-semibold">
                          {activeEpisodeNum || "?"} / {totalEpisodes || "?"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">Rating:</span>
                        <span className="text-zinc-200 font-semibold">
                          {animeInfo?.animeInfo?.["MAL Score"] ||
                            animeInfo?.animeInfo?.tvInfo?.rating ||
                            "83"} / 100
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">Duration:</span>
                        <span className="text-zinc-200 font-semibold">
                          {animeInfo?.animeInfo?.Duration ||
                            animeInfo?.animeInfo?.tvInfo?.duration ||
                            "24 min"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">Season:</span>
                        <span className="text-zinc-200 font-semibold">
                          {animeInfo?.animeInfo?.Premiered || "Spring"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">Start Date:</span>
                        <span className="text-zinc-200 font-semibold">
                          {animeInfo?.animeInfo?.Aired?.split(" to ")[0] || "April 3, 2026"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">End Date:</span>
                        <span className="text-zinc-200 font-semibold">
                          {animeInfo?.animeInfo?.Aired?.split(" to ")[1] || "September 25, 2026"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">Country:</span>
                        <span className="text-zinc-200 font-semibold">JP</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">Adult:</span>
                        <span className="text-zinc-200 font-semibold">
                          {animeInfo?.adultContent ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">Studios:</span>
                        <span className="text-zinc-200 font-semibold">
                          {animeInfo?.animeInfo?.Studios || "8-bit"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-medium">Official Site:</span>
                        <span className="text-zinc-200 font-semibold truncate max-w-[140px]">
                          {animeInfo?.animeInfo?.officialSite || "www.ten-sura.com"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended For You Section (HiAnime Proper Anime Cards) */}
            {((animeInfo?.recommended_data && animeInfo.recommended_data.length > 0) ||
              (animeInfo?.recommendations && animeInfo.recommendations.length > 0)) && (
              <div className="w-full bg-[#121214] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl">
                <CategoryCard
                  label="Recommended for you"
                  data={animeInfo?.recommended_data || animeInfo?.recommendations || []}
                  showViewMore={false}
                  cardStyle="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
                />
              </div>
            )}
          </div>

          {/* Right Column: Episode Drawer (Height equal to player), More Seasons (HiAnime), Next Episode, RELATED, RECOMMENDATIONS */}
          <div className="flex flex-col gap-2.5 w-full min-w-0">
            {/* Episode List Drawer - Equal Height to Player Component */}
            <div
              style={playerHeight ? { height: `${playerHeight}px` } : {}}
              className="w-full flex-shrink-0 transition-[height] duration-150"
            >
              {!episodes ? (
                <div className="h-full min-h-[300px] flex items-center justify-center bg-[#121214] border border-zinc-800 rounded-2xl">
                  <BouncingLoader />
                </div>
              ) : (
                <Episodelist
                  episodes={episodes}
                  currentEpisode={episodeId}
                  onEpisodeClick={(id) => setEpisodeId(id)}
                  totalEpisodes={totalEpisodes}
                  animePoster={animeInfo?.poster}
                />
              )}
            </div>

            {/* More Seasons Component (HiAnime Style) */}
            {seasons && seasons.length > 0 && (
              <div className="w-full bg-[#121214] border border-zinc-800 rounded-2xl p-3 sm:p-3.5 shadow-xl">
                <div className="flex items-center gap-2 mb-2.5 text-white font-bold text-xs sm:text-sm tracking-wide">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-zinc-400 text-xs" />
                  <span>More Seasons</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {seasons.map((season, index) => {
                    const isCurrentSeason = animeId === String(season.id);
                    return (
                      <Link
                        to={`/${season.id}`}
                        key={season.id || index}
                        className={`relative w-full aspect-[3/1] rounded-lg overflow-hidden cursor-pointer group transition-all ${
                          isCurrentSeason
                            ? "ring-2 ring-white/60 shadow-lg shadow-white/10"
                            : "hover:ring-1 hover:ring-white/30 border border-zinc-800"
                        }`}
                      >
                        {/* Background Poster Image */}
                        {season.season_poster ? (
                          <img
                            src={season.season_poster}
                            alt={season.season}
                            className={`w-full h-full object-cover scale-150 ${
                              isCurrentSeason
                                ? "opacity-50"
                                : "opacity-40 group-hover:opacity-60 transition-opacity"
                            }`}
                          />
                        ) : null}

                        {/* Dots Pattern Overlay */}
                        <div
                          className="absolute inset-0 z-10 pointer-events-none"
                          style={{
                            backgroundImage: `url('data:image/svg+xml,<svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="1.5" cy="1.5" r="0.5" fill="white" fill-opacity="0.25"/></svg>')`,
                            backgroundSize: "3px 3px",
                          }}
                        />

                        {/* Dark Gradient Overlay */}
                        <div
                          className={`absolute inset-0 z-20 bg-gradient-to-r ${
                            isCurrentSeason
                              ? "from-black/60 to-transparent"
                              : "from-black/50 to-transparent"
                          }`}
                        />

                        {/* Title Container */}
                        <div className="absolute inset-0 z-30 flex items-center justify-center">
                          <p
                            className={`text-xs font-bold text-center px-1.5 transition-colors line-clamp-1 ${
                              isCurrentSeason
                                ? "text-white font-extrabold"
                                : "text-white/90 group-hover:text-white"
                            }`}
                          >
                            {season.season}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Episode Schedule Notification */}
            <div className="w-full bg-[#121214] border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between text-xs shadow-lg">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faBell} className="text-white text-xs" />
                </div>
                <span className="font-semibold text-zinc-200">
                  {nextEpisodeString}
                </span>
              </div>
            </div>

            {/* RELATED Section */}
            {animeInfo?.related_data && animeInfo.related_data.length > 0 && (
              <div className="w-full bg-[#121214] border border-zinc-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-1.5 mb-3 text-white font-bold text-sm tracking-wide">
                  <FontAwesomeIcon icon={faChevronRight} className="text-zinc-400 text-xs" />
                  <span>RELATED</span>
                </div>
                <div className="space-y-2">
                  {animeInfo.related_data.slice(0, 5).map((item, idx) => (
                    <Link
                      key={item.id || idx}
                      to={`/${item.id}`}
                      className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#1a1a1c] border border-transparent hover:border-zinc-800 transition-all group"
                    >
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-11 h-14 object-cover rounded-lg bg-zinc-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-1 transition-colors">
                          {language === "EN" ? item.title : (item.japanese_title || item.title)}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-medium">
                          <span className="flex items-center gap-1 text-zinc-400">
                            <FontAwesomeIcon icon={faPlay} className="text-[8px]" />
                            {item.tvInfo?.showType || "TV"}
                          </span>
                          {item.tvInfo?.sub && <span>• {item.tvInfo.sub} eps</span>}
                          {item.tvInfo?.rating && (
                            <span className="flex items-center gap-0.5 text-yellow-500">
                              <FontAwesomeIcon icon={faStar} className="text-[9px]" />
                              {item.tvInfo.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => {
            setShowReportModal(false);
            setReportSubmitted(false);
          }}
        >
          <div
            className="bg-[#18181a] border border-zinc-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faFlag} className="text-zinc-300" />
                Report an Issue
              </h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportSubmitted(false);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center mx-auto">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
                <h4 className="text-sm font-semibold text-white">Thank you!</h4>
                <p className="text-xs text-zinc-400">
                  Your report has been submitted to the moderation team.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-zinc-400">
                  Select the issue you are experiencing with Episode {activeEpisodeNum}:
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                    <input type="radio" name="report_reason" defaultChecked className="accent-white" />
                    <span className="text-zinc-200">Video player not loading or buffering indefinitely</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                    <input type="radio" name="report_reason" className="accent-white" />
                    <span className="text-zinc-200">Audio out of sync or missing</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                    <input type="radio" name="report_reason" className="accent-white" />
                    <span className="text-zinc-200">Wrong episode or broken subtitles</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setReportSubmitted(true)}
                    className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
