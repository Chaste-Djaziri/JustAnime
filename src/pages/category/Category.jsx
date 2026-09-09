import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useParams, Link, useNavigate } from "react-router-dom";
import getCategoryInfo from "@/src/utils/getCategoryInfo.utils";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import CategoryCardLoader from "@/src/components/Loader/CategoryCard.loader";
import PageSlider from "@/src/components/pageslider/PageSlider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTags,
  faSliders,
  faArrowLeft,
  faCompass,
  faCircleExclamation,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { ALL_ANIME_GENRES } from "@/src/pages/genres/Genres";

function Category({ path: propPath, label: propLabel }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();

  // Dynamically resolve path and genre
  const rawPath =
    propPath ||
    (params.genre ? `genre/${params.genre}` : params.category || params["*"] || "");
  const cleanPath = rawPath.replace(/^\//, "");

  const isGenre = cleanPath.startsWith("genre/") || cleanPath.startsWith("genres/");
  const genreSlug = isGenre ? cleanPath.replace(/^genres?\//, "") : "";

  const rawTitle = isGenre
    ? genreSlug
    : propLabel || cleanPath.split("/").pop() || "Category";

  const formattedTitle = useMemo(() => {
    return rawTitle
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, [rawTitle]);

  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  const page = parseInt(searchParams.get("page"), 10) || 1;

  useEffect(() => {
    const fetchCategoryInfo = async () => {
      if (!cleanPath) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getCategoryInfo(cleanPath, page);
        setCategoryInfo(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err);
        console.error("Error fetching category info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryInfo();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [cleanPath, page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const categoryGridClass =
    "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 max-[478px]:gap-2.5";

  return (
    <div className="w-full min-h-screen bg-black text-white pt-[76px] pb-16">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-y-8">
        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 border border-zinc-800 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl" />

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-zinc-600">/</span>
            {isGenre ? (
              <>
                <Link to="/genres" className="hover:text-white transition-colors">
                  Genres
                </Link>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-200">{formattedTitle}</span>
              </>
            ) : (
              <span className="text-zinc-200">{formattedTitle}</span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <FontAwesomeIcon icon={isGenre ? faTags : faCompass} className="text-base" />
                </div>
                <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  {formattedTitle} Anime
                </h1>

                {!loading && categoryInfo && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                    {categoryInfo.length} on page
                  </span>
                )}

                {totalPages > 1 && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-800 text-zinc-400">
                    Page {page} of {totalPages}
                  </span>
                )}
              </div>

              <p className="text-sm text-zinc-400 max-w-xl">
                {isGenre
                  ? `Discover top rated, popular, and trending ${formattedTitle} anime. Browse titles or filter with more criteria.`
                  : `Browse our curated collection of ${formattedTitle} anime titles and latest updates.`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {isGenre && (
                <Link
                  to={`/filter?genre[]=${genreSlug}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 border border-white/20 text-xs font-bold text-black transition-all shadow-sm active:scale-95"
                >
                  <FontAwesomeIcon icon={faSliders} className="text-xs" />
                  <span>Filter in {formattedTitle}</span>
                </Link>
              )}

              <Link
                to="/genres"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-sm"
              >
                <FontAwesomeIcon icon={faList} className="text-xs text-zinc-400" />
                <span>All Genres</span>
              </Link>
            </div>
          </div>

          {/* Quick Genre Switcher Bar */}
          <div className="mt-6 pt-5 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold text-zinc-400 shrink-0 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faTags} className="text-white text-xs" />
              <span>Genres:</span>
            </span>

            <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 scrollbar-none">
              {ALL_ANIME_GENRES.slice(0, 16).map((g) => {
                const isActive = genreSlug.toLowerCase() === g.id.toLowerCase();
                return (
                  <Link
                    key={g.id}
                    to={`/genre/${g.id}`}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-white text-black font-bold shadow-md shadow-white/10 scale-105"
                        : "bg-zinc-800/70 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-300 hover:text-white"
                    }`}
                  >
                    {g.name}
                  </Link>
                );
              })}
              <Link
                to="/genres"
                className="px-2.5 py-1 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 border border-zinc-700/50 text-xs text-zinc-300 hover:text-white transition-colors"
              >
                + More
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 bg-zinc-800/80 rounded-md animate-pulse" />
              <div className="h-6 w-32 bg-zinc-800/60 rounded-md animate-pulse" />
            </div>
            <CategoryCardLoader
              className="mt-0"
              gridClass={categoryGridClass}
              showLabelSkeleton={false}
            />
          </div>
        ) : page > totalPages && totalPages > 0 ? (
          /* Page out of range */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-xl mb-4">
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">End of Results</h2>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              You've navigated to page {page}, but only {totalPages} {totalPages === 1 ? "page exists" : "pages exist"} for {formattedTitle}.
            </p>
            <button
              onClick={() => handlePageChange(1)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-200 hover:bg-white text-zinc-900 rounded-lg text-sm font-semibold transition-all shadow-lg"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              Return to Page 1
            </button>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/40 border border-red-900/30 rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center justify-center text-red-400 text-xl mb-4">
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Could Not Fetch {formattedTitle}</h2>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              We encountered an issue retrieving anime for this category. Please try again.
            </p>
            <button
              onClick={() => handlePageChange(page)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium border border-zinc-700 transition-all"
            >
              Retry
            </button>
          </div>
        ) : categoryInfo && categoryInfo.length > 0 ? (
          /* Results Grid */
          <div className="flex flex-col gap-y-6">
            <CategoryCard
              data={categoryInfo}
              showViewMore={false}
              className="mt-0"
              gridClass={categoryGridClass}
              path={cleanPath}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-center gap-3 pt-8 pb-4">
                <PageSlider
                  page={page}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                />
                <p className="text-xs text-zinc-500">
                  Page {page} of {totalPages}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Empty Results */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-xl mb-4">
              <FontAwesomeIcon icon={faCompass} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              No anime found for {formattedTitle}
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              There are currently no listed titles in this category. Explore other popular genres below.
            </p>
            <Link
              to="/genres"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-lg hover:shadow-white/20 active:scale-95"
            >
              Explore All Genres
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Category;
