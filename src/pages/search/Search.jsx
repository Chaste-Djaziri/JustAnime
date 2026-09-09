import CategoryCard from "@/src/components/categorycard/CategoryCard";
import CategoryCardLoader from "@/src/components/Loader/CategoryCard.loader";
import PageSlider from "@/src/components/pageslider/PageSlider";
import getSearch from "@/src/utils/getSearch.utils";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faSliders,
  faTv,
  faFilm,
  faLayerGroup,
  faArrowLeft,
  faCompass,
  faFire,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

const POPULAR_GENRES = [
  { name: "Action", path: "/genre/action" },
  { name: "Isekai", path: "/genre/isekai" },
  { name: "Shounen", path: "/genre/shounen" },
  { name: "Comedy", path: "/genre/comedy" },
  { name: "Fantasy", path: "/genre/fantasy" },
  { name: "Romance", path: "/genre/romance" },
  { name: "Sci-Fi", path: "/genre/sci-fi" },
  { name: "Supernatural", path: "/genre/supernatural" },
  { name: "Mystery", path: "/genre/mystery" },
  { name: "Slice of Life", path: "/genre/slice-of-life" },
];

const POPULAR_SEARCHES = [
  "Solo Leveling",
  "One Piece",
  "Jujutsu Kaisen",
  "Demon Slayer",
  "Bleach",
  "Attack on Titan",
  "Naruto",
  "Chainsaw Man",
];

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const keyword =
    searchParams.get("keyword") ||
    searchParams.get("query") ||
    searchParams.get("q") ||
    "";
  const page = parseInt(searchParams.get("page"), 10) || 1;

  const [inputQuery, setInputQuery] = useState(keyword);
  const [searchData, setSearchData] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Synchronize local input state whenever URL keyword changes
  useEffect(() => {
    setInputQuery(keyword);
  }, [keyword]);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!keyword.trim()) {
        setSearchData([]);
        setTotalPages(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getSearch(keyword, page);
        setSearchData(data.data || []);
        setTotalPages(data.totalPage || 1);
      } catch (err) {
        console.error("Error fetching anime search:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [keyword, page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ keyword, page: newPage });
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const trimmed = inputQuery.trim();
    if (trimmed) {
      setSearchParams({ keyword: trimmed, page: 1 });
    }
  };

  const handleClearSearch = () => {
    setInputQuery("");
  };

  const handlePopularSearchClick = (term) => {
    setInputQuery(term);
    setSearchParams({ keyword: term, page: 1 });
  };

  // Format counts
  const counts = useMemo(() => {
    if (!searchData || !Array.isArray(searchData)) {
      return { all: 0, tv: 0, movie: 0, other: 0 };
    }
    let tv = 0;
    let movie = 0;
    let other = 0;

    searchData.forEach((item) => {
      const type = (item.type || item.tvInfo?.showType || "").toUpperCase();
      if (type === "TV") tv++;
      else if (type === "MOVIE") movie++;
      else if (type) other++;
    });

    return { all: searchData.length, tv, movie, other };
  }, [searchData]);

  // Filtered & Sorted items
  const processedData = useMemo(() => {
    if (!searchData || !Array.isArray(searchData)) return [];

    let list = [...searchData];

    // Filter by format
    if (selectedFormat === "tv") {
      list = list.filter((item) => {
        const type = (item.type || item.tvInfo?.showType || "").toUpperCase();
        return type === "TV";
      });
    } else if (selectedFormat === "movie") {
      list = list.filter((item) => {
        const type = (item.type || item.tvInfo?.showType || "").toUpperCase();
        return type === "MOVIE";
      });
    } else if (selectedFormat === "other") {
      list = list.filter((item) => {
        const type = (item.type || item.tvInfo?.showType || "").toUpperCase();
        return type && type !== "TV" && type !== "MOVIE";
      });
    }

    // Sort
    if (sortBy === "title-asc") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "title-desc") {
      list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    } else if (sortBy === "episodes") {
      list.sort((a, b) => {
        const epA = Number(a.episodes || a.sub || a.tvInfo?.sub || 0);
        const epB = Number(b.episodes || b.sub || b.tvInfo?.sub || 0);
        return epB - epA;
      });
    }

    return list;
  }, [searchData, selectedFormat, sortBy]);

  const searchGridClass =
    "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 max-[478px]:gap-2.5";

  return (
    <div className="w-full min-h-screen bg-black text-white pt-[76px] pb-16">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-y-8">
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {/* Subtle ambient lighting */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl" />

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200">Search</span>
            {keyword && (
              <>
                <span className="text-zinc-600">/</span>
                <span className="text-white truncate max-w-[200px]">"{keyword}"</span>
              </>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Title & Stats */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  {keyword ? (
                    <>
                      Results for{" "}
                      <span className="text-zinc-100 bg-zinc-800/80 px-2.5 py-0.5 rounded-lg border border-zinc-700/60 font-semibold inline-block">
                        "{keyword}"
                      </span>
                    </>
                  ) : (
                    "Explore & Search Anime"
                  )}
                </h1>

                {keyword && !loading && searchData && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                    {searchData.length} {searchData.length === 1 ? "anime" : "anime found"}
                  </span>
                )}

                {keyword && totalPages > 1 && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-800 text-zinc-400">
                    Page {page} of {totalPages}
                  </span>
                )}
              </div>

              <p className="text-sm text-zinc-400 max-w-xl">
                {keyword
                  ? "Browse matching series, movies, and specials. Use the quick filters to narrow down your results."
                  : "Discover series, movies, and episodes across the catalog. Type a query below or pick a popular genre."}
              </p>
            </div>

            {/* Inline Search Input Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center w-full lg:w-[460px] relative group"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Refine or enter new search..."
                  className="w-full bg-zinc-950/80 hover:bg-zinc-950 text-white placeholder-zinc-500 pl-11 pr-24 py-3 rounded-xl border border-zinc-700/70 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all text-sm shadow-inner"
                />
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-white transition-colors text-sm pointer-events-none"
                />

                {inputQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-16 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1 transition-colors"
                    title="Clear input"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-xs" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-zinc-200 hover:bg-white text-zinc-900 font-semibold text-xs transition-all disabled:opacity-40 disabled:hover:bg-zinc-200"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Quick Trending Genres */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 shrink-0">
              <FontAwesomeIcon icon={faFire} className="text-amber-400 text-xs" />
              <span>Trending Genres:</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 scrollbar-none">
              {POPULAR_GENRES.map((genre) => (
                <Link
                  key={genre.name}
                  to={genre.path}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/80 border border-zinc-700/40 text-xs text-zinc-300 hover:text-white transition-all hover:scale-105 active:scale-95"
                >
                  {genre.name}
                </Link>
              ))}
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
              gridClass={searchGridClass}
              showLabelSkeleton={false}
            />
          </div>
        ) : !keyword.trim() ? (
          /* Landing state when user navigates directly to /search */
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-300 text-2xl mb-4 shadow-xl">
              <FontAwesomeIcon icon={faCompass} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">What would you like to watch?</h2>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              Search by anime title, alternative names, or choose from trending titles below.
            </p>

            <div className="flex items-center gap-2 flex-wrap justify-center max-w-xl">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handlePopularSearchClick(term)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-xs font-medium text-zinc-200 hover:text-white transition-all shadow-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : page > totalPages && totalPages > 0 ? (
          /* Page out-of-range state */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-xl mb-4">
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">End of Search Results</h2>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              You've navigated to page {page}, but this search only has {totalPages} {totalPages === 1 ? "page" : "pages"}.
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
          /* Error state */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/40 border border-red-900/30 rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center justify-center text-red-400 text-xl mb-4">
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Could Not Fetch Results</h2>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              We encountered an issue connecting to the catalog. Please try refreshing the search.
            </p>
            <button
              onClick={() => handlePageChange(page)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium border border-zinc-700 transition-all"
            >
              Retry Search
            </button>
          </div>
        ) : searchData && searchData.length > 0 ? (
          /* Active Results State */
          <div className="flex flex-col gap-y-6">
            {/* Control Bar: Format Filters & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-zinc-800/80">
              {/* Format pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedFormat("all")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedFormat === "all"
                      ? "bg-zinc-100 text-zinc-950 shadow"
                      : "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                  }`}
                >
                  <FontAwesomeIcon icon={faLayerGroup} className="text-[11px]" />
                  <span>All</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedFormat === "all" ? "bg-zinc-300 text-zinc-900 font-bold" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {counts.all}
                  </span>
                </button>

                {counts.tv > 0 && (
                  <button
                    onClick={() => setSelectedFormat("tv")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedFormat === "tv"
                        ? "bg-zinc-100 text-zinc-950 shadow"
                        : "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    <FontAwesomeIcon icon={faTv} className="text-[11px]" />
                    <span>TV Series</span>
                    <span
                      className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedFormat === "tv" ? "bg-zinc-300 text-zinc-900 font-bold" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {counts.tv}
                    </span>
                  </button>
                )}

                {counts.movie > 0 && (
                  <button
                    onClick={() => setSelectedFormat("movie")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedFormat === "movie"
                        ? "bg-zinc-100 text-zinc-950 shadow"
                        : "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    <FontAwesomeIcon icon={faFilm} className="text-[11px]" />
                    <span>Movies</span>
                    <span
                      className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedFormat === "movie" ? "bg-zinc-300 text-zinc-900 font-bold" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {counts.movie}
                    </span>
                  </button>
                )}

                {counts.other > 0 && (
                  <button
                    onClick={() => setSelectedFormat("other")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedFormat === "other"
                        ? "bg-zinc-100 text-zinc-950 shadow"
                        : "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    <span>OVAs & Specials</span>
                    <span
                      className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedFormat === "other" ? "bg-zinc-300 text-zinc-900 font-bold" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {counts.other}
                    </span>
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faSliders} className="text-zinc-500 text-xs" />
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort anime results"
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-800 focus:border-zinc-600 focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="default">Relevance (Default)</option>
                  <option value="title-asc">Title: A to Z</option>
                  <option value="title-desc">Title: Z to A</option>
                  <option value="episodes">Most Episodes</option>
                </select>
              </div>
            </div>

            {/* If format filter reduced results to 0 */}
            {processedData.length === 0 ? (
              <div className="py-16 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
                <p className="text-zinc-300 text-base font-medium mb-2">
                  No {selectedFormat.toUpperCase()} results found for "{keyword}".
                </p>
                <button
                  onClick={() => setSelectedFormat("all")}
                  className="text-xs text-zinc-400 underline hover:text-white"
                >
                  View all formats ({counts.all} available)
                </button>
              </div>
            ) : (
              /* Anime Cards Grid */
              <CategoryCard
                data={processedData}
                showViewMore={false}
                className="mt-0"
                gridClass={searchGridClass}
              />
            )}

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
          /* Empty / Zero Results State */
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-center shadow-xl">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-zinc-800 to-zinc-700/80 flex items-center justify-center text-zinc-300 text-2xl shadow-xl border border-white/10">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs">
                <FontAwesomeIcon icon={faXmark} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              No results found for "{keyword}"
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mb-8 leading-relaxed">
              We couldn't find any anime matching your query. Check for typos, try fewer keywords,
              or discover something new from trending titles below.
            </p>

            {/* Quick search suggestions */}
            <div className="flex flex-col items-center gap-3 w-full max-w-md">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Try searching for:
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {POPULAR_SEARCHES.slice(0, 6).map((term) => (
                  <button
                    key={term}
                    onClick={() => handlePopularSearchClick(term)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/60 text-xs font-medium text-zinc-200 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
