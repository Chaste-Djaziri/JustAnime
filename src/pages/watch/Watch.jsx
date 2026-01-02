/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import { useWatch } from "@/src/hooks/useWatch";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import Episodelist from "@/src/components/episodelist/Episodelist";
import website_name from "@/src/config/website";
import {
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Servers from "@/src/components/servers/Servers";
import { Skeleton } from "@/src/components/ui/Skeleton/Skeleton";
import Watchcontrols from "@/src/components/watchcontrols/Watchcontrols";
import useWatchControl from "@/src/hooks/useWatchControl";
import Player from "@/src/components/player/Player";

export default function Watch() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: animeId } = useParams();
  const queryParams = new URLSearchParams(location.search);
  let initialEpisodeId = queryParams.get("ep");
  const [tags, setTags] = useState([]);
  const { language } = useLanguage();
  const isFirstSet = useRef(true);
  const [showNextEpisodeSchedule, setShowNextEpisodeSchedule] = useState(true);
  const {
    // error,
    buffering,
    streamInfo,
    streamUrl,
    animeInfo,
    episodes,
    nextEpisodeSchedule,
    animeInfoLoading,
    totalEpisodes,
    isFullOverview,
    intro,
    outro,
    subtitles,
    thumbnail,
    setIsFullOverview,
    activeEpisodeNum,
    episodeId,
    setEpisodeId,
    activeServerId,
    setActiveServerId,
    servers,
    serverLoading,
    activeServerType,
    setActiveServerType,
    activeServerName,
    setActiveServerName
  } = useWatch(animeId, initialEpisodeId);
  const {
    autoPlay,
    setAutoPlay,
    autoSkipIntro,
    setAutoSkipIntro,
    autoNext,
    setAutoNext,
  } = useWatchControl();
  const playerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const controlsRef = useRef(null);
  const episodesRef = useRef(null);

  const getEpisodeNumberFromId = (epId) => {
    if (!epId) return null;
    const match = epId.match(/\$ep=(\d+)/);
    return match ? Number(match[1]) : null;
  };

  useEffect(() => {
    if (!episodes || episodes.length === 0) return;

    const isValidEpisode = episodes.some((ep) => ep.id === episodeId);

    if (!episodeId || !isValidEpisode) {
      const fallbackId = episodes[0]?.id;
      if (fallbackId && fallbackId !== episodeId) {
        setEpisodeId(fallbackId);
      }
      return;
    }

    const activeEpisode = episodes.find((ep) => ep.id === episodeId);
    const episodeNumber = activeEpisode?.number ?? getEpisodeNumberFromId(episodeId);
    const newUrl = episodeNumber
      ? `/watch/${animeId}?ep=${episodeNumber}`
      : `/watch/${animeId}?ep=${episodeId}`;
    if (isFirstSet.current) {
      navigate(newUrl, { replace: true });
      isFirstSet.current = false;
    } else {
      navigate(newUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, animeId, navigate, episodes]);

  // Update document title
  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId]);

  // Redirect if no episodes
  useEffect(() => {
    if (totalEpisodes !== null && totalEpisodes === 0) {
      navigate(`/${animeId}`);
    }
  }, [streamInfo, episodeId, animeId, totalEpisodes, navigate]);

  useEffect(() => {
    // Function to adjust the height of episodes list to match only video + controls
    const adjustHeight = () => {
      if (window.innerWidth > 1200) {
        if (videoContainerRef.current && controlsRef.current && episodesRef.current) {
          // Calculate combined height of video container and controls
          const videoHeight = videoContainerRef.current.offsetHeight;
          const controlsHeight = controlsRef.current.offsetHeight;
          const totalHeight = videoHeight + controlsHeight;
          
          // Apply the combined height to episodes container
          episodesRef.current.style.height = `${totalHeight}px`;
        }
      } else {
        if (episodesRef.current) {
          episodesRef.current.style.height = 'auto';
        }
      }
    };

    // Initial adjustment with delay to ensure player is fully rendered
    const initialTimer = setTimeout(() => {
      adjustHeight();
    }, 500);
    
    // Set up resize listener
    window.addEventListener('resize', adjustHeight);
    
    // Create MutationObserver to monitor player changes
    const observer = new MutationObserver(() => {
      setTimeout(adjustHeight, 100);
    });
    
    // Start observing both video container and controls
    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }
    
    if (controlsRef.current) {
      observer.observe(controlsRef.current, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }
    
    // Set up additional interval for continuous adjustments
    const intervalId = setInterval(adjustHeight, 1000);
    
    // Clean up
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
      observer.disconnect();
      window.removeEventListener('resize', adjustHeight);
    };
  }, [buffering, activeServerType, activeServerName, episodeId, streamUrl, episodes]);

  function Tag({ bgColor, index, icon, text }) {
    return (
      <div
        className={`flex space-x-1 justify-center items-center px-[4px] py-[1px] text-black font-semibold text-[13px] ${
          index === 0 ? "rounded-l-[4px]" : "rounded-none"
        }`}
        style={{ backgroundColor: bgColor }}
      >
        {icon && <FontAwesomeIcon icon={icon} className="text-[12px]" />}
        <p className="text-[12px]">{text}</p>
      </div>
    );
  }

  useEffect(() => {
    setTags([
      {
        condition: animeInfo?.type,
        bgColor: "#FFBADE",
        text: animeInfo?.type,
      },
      {
        condition: animeInfo?.status,
        bgColor: "#ffffff",
        text: animeInfo?.status,
      },
      {
        condition: animeInfo?.hasSub,
        icon: faClosedCaptioning,
        bgColor: "#B0E3AF",
        text: "Sub",
      },
      {
        condition: animeInfo?.hasDub,
        icon: faMicrophone,
        bgColor: "#B9E7FF",
        text: "Dub",
      },
      {
        condition: animeInfo?.totalEpisodes,
        bgColor: "#ffffff",
        text: `${animeInfo?.totalEpisodes} EP`,
      },
      {
        condition: animeInfo?.subOrDub,
        bgColor: "#ffffff",
        text: animeInfo?.subOrDub,
      },
    ]);
  }, [animeId, animeInfo]);
  return (
    <div className="w-full min-h-screen bg-[#0a0a0a]">
      <div className="w-full max-w-[1920px] mx-auto pt-16 pb-6 w-full max-[1200px]:pt-12">
        <div className="grid grid-cols-[minmax(0,70%),minmax(0,30%)] gap-6 w-full h-full max-[1200px]:flex max-[1200px]:flex-col">
          {/* Left Column - Player, Controls, Servers */}
          <div className="flex flex-col w-full gap-6">
            <div ref={playerRef} className="player w-full h-fit bg-black flex flex-col rounded-xl overflow-hidden">
              {/* Video Container */}
              <div ref={videoContainerRef} className="w-full relative aspect-video bg-black">
                {!buffering ? (
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
                  />
                ) : (
                  <div className="absolute inset-0 flex justify-center items-center bg-black">
                    <BouncingLoader />
                  </div>
                )}
                <p className="text-center underline font-medium text-[15px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                  {!buffering && !activeServerType ? (
                    servers ? (
                      <>
                        Probably this server is down, try other servers
                        <br />
                        Either reload or try again after sometime
                      </>
                    ) : (
                      <>
                        Probably streaming server is down
                        <br />
                        Either reload or try again after sometime
                      </>
                    )
                  ) : null}
                </p>
              </div>

              {/* Controls Section */}
              <div className="bg-[#121212]">
                {!buffering && (
                  <div ref={controlsRef}>
                    <Watchcontrols
                      autoPlay={autoPlay}
                      setAutoPlay={setAutoPlay}
                      autoSkipIntro={autoSkipIntro}
                      setAutoSkipIntro={setAutoSkipIntro}
                      autoNext={autoNext}
                      setAutoNext={setAutoNext}
                      episodes={episodes}
                      totalEpisodes={totalEpisodes}
                      episodeId={episodeId}
                      onButtonClick={(id) => setEpisodeId(id)}
                    />
                  </div>
                )}

                {/* Title and Server Selection */}
                <div className="px-3 py-2">
                  <div>
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

                {/* Next Episode Schedule */}
                {nextEpisodeSchedule?.nextEpisodeSchedule && showNextEpisodeSchedule && (
                  <div className="px-3 pb-3">
                    <div className="w-full p-3 rounded-lg bg-[#272727] flex items-center justify-between">
                      <div className="flex items-center gap-x-3">
                        <span className="text-[18px]">🚀</span>
                        <div>
                          <span className="text-gray-400 text-sm">Next episode estimated at</span>
                          <span className="ml-2 text-white text-sm font-medium">
                            {new Date(
                              new Date(nextEpisodeSchedule.nextEpisodeSchedule).getTime() -
                              new Date().getTimezoneOffset() * 60000
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <button
                        className="text-2xl text-gray-500 hover:text-white transition-colors"
                        onClick={() => setShowNextEpisodeSchedule(false)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Mobile-only Episodes Section */}
            <div className="hidden max-[1200px]:block">
              <div ref={episodesRef} className="episodes flex-shrink-0 bg-[#141414] rounded-lg overflow-hidden">
                {!episodes ? (
                  <div className="h-full flex items-center justify-center">
                    <BouncingLoader />
                  </div>
                ) : (
                  <Episodelist
                    episodes={episodes}
                    currentEpisode={episodeId}
                    onEpisodeClick={(id) => setEpisodeId(id)}
                    totalEpisodes={totalEpisodes}
                  />
                )}
              </div>
            </div>

            {/* Anime Info Section */}
            <div className="bg-[#141414] rounded-lg p-4">
              <div className="flex gap-x-6 max-[600px]:flex-row max-[600px]:gap-4">
                {animeInfo && animeInfo?.image ? (
                  <img
                    src={`${animeInfo?.image}`}
                    alt=""
                    className="w-[120px] h-[180px] object-cover rounded-md max-[600px]:w-[100px] max-[600px]:h-[150px]"
                  />
                ) : (
                  <Skeleton className="w-[120px] h-[180px] rounded-md max-[600px]:w-[100px] max-[600px]:h-[150px]" />
                )}
                <div className="flex flex-col gap-y-4 flex-1 max-[600px]:gap-y-2">
                  {animeInfo && animeInfo?.title ? (
                    <Link 
                      to={`/${animeId}`}
                      className="group"
                    >
                      <h1 className="text-[28px] font-medium text-white leading-tight group-hover:text-gray-300 transition-colors max-[600px]:text-[20px]">
                        {language ? animeInfo?.title : animeInfo?.japaneseTitle}
                      </h1>
                      <div className="flex items-center gap-1.5 mt-1 text-gray-400 text-sm group-hover:text-white transition-colors max-[600px]:text-[12px] max-[600px]:mt-0.5">
                        <span>View Details</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform max-[600px]:w-3 max-[600px]:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ) : (
                    <Skeleton className="w-[170px] h-[20px] rounded-xl" />
                  )}
                  <div className="flex flex-wrap gap-2 max-[600px]:gap-1.5">
                    {animeInfo ? (
                      tags.map(
                        ({ condition, icon, text }, index) =>
                          condition && (
                            <span key={index} className="px-3 py-1 bg-[#1a1a1a] rounded-full text-sm flex items-center gap-x-1 text-gray-300 max-[600px]:px-2 max-[600px]:py-0.5 max-[600px]:text-[11px]">
                              {icon && <FontAwesomeIcon icon={icon} className="text-[12px] max-[600px]:text-[10px]" />}
                              {text}
                            </span>
                          )
                      )
                    ) : (
                      <Skeleton className="w-[70px] h-[20px] rounded-xl" />
                    )}
                  </div>
                  {animeInfo?.description && (
                    <p className="text-[15px] text-gray-400 leading-relaxed max-[600px]:text-[13px] max-[600px]:leading-normal">
                      {animeInfo?.description.length > 270 ? (
                        <>
                          {isFullOverview
                            ? animeInfo?.description
                            : `${animeInfo?.description.slice(0, 270)}...`}
                          <button
                            className="ml-2 text-gray-300 hover:text-white transition-colors max-[600px]:text-[12px] max-[600px]:ml-1"
                            onClick={() => setIsFullOverview(!isFullOverview)}
                          >
                            {isFullOverview ? "Show Less" : "Read More"}
                          </button>
                        </>
                      ) : (
                        animeInfo?.description
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Episodes and Related (Desktop Only) */}
          <div className="flex flex-col gap-6 h-full max-[1200px]:hidden">
            {/* Episodes Section */}
            <div ref={episodesRef} className="episodes flex-shrink-0 bg-[#141414] rounded-lg overflow-hidden">
              {!episodes ? (
                <div className="h-full flex items-center justify-center">
                  <BouncingLoader />
                </div>
              ) : (
                <Episodelist
                  episodes={episodes}
                  currentEpisode={episodeId}
                  onEpisodeClick={(id) => setEpisodeId(id)}
                  totalEpisodes={totalEpisodes}
                />
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
