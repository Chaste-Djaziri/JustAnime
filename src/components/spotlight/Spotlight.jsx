import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import "./Spotlight.css";
import Banner from "../banner/Banner";

const Spotlight = ({ spotlights }) => {
  return (
    <div className="w-full relative">
      <div className="relative h-[400px] sm:h-[440px] md:h-[480px] lg:h-[520px] w-full rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a]">
        {spotlights && spotlights.length > 0 ? (
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            allowTouchMove={true}
            breakpoints={{
              1024: {
                allowTouchMove: false,
              },
            }}
            navigation={false}
            pagination={false}
            autoplay={{
              delay: 8000,
              disableOnInteraction: false,
            }}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            modules={[Autoplay, EffectFade]}
            className="h-full w-full overflow-hidden relative"
          >
            {spotlights.map((item, index) => (
              <SwiperSlide className="text-black relative h-full w-full" key={index}>
                <Banner item={item} index={index} total={spotlights.length} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-zinc-500 p-8">No spotlights to show.</p>
        )}
      </div>
    </div>
  );
};

export default Spotlight;

