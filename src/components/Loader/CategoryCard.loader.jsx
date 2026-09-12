import { Skeleton } from "../ui/Skeleton/Skeleton";

function CategoryCardLoader({ className, showLabelSkeleton = true, gridClass, count = 20 }) {
  return (
    <div className={`w-full ${className}`}>
      {showLabelSkeleton && (
        <Skeleton className="w-[200px] h-[20px] max-[320px]:w-[70px]" />
      )}
      <div className={`grid ${gridClass || "grid-cols-6 max-[1400px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-2"} gap-x-3 gap-y-8 mt-6`}>
        {[...Array(count)].map((_, index) => (
          <div
            key={index}
            className="flex flex-col"
            style={{ height: "fit-content" }}
          >
            <div className="w-full relative">
              <Skeleton className="w-full pb-[140%] rounded-lg" />
              <div className="absolute left-3 bottom-3 flex items-center gap-1.5 flex-wrap">
                <Skeleton className="w-[40px] h-[20px] rounded-[2px]" />
                <Skeleton className="w-[40px] h-[20px] rounded-[2px]" />
                <Skeleton className="w-[40px] h-[20px] rounded-[2px]" />
              </div>
            </div>
            <Skeleton className="mt-3 w-[90%] h-[20px] rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryCardLoader;

