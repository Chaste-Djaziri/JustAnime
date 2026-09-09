import { useLanguage } from "@/src/context/LanguageContext";
import {
  faAngleDown,
  faCirclePlay,
  faList,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { getCleanEpisodeId, isEpisodeMatch } from "@/src/helper/episodeHelper";
import "./Episodelist.css";

function Episodelist({
  episodes,
  onEpisodeClick,
  currentEpisode,
  totalEpisodes,
}) {
  const [activeEpisodeId, setActiveEpisodeId] = useState(currentEpisode);
  const { language } = useLanguage();
  const listContainerRef = useRef(null);
  const activeEpisodeRef = useRef(null);
  const [showDropDown, setShowDropDown] = useState(false);
  const [selectedRange, setSelectedRange] = useState([1, 100]);
  const [activeRange, setActiveRange] = useState("1-100");
  const [episodeNum, setEpisodeNum] = useState(currentEpisode);
  const dropDownRef = useRef(null);
  const [searchedEpisode, setSearchedEpisode] = useState(null);

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
    setActiveEpisodeId(episodeNum);
  }, [episodeNum]);
  useEffect(() => {
    scrollToActiveEpisode();
  }, [activeEpisodeId]);

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

  function handleChange(e) {
    const value = e.target.value;
    if (value.trim() === "") {
      const newRange = findRangeForEpisode(1);
      setSelectedRange(newRange);
      setActiveRange(`${newRange[0]}-${newRange[1]}`);
      setSearchedEpisode(null);
    } else if (!value || isNaN(value)) {
      setSearchedEpisode(null);
    } else if (
      !isNaN(value) &&
      parseInt(value, 10) > totalEpisodes &&
      episodeNum !== null
    ) {
      const newRange = findRangeForEpisode(episodeNum);
      setSelectedRange(newRange);
      setActiveRange(`${newRange[0]}-${newRange[1]}`);
      setSearchedEpisode(null);
    } else if (!isNaN(value) && value.trim() !== "") {
      const num = parseInt(value, 10);
      const foundEpisode = episodes?.find((item) => (item?.episode_no ?? item?.number) === num);
      if (foundEpisode) {
        const newRange = findRangeForEpisode(num);
        setSelectedRange(newRange);
        setActiveRange(`${newRange[0]}-${newRange[1]}`);
        setSearchedEpisode(foundEpisode?.id);
      }
    } else {
      setSearchedEpisode(null);
    }
  }

  function findRangeForEpisode(episodeNumber) {
    const step = 100;
    const start = Math.floor((episodeNumber - 1) / step) * step + 1;
    const end = Math.min(start + step - 1, totalEpisodes);
    return [start, end];
  }

  useEffect(() => {
    if (currentEpisode && totalEpisodes) {
      const activeEp = episodes?.find((ep) => isEpisodeMatch(ep, currentEpisode));
      const epNum = activeEp?.episode_no ?? activeEp?.number ?? Number(currentEpisode);
      if (!isNaN(epNum)) {
        const newRange = findRangeForEpisode(epNum);
        setSelectedRange(newRange);
        setActiveRange(`${newRange[0]}-${newRange[1]}`);
      }
    }
  }, [currentEpisode, totalEpisodes]);

  const handleRangeSelect = (range) => {
    const [start, end] = range.split("-").map(Number);
    setSelectedRange([start, end]);
  };

  useEffect(() => {
    const activeEpisode = episodes?.find((item) =>
      isEpisodeMatch(item, activeEpisodeId)
    );
    if (activeEpisode) {
      setEpisodeNum(activeEpisode?.episode_no ?? activeEpisode?.number);
    }
  }, [activeEpisodeId, episodes]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border-b border-[#2a2a2a] max-[600px]:px-2">
        <div className="flex items-center gap-4 max-[600px]:gap-2">
          <h1 className="text-[14px] font-semibold text-white max-[600px]:text-[13px]">Episodes</h1>
          {totalEpisodes > 100 && (
            <div className="flex items-center">
              <FontAwesomeIcon icon={faList} className="text-[#a0a0a0] text-xs mr-2" />
              <div className="relative" ref={dropDownRef}>
                <button
                  className="bg-[#242424] hover:bg-[#2a2a2a] text-xs text-white px-3 py-1 rounded flex items-center gap-2 transition-colors border border-[#333]"
                  onClick={() => setShowDropDown((prev) => !prev)}
                >
                  <span>EPS: {activeRange}</span>
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    className={`transition-transform duration-200 text-xs ${showDropDown ? "rotate-180" : ""}`}
                  />
                </button>
                {showDropDown && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-[#1f1f1f] border border-[#333] rounded-md shadow-xl py-1 z-50 max-h-60 overflow-y-auto no-scrollbar">
                    {Array.from(
                      { length: Math.ceil(totalEpisodes / 100) },
                      (_, i) => {
                        const start = i * 100 + 1;
                        const end = Math.min((i + 1) * 100, totalEpisodes);
                        const range = `${start}-${end}`;
                        const isSelected = activeRange === range;
                        return (
                          <div
                            key={range}
                            className={`px-3 py-1.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                              isSelected
                                ? "bg-[#2a2a2a] text-white font-medium"
                                : "text-gray-300 hover:bg-[#252525] hover:text-white"
                            }`}
                            onClick={() => {
                              handleRangeSelect(range);
                              setActiveRange(range);
                              setShowDropDown(false);
                            }}
                          >
                            <span>EPS: {range}</span>
                            {isSelected && (
                              <FontAwesomeIcon icon={faCheck} className="text-xs text-white" />
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {totalEpisodes > 20 && (
          <div className="flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Find EP"
                className="bg-[#242424] text-xs text-white placeholder-gray-500 px-2.5 py-1 pl-7 rounded w-28 focus:outline-none focus:ring-1 focus:ring-white border border-[#333] transition-all"
                onChange={handleChange}
              />
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
              />
            </div>
          </div>
        )}
      </div>
      
      <div ref={listContainerRef} className="w-full flex-1 overflow-y-auto bg-[#1a1a1a] max-h-[calc(100vh-200px)] max-[1200px]:max-h-[400px]">
        <div
          className={`${
            totalEpisodes > 30
              ? "p-4 grid gap-2 max-[600px]:p-2 max-[600px]:gap-1.5" + 
                (totalEpisodes > 100 
                  ? " grid-cols-5" 
                  : " grid-cols-5 max-[1200px]:grid-cols-12 max-[860px]:grid-cols-10 max-[575px]:grid-cols-8 max-[478px]:grid-cols-6 max-[350px]:grid-cols-5")
              : ""
          }`}
        >
          {totalEpisodes > 30
            ? episodes
                ?.slice(selectedRange[0] - 1, selectedRange[1])
                .map((item, index) => {
                  const epCleanId = getCleanEpisodeId(item);
                  const isActive =
                    isEpisodeMatch(item, activeEpisodeId) ||
                    isEpisodeMatch(item, currentEpisode);
                  const isSearched = searchedEpisode === item?.id;

                  return (
                    <div
                      key={item?.id || index}
                      ref={isActive ? activeEpisodeRef : null}
                      className={`flex items-center justify-center rounded-lg h-[35px] text-[13px] font-medium cursor-pointer transition-all max-[600px]:h-[30px] max-[600px]:text-[12px] ${
                        item?.filler
                          ? isActive
                            ? "bg-white text-black"
                            : "bg-[#2a2a2a] text-gray-400"
                          : ""
                      } hover:bg-[#404040] 
                          hover:text-white
                       ${
                         isActive
                           ? "bg-white text-black ring-1 ring-white"
                           : "bg-[#2a2a2a] text-gray-400"
                       } ${isSearched ? "ring-2 ring-white" : ""}`}
                      onClick={() => {
                        if (epCleanId) {
                          onEpisodeClick(epCleanId);
                          setActiveEpisodeId(epCleanId);
                          setSearchedEpisode(null);
                        }
                      }}
                    >
                      <span className="transition-colors">
                        {index + selectedRange[0]}
                      </span>
                    </div>
                  );
                })
            : episodes?.map((item, index) => {
                const epCleanId = getCleanEpisodeId(item);
                const isActive =
                  isEpisodeMatch(item, activeEpisodeId) ||
                  isEpisodeMatch(item, currentEpisode);
                const isSearched = searchedEpisode === item?.id;

                return (
                  <div
                    key={item?.id || index}
                    ref={isActive ? activeEpisodeRef : null}
                    className={`w-full px-4 py-2.5 flex items-center justify-start gap-x-4 cursor-pointer transition-all max-[600px]:px-3 max-[600px]:py-2 max-[600px]:gap-x-3 ${
                      (index + 1) % 2 && !isActive
                        ? "bg-[#202020]"
                        : "bg-[#1a1a1a]"
                    } hover:bg-[#2a2a2a] ${
                      isActive ? "bg-[#2a2a2a]" : ""
                    } ${isSearched ? "ring-1 ring-white" : ""}`}
                    onClick={() => {
                      if (epCleanId) {
                        onEpisodeClick(epCleanId);
                        setActiveEpisodeId(epCleanId);
                        setSearchedEpisode(null);
                      }
                    }}
                  >
                    <p className={`text-[14px] font-medium max-[600px]:text-[13px] ${isActive ? "text-white" : "text-gray-400"}`}>
                      {index + 1}
                    </p>
                    <div className="w-full flex items-center justify-between gap-x-[5px]">
                      <h1 className={`line-clamp-1 text-[14px] transition-colors max-[600px]:text-[13px] ${
                        isActive ? "text-white font-medium" : "text-gray-400 font-normal"
                      }`}>
                        {language === "EN" ? item?.title : (item?.japanese_title || item?.title)}
                      </h1>
                      {isActive && (
                        <FontAwesomeIcon
                          icon={faCirclePlay}
                          className="w-[18px] h-[18px] text-white max-[600px]:w-[16px] max-[600px]:h-[16px]"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

export default Episodelist;
