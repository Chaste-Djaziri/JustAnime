import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPlay,
  faCheck,
  faClock,
  faBookmark,
  faRotate,
  faArrowRightFromBracket,
  faFileImport,
  faStar,
  faTv,
  faCircleCheck,
  faCircleExclamation,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

export default function Profile() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const {
    user,
    token,
    animeLists,
    loading,
    syncing,
    error,
    isAuthenticated,
    isOAuth,
    loginWithAniList,
    importFromAniList,
    importFromMAL,
    logout,
    setError,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("continue");
  const [anilistInput, setAnilistInput] = useState("");
  const [malInput, setMalInput] = useState("");
  const [customClientId, setCustomClientId] = useState(
    () => localStorage.getItem("anilist_client_id") || ""
  );
  const [successNotice, setSuccessNotice] = useState(null);

  // Local continue watching list
  const [continueWatchingList, setContinueWatchingList] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("continueWatching") || "[]");
    setContinueWatchingList(list);
  }, [syncing]);

  const removeFromContinueWatching = (entry) => {
    const updated = continueWatchingList.filter(
      (item) => item.id !== entry.id && item.title !== entry.title
    );
    setContinueWatchingList(updated);
    localStorage.setItem("continueWatching", JSON.stringify(updated));
  };

  const handleAnilistImport = async (e) => {
    e.preventDefault();
    if (!anilistInput.trim()) return;
    try {
      const res = await importFromAniList(anilistInput.trim());
      setSuccessNotice(`Successfully imported AniList profile for "${res.name}"!`);
      setTimeout(() => setSuccessNotice(null), 4000);
      setAnilistInput("");
    } catch (err) {
      // error is handled in context
    }
  };

  const handleMALImport = async (e) => {
    e.preventDefault();
    if (!malInput.trim()) return;
    try {
      const res = await importFromMAL(malInput.trim());
      setSuccessNotice(`Successfully imported MyAnimeList profile for "${res.name}"!`);
      setTimeout(() => setSuccessNotice(null), 4000);
      setMalInput("");
    } catch (err) {
      // error is handled in context
    }
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (customClientId.trim()) {
      localStorage.setItem("anilist_client_id", customClientId.trim());
      setSuccessNotice("AniList Client ID saved!");
      setTimeout(() => setSuccessNotice(null), 3000);
    } else {
      localStorage.removeItem("anilist_client_id");
    }
  };

  const handleConnectOAuth = () => {
    try {
      loginWithAniList(customClientId.trim() || null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (user?.statistics) {
      return {
        count: user.statistics.count || 0,
        episodesWatched: user.statistics.episodesWatched || 0,
        hoursWatched: Math.round((user.statistics.minutesWatched || 0) / 60) || Math.round((user.statistics.daysWatched || 0) * 24) || 0,
        meanScore: user.statistics.meanScore || 0,
      };
    }
    const totalCount =
      (animeLists?.current?.length || 0) +
      (animeLists?.completed?.length || 0) +
      (animeLists?.planning?.length || 0);
    return {
      count: totalCount,
      episodesWatched: continueWatchingList.reduce((acc, c) => acc + (c.episodeNum || 1), 0),
      hoursWatched: Math.round(continueWatchingList.reduce((acc, c) => acc + ((c.episodeNum || 1) * 24), 0) / 60),
      meanScore: 0,
    };
  }, [user, animeLists, continueWatchingList]);

  // Current tab items
  const currentTabItems = useMemo(() => {
    if (activeTab === "continue") return continueWatchingList;
    if (activeTab === "watching") return animeLists?.current || [];
    if (activeTab === "completed") return animeLists?.completed || [];
    if (activeTab === "planning") return animeLists?.planning || [];
    return [];
  }, [activeTab, continueWatchingList, animeLists]);

  const resolveAnimeLink = (item) => {
    if (item.id && !item.id.startsWith("al-") && !item.id.startsWith("mal-")) {
      return `/watch/${item.id}${item.episodeId ? `?ep=${item.episodeId}` : ""}`;
    }
    const title = item.media?.title?.english || item.media?.title?.romaji || item.title || "";
    return `/search?query=${encodeURIComponent(title)}`;
  };

  return (
    <div className="w-full min-h-screen text-zinc-100 pb-20 pt-20">
      {/* Top Banner & Profile Header */}
      <div className="w-full bg-[#121214] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl mb-8 relative">
        {/* Banner image or subtle gradient */}
        <div className="w-full h-44 sm:h-64 relative bg-zinc-900 overflow-hidden">
          {user?.banner ? (
            <img
              src={user.banner}
              alt="Profile Banner"
              className="w-full h-full object-cover opacity-60 filter blur-xs"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-transparent" />
        </div>

        {/* User Info Bar */}
        <div className="px-6 sm:px-10 pb-8 pt-0 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-zinc-800 border-4 border-[#121214] overflow-hidden shadow-2xl shrink-0 flex items-center justify-center text-zinc-500 text-4xl">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FontAwesomeIcon icon={faUser} />
              )}
            </div>

            {/* Name & Provider badge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user?.name || (isAuthenticated ? "Anime Enthusiast" : "Guest Profile")}
                </h1>
                {isOAuth ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[11px] font-bold tracking-wide uppercase">
                    AniList Connected
                  </span>
                ) : user?.provider ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-semibold tracking-wide capitalize">
                    {user.provider} Synced
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-medium">
                    Local Device
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                {isAuthenticated
                  ? "Track, manage, and continue watching your synced anime library."
                  : "Connect your AniList or MyAnimeList profile to sync your watchlist."}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            {isOAuth ? (
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleConnectOAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-lg"
              >
                <span>Login with AniList</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeTab === "settings"
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faFileImport} />
              <span>Import / Sync</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="border-t border-zinc-800/80 bg-zinc-950/40 px-6 sm:px-10 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">{stats.count}</div>
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
              Anime Library
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">{stats.episodesWatched}</div>
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
              Episodes Watched
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">{stats.hoursWatched}h</div>
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
              Hours Watched
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats.meanScore ? `${stats.meanScore}%` : "—"}
            </div>
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
              Mean Score
            </div>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successNotice && (
        <div className="w-full mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
          <FontAwesomeIcon icon={faCircleCheck} className="text-sm" />
          <span>{successNotice}</span>
        </div>
      )}

      {error && (
        <div className="w-full mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-sm" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("continue")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "continue"
              ? "bg-white text-black shadow-lg"
              : "bg-[#141416] text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <FontAwesomeIcon icon={faClock} />
          <span>Continue Watching</span>
          {continueWatchingList.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                activeTab === "continue" ? "bg-black text-white" : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {continueWatchingList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("watching")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "watching"
              ? "bg-white text-black shadow-lg"
              : "bg-[#141416] text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <FontAwesomeIcon icon={faPlay} />
          <span>Currently Watching</span>
          {animeLists?.current?.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                activeTab === "watching" ? "bg-black text-white" : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {animeLists.current.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "completed"
              ? "bg-white text-black shadow-lg"
              : "bg-[#141416] text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <FontAwesomeIcon icon={faCheck} />
          <span>Completed</span>
          {animeLists?.completed?.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                activeTab === "completed" ? "bg-black text-white" : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {animeLists.completed.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("planning")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "planning"
              ? "bg-white text-black shadow-lg"
              : "bg-[#141416] text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <FontAwesomeIcon icon={faBookmark} />
          <span>Plan to Watch</span>
          {animeLists?.planning?.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                activeTab === "planning" ? "bg-black text-white" : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {animeLists.planning.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "settings"
              ? "bg-white text-black shadow-lg"
              : "bg-[#141416] text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <FontAwesomeIcon icon={faFileImport} />
          <span>Import & Sync</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "settings" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AniList Public Import */}
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-base">
                <FontAwesomeIcon icon={faFileImport} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Import from AniList</h3>
                <p className="text-xs text-zinc-400">
                  Instant import using your public AniList username or user ID (No password needed).
                </p>
              </div>
            </div>

            <form onSubmit={handleAnilistImport} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  AniList Username or ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. your_anilist_name or 123456"
                  value={anilistInput}
                  onChange={(e) => setAnilistInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={syncing || !anilistInput.trim()}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {syncing ? (
                  <>
                    <FontAwesomeIcon icon={faRotate} className="animate-spin" />
                    <span>Syncing AniList...</span>
                  </>
                ) : (
                  <span>Import AniList Watchlist</span>
                )}
              </button>
            </form>
          </div>

          {/* MyAnimeList Public Import */}
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-base">
                <FontAwesomeIcon icon={faFileImport} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Import from MyAnimeList</h3>
                <p className="text-xs text-zinc-400">
                  Import your public animelist directly from MyAnimeList using your username.
                </p>
              </div>
            </div>

            <form onSubmit={handleMALImport} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  MyAnimeList Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. mal_username"
                  value={malInput}
                  onChange={(e) => setMalInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={syncing || !malInput.trim()}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {syncing ? (
                  <>
                    <FontAwesomeIcon icon={faRotate} className="animate-spin" />
                    <span>Syncing MAL...</span>
                  </>
                ) : (
                  <span>Import MyAnimeList</span>
                )}
              </button>
            </form>
          </div>

          {/* AniList OAuth Client Configuration */}
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">AniList OAuth 2.0 Login Setup</h3>
                <p className="text-xs text-zinc-400">
                  To enable one-click OAuth login and automatic episode scrobbling to your AniList account, specify your AniList API Client ID.
                </p>
              </div>
              {isOAuth && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  Connected
                </span>
              )}
            </div>

            <form onSubmit={handleSaveClientId} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="AniList Client ID (e.g. 21980)"
                value={customClientId}
                onChange={(e) => setCustomClientId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
              >
                Save Client ID
              </button>
              <button
                type="button"
                onClick={handleConnectOAuth}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors"
              >
                Authorize with AniList
              </button>
            </form>
            <p className="text-[11px] text-zinc-500">
              Create an AniList API Client at{" "}
              <a
                href="https://anilist.co/settings/developer"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 underline hover:text-white"
              >
                anilist.co/settings/developer
              </a>{" "}
              with Redirect URL: <code className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-300">{`${window.location.origin}/auth/callback`}</code>
            </p>
          </div>
        </div>
      ) : currentTabItems.length === 0 ? (
        <div className="w-full bg-[#121214] border border-zinc-800 rounded-3xl p-12 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center text-2xl mx-auto">
            <FontAwesomeIcon icon={activeTab === "continue" ? faClock : faTv} />
          </div>
          <h3 className="text-lg font-bold text-white capitalize">
            No {activeTab.replace("-", " ")} Anime Found
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {activeTab === "continue"
              ? "Start watching an anime episode or import your AniList / MyAnimeList library to resume right here."
              : "Connect or import your AniList/MyAnimeList profile to view your anime library."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab("settings")}
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
            >
              Import Watchlist
            </button>
            <Link
              to="/home"
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 font-semibold text-xs hover:bg-zinc-700 transition-colors"
            >
              Browse Anime
            </Link>
          </div>
        </div>
      ) : (
        /* Anime Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {currentTabItems.map((item, idx) => {
            const title =
              item.media?.title?.english ||
              item.media?.title?.romaji ||
              item.title ||
              "Anime";
            const poster =
              item.media?.coverImage?.large ||
              item.media?.coverImage?.extraLarge ||
              item.poster ||
              "";
            const progress = item.progress ?? item.episodeNum ?? null;
            const totalEps = item.media?.episodes || item.totalEpisodes || null;
            const score = item.score || null;
            const linkUrl = resolveAnimeLink(item);

            return (
              <div
                key={item.id || idx}
                className="flex flex-col bg-[#141416] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300 group shadow-lg"
              >
                {/* Poster container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                  <img
                    src={poster}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Play Button Overlay */}
                  <Link
                    to={linkUrl}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform shadow-2xl">
                      {item.id && !item.id.startsWith("al-") && !item.id.startsWith("mal-") ? (
                        <FontAwesomeIcon icon={faPlay} className="text-base ml-0.5" />
                      ) : (
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                      )}
                    </div>
                  </Link>

                  {/* Delete from continue watching */}
                  {activeTab === "continue" && (
                    <button
                      onClick={() => removeFromContinueWatching(item)}
                      title="Remove from Continue Watching"
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white flex items-center justify-center text-xs transition-colors z-10"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}

                  {/* Score badge */}
                  {score ? (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs border border-white/10 text-yellow-400 font-bold text-[11px] flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="text-[9px]" />
                      <span>{score}</span>
                    </div>
                  ) : null}

                  {/* Badges on bottom */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-zinc-300 font-semibold z-10">
                    {progress !== null ? (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-700 text-white">
                        Ep {progress}
                        {totalEps ? ` / ${totalEps}` : ""}
                      </span>
                    ) : null}

                    {item.source && (
                      <span className="px-1.5 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 text-[9px] uppercase font-bold tracking-wider">
                        {item.source}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Title Info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <Link
                    to={linkUrl}
                    className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-2 transition-colors leading-snug"
                    title={title}
                  >
                    {title}
                  </Link>

                  {/* Progress bar for continue watching */}
                  {activeTab === "continue" && totalEps && progress ? (
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2.5">
                      <div
                        className="bg-white h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.round((progress / totalEps) * 100))}%`,
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
