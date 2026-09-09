import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faCalendar,
  faChevronLeft,
  faChevronRight,
  faCircleInfo,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useSwiper } from "swiper/react";
import { useLanguage } from "@/src/context/LanguageContext";
import "./Banner.css";

function Banner({ item, index, total }) {
  const { language } = useLanguage();
  const swiper = useSwiper();

  const title = (
    language === "EN"
      ? item.title || item.japanese_title || item.japaneseTitle
      : item.japanese_title || item.japaneseTitle || item.title
  )?.trim() || "";

  const imageSrc = item.banner || item.poster || item.image;

  // Genre pills
  const genresList = Array.isArray(item.genres) && item.genres.length > 0
    ? item.genres.slice(0, 3)
    : ["Action", "Adventure", "Fantasy"];

  // Countdown text or spotlight rank
  const countdownText = item.tvInfo?.sub || item.sub
    ? `EP ${item.tvInfo?.sub || item.sub} IN 2d 2h 18m`
    : `#${index + 1} Spotlight`;

  return (
    <div className="spotlight w-full h-full relative overflow-hidden select-none bg-[#0a0a0a]">
      {/* Anime Backdrop Image (Resized, Centered, and Fitted) */}
      <img
        src={imageSrc}
        alt={title}
        loading="eager"
        className="spotlight-image"
      />

      {/* Layered Gradient Overlay */}
      <div className="spotlight-overlay z-[1]"></div>

      {/* Top Bar: Countdown Pill on Left, Slide Controls on Right */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 sm:px-10 md:px-12 pt-6 sm:pt-7 flex items-center justify-between pointer-events-auto">
        {/* Top-Left Episode Countdown Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-semibold text-zinc-200 shadow-lg">
          <FontAwesomeIcon icon={faClock} className="text-[11px] text-zinc-400" />
          <span>{countdownText}</span>
        </div>

        {/* Top-Right Slide Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-black/50 hover:bg-black/80 active:scale-90 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
            aria-label="Previous slide"
            onClick={() => swiper.slidePrev()}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs text-white" />
          </button>
          <div className="h-8 px-3 rounded-lg bg-black/50 backdrop-blur-md border border-white/15 text-xs font-semibold text-white flex items-center justify-center tracking-wider shadow-md">
            <span>{index + 1}</span>
            <span className="text-white/40 mx-1.5 font-normal">/</span>
            <span className="text-white/70">{total}</span>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-black/50 hover:bg-black/80 active:scale-90 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
            aria-label="Next slide"
            onClick={() => swiper.slideNext()}
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-xs text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 sm:px-10 md:px-12 pb-6 sm:pb-7 flex flex-col justify-end">
        {/* Meta Info Line */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-zinc-300 font-medium mb-2 drop-shadow">
          <span>{item.tvInfo?.showType || item.type || "TV"}</span>
          {(item.tvInfo?.releaseDate || item.releaseDate) && (
            <>
              <span className="text-zinc-500">•</span>
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCalendar} className="text-[11px] text-zinc-400" />
                {item.tvInfo?.releaseDate || item.releaseDate}
              </span>
            </>
          )}
          <span className="text-zinc-500">•</span>
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
            {item.status || "RELEASING"}
          </span>
          {(item.tvInfo?.sub || item.tvInfo?.episodeInfo?.sub || item.sub) && (
            <>
              <span className="text-zinc-500">•</span>
              <span>{item.tvInfo?.sub || item.tvInfo?.episodeInfo?.sub || item.sub} Episodes</span>
            </>
          )}
          {(item.tvInfo?.duration || item.duration) && (
            <>
              <span className="text-zinc-500">•</span>
              <span>{item.tvInfo?.duration || item.duration}</span>
            </>
          )}
        </div>

        {/* Anime Title */}
        <Link
          to={`/${item.id}`}
          className="inline-block hover:opacity-90 transition-opacity mb-2.5 max-w-3xl"
        >
          <h1
            title={title}
            className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black tracking-tight leading-tight line-clamp-1 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
          >
            {title}
          </h1>
        </Link>

        {/* Genre Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {genresList.map((g, i) => (
            <Link
              key={i}
              to={`/genre/${g.toLowerCase()}`}
              className="px-3 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 backdrop-blur-sm border border-zinc-700/60 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
            >
              {g}
            </Link>
          ))}
        </div>

        {/* Bottom Row: Description on Left, Action Buttons on Right */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 w-full">
          {item.description && (
            <p className="text-zinc-300/90 text-xs sm:text-sm leading-relaxed line-clamp-2 max-w-2xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              {item.description}
            </p>
          )}

          {/* Action Buttons: Watch Now is WHITE */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to={`/watch/${item.id}`}
              className="bg-white hover:bg-zinc-100 text-black font-bold px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm shadow-xl active:scale-95"
            >
              <FontAwesomeIcon icon={faPlay} className="text-xs text-black" />
              <span>Watch Now</span>
            </Link>

            <Link
              to={`/${item.id}`}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm backdrop-blur-md border border-white/15 active:scale-95"
            >
              <FontAwesomeIcon icon={faCircleInfo} className="text-xs text-zinc-300" />
              <span>Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
