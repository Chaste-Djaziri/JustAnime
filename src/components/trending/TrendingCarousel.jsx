import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faFire } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/src/context/LanguageContext";
import "swiper/css";
import "swiper/css/navigation";

export default function TrendingCarousel({ trending }) {
  const { language } = useLanguage();

  if (!trending || trending.length === 0) return null;

  return (
    <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFire} className="text-red-500 text-xl" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Trending
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="trending-prev w-8 h-8 rounded-full bg-[#1e1e24] hover:bg-[#2e2e38] text-white flex items-center justify-center transition-colors border border-white/10"
            aria-label="Previous trending"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          </button>
          <button
            className="trending-next w-8 h-8 rounded-full bg-[#1e1e24] hover:bg-[#2e2e38] text-white flex items-center justify-center transition-colors border border-white/10"
            aria-label="Next trending"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={2.2}
        navigation={{
          prevEl: ".trending-prev",
          nextEl: ".trending-next",
        }}
        breakpoints={{
          480: { slidesPerView: 2.8, spaceBetween: 16 },
          640: { slidesPerView: 3.5, spaceBetween: 18 },
          1024: { slidesPerView: 4.8, spaceBetween: 20 },
          1280: { slidesPerView: 5.8, spaceBetween: 22 },
          1536: { slidesPerView: 6.8, spaceBetween: 24 },
        }}
        className="overflow-visible"
      >
        {trending.slice(0, 10).map((item, index) => {
          const rank = index + 1;
          const displayRank = rank < 10 ? `0${rank}` : `${rank}`;
          const title =
            language === "EN"
              ? item.title || item.japanese_title
              : item.japanese_title || item.title;

          return (
            <SwiperSlide key={item.id || index}>
              <Link
                to={`/${item.id}`}
                className="group relative flex items-center gap-3 bg-[#16161a] hover:bg-[#202026] p-2.5 rounded-xl transition-all duration-300 border border-white/5 hover:border-white/15 hover:shadow-lg hover:shadow-black/50"
              >
                {/* Rank Number */}
                <div className="flex flex-col items-center justify-center w-8 shrink-0">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rank
                  </span>
                  <span
                    className={`text-xl sm:text-2xl font-black tracking-tight ${
                      rank <= 3 ? "text-amber-400" : "text-white/80"
                    }`}
                  >
                    {displayRank}
                  </span>
                </div>

                {/* Poster Image */}
                <div className="relative w-16 sm:w-20 aspect-[3/4] rounded-lg overflow-hidden shrink-0 bg-neutral-900 shadow-md">
                  <img
                    src={item.poster}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-1">
                  <h3
                    title={title}
                    className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug"
                  >
                    {title}
                  </h3>
                  {item.tvInfo?.showType && (
                    <span className="inline-block mt-1 text-[11px] font-medium text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                      {item.tvInfo.showType}
                    </span>
                  )}
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
