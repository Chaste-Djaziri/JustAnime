import { faBackward, faForward } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { getCleanEpisodeId, findEpisodeIndex } from "@/src/helper/episodeHelper";

const ToggleButton = ({ label, isActive, onClick }) => (
  <button 
    className="flex items-center text-xs px-2 py-0.5 rounded transition-colors hover:bg-[#2a2a2a]" 
    onClick={onClick}
  >
    <span className="text-gray-300">{label}</span>
    <span
      className={`ml-1.5 ${
        isActive ? "text-white" : "text-gray-500"
      }`}
    >
      {isActive ? "ON" : "OFF"}
    </span>
  </button>
);

export default function WatchControls({
  autoPlay,
  setAutoPlay,
  autoSkipIntro,
  setAutoSkipIntro,
  autoNext,
  setAutoNext,
  episodeId,
  episodes = [],
  onButtonClick,
}) {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    findEpisodeIndex(episodes, episodeId)
  );

  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = findEpisodeIndex(episodes, episodeId);
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);

  return (
    <div className="w-full flex justify-between items-center px-3 py-2 border-b border-gray-800">
      <div className="flex gap-x-2">
        <ToggleButton
          label="Auto Play"
          isActive={autoPlay}
          onClick={() => setAutoPlay((prev) => !prev)}
        />
        <ToggleButton
          label="Skip Intro"
          isActive={autoSkipIntro}
          onClick={() => setAutoSkipIntro((prev) => !prev)}
        />
        <ToggleButton
          label="Auto Next"
          isActive={autoNext}
          onClick={() => setAutoNext((prev) => !prev)}
        />
      </div>
      <div className="flex items-center gap-x-2">
        <button
          onClick={() => {
            if (currentEpisodeIndex > 0) {
              const prevEp = episodes[currentEpisodeIndex - 1];
              const prevId = getCleanEpisodeId(prevEp);
              if (prevId) onButtonClick(prevId);
            }
          }}
          disabled={currentEpisodeIndex <= 0}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            currentEpisodeIndex <= 0 
              ? "text-gray-600 cursor-not-allowed" 
              : "text-gray-300 hover:text-white"
          }`}
          title="Previous Episode"
        >
          <FontAwesomeIcon icon={faBackward} className="text-[14px]" />
        </button>
        <button
          onClick={() => {
            if (currentEpisodeIndex < episodes?.length - 1) {
              const nextEp = episodes[currentEpisodeIndex + 1];
              const nextId = getCleanEpisodeId(nextEp);
              if (nextId) onButtonClick(nextId);
            }
          }}
          disabled={currentEpisodeIndex < 0 || currentEpisodeIndex >= episodes?.length - 1}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            currentEpisodeIndex < 0 || currentEpisodeIndex >= episodes?.length - 1 
              ? "text-gray-600 cursor-not-allowed" 
              : "text-gray-300 hover:text-white"
          }`}
          title="Next Episode"
        >
          <FontAwesomeIcon icon={faForward} className="text-[14px]" />
        </button>
      </div>
    </div>
  );
}
