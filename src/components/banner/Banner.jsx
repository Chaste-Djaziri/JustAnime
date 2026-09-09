import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faClosedCaptioning,
  faMicrophone,
  faCalendar,
  faChevronLeft,
  faChevronRight,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useSwiper } from "swiper/react";
import { useLanguage } from "@/src/context/LanguageContext";
import "./Banner.css";

function Banner({ item, index, total }) {
  const { language } = useLanguage();
  const swiper = useSwiper();

  const title = language === "EN" ? item.title || item.japanese_title : item.japanese_title || item.title;
  const imageSrc = item.banner || item.poster || item.image;

  return (
    <div className="spotlight w-full h-full relative overflow-hidden select-none bg-[#0a0a0a]">
      {/* Anime Backdrop Image */}
      <img
        src={imageSrc}
        alt={title}
        loading="eager"
        className="spotlight-image"
      />

      {/* Layered Gradient Overlay (Fades black to left, bottom, and top) */}
      <div className="spotlight-overlay z-[1]"></div>

      {/* Main Content Container */}
      <div className="relative z-[2] h-full max-w-[1920px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16 flex flex-col justify-center pb-8 sm:pb-4">
        <div className="max-w-xl lg:max-w-2xl flex flex-col items-start text-left">
          {/* Spotlight Rank Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 font-semibold text-xs sm:text-sm tracking-wide mb-2.5">
            <span>#{index + 1} Spotlight</span>
          </div>

          {/* Anime Title */}
          <Link
            to={`/${item.id}`}
            className="hover:text-amber-400 transition-colors"
          >
            <h1
              title={title}
              className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-tight line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            >
              {title}
            </h1>
          </Link>

          {/* Badges / Metadata */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm mt-3 text-gray-300">
            {item.tvInfo?.showType && (
              <span className="font-semibold text-white bg-white/10 px-2 py-0.5 rounded text-xs">
                {item.tvInfo.showType}
              </span>
            )}
            {item.tvInfo?.releaseDate && (
              <div className="flex items-center gap-1 text-gray-300">
                <FontAwesomeIcon icon={faCalendar} className="text-[11px] text-gray-400" />
                <span className="text-xs">{item.tvInfo.releaseDate}</span>
              </div>
            )}
            {item.tvInfo?.quality && (
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-1.5 py-0.5 rounded">
                {item.tvInfo.quality}
              </span>
            )}
            {item.tvInfo?.episodeInfo?.sub && (
              <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-xs text-white">
                <FontAwesomeIcon icon={faClosedCaptioning} className="text-[11px]" />
                <span className="font-semibold">{item.tvInfo.episodeInfo.sub}</span>
              </div>
            )}
            {item.tvInfo?.episodeInfo?.dub && (
              <div className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded text-xs text-white">
                <FontAwesomeIcon icon={faMicrophone} className="text-[11px]" />
                <span className="font-semibold">{item.tvInfo.episodeInfo.dub}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-gray-300/90 text-xs sm:text-sm md:text-[15px] leading-relaxed line-clamp-2 sm:line-clamp-3 mt-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              {item.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-4 sm:mt-5 flex items-center gap-3">
            <Link
              to={`/watch/${item.id}`}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-6 sm:px-7 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-amber-400/20 active:scale-95"
            >
              <FontAwesomeIcon icon={faPlay} className="text-xs" />
              <span>Watch Now</span>
            </Link>

            <Link
              to={`/${item.id}`}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm border border-white/10 active:scale-95"
            >
              <FontAwesomeIcon icon={faCircleInfo} className="text-xs" />
              <span>Details</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation Controls (Bottom-Right) */}
      <div className="absolute right-6 sm:right-10 md:right-14 lg:right-16 bottom-6 sm:bottom-8 z-[3]">
        <div className="spotlight-nav">
          <button
            type="button"
            className="spotlight-nav-button button-prev"
            aria-label="Previous spotlight"
            onClick={() => swiper.slidePrev()}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          </button>
          <span className="spotlight-count">
            <span className="spotlight-count-current">{index + 1}</span>
            <span className="spotlight-count-separator">/</span>
            <span className="spotlight-count-total">{total}</span>
          </span>
          <button
            type="button"
            className="spotlight-nav-button button-next"
            aria-label="Next spotlight"
            onClick={() => swiper.slideNext()}
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Banner;
