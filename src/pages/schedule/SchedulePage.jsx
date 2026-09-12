import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faClock,
  faPlay,
  faMagnifyingGlass,
  faTableCellsLarge,
  faList,
  faChevronLeft,
  faChevronRight,
  faCircleDot,
  faCircleCheck,
  faStar,
  faArrowRight,
  faFilm,
} from "@fortawesome/free-solid-svg-icons";
import getSchedInfo from "@/src/utils/getScheduleInfo.utils";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import website_name from "@/src/config/website";

export default function SchedulePage() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'upcoming' | 'aired'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [imageErrors, setImageErrors] = useState({});
  const datesContainerRef = useRef(null);

  // Timezone string
  const timezoneOffset = -new Date().getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
  const offsetMins = Math.abs(timezoneOffset) % 60;
  const gmtString = `GMT ${timezoneOffset >= 0 ? "+" : "-"}${String(
    offsetHours
  ).padStart(2, "0")}:${String(offsetMins).padStart(2, "0")}`;

  // Generate 14-day rolling window: past 3 days, today, next 10 days
  useEffect(() => {
    document.title = `Estimated Airing Schedule - ${website_name}`;

    const daysList = [];
    const base = new Date();
    for (let i = -3; i <= 10; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);

      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, "0");
      const dayStr = String(d.getDate()).padStart(2, "0");
      const fulldate = `${yearStr}-${monthStr}-${dayStr}`;

      const isToday = i === 0;

      daysList.push({
        fulldate,
        dayNumber: d.getDate(),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        isToday,
      });
    }

    setDates(daysList);
    const todayItem = daysList.find((d) => d.isToday) || daysList[0];
    if (todayItem) {
      setSelectedDate(todayItem.fulldate);
    }

    // Live clock ticker
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch schedule whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;

    let isMounted = true;
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        // Check cache with v2 key (guarantees enriched posters)
        const cached = localStorage.getItem(`sched-page-v2-${selectedDate}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (
              Array.isArray(parsed) &&
              parsed.length > 0 &&
              parsed.some((item) => item.poster)
            ) {
              if (isMounted) {
                setScheduleData(parsed);
                setLoading(false);
              }
              return;
            }
          } catch (_) {}
        }

        const data = await getSchedInfo(selectedDate);
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setScheduleData(list);
          if (list.length > 0) {
            try {
              localStorage.setItem(
                `sched-page-v2-${selectedDate}`,
                JSON.stringify(list)
              );
            } catch (_) {}
          }
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
        if (isMounted) setScheduleData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSchedule();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Scroll date selector to selected date
  const scrollDates = (direction) => {
    if (datesContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      datesContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Helper to determine airing status relative to currentTime
  const getItemStatus = (item) => {
    if (!item?.time || !selectedDate) return "upcoming";
    try {
      const [hours, minutes] = item.time.split(":").map(Number);
      const [year, month, day] = selectedDate.split("-").map(Number);
      const itemDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);

      const diffMs = itemDate.getTime() - currentTime.getTime();
      if (diffMs < -1800000) {
        return "aired"; // more than 30 mins ago
      } else if (diffMs <= 1800000 && diffMs >= -1800000) {
        return "airing"; // right now
      } else {
        return "upcoming";
      }
    } catch (_) {
      return "upcoming";
    }
  };

  // Filter items based on search and status
  const filteredSchedule = useMemo(() => {
    let list = scheduleData || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.name?.toLowerCase().includes(q) ||
          item.jname?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === "upcoming") {
      list = list.filter((item) => {
        const s = getItemStatus(item);
        return s === "upcoming" || s === "airing";
      });
    } else if (statusFilter === "aired") {
      list = list.filter((item) => getItemStatus(item) === "aired");
    }

    return list;
  }, [scheduleData, searchQuery, statusFilter, currentTime, selectedDate]);

  // Counts for pills
  const counts = useMemo(() => {
    const list = scheduleData || [];
    let upcoming = 0;
    let aired = 0;

    list.forEach((item) => {
      const s = getItemStatus(item);
      if (s === "aired") aired++;
      else upcoming++;
    });

    return { all: list.length, upcoming, aired };
  }, [scheduleData, currentTime, selectedDate]);

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="w-full min-h-screen pt-20 pb-16 px-3 sm:px-6 lg:px-10 max-w-[1920px] mx-auto text-zinc-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#18181b]/80 via-[#121214] to-[#0c0c0e] border border-white/10 p-6 sm:p-10 mb-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold tracking-wider uppercase mb-3 border border-white/10">
              <FontAwesomeIcon icon={faCalendarDays} className="text-[11px]" />
              <span>Broadcast Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Estimated Airing Schedule
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
              Keep track of weekly anime broadcasts, release timetables, and never miss your favorite episodes.
            </p>
          </div>

          {/* Clock & Timezone Widget */}
          <div className="flex flex-col sm:items-end gap-2 bg-[#1b1b1f]/90 border border-white/10 rounded-2xl p-4 sm:min-w-[260px] shadow-lg">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <FontAwesomeIcon icon={faClock} className="text-zinc-500 animate-pulse" />
              <span>LOCAL TIME ({gmtString})</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
            <div className="text-xs text-zinc-400">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Date Carousel & Navigator */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Select Date
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const today = dates.find((d) => d.isToday);
                if (today) setSelectedDate(today.fulldate);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-colors"
              title="Jump to Today"
            >
              Today
            </button>
            <button
              onClick={() => scrollDates("left")}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center text-xs"
              title="Previous days"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              onClick={() => scrollDates("right")}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center text-xs"
              title="Next days"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>

        {/* Date pills container with pt-3.5 to prevent "Today" badge clipping */}
        <div
          ref={datesContainerRef}
          className="flex items-center gap-3 overflow-x-auto pt-3.5 pb-2.5 scrollbar-hide select-none"
        >
          {dates.map((d) => {
            const isSelected = selectedDate === d.fulldate;
            return (
              <button
                key={d.fulldate}
                onClick={() => setSelectedDate(d.fulldate)}
                className={`relative flex flex-col items-center justify-center min-w-[85px] sm:min-w-[105px] py-3.5 px-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-[1.03] font-bold"
                    : "bg-[#141416] text-zinc-400 border-white/5 hover:border-white/20 hover:bg-[#1a1a1e] hover:text-white"
                }`}
              >
                {d.isToday && (
                  <span
                    className={`absolute -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                      isSelected ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    Today
                  </span>
                )}
                <span className="text-xs uppercase tracking-wider mb-1 font-semibold">
                  {d.dayName}
                </span>
                <span className="text-xl sm:text-2xl font-black">{d.dayNumber}</span>
                <span className="text-[11px] opacity-75">{d.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              statusFilter === "all"
                ? "bg-white text-black border-white"
                : "bg-[#161618] text-zinc-400 border-white/5 hover:text-white hover:bg-zinc-800"
            }`}
          >
            All Episodes ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter("upcoming")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              statusFilter === "upcoming"
                ? "bg-white text-black border-white"
                : "bg-[#161618] text-zinc-400 border-white/5 hover:text-white hover:bg-zinc-800"
            }`}
          >
            Upcoming ({counts.upcoming})
          </button>
          <button
            onClick={() => setStatusFilter("aired")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              statusFilter === "aired"
                ? "bg-white text-black border-white"
                : "bg-[#161618] text-zinc-400 border-white/5 hover:text-white hover:bg-zinc-800"
            }`}
          >
            Already Aired ({counts.aired})
          </button>
        </div>

        {/* Right: Search & View Mode */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"
            />
            <input
              type="text"
              placeholder="Search in schedule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161618] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#161618] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <FontAwesomeIcon icon={faTableCellsLarge} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                viewMode === "list"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="List View"
            >
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
          <BouncingLoader />
          <p className="text-xs text-zinc-400 tracking-wider uppercase animate-pulse">
            Loading anime schedule...
          </p>
        </div>
      ) : filteredSchedule.length === 0 ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center rounded-3xl bg-[#121214] border border-white/5 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 border border-white/10 flex items-center justify-center text-zinc-400 text-xl mb-4">
            <FontAwesomeIcon icon={faFilm} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            No Broadcasts Scheduled
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-6">
            {searchQuery
              ? `No anime in the schedule matched "${searchQuery}".`
              : "No anime releases found for this date. Check adjacent dates or return to today."}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={() => {
                const today = dates.find((d) => d.isToday);
                if (today) setSelectedDate(today.fulldate);
              }}
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
            >
              Go to Today
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View: Authentic anime card ratio (aspect-[3/4]) */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredSchedule.map((item, idx) => {
            const status = getItemStatus(item);
            const targetUrl = `/watch/${item.id}`;
            const isImgBroken = imageErrors[item.id || idx];
            const hasPoster = Boolean(item.poster) && !isImgBroken;

            return (
              <div
                key={item.id || idx}
                className="group relative flex flex-col rounded-2xl bg-[#141417] hover:bg-[#19191e] border border-white/5 hover:border-white/20 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5"
              >
                {/* Vertical Poster Header (3/4 ratio) */}
                <Link
                  to={targetUrl}
                  className="relative block aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900"
                >
                  {hasPoster ? (
                    <img
                      src={item.poster}
                      alt={item.title || "Anime"}
                      onError={() => handleImageError(item.id || idx)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    /* Stylized Gradient Poster Fallback with Initials */
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1a1c23] via-[#121318] to-[#0a0a0c] text-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 text-lg mb-2 shadow-inner">
                        <FontAwesomeIcon icon={faFilm} />
                      </div>
                      <span className="text-xs font-bold text-zinc-300 line-clamp-2 px-2">
                        {item.title}
                      </span>
                    </div>
                  )}

                  {/* Gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-black/20 to-black/60 pointer-events-none" />

                  {/* Airing Time Badge (Top-Left) */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-white font-mono text-[11px] font-bold shadow-lg">
                    <FontAwesomeIcon icon={faClock} className="text-[9px] text-zinc-400" />
                    <span>{item.time || "TBA"}</span>
                  </div>

                  {/* Airing Status Badge (Top-Right) */}
                  <div className="absolute top-2.5 right-2.5">
                    {status === "airing" && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live
                      </span>
                    )}
                    {status === "aired" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-zinc-400 border border-white/15 text-[10px] font-semibold">
                        <FontAwesomeIcon icon={faCircleCheck} className="text-[9px]" />
                        Aired
                      </span>
                    )}
                    {status === "upcoming" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-500/30 text-[10px] font-semibold">
                        <FontAwesomeIcon icon={faCircleDot} className="text-[8px] text-blue-400" />
                        Upcoming
                      </span>
                    )}
                  </div>

                  {/* Episode Pill (Bottom-Right overlay) */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white text-black text-[11px] font-extrabold shadow-lg">
                    EP {item.episode_no || "?"}
                  </div>

                  {/* Score badge (Bottom-Left overlay, if available) */}
                  {item.score && (
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-amber-400 text-[11px] font-bold">
                      <FontAwesomeIcon icon={faStar} className="text-[9px]" />
                      <span>{item.score}</span>
                    </div>
                  )}
                </Link>

                {/* Details Section */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Format & First Genre */}
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mb-1 font-medium">
                      {item.format && (
                        <span className="uppercase font-semibold tracking-wider text-zinc-300">
                          {item.format}
                        </span>
                      )}
                      {item.format && item.genres?.length > 0 && <span>•</span>}
                      {item.genres?.slice(0, 1).map((g) => (
                        <span key={g} className="truncate text-zinc-400">
                          {g}
                        </span>
                      ))}
                    </div>

                    {/* Anime Title */}
                    <Link to={targetUrl} className="block group/title">
                      <h3
                        className="text-xs sm:text-sm font-bold text-white group-hover/title:text-zinc-200 line-clamp-2 leading-snug mb-1"
                        title={item.title}
                      >
                        {item.title}
                      </h3>
                    </Link>

                    {/* Japanese/Romaji Subtitle */}
                    {item.jname && item.jname !== item.title && (
                      <p className="text-[11px] text-zinc-500 line-clamp-1 italic mb-2">
                        {item.jname}
                      </p>
                    )}
                  </div>

                  {/* Action Link Footer */}
                  <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">
                      {status === "aired" ? "Available now" : "Scheduled"}
                    </span>
                    <Link
                      to={targetUrl}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white group-hover:text-zinc-300 hover:underline transition-colors"
                    >
                      <span>Watch</span>
                      <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View: Chronological schedule timeline */
        <div className="flex flex-col gap-2 rounded-2xl bg-[#121214] border border-white/5 p-2 sm:p-3 overflow-hidden shadow-xl">
          {filteredSchedule.map((item, idx) => {
            const status = getItemStatus(item);
            const targetUrl = `/watch/${item.id}`;
            const isImgBroken = imageErrors[item.id || idx];
            const hasPoster = Boolean(item.poster) && !isImgBroken;

            return (
              <div
                key={item.id || idx}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-transparent hover:bg-white/[0.04] transition-colors gap-3 border-b border-white/5 last:border-0"
              >
                {/* Left: Time + Poster Thumbnail + Title */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {/* Airing Time */}
                  <div className="flex flex-col items-center justify-center min-w-[55px] sm:min-w-[65px] px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 font-mono text-xs font-bold text-zinc-200 shadow-sm">
                    <span>{item.time || "TBA"}</span>
                  </div>

                  {/* Portrait Thumbnail */}
                  <Link
                    to={targetUrl}
                    className="relative w-12 h-16 sm:w-14 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-800 border border-white/5"
                  >
                    {hasPoster ? (
                      <img
                        src={item.poster}
                        alt={item.title || "Anime"}
                        onError={() => handleImageError(item.id || idx)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                        <FontAwesomeIcon icon={faFilm} className="text-sm" />
                      </div>
                    )}
                  </Link>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    <Link to={targetUrl} className="block hover:underline">
                      <h3 className="text-sm font-bold text-white truncate mb-1">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-center flex-wrap gap-2 text-xs text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold text-[11px]">
                        EP {item.episode_no || "?"}
                      </span>
                      {status === "airing" && (
                        <span className="text-emerald-400 font-bold text-[11px] uppercase">
                          • Live Now
                        </span>
                      )}
                      {status === "aired" && (
                        <span className="text-zinc-500 text-[11px]">• Aired</span>
                      )}
                      {status === "upcoming" && (
                        <span className="text-blue-400 text-[11px]">• Upcoming</span>
                      )}
                      {item.score && (
                        <span className="text-amber-400 text-[11px] flex items-center gap-1">
                          <FontAwesomeIcon icon={faStar} className="text-[9px]" />
                          {item.score}
                        </span>
                      )}
                      {item.format && (
                        <span className="text-zinc-500 text-[11px]">• {item.format}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Watch Button */}
                <div className="shrink-0 pl-2">
                  <Link
                    to={targetUrl}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors shadow-sm"
                  >
                    <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
                    <span className="hidden sm:inline">Watch</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

