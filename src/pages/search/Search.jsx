import CategoryCard from "@/src/components/categorycard/CategoryCard";
import CategoryCardLoader from "@/src/components/Loader/CategoryCard.loader";
import PageSlider from "@/src/components/pageslider/PageSlider";
import DatePickerPill from "@/src/components/filter/DatePickerPill";
import getSearch from "@/src/utils/getSearch.utils";
import getFilter from "@/src/utils/getFilter.utils";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faSliders,
  faChevronDown,
  faChevronUp,
  faArrowLeft,
  faCompass,
  faCircleExclamation,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

const ALL_GENRES = [
  { id: "action", name: "Action" },
  { id: "adventure", name: "Adventure" },
  { id: "cars", name: "Cars" },
  { id: "comedy", name: "Comedy" },
  { id: "dementia", name: "Dementia" },
  { id: "demons", name: "Demons" },
  { id: "drama", name: "Drama" },
  { id: "ecchi", name: "Ecchi" },
  { id: "fantasy", name: "Fantasy" },
  { id: "game", name: "Game" },
  { id: "historical", name: "Historical" },
  { id: "horror", name: "Horror" },
  { id: "isekai", name: "Isekai" },
  { id: "josei", name: "Josei" },
  { id: "kids", name: "Kids" },
  { id: "magic", name: "Magic" },
  { id: "martial-arts", name: "Martial Arts" },
  { id: "mecha", name: "Mecha" },
  { id: "military", name: "Military" },
  { id: "music", name: "Music" },
  { id: "mystery", name: "Mystery" },
  { id: "parody", name: "Parody" },
  { id: "police", name: "Police" },
  { id: "psychological", name: "Psychological" },
  { id: "romance", name: "Romance" },
  { id: "samurai", name: "Samurai" },
  { id: "school", name: "School" },
  { id: "sci-fi", name: "Sci-Fi" },
  { id: "seinen", name: "Seinen" },
  { id: "shoujo", name: "Shoujo" },
  { id: "shounen", name: "Shounen" },
  { id: "slice-of-life", name: "Slice of Life" },
  { id: "space", name: "Space" },
  { id: "sports", name: "Sports" },
  { id: "super-power", name: "Super Power" },
  { id: "supernatural", name: "Supernatural" },
  { id: "thriller", name: "Thriller" },
  { id: "vampire", name: "Vampire" },
  { id: "harem", name: "Harem" },
];

const TYPE_OPTIONS = [
  { val: "", label: "All" },
  { val: "tv", label: "TV" },
  { val: "movie", label: "Movie" },
  { val: "ova", label: "OVA" },
  { val: "ona", label: "ONA" },
  { val: "special", label: "Special" },
  { val: "music", label: "Music" },
];

const STATUS_OPTIONS = [
  { val: "", label: "All" },
  { val: "completed", label: "Finished Airing" },
  { val: "releasing", label: "Currently Airing" },
  { val: "not_yet_aired", label: "Not yet aired" },
];

const RATED_OPTIONS = [
  { val: "", label: "All" },
  { val: "g", label: "G - All Ages" },
  { val: "pg", label: "PG - Children" },
  { val: "pg_13", label: "PG-13 - Teens 13+" },
  { val: "r_17", label: "R - 17+ (violence)" },
  { val: "r_plus", label: "R+ - Mild Nudity" },
  { val: "rx", label: "Rx - Hentai" },
];

const SCORE_OPTIONS = [
  { val: "", label: "All" },
  { val: "10", label: "(10) Masterpiece" },
  { val: "9", label: "(9) Great" },
  { val: "8", label: "(8) Very Good" },
  { val: "7", label: "(7) Good" },
  { val: "6", label: "(6) Fine" },
  { val: "5", label: "(5) Average" },
  { val: "4", label: "(4) Bad" },
  { val: "3", label: "(3) Very Bad" },
  { val: "2", label: "(2) Horrible" },
  { val: "1", label: "(1) Appalling" },
];

