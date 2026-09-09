import { useLanguage } from "@/src/context/LanguageContext";
import {
  faAngleDown,
  faCirclePlay,
  faCheck,
  faMagnifyingGlass,
  faImage,
  faEye,
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef, useMemo } from "react";
import { getCleanEpisodeId, isEpisodeMatch } from "@/src/helper/episodeHelper";
import "./Episodelist.css";

function Episodelist({
  episodes = [],
  onEpisodeClick,
  currentEpisode,
  totalEpisodes,
  animePoster,
}) {
  const [activeEpisodeId, setActiveEpisodeId] = useState(currentEpisode);
  const [viewMode, setViewMode] = useState("thumbnail"); // "thumbnail" or "list"
  const { language } = useLanguage();
  const listContainerRef = useRef(null);
  const activeEpisodeRef = useRef(null);
  const [showDropDown, setShowDropDown] = useState(false);
  const [selectedRange, setSelectedRange] = useState([1, 100]);
  const [activeRange, setActiveRange] = useState("1-100");
  const [searchTerm, setSearchTerm] = useState("");
  const dropDownRef = useRef(null);

  const epTotal = totalEpisodes || episodes?.length || 0;

  const scrollToActiveEpisode = () => {
    if (activeEpisodeRef.current && listContainerRef.current) {
      const container = listContainerRef.current;
      const activeEpisode = activeEpisodeRef.current;
      const containerTop = container.getBoundingClientRect().top;
      const containerHeight = container.clientHeight;
      const activeEpisodeTop = activeEpisode.getBoundingClientRect().top;
      const activeEpisodeHeight = activeEpisode.clientHeight;
      const offset = activeEpisodeTop - containerTop;
      container.scrollTop =
        container.scrollTop +
        offset -
        containerHeight / 2 +
        activeEpisodeHeight / 2;
    }
  };

  useEffect(() => {
    setActiveEpisodeId(currentEpisode);
  }, [currentEpisode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToActiveEpisode();
    }, 150);
    return () => clearTimeout(timer);
  }, [activeEpisodeId, viewMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setShowDropDown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function findRangeForEpisode(episodeNumber) {
    const step = 100;
    const start = Math.floor((episodeNumber - 1) / step) * step + 1;
    const end = Math.min(start + step - 1, epTotal || 100);
    return [start, end];
  }

  useEffect(() => {
    if (currentEpisode && epTotal) {
      const activeEp = episodes?.find((ep) => isEpisodeMatch(ep, currentEpisode));
      const epNum = activeEp?.episode_no ?? activeEp?.number ?? Number(currentEpisode);
      if (!isNaN(epNum) && epNum > 0) {
        const newRange = findRangeForEpisode(epNum);
        setSelectedRange(newRange);
        setActiveRange(`${newRange[0]}-${newRange[1]}`);
      }
    }
  }, [currentEpisode, epTotal, episodes]);

  const handleRangeSelect = (range) => {
    const [start, end] = range.split("-").map(Number);
    setSelectedRange([start, end]);
    setActiveRange(range);
  };

  const filteredEpisodes = useMemo(() => {
    if (!episodes) return [];
    let list = episodes;

    // Filter by search query if provided
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((ep, idx) => {
        const epNum = String(ep?.episode_no ?? ep?.number ?? idx + 1);
        const title = (ep?.title || "").toLowerCase();
        const jTitle = (ep?.japanese_title || "").toLowerCase();
        return epNum === q || epNum.includes(q) || title.includes(q) || jTitle.includes(q);
      });
    } else if (epTotal > 100) {
      list = list.slice(selectedRange[0] - 1, selectedRange[1]);
    }

    return list;
  }, [episodes, searchTerm, epTotal, selectedRange]);

  const ranges = useMemo(() => {
    if (!epTotal) return ["1-100"];
    const count = Math.ceil(epTotal / 100);
    return Array.from({ length: count }, (_, i) => {
      const start = i * 100 + 1;
      const end = Math.min((i + 1) * 100, epTotal);
      return `${start}-${end}`;
    });
  }, [epTotal]);

  return (
    <div className="flex flex-col w-full h-full bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header Controls - Black & White Theme */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2.5 bg-[#161616] border-b border-zinc-800 gap-2">
        {/* Range Selector */}
        <div className="relative" ref={dropDownRef}>
          <button
            className="bg-[#222222] hover:bg-[#2c2c2c] text-xs text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-zinc-700 transition-colors font-medium"
            onClick={() => setShowDropDown((prev) => !prev)}
          >
            <span>{activeRange}</span>
            <FontAwesomeIcon
              icon={faAngleDown}
              className={`text-[10px] text-zinc-400 transition-transform duration-200 ${
                showDropDown ? "rotate-180" : ""
              }`}
            />
          </button>
          {showDropDown && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-[#1b1b1b] border border-zinc-700 rounded-xl shadow-2xl py-1 z-50 max-h-56 overflow-y-auto no-scrollbar">
              {ranges.map((range) => {
                const isSelected = activeRange === range;
                return (
                  <div
                    key={range}
                    className={`px-3 py-1.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-white text-black font-bold"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                    onClick={() => {
                      handleRangeSelect(range);
                      setShowDropDown(false);
                    }}
                  >
                    <span>{range}</span>
                    {isSelected && (
                      <FontAwesomeIcon icon={faCheck} className="text-[10px] text-black" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter Input */}
        <div className="relative flex-1 max-w-[200px]">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs pointer-events-none"
          />
          <input
            type="text"
            placeholder="Filter episodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#222222] text-xs text-white placeholder-zinc-500 pl-7 pr-2 py-1.5 rounded-lg border border-zinc-750 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
          />
        </div>

        {/* View Mode Toggles */}
        <div className="flex items-center gap-1 bg-[#1c1c1c] p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => setViewMode("list")}
            title="Compact View"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={faEye} className="text-[11px] block" />
          </button>
          <button
            onClick={() => setViewMode("thumbnail")}
            title="Thumbnail View"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "thumbnail"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={faImage} className="text-[11px] block" />
          </button>
        </div>
      </div>

      {/* Episode Container */}
      <div
        ref={listContainerRef}
        className="w-full flex-1 overflow-y-auto p-2.5 space-y-2 max-h-[calc(100vh-230px)] max-[1200px]:max-h-[460px] custom-scrollbar"
      >
        {filteredEpisodes.length === 0 ? (
          <div className="text-center py-10 text-xs text-zinc-500">
            No episodes found.
          </div>
        ) : viewMode === "thumbnail" ? (
          // Thumbnail View - Black and White Theme
          filteredEpisodes.map((item, index) => {
            const epCleanId = getCleanEpisodeId(item);
            const isActive =
              isEpisodeMatch(item, activeEpisodeId) ||
              isEpisodeMatch(item, currentEpisode);
            const epNum = item?.episode_no ?? item?.number ?? (index + 1);
            const epTitle =
              language === "EN"
                ? item?.title || `Episode ${epNum}`
                : item?.japanese_title || item?.title || `Episode ${epNum}`;
            const epImage = item?.image || item?.thumbnail || animePoster;

            return (
              <div
                key={item?.id || index}
                ref={isActive ? activeEpisodeRef : null}
                onClick={() => {
                  if (epCleanId) {
                    onEpisodeClick(epCleanId);
                    setActiveEpisodeId(epCleanId);
                  }
                }}
                className={`group flex items-start gap-3 p-2 rounded-xl transition-all cursor-pointer border ${
                  isActive
                    ? "bg-[#252528] border-white/90 shadow-[0_0_15px_rgba(255,255,255,0.12)] ring-1 ring-white/60"
                    : "bg-[#18181b] border-zinc-800 hover:bg-[#222226] hover:border-zinc-700"
                }`}
              >
                {/* Thumbnail with EP Badge */}
                <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                  {epImage ? (
                    <img
                      src={epImage}
                      alt={`EP ${epNum}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                      <FontAwesomeIcon icon={faCirclePlay} className="text-lg" />
                    </div>
                  )}
                  <div className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight ${
                    isActive ? "bg-white text-black font-extrabold" : "bg-black/80 text-white border border-white/10"
                  }`}>
                    EP {epNum}
                  </div>
                </div>

                {/* Right Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                  <div>
                    <h4
                      className={`text-xs font-medium line-clamp-1 transition-colors ${
                        isActive
                          ? "text-white font-bold"
                          : "text-zinc-200 group-hover:text-white"
                      }`}
                    >
                      {epTitle}
                    </h4>
                    {item?.description && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Badges & Date */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1.5 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">
                        <FontAwesomeIcon icon={faClosedCaptioning} className="text-[9px]" />
                      </span>
                      <span className="flex items-center gap-1 bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">
                        <FontAwesomeIcon icon={faMicrophone} className="text-[9px]" />
                      </span>
                    </div>
                    {item?.airdate ? (
                      <span className="text-zinc-500 font-medium">
                        {item.airdate}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Compact / Grid View - Black and White
          <div className="grid grid-cols-5 gap-1.5 p-1">
            {filteredEpisodes.map((item, index) => {
              const epCleanId = getCleanEpisodeId(item);
              const isActive =
                isEpisodeMatch(item, activeEpisodeId) ||
                isEpisodeMatch(item, currentEpisode);
              const epNum = item?.episode_no ?? item?.number ?? (index + 1);

              return (
                <div
                  key={item?.id || index}
                  ref={isActive ? activeEpisodeRef : null}
                  onClick={() => {
                    if (epCleanId) {
                      onEpisodeClick(epCleanId);
                      setActiveEpisodeId(epCleanId);
                    }
                  }}
                  className={`flex items-center justify-center rounded-lg h-9 text-xs font-semibold cursor-pointer transition-all border ${
                    isActive
                      ? "bg-white text-black border-white shadow-md font-bold"
                      : "bg-[#1f1f1f] text-zinc-300 border-zinc-800 hover:bg-[#2c2c2c] hover:text-white"
                  }`}
                >
                  <span>{epNum}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Episodelist;
