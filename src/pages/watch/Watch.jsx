import { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import { useWatch } from "@/src/hooks/useWatch";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import IframePlayer from "@/src/components/player/IframePlayer";
import Episodelist from "@/src/components/episodelist/Episodelist";
import website_name from "@/src/config/website";
import {
  faClosedCaptioning,
  faMicrophone,
  faCircleExclamation,
  faXmark,
  faHeadphones,
  faBolt,
  faFlag,
  faDownload,
  faShareNodes,
  faPlay,
  faBell,
  faLayerGroup,
  faChevronRight,
  faAngleDown,
  faCheck,
  faStar,
  faComments,
  faThumbsUp,
  faThumbsDown,
  faReply,
  faQuestionCircle,
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
  const [showAudioDropdown, setShowAudioDropdown] = useState(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [commentTab, setCommentTab] = useState("anime"); // "anime" or "episode"
  const [commentSort, setCommentSort] = useState("Top");
  const [commentInput, setCommentInput] = useState("");
  const [commentsList, setCommentsList] = useState([
    {
      id: 1,
      author: "Sojiro Soju",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sojiro",
      badge: "VIP",
      time: "5 days ago",
      text: "The pacing in this episode was sublime! The lore expansion regarding the past timeline is unmatched.",
      likes: 48,
      userLiked: false,
    },
    {
      id: 2,
      author: "KuroNeko",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=KuroNeko",
      badge: "Top Contributor",
      time: "1 week ago",
      text: "Chloe and Hinata meeting Luminus gives me chills every time. 10/10 adaptation by the studio.",
      likes: 31,
      userLiked: false,
    },
    {
      id: 3,
      author: "VeldoraLover",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Veldora",
      badge: "",
      time: "2 weeks ago",
      text: "Can we talk about the soundtrack during the ritual? Truly breathtaking composition.",
      likes: 19,
      userLiked: false,
    },
  ]);

  const audioDropdownRef = useRef(null);
  const serverDropdownRef = useRef(null);
  const playerSectionRef = useRef(null);

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
  } = useWatch(animeId, initialEpisodeId);

  const {
    autoPlay,
    setAutoPlay,
    autoSkipIntro,
    setAutoSkipIntro,
    autoNext,
    setAutoNext,
  } = useWatchControl();

  // Active episode object
  const currentEpObject = useMemo(() => {
    if (!episodes) return null;
    return episodes.find((ep) => isEpisodeMatch(ep, episodeId)) || episodes[0];
  }, [episodes, episodeId]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (audioDropdownRef.current && !audioDropdownRef.current.contains(e.target)) {
        setShowAudioDropdown(false);
      }
      if (serverDropdownRef.current && !serverDropdownRef.current.contains(e.target)) {
        setShowServerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Add mock comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newComment = {
      id: Date.now(),
      author: "You",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CurrentUser",
      badge: "Member",
      time: "Just now",
      text: commentInput.trim(),
      likes: 0,
      userLiked: false,
    };
    setCommentsList([newComment, ...commentsList]);
    setCommentInput("");
  };

  // Available server types and servers
  const subServers = useMemo(
    () => servers?.filter((s) => s.type === "sub") || [],
    [servers]
  );
  const dubServers = useMemo(
    () => servers?.filter((s) => s.type === "dub") || [],
    [servers]
  );

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
    <div className="w-full min-h-screen bg-[#0d0d12] text-zinc-100 font-sans relative">
      {/* Lights Off Backdrop */}
      {lightsOff && (
        <div
          onClick={() => setLightsOff(false)}
          className="fixed inset-0 z-40 bg-black/90 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Top Notice Bar */}
      {showNotice && (
        <div className="w-full bg-[#241a0b] text-[#f59e0b] border-b border-[#3d2b12] px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-medium sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-sm shrink-0" />
            <span className="truncate">
              Some servers are under maintenance. Please switch servers if needed.
            </span>
          </div>
          <button
            onClick={() => setShowNotice(false)}
            className="text-[#f59e0b] hover:text-white transition-colors p-1"
            title="Dismiss notice"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>
      )}

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181820] text-purple-300 border border-purple-500/50 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <FontAwesomeIcon icon={faCheck} className="text-purple-400" />
          <span>Watch link copied to clipboard!</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_410px] gap-6 items-start">
          {/* Left Column: Player, Controls, Info Bar, Anime Details, Comments */}
          <div className="flex flex-col gap-5 w-full min-w-0">
            {/* Player Container */}
            <div
              ref={playerSectionRef}
              className={`player-container w-full bg-black rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl ${
                lightsOff ? "relative z-50 ring-2 ring-purple-500/40" : "relative"
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
            </div>

            {/* Episode Info & Stream Settings Bar (Miruro Style) */}
            <div className="w-full bg-[#131318] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  <p className="text-xs text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {currentEpObject.description}
                  </p>
                )}
              </div>

              {/* Right: Audio Dropdown, Server Dropdown, Actions */}
              <div className="flex flex-col sm:items-end gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  {/* AUDIO Dropdown */}
                  <div className="relative" ref={audioDropdownRef}>
                    <div className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase mb-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faHeadphones} className="text-[9px]" />
                      <span>Audio</span>
                    </div>
                    <button
                      onClick={() => setShowAudioDropdown((prev) => !prev)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a22] hover:bg-[#23232e] border border-zinc-700/80 rounded-lg text-xs font-semibold text-zinc-200 transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={
                          activeServerType === "dub"
                            ? faMicrophone
                            : faClosedCaptioning
                        }
                        className="text-purple-400 text-xs"
                      />
                      <span>{activeServerType === "dub" ? "Dub" : "Sub"}</span>
                      <FontAwesomeIcon
                        icon={faAngleDown}
                        className={`text-[10px] text-zinc-400 transition-transform duration-200 ${
                          showAudioDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showAudioDropdown && (
                      <div className="absolute right-0 top-full mt-1.5 w-32 bg-[#181820] border border-zinc-700/80 rounded-xl shadow-2xl p-1 z-50">
                        <button
                          onClick={() => {
                            if (subServers.length > 0) {
                              setActiveServerType("sub");
                              setActiveServerId(subServers[0].data_id);
                              setActiveServerName(subServers[0].serverName);
                            } else {
                              setActiveServerType("sub");
                            }
                            setShowAudioDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                            activeServerType !== "dub"
                              ? "bg-purple-900/40 text-purple-300 font-semibold"
                              : "text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faClosedCaptioning} />
                            Sub
                          </span>
                          {activeServerType !== "dub" && (
                            <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (dubServers.length > 0) {
                              setActiveServerType("dub");
                              setActiveServerId(dubServers[0].data_id);
                              setActiveServerName(dubServers[0].serverName);
                            } else {
                              setActiveServerType("dub");
                            }
                            setShowAudioDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                            activeServerType === "dub"
                              ? "bg-purple-900/40 text-purple-300 font-semibold"
                              : "text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faMicrophone} />
                            Dub
                          </span>
                          {activeServerType === "dub" && (
                            <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SERVER Dropdown */}
                  <div className="relative" ref={serverDropdownRef}>
                    <div className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase mb-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faBolt} className="text-[9px]" />
                      <span>Server ({servers?.length || 1})</span>
                    </div>
                    <button
                      onClick={() => setShowServerDropdown((prev) => !prev)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a22] hover:bg-[#23232e] border border-zinc-700/80 rounded-lg text-xs font-semibold text-zinc-200 transition-colors"
                    >
                      <FontAwesomeIcon icon={faBolt} className="text-yellow-400 text-xs" />
                      <span className="truncate max-w-[90px]">
                        {activeServerName || "Auto"}
                      </span>
                      <FontAwesomeIcon
                        icon={faAngleDown}
                        className={`text-[10px] text-zinc-400 transition-transform duration-200 ${
                          showServerDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showServerDropdown && (
                      <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#181820] border border-zinc-700/80 rounded-xl shadow-2xl p-1 z-50 max-h-56 overflow-y-auto no-scrollbar">
                        {servers && servers.length > 0 ? (
                          servers.map((srv, idx) => {
                            const isCurrent =
                              activeServerId === srv.data_id &&
                              activeServerType === srv.type;
                            return (
                              <button
                                key={srv.data_id || idx}
                                onClick={() => {
                                  setActiveServerId(srv.data_id);
                                  setActiveServerType(srv.type);
                                  setActiveServerName(srv.serverName);
                                  setShowServerDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                                  isCurrent
                                    ? "bg-purple-900/40 text-purple-300 font-semibold"
                                    : "text-zinc-300 hover:bg-zinc-800"
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <FontAwesomeIcon
                                    icon={faBolt}
                                    className="text-[10px] text-zinc-400"
                                  />
                                  {srv.serverName} ({srv.type})
                                </span>
                                {isCurrent && (
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="text-[10px] text-purple-400"
                                  />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-3 py-2 text-xs text-zinc-500">
                            No other servers
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Report, Download, Share */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-medium transition-colors"
                  >
                    <FontAwesomeIcon icon={faFlag} className="text-[10px]" />
                    <span>Report</span>
                  </button>

                  <a
                    href={streamUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-medium transition-colors"
                  >
                    <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-medium transition-colors"
                  >
                    <FontAwesomeIcon icon={faShareNodes} className="text-[10px]" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Anime Details Card (Miruro Screenshot 2 Style) */}
            <div className="w-full bg-[#131318] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Poster & External Links */}
                <div className="flex flex-col items-center sm:items-start shrink-0 gap-3">
                  <div className="w-36 sm:w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-zinc-700/50 bg-zinc-900">
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
                    className="w-full py-1.5 px-3 bg-[#1c1c24] hover:bg-[#252532] border border-zinc-700/80 rounded-lg flex items-center justify-center gap-2 text-xs font-bold tracking-wider text-zinc-200 transition-colors uppercase"
                  >
                    <span>Trailer</span>
                    <FontAwesomeIcon icon={faPlay} className="text-[10px] text-green-400" />
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
                      className="py-1 px-2 bg-[#1c1c24] hover:bg-[#252532] border border-zinc-700/80 rounded-lg text-center text-xs font-bold text-zinc-300 hover:text-white transition-colors"
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
                      className="py-1 px-2 bg-[#1c1c24] hover:bg-[#252532] border border-zinc-700/80 rounded-lg text-center text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                    >
                      MAL
                    </a>
                  </div>
                </div>

                {/* Right Details: Title, Romaji, Cyan Genres, Synopsis, 2-col Metadata Grid */}
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

                    {/* Cyan Genre Pills */}
                    <div className="flex flex-wrap gap-2 mt-3.5">
                      {animeInfo?.animeInfo?.Genres &&
                      animeInfo.animeInfo.Genres.length > 0 ? (
                        animeInfo.animeInfo.Genres.map((genre, idx) => (
                          <Link
                            key={idx}
                            to={`/category/${genre.toLowerCase()}`}
                            className="px-3 py-1 bg-[#062c30] text-[#22d3ee] border border-[#0e4854] hover:border-[#22d3ee] rounded-full text-xs font-semibold transition-colors"
                          >
                            {genre}
                          </Link>
                        ))
                      ) : (
                        <span className="px-3 py-1 bg-[#062c30] text-[#22d3ee] border border-[#0e4854] rounded-full text-xs font-semibold">
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
                              className="text-purple-400 hover:text-purple-300 font-semibold ml-1 cursor-pointer transition-colors"
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

            {/* The Anime Community Comments Section (Miruro Style) */}
            <div className="w-full bg-[#131318] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase">
                    The Anime Community
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Comments
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <button className="hover:text-zinc-300 transition-colors">Rules</button>
                    <span>•</span>
                    <button className="hover:text-zinc-300 transition-colors">FAQ</button>
                  </div>
                </div>

                {/* Right Tab controls: ANIME vs EP */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#1c1c24] p-1 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => setCommentTab("anime")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        commentTab === "anime"
                          ? "bg-purple-600 text-white shadow-md"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <FontAwesomeIcon icon={faComments} className="text-[10px]" />
                      <span>ANIME</span>
                    </button>
                    <button
                      onClick={() => setCommentTab("episode")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        commentTab === "episode"
                          ? "bg-purple-600 text-white shadow-md"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <FontAwesomeIcon icon={faComments} className="text-[10px]" />
                      <span>EP {activeEpisodeNum || 1}</span>
                    </button>
                  </div>

                  <button
                    title="Help"
                    className="w-8 h-8 rounded-xl bg-[#1c1c24] border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors"
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} />
                  </button>

                  <button className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors">
                    Log In
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-[#1c1c24] hover:bg-[#252530] border border-zinc-800 text-zinc-200 text-xs font-bold transition-colors">
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Comments Count & Sort By */}
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">
                  {commentsList.length + 291} Comments
                </span>
                <div className="flex items-center gap-1.5">
                  <span>Sort By:</span>
                  <select
                    value={commentSort}
                    onChange={(e) => setCommentSort(e.target.value)}
                    className="bg-[#1c1c24] border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-purple-500"
                  >
                    <option value="Top">Top</option>
                    <option value="Newest">Newest</option>
                    <option value="Oldest">Oldest</option>
                  </select>
                </div>
              </div>

              {/* Comment Input Box */}
              <form onSubmit={handleAddComment} className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=UserGuest"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    rows={2}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Log in to comment or write your thoughts..."
                    className="w-full bg-[#181820] text-xs text-zinc-200 placeholder-zinc-500 p-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!commentInput.trim()}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        commentInput.trim()
                          ? "bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-md"
                          : "bg-zinc-800/80 text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </form>

              {/* Community Comments Feed */}
              <div className="space-y-4 pt-2">
                {commentsList.map((c) => (
                  <div key={c.id} className="flex gap-3 items-start">
                    <img
                      src={c.avatar}
                      alt={c.author}
                      className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700/60 object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200">
                          {c.author}
                        </span>
                        {c.badge && (
                          <span className="text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded">
                            {c.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500">• {c.time}</span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        {c.text}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                        <button className="flex items-center gap-1 hover:text-purple-300 transition-colors">
                          <FontAwesomeIcon icon={faThumbsUp} className="text-[10px]" />
                          <span>{c.likes}</span>
                        </button>
                        <button className="hover:text-red-400 transition-colors">
                          <FontAwesomeIcon icon={faThumbsDown} className="text-[10px]" />
                        </button>
                        <button className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
                          <FontAwesomeIcon icon={faReply} className="text-[10px]" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Episode Drawer, Next Episode Schedule, SEASONS, RELATED, RECOMMENDATIONS */}
          <div className="flex flex-col gap-5 w-full min-w-0">
            {/* Episode List Drawer */}
            <div className="w-full">
              {!episodes ? (
                <div className="h-64 flex items-center justify-center bg-[#111115] border border-zinc-800/80 rounded-2xl">
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

            {/* Next Episode Schedule Notification */}
            <div className="w-full bg-[#141419] border border-zinc-800/80 rounded-2xl p-3.5 flex items-center justify-between text-xs shadow-lg">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faBell} className="text-purple-400 text-xs" />
                </div>
                <span className="font-semibold text-zinc-200">
                  {nextEpisodeString}
                </span>
              </div>
            </div>

            {/* SEASONS Section (Miruro Screenshot 2 Style) */}
            {seasons && seasons.length > 0 && (
              <div className="w-full bg-[#131318] border border-zinc-800/80 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3 text-white font-bold text-sm tracking-wide">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-purple-400 text-xs" />
                  <span>SEASONS</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {seasons.map((season, index) => {
                    const isCurrentSeason = animeId === String(season.id);
                    return (
                      <Link
                        to={`/${season.id}`}
                        key={season.id || index}
                        className={`relative aspect-[16/8] rounded-xl overflow-hidden cursor-pointer group border transition-all ${
                          isCurrentSeason
                            ? "border-purple-500 ring-2 ring-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-purple-950/40"
                            : "border-zinc-800 hover:border-zinc-700 bg-zinc-900"
                        }`}
                      >
                        {/* Background Poster Image */}
                        {season.season_poster ? (
                          <img
                            src={season.season_poster}
                            alt={season.season}
                            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              isCurrentSeason ? "opacity-40" : "opacity-30 group-hover:opacity-45"
                            }`}
                          />
                        ) : null}

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                        {/* Centered Season Title */}
                        <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                          <span
                            className={`text-xs font-bold transition-colors ${
                              isCurrentSeason
                                ? "text-purple-300"
                                : "text-zinc-200 group-hover:text-white"
                            }`}
                          >
                            {season.season}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RELATED Section (Miruro Screenshot 2 Style) */}
            {animeInfo?.related_data && animeInfo.related_data.length > 0 && (
              <div className="w-full bg-[#131318] border border-zinc-800/80 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-1.5 mb-3 text-white font-bold text-sm tracking-wide">
                  <FontAwesomeIcon icon={faChevronRight} className="text-purple-400 text-xs" />
                  <span>RELATED</span>
                </div>
                <div className="space-y-2">
                  {animeInfo.related_data.slice(0, 5).map((item, idx) => (
                    <Link
                      key={item.id || idx}
                      to={`/${item.id}`}
                      className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#1c1c24] border border-transparent hover:border-zinc-800 transition-all group"
                    >
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-11 h-14 object-cover rounded-lg bg-zinc-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-purple-300 line-clamp-1 transition-colors">
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

            {/* RECOMMENDATIONS Section (Miruro Screenshot 2 Style) */}
            {animeInfo?.recommended_data && animeInfo.recommended_data.length > 0 && (
              <div className="w-full bg-[#131318] border border-zinc-800/80 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-1.5 mb-3 text-white font-bold text-sm tracking-wide">
                  <FontAwesomeIcon icon={faChevronRight} className="text-purple-400 text-xs" />
                  <span>RECOMMENDATIONS</span>
                </div>
                <div className="space-y-2">
                  {animeInfo.recommended_data.slice(0, 6).map((item, idx) => (
                    <Link
                      key={item.id || idx}
                      to={`/${item.id}`}
                      className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#1c1c24] border border-transparent hover:border-zinc-800 transition-all group"
                    >
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-11 h-14 object-cover rounded-lg bg-zinc-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-purple-300 line-clamp-1 transition-colors">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
          onClick={() => {
            setShowReportModal(false);
            setReportSubmitted(false);
          }}
        >
          <div
            className="bg-[#181820] border border-zinc-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faFlag} className="text-red-400" />
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
                <div className="w-10 h-10 rounded-full bg-green-950 border border-green-500/40 text-green-400 flex items-center justify-center mx-auto">
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
                    <input type="radio" name="report_reason" defaultChecked className="accent-purple-500" />
                    <span className="text-zinc-200">Video player not loading or buffering indefinitely</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                    <input type="radio" name="report_reason" className="accent-purple-500" />
                    <span className="text-zinc-200">Audio out of sync or missing</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                    <input type="radio" name="report_reason" className="accent-purple-500" />
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
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
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