const SEASON_OPTIONS = [
  { val: "", label: "All" },
  { val: "spring", label: "Spring" },
  { val: "summer", label: "Summer" },
  { val: "fall", label: "Fall" },
  { val: "winter", label: "Winter" },
];

const LANGUAGE_OPTIONS = [
  { val: "", label: "All" },
  { val: "sub", label: "SUB" },
  { val: "dub", label: "DUB" },
];

const COUNTRY_OPTIONS = [
  { val: "", label: "All" },
  { val: "japan", label: "Japan" },
  { val: "china", label: "China (Donghua)" },
  { val: "korea", label: "South Korea" },
];

const SORT_OPTIONS = [
  { val: "default", label: "Default" },
  { val: "updated_date", label: "Recently Updated" },
  { val: "added_date", label: "Recently Added" },
  { val: "release_date", label: "Released Date" },
  { val: "trending", label: "Trending" },
  { val: "title_az", label: "Name A-Z" },
  { val: "avg_score", label: "Score" },
  { val: "mal_score", label: "MAL Score" },
  { val: "most_viewed", label: "Most Watched" },
  { val: "most_followed", label: "Most Followed" },
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

function FilterPill({ label, value, options, onChange }) {
  const isSelected = value && value !== "all" && value !== "default";
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 bg-[#18181b] hover:bg-[#222226] border border-zinc-700/60 rounded-xl px-3.5 py-2 transition-all shrink-0">
      <span className="text-xs font-bold text-white tracking-wide shrink-0 select-none">
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1 capitalize transition-colors ${
          isSelected ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        {options.map((opt) => (
          <option
            key={opt.val}
            value={opt.val}
            className="bg-zinc-900 text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isFilterPath =
    location.pathname.startsWith("/filter") ||
    location.pathname.startsWith("/filtter");

  const keyword =
    searchParams.get("keyword") ||
    searchParams.get("query") ||
    searchParams.get("q") ||
    "";
  const page = parseInt(searchParams.get("page"), 10) || 1;

  // URL Filter Parameters
  const paramType = searchParams.get("type") || "";
  const paramStatus = searchParams.get("status") || "";
  const paramRated = searchParams.get("rated") || searchParams.get("rating") || "";
  const paramScore = searchParams.get("score") || "";
  const paramSeason = searchParams.get("season") || "";
  const paramLanguage = searchParams.get("language") || "";
  const paramCountry = searchParams.get("country") || "";
  const paramSort = searchParams.get("sort") || "default";
  const paramSy = searchParams.get("sy") || "";
  const paramSm = searchParams.get("sm") || "";
  const paramSd = searchParams.get("sd") || "";
  const paramEy = searchParams.get("ey") || "";
  const paramEm = searchParams.get("em") || "";
  const paramEd = searchParams.get("ed") || "";

  // Parse genres from URL (handles genre[], genres=a,b, genre=a)
  const paramGenres = useMemo(() => {
    const fromArray = searchParams.getAll("genre[]");
    if (fromArray.length > 0) return fromArray;
    const fromString = searchParams.get("genres") || searchParams.get("genre");
    if (fromString) {
      return fromString
        .split(",")
        .map((g) => g.trim().toLowerCase())
        .filter(Boolean);
    }
    return [];
  }, [searchParams]);

  // Are any advanced filters active in the URL?
  const hasActiveFiltersInUrl = useMemo(() => {
    return Boolean(
      paramType ||
        paramStatus ||
        paramRated ||
        paramScore ||
        paramSeason ||
        paramLanguage ||
        paramCountry ||
        paramSy ||
        paramSm ||
        paramSd ||
        paramEy ||
        paramEm ||
        paramEd ||
        (paramSort && paramSort !== "default") ||
        paramGenres.length > 0
    );
  }, [
    paramType,
    paramStatus,
    paramRated,
    paramScore,
    paramSeason,
    paramLanguage,
    paramCountry,
    paramSy,
    paramSm,
    paramSd,
    paramEy,
    paramEm,
    paramEd,
    paramSort,
    paramGenres,
  ]);

  // Local state for the filter panel form
  const [filterType, setFilterType] = useState(paramType);
  const [filterStatus, setFilterStatus] = useState(paramStatus);
  const [filterRated, setFilterRated] = useState(paramRated);
  const [filterScore, setFilterScore] = useState(paramScore);
  const [filterSeason, setFilterSeason] = useState(paramSeason);
  const [filterLanguage, setFilterLanguage] = useState(paramLanguage);
  const [filterCountry, setFilterCountry] = useState(paramCountry);
  const [filterSort, setFilterSort] = useState(paramSort);
  const [filterSy, setFilterSy] = useState(paramSy);
  const [filterSm, setFilterSm] = useState(paramSm);
  const [filterSd, setFilterSd] = useState(paramSd);
  const [filterEy, setFilterEy] = useState(paramEy);
  const [filterEm, setFilterEm] = useState(paramEm);
  const [filterEd, setFilterEd] = useState(paramEd);
  const [selectedGenres, setSelectedGenres] = useState(paramGenres);

  // Synchronize local filter state when URL searchParams changes
  useEffect(() => {
    setFilterType(paramType);
    setFilterStatus(paramStatus);
    setFilterRated(paramRated);
    setFilterScore(paramScore);
    setFilterSeason(paramSeason);
    setFilterLanguage(paramLanguage);
    setFilterCountry(paramCountry);
    setFilterSort(paramSort);
    setFilterSy(paramSy);
    setFilterSm(paramSm);
    setFilterSd(paramSd);
    setFilterEy(paramEy);
    setFilterEm(paramEm);
    setFilterEd(paramEd);
    setSelectedGenres(paramGenres);
  }, [
    paramType,
    paramStatus,
    paramRated,
    paramScore,
    paramSeason,
    paramLanguage,
    paramCountry,
    paramSort,
    paramSy,
    paramSm,
    paramSd,
    paramEy,
    paramEm,
    paramEd,
    paramGenres,
  ]);

  // Toggle filter drawer open/closed (open by default on /filter or if filters are active)
  const [isFilterOpen, setIsFilterOpen] = useState(
    isFilterPath || hasActiveFiltersInUrl
  );

  const [inputQuery, setInputQuery] = useState(keyword);
  const [searchData, setSearchData] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setInputQuery(keyword);
  }, [keyword]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (paramType) count++;
    if (paramStatus) count++;
    if (paramRated) count++;
    if (paramScore) count++;
    if (paramSeason) count++;
    if (paramLanguage) count++;
    if (paramCountry) count++;
    if (paramSy || paramSm || paramSd) count++;
    if (paramEy || paramEm || paramEd) count++;
    if (paramSort && paramSort !== "default") count++;
    count += paramGenres.length;
    return count;
  }, [
    paramType,
    paramStatus,
    paramRated,
    paramScore,
    paramSeason,
    paramLanguage,
    paramCountry,
    paramSy,
    paramSm,
    paramSd,
    paramEy,
    paramEm,
    paramEd,
    paramSort,
    paramGenres,
  ]);

  // Main Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      // If no keyword and not on filter page and no filters active:
      if (!keyword.trim() && !isFilterPath && !hasActiveFiltersInUrl) {
        setSearchData([]);
        setTotalPages(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (hasActiveFiltersInUrl || isFilterPath) {
          // Use Advanced Filter API
          const filterPayload = {
            page,
            type: paramType,
            status: paramStatus,
            rating: paramRated,
            score: paramScore,
            season: paramSeason,
            language: paramLanguage,
            country: paramCountry,
            sort: paramSort,
            sy: paramSy,
            sm: paramSm,
            sd: paramSd,
            ey: paramEy,
            em: paramEm,
            ed: paramEd,
            genres: paramGenres,
          };

          const data = await getFilter(filterPayload);
          setSearchData(data.data || []);
          setTotalPages(data.totalPage || 1);
        } else {
          // Standard Keyword Search
          const data = await getSearch(keyword, page);
          setSearchData(data.data || []);
          setTotalPages(data.totalPage || 1);
        }
      } catch (err) {
        console.error("Error fetching search/filter data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [
    keyword,
    page,
    isFilterPath,
    hasActiveFiltersInUrl,
    paramType,
    paramStatus,
    paramRated,
    paramScore,
    paramSeason,
    paramLanguage,
    paramCountry,
    paramSort,
    paramSy,
    paramSm,
    paramSd,
    paramEy,
    paramEm,
    paramEd,
    paramGenres,
  ]);

  // Page change
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    setSearchParams(newParams);
  };

  // Search input submission
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const trimmed = inputQuery.trim();
    if (trimmed) {
      navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
    } else {
      // If submitted empty, navigate to filter!
      navigate("/filter");
      setIsFilterOpen(true);
    }
  };

  const handleClearSearch = () => {
    setInputQuery("");
  };

  const handlePopularSearchClick = (term) => {
    setInputQuery(term);
    navigate(`/search?keyword=${encodeURIComponent(term)}`);
  };

  // Genre selection toggle
  const toggleGenre = useCallback((genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((g) => g !== genreId)
        : [...prev, genreId]
    );
  }, []);

  // Apply all filter choices to URL
  const handleApplyFilter = (e) => {
    e?.preventDefault();
    const newParams = new URLSearchParams();

    if (keyword.trim() && !isFilterPath) {
      newParams.set("keyword", keyword.trim());
    }
    newParams.set("page", "1");

    if (filterType) newParams.set("type", filterType);
    if (filterStatus) newParams.set("status", filterStatus);
    if (filterRated) newParams.set("rating", filterRated);
    if (filterScore) newParams.set("score", filterScore);
    if (filterSeason) newParams.set("season", filterSeason);
    if (filterLanguage) newParams.set("language", filterLanguage);
    if (filterCountry) newParams.set("country", filterCountry);
    if (filterSort && filterSort !== "default") newParams.set("sort", filterSort);

    if (filterSy) newParams.set("sy", filterSy);
    if (filterSm) newParams.set("sm", filterSm);
    if (filterSd) newParams.set("sd", filterSd);

    if (filterEy) newParams.set("ey", filterEy);
    if (filterEm) newParams.set("em", filterEm);
    if (filterEd) newParams.set("ed", filterEd);

    selectedGenres.forEach((g) => {
      newParams.append("genre[]", g);
    });

    const targetBase = isFilterPath ? "/filter" : "/search";
    navigate(`${targetBase}?${newParams.toString()}`);
  };

  // Reset all filters back to default
  const handleResetFilters = () => {
    setFilterType("");
    setFilterStatus("");
    setFilterRated("");
    setFilterScore("");
    setFilterSeason("");
    setFilterLanguage("");
    setFilterCountry("");
    setFilterSort("default");
    setFilterSy("");
    setFilterSm("");
    setFilterSd("");
    setFilterEy("");
    setFilterEm("");
    setFilterEd("");
    setSelectedGenres([]);

    if (isFilterPath) {
      navigate("/filter");
    } else if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    } else {
      navigate("/search");
    }
  };

  // Remove a single active filter badge
  const removeFilterParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === "genre") {
      const remaining = paramGenres.filter((g) => g !== value);
      newParams.delete("genre[]");
      newParams.delete("genres");
      newParams.delete("genre");
      remaining.forEach((g) => newParams.append("genre[]", g));
    } else if (key === "date_start") {
      newParams.delete("sy");
      newParams.delete("sm");
      newParams.delete("sd");
    } else if (key === "date_end") {
      newParams.delete("ey");
      newParams.delete("em");
      newParams.delete("ed");
    } else {
      newParams.delete(key);
      if (key === "rating") newParams.delete("rated");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const searchGridClass =
    "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 max-[478px]:gap-2.5";

  return (
    <div className="w-full min-h-screen bg-black text-white pt-[76px] pb-16">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-y-8">
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl" />

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-zinc-600">/</span>
            <Link
              to={isFilterPath ? "/filter" : "/search"}
              className="hover:text-white transition-colors text-zinc-200"
            >
              {isFilterPath ? "Filter" : "Search"}
            </Link>
            {keyword && (
              <>
                <span className="text-zinc-600">/</span>
                <span className="text-white truncate max-w-[200px]">
                  "{keyword}"
                </span>
              </>
            )}
            {hasActiveFiltersInUrl && !keyword && (
              <>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-300">Filtered Catalog</span>
              </>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Title & Stats */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  {isFilterPath ? (
                    "Filter Anime"
                  ) : keyword ? (
                    <>
                      Results for{" "}
                      <span className="text-zinc-100 bg-zinc-800/80 px-2.5 py-0.5 rounded-lg border border-zinc-700/60 font-semibold inline-block">
                        "{keyword}"
                      </span>
                    </>
                  ) : (
                    "Explore & Filter Anime"
                  )}
                </h1>

                {!loading && searchData && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                    {searchData.length}{" "}
                    {searchData.length === 1 ? "anime" : "anime found"}
                  </span>
                )}

                {totalPages > 1 && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-800 text-zinc-400">
                    Page {page} of {totalPages}
                  </span>
                )}
              </div>

              <p className="text-sm text-zinc-400 max-w-xl">
                {isFilterPath
                  ? "Customize your search with granular filters: type, status, rated, score, season, language, country, dates, and genres."
                  : keyword
                  ? "Browse matching series, movies, and specials. Click the Filter button to refine your search."
                  : "Discover series, movies, and episodes across the catalog. Type a query or open filters below."}
              </p>
            </div>

            {/* Controls: Search Box & Filter Toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center w-full lg:w-[380px] relative group"
              >
                <div className="relative w-full">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Search or enter empty for filter..."
                    className="w-full bg-zinc-950/80 hover:bg-zinc-950 text-white placeholder-zinc-500 pl-10 pr-20 py-2.5 rounded-xl border border-zinc-700/70 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all text-sm shadow-inner"
                  />
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-white transition-colors text-sm pointer-events-none"
                  />

                  {inputQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-14 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1 transition-colors"
                      title="Clear input"
                    >
                      <FontAwesomeIcon icon={faXmark} className="text-xs" />
                    </button>
                  )}

                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-zinc-200 hover:bg-white text-zinc-900 font-semibold text-xs transition-all shadow-sm"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
                  isFilterOpen || activeFiltersCount > 0
                    ? "bg-zinc-100 text-zinc-900 border-white shadow-lg"
                    : "bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700/70 text-zinc-200 hover:text-white"
                }`}
              >
                <FontAwesomeIcon icon={faSliders} className="text-xs" />
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isFilterOpen
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-900"
                    }`}
                  >
                    {activeFiltersCount}
                  </span>
                )}
                <FontAwesomeIcon
                  icon={isFilterOpen ? faChevronUp : faChevronDown}
                  className="text-[10px] ml-0.5 opacity-70"
                />
              </button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFiltersCount > 0 && (
            <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-zinc-500 font-medium mr-1 flex items-center gap-1">
                <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
                Active filters:
              </span>

              {paramType && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  Type: <strong className="text-white uppercase">{paramType}</strong>
                  <button
                    onClick={() => removeFilterParam("type")}
                    className="hover:text-red-400 ml-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </span>
              )}

              {paramStatus && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  Status: <strong className="text-white">{paramStatus}</strong>
                  <button
                    onClick={() => removeFilterParam("status")}
                    className="hover:text-red-400 ml-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </span>
              )}

              {paramRated && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  Rated: <strong className="text-white uppercase">{paramRated}</strong>
                  <button
                    onClick={() => removeFilterParam("rating")}
                    className="hover:text-red-400 ml-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </span>
              )}

              {paramScore && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  Score: <strong className="text-white">{paramScore}+</strong>
                  <button
                    onClick={() => removeFilterParam("score")}
                    className="hover:text-red-400 ml-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </span>
              )}

              {paramSeason && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 capitalize">
                  Season: <strong className="text-white">{paramSeason}</strong>
                  <button
                    onClick={() => removeFilterParam("season")}
                    className="hover:text-red-400 ml-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </span>
              )}

              {paramLanguage && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 uppercase">
                  Language: <strong className="text-white">{paramLanguage}</strong>
                  <button
                    onClick={() => removeFilterParam("language")}
                    className="hover:text-red-400 ml-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </span>
              )}

              {paramCountry && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 capitalize">
                  Country: <strong className="text-white">{paramCountry}</strong>
                  <button
                    onClick={() => removeFilterParam("country")}
                    className="hover:text-red-400 ml-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </span>
              )}

              {(paramSy || paramSm || paramSd) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  From:{" "}
                  <strong className="text-white">
                    {[paramSy, paramSm, paramSd].filter(Boolean).join("-")}
                  </strong>
                  <button
                    onClick={() => removeFilterParam("date_start")}
                    className="hover:text-red-400 ml-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </span>
              )}

              {(paramEy || paramEm || paramEd) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  To:{" "}
                  <strong className="text-white">
                    {[paramEy, paramEm, paramEd].filter(Boolean).join("-")}
                  </strong>
                  <button
                    onClick={() => removeFilterParam("date_end")}
                    className="hover:text-red-400 ml-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </span>
              )}

              {paramSort && paramSort !== "default" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  Sort:{" "}
                  <strong className="text-white">
                    {SORT_OPTIONS.find((s) => s.val === paramSort)?.label || paramSort}
                  </strong>
                  <button
                    onClick={() => removeFilterParam("sort")}
                    className="hover:text-red-400 ml-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </span>
              )}

              {paramGenres.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 capitalize"
                >
                  Genre: <strong className="text-white">{g}</strong>
                  <button
                    onClick={() => removeFilterParam("genre", g)}
                    className="hover:text-red-400 ml-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </span>
              ))}

              <button
                onClick={handleResetFilters}
                className="text-xs text-zinc-400 hover:text-white underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filter Panel (matches screenshot layout) */}
        {isFilterOpen && (
          <form
            onSubmit={handleApplyFilter}
            className="p-6 sm:p-8 rounded-2xl bg-[#141418] border border-zinc-800 shadow-2xl backdrop-blur-xl flex flex-col gap-6"
          >
            {/* Filter Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-base tracking-wide">
                  Filter
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="text-zinc-400 hover:text-white p-1 text-xs"
                    title="Close"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              </div>

              {/* Filter Pills Grid */}
              <div className="flex flex-wrap gap-2.5 items-center">
                <FilterPill
                  label="Type"
                  value={filterType}
                  options={TYPE_OPTIONS}
                  onChange={setFilterType}
                />
                <FilterPill
                  label="Status"
                  value={filterStatus}
                  options={STATUS_OPTIONS}
                  onChange={setFilterStatus}
                />
                <FilterPill
                  label="Rated"
                  value={filterRated}
                  options={RATED_OPTIONS}
                  onChange={setFilterRated}
                />
                <FilterPill
                  label="Score"
                  value={filterScore}
                  options={SCORE_OPTIONS}
                  onChange={setFilterScore}
                />
                <FilterPill
                  label="Season"
                  value={filterSeason}
                  options={SEASON_OPTIONS}
                  onChange={setFilterSeason}
                />
                <FilterPill
                  label="Language"
                  value={filterLanguage}
                  options={LANGUAGE_OPTIONS}
                  onChange={setFilterLanguage}
                />
                <FilterPill
                  label="Country"
                  value={filterCountry}
                  options={COUNTRY_OPTIONS}
                  onChange={setFilterCountry}
                />
                <DatePickerPill
                  label="Start Date"
                  year={filterSy}
                  month={filterSm}
                  day={filterSd}
                  onDateChange={({ year, month, day }) => {
                    setFilterSy(year);
                    setFilterSm(month);
                    setFilterSd(day);
                  }}
                  onClear={() => {
                    setFilterSy("");
                    setFilterSm("");
                    setFilterSd("");
                  }}
                />
                <DatePickerPill
                  label="End Date"
                  year={filterEy}
                  month={filterEm}
                  day={filterEd}
                  onDateChange={({ year, month, day }) => {
                    setFilterEy(year);
                    setFilterEm(month);
                    setFilterEd(day);
                  }}
                  onClear={() => {
                    setFilterEy("");
                    setFilterEm("");
                    setFilterEd("");
                  }}
                />
                <FilterPill
                  label="Sort"
                  value={filterSort}
                  options={SORT_OPTIONS}
                  onChange={setFilterSort}
                />
              </div>
            </div>

            {/* Genre Section */}
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-base tracking-wide">
                  Genre
                </h3>
                {selectedGenres.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedGenres([])}
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    Clear genres
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {ALL_GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.id);
                  return (
                    <button
                      type="button"
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-white text-black font-bold shadow-md shadow-white/10 scale-105"
                          : "bg-[#18181b] hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white"
                      }`}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700/60 transition-all"
              >
                Reset
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-lg hover:shadow-white/20 active:scale-95"
              >
                <FontAwesomeIcon icon={faFilter} className="text-xs" />
                <span>Filter</span>
              </button>
            </div>
          </form>
        )}

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
        ) : !keyword.trim() && !isFilterPath && !hasActiveFiltersInUrl ? (
          /* Landing state when user navigates directly to /search */
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-300 text-2xl mb-4 shadow-xl">
              <FontAwesomeIcon icon={faCompass} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              What would you like to watch?
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              Search by anime title, or explore our full catalog using the Filter button above.
            </p>

            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow"
              >
                <FontAwesomeIcon icon={faSliders} className="text-xs" />
                <span>Open Advanced Filter</span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                Or search trending anime:
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center max-w-xl">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handlePopularSearchClick(term)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-xs font-medium text-zinc-200 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : page > totalPages && totalPages > 0 ? (
          /* Page out-of-range state */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-xl mb-4">
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              End of Results
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              You've navigated to page {page}, but only {totalPages}{" "}
              {totalPages === 1 ? "page exists" : "pages exist"} for this query.
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
            <h2 className="text-xl font-bold text-white mb-2">
              Could Not Fetch Results
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              We encountered an issue connecting to the catalog. Please try again.
            </p>
            <button
              onClick={() => handlePageChange(page)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium border border-zinc-700 transition-all"
            >
              Retry
            </button>
          </div>
        ) : searchData && searchData.length > 0 ? (
          /* Active Results State */
          <div className="flex flex-col gap-y-6">
            {/* Anime Cards Grid */}
            <CategoryCard
              data={searchData}
              showViewMore={false}
              className="mt-0"
              gridClass={searchGridClass}
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
              {keyword ? `No results found for "${keyword}"` : "No matching anime found"}
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mb-8 leading-relaxed">
              We couldn't find any anime matching your criteria. Try adjusting your filters,
              or discover something new from trending titles below.
            </p>

            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold border border-zinc-700 transition-all"
              >
                Reset All Filters
              </button>
            </div>

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
