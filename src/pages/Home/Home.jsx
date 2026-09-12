import website_name from "@/src/config/website.js";
import Spotlight from "@/src/components/spotlight/Spotlight.jsx";
import Genre from "@/src/components/genres/Genre.jsx";
import TrendingCarousel from "@/src/components/trending/TrendingCarousel.jsx";
import FeaturedColumns from "@/src/components/featured/FeaturedColumns.jsx";
import CategoryCard from "@/src/components/categorycard/CategoryCard.jsx";
import Topten from "@/src/components/topten/Topten.jsx";
import Sidecard from "@/src/components/sidecard/Sidecard.jsx";
import Loader from "@/src/components/Loader/Loader.jsx";
import Error from "@/src/components/error/Error.jsx";
import { useHomeInfo } from "@/src/context/HomeInfoContext.jsx";
import Schedule from "@/src/components/schedule/Schedule";
import ContinueWatching from "@/src/components/continue/ContinueWatching";

function Home() {
  const { homeInfo, homeInfoLoading, error } = useHomeInfo();

  if (homeInfoLoading) return <Loader type="home" />;
  if (error) return <Error />;
  if (!homeInfo) return <Error error="404" />;

  // Prefer dedicated trending feed or fallback to spotlight / top_airing
  const trendingData =
    homeInfo.trending && homeInfo.trending.length > 0
      ? homeInfo.trending
      : homeInfo.spotlights;

  return (
    <>
      <div className="pt-16 w-full overflow-x-hidden">
        {/* 1. Hero Spotlight & Genre Ribbon */}
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 space-y-3">
          <Spotlight spotlights={homeInfo.spotlights} />
          <Genre data={homeInfo.genres} />
        </div>

        {/* 2. Full-width Trending Carousel (Ranks 01-10) */}
        <div className="mt-6">
          <TrendingCarousel trending={trendingData} />
        </div>

        {/* 3. Full-width 4-Column Featured Block (Top Airing, Most Popular, Most Favorite, Latest Completed) */}
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <FeaturedColumns
            topAiring={homeInfo.top_airing}
            mostPopular={homeInfo.most_popular}
            mostFavorite={homeInfo.most_favorite}
            latestCompleted={homeInfo.latest_completed}
          />
        </div>

        {/* 4. Main Two-Column Content & Sidebar Area */}
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="w-full grid grid-cols-1 xl:grid-cols-[minmax(0,75%),minmax(0,25%)] gap-8">
            {/* Left Column (Main Feed) */}
            <div className="space-y-10 min-w-0">
              {/* Continue Watching (auto-hides if empty) */}
              <ContinueWatching />

              {/* Latest Episode */}
              <CategoryCard
                label="Latest Episode"
                data={homeInfo.latest_episode}
                path="recently-updated"
                limit={20}
                gridClass="grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5"
              />

              {/* Estimated Schedule */}
              <Schedule />

              {/* New On Kizora */}
              {homeInfo.recently_added && homeInfo.recently_added.length > 0 && (
                <CategoryCard
                  label="New On Kizora"
                  data={homeInfo.recently_added}
                  path="recently-added"
                  limit={20}
                  gridClass="grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5"
                />
              )}
            </div>

            {/* Right Sidebar */}
            <aside className="w-full space-y-8 min-w-0">
              {/* Top 10 Today / Week / Month */}
              <Topten data={homeInfo.topten} />

              {/* Top Upcoming */}
              {homeInfo.top_upcoming && homeInfo.top_upcoming.length > 0 && (
                <Sidecard
                  data={homeInfo.top_upcoming}
                  label="Top Upcoming"
                  path="top-upcoming"
                  limit={10}
                />
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

