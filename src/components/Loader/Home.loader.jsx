import { Skeleton } from "../ui/Skeleton/Skeleton";
import CategoryCardLoader from "./CategoryCard.loader";
import SidecardLoader from "./Sidecard.loader";
import SpotlightLoader from "./Spotlight.loader";
import TrendingLoader from "./Trending.loader";

const GenreLoader = () => (
  <div className="flex flex-wrap gap-3">
    {[...Array(8)].map((_, index) => (
      <Skeleton
        key={index}
        className="h-[35px] w-[120px] rounded-full"
      />
    ))}
  </div>
);

const ContinueWatchingLoader = () => (
  <div className="mt-6">
    <Skeleton className="w-[200px] h-7 mb-4" />
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-[2/3] rounded-xl" />
          <Skeleton className="w-3/4 h-4" />
        </div>
      ))}
    </div>
  </div>
);

const ScheduleLoader = () => (
  <div className="mt-8">
    <Skeleton className="w-[150px] h-7 mb-4" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="w-[100px] aspect-[2/3] rounded-lg" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-1/3 h-4" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TabbedAnimeSectionLoader = () => (
  <div className="mt-8">
    <div className="flex gap-4 mb-4">
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} className="w-[100px] h-8 rounded-full" />
      ))}
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(12)].map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-[2/3] rounded-xl" />
          <Skeleton className="w-3/4 h-4" />
        </div>
      ))}
    </div>
  </div>
);

function HomeLoader() {
  return (
    <div className="pt-16 w-full bg-[#0a0a0a]">
      <SpotlightLoader />
      <div className="mt-6">
        <GenreLoader />
      </div>
      <ContinueWatchingLoader />
      
      <div className="w-full grid grid-cols-[minmax(0,75%),minmax(0,25%)] gap-x-6 max-[1200px]:flex flex-col">
        <div>
          <CategoryCardLoader 
            className="mt-[60px]"
            title="Latest Episode"
            gridClass="grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5"
            count={20}
          />
          <ScheduleLoader />
          <TabbedAnimeSectionLoader />
        </div>
        <div className="w-full mt-[60px]">
          <TrendingLoader />
          <div className="mt-12">
            <SidecardLoader title="Top 10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeLoader;
