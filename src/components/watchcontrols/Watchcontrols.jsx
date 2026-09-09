import { 
  faCheck, 
  faSquare, 
  faLightbulb, 
  faKeyboard, 
  faPlay, 
  faChevronLeft, 
  faChevronRight, 
  faTimes 
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { getCleanEpisodeId, findEpisodeIndex } from "@/src/helper/episodeHelper";

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
  lightsOff,
  onToggleLightsOff,
}) {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    findEpisodeIndex(episodes, episodeId)
  );
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = findEpisodeIndex(episodes, episodeId);
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);

  const prevEp = currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
  const nextEp =
    currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1
      ? episodes[currentEpisodeIndex + 1]
      : null;

  const prevEpNum = prevEp?.episode_no ?? prevEp?.number ?? (currentEpisodeIndex > 0 ? currentEpisodeIndex : null);
  const nextEpNum = nextEp?.episode_no ?? nextEp?.number ?? (currentEpisodeIndex >= 0 ? currentEpisodeIndex + 2 : null);

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-y-2 px-3 py-2 bg-[#121215] border-t border-b border-zinc-800/80 text-xs select-none">
      {/* Left toggles & utility buttons */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-zinc-400">
        {/* Autoplay */}
        <button
          onClick={() => setAutoPlay?.((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            autoPlay ? "text-zinc-100 font-medium" : "hover:text-zinc-200"
          }`}
        >
          <FontAwesomeIcon
            icon={faCheck}
            className={`text-[10px] ${autoPlay ? "text-purple-400" : "text-zinc-500"}`}
          />
          <span>Autoplay</span>
        </button>

        {/* Auto Skip */}
        <button
          onClick={() => setAutoSkipIntro?.((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            autoSkipIntro ? "text-purple-300 font-medium" : "hover:text-zinc-200"
          }`}
        >
          <FontAwesomeIcon
            icon={faSquare}
            className={`text-[9px] ${autoSkipIntro ? "text-purple-400" : "text-zinc-600"}`}
          />
          <span>Auto Skip</span>
        </button>

        {/* Auto Next */}
        <button
          onClick={() => setAutoNext?.((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            autoNext ? "text-zinc-100 font-medium" : "hover:text-zinc-200"
          }`}
        >
          <FontAwesomeIcon
            icon={faCheck}
            className={`text-[10px] ${autoNext ? "text-purple-400" : "text-zinc-500"}`}
          />
          <span>Auto Next</span>
        </button>

        {/* Shortcuts */}
        <button
          onClick={() => setShowShortcutsModal(true)}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:text-zinc-200 transition-colors"
        >
          <FontAwesomeIcon icon={faKeyboard} className="text-[11px] text-zinc-500" />
          <span>Shortcuts</span>
        </button>

        {/* Lights Off */}
        <button
          onClick={() => onToggleLightsOff?.()}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            lightsOff ? "text-amber-300 font-medium" : "hover:text-zinc-200"
          }`}
        >
          <FontAwesomeIcon
            icon={faLightbulb}
            className={`text-[11px] ${lightsOff ? "text-amber-400" : "text-zinc-500"}`}
          />
          <span>Lights {lightsOff ? "On" : "Off"}</span>
        </button>

        {/* Player Badge */}
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-zinc-800/80 text-zinc-400">
          <FontAwesomeIcon icon={faPlay} className="text-[8px] text-purple-400" />
          <span>Player</span>
        </div>
      </div>

      {/* Right navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (prevEp) {
              const prevId = getCleanEpisodeId(prevEp);
              if (prevId) onButtonClick(prevId);
            }
          }}
          disabled={!prevEp}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-800 transition-all ${
            !prevEp
              ? "opacity-40 cursor-not-allowed text-zinc-600 border-zinc-800/40"
              : "text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700"
          }`}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-[9px]" />
          <span>Episode {prevEpNum ?? "Prev"}</span>
        </button>

        <button
          onClick={() => {
            if (nextEp) {
              const nextId = getCleanEpisodeId(nextEp);
              if (nextId) onButtonClick(nextId);
            }
          }}
          disabled={!nextEp}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-800 transition-all ${
            !nextEp
              ? "opacity-40 cursor-not-allowed text-zinc-600 border-zinc-800/40"
              : "text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700"
          }`}
        >
          <span>Next {nextEpNum ? `${nextEpNum}` : ""}</span>
          <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
        </button>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div 
            className="bg-[#18181f] border border-zinc-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faKeyboard} className="text-purple-400" />
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">Play / Pause</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200">Space</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">Toggle Fullscreen</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200">F</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">Mute / Unmute</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200">M</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">Seek 5s Forward / Backward</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200">← / →</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">Volume Up / Down</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200">↑ / ↓</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
