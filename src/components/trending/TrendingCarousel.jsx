import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/src/context/LanguageContext";
import "swiper/css";
import "swiper/css/navigation";

export default function TrendingCarousel({ trending }) {
  const { language } = useLanguage();

  if (!trending || trending.length === 0) return null;

  return (
    <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
          Trending
        </h2>
      </div>

      {/* Carousel Container with Right-side Navigation Column */}
      <div className="relative w-full pr-12 sm:pr-14">
        <Swiper
          modules={[Navigation]}
          spaceBetween={14}
          slidesPerView={1.8}
          navigation={{
            nextEl: ".trending-next-btn",
            prevEl: ".trending-prev-btn",
          }}
          breakpoints={{
            420: { slidesPerView: 2.2, spaceBetween: 14 },
            640: { slidesPerView: 3.2, spaceBetween: 14 },
            860: { slidesPerView: 4.2, spaceBetween: 14 },
            1100: { slidesPerView: 5, spaceBetween: 14 },
            1400: { slidesPerView: 6, spaceBetween: 14 },
          }}
          className="w-full overflow-hidden"
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
                  className="group flex h-[210px] sm:h-[235px] md:h-[250px] w-full overflow-hidden select-none"
                >
                  {/* Left Column: Vertical Title + Bottom Rank Number */}
                  <div className="w-8 sm:w-9 md:w-10 shrink-0 h-full flex flex-col justify-end items-center pb-0.5 overflow-hidden">
                    {/* Vertical Title reading upwards */}
                    <div className="flex-1 w-full flex items-end justify-center overflow-hidden pb-2">
                      <span
                        title={title}
                        className="text-xs sm:text-[13px] font-medium text-white/90 group-hover:text-white transition-colors [writing-mode:vertical-rl] rotate-180 truncate max-h-full leading-none tracking-normal"
                      >
                        {title}
                      </span>
                    </div>

                    {/* Bottom Rank Number */}
                    <span className="text-base sm:text-lg font-bold text-white/90 group-hover:text-white transition-colors shrink-0 leading-none">
                      {displayRank}
                    </span>
                  </div>

                  {/* Right Column: Anime Poster */}
                  <div className="relative flex-1 h-full overflow-hidden bg-neutral-900 rounded-sm">
                    <img
                      src={item.poster}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Right Stacked Navigation Buttons */}
        <div className="absolute right-0 top-0 bottom-0 w-9 sm:w-11 flex flex-col justify-between gap-2.5 z-10">
          <button
            className="trending-next-btn flex-1 w-full flex items-center justify-center bg-[#24242d] hover:bg-[#32323e] text-white/80 hover:text-white rounded-xl transition-all border border-white/10 active:scale-95 shadow-md"
            aria-label="Next trending"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-sm sm:text-base" />
          </button>
          <button
            className="trending-prev-btn flex-1 w-full flex items-center justify-center bg-[#24242d] hover:bg-[#32323e] text-white/80 hover:text-white rounded-xl transition-all border border-white/10 active:scale-95 shadow-md"
            aria-label="Previous trending"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-sm sm:text-base" />
          </button>
        </div>
      </div>
    </section>
  );
}
