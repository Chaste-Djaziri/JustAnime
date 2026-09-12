import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useParams, useLocation, Link } from "react-router-dom";
import getCategoryInfo from "@/src/utils/getCategoryInfo.utils";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import Loader from "@/src/components/Loader/Loader";
import Error from "@/src/components/error/Error";
import PageSlider from "@/src/components/pageslider/PageSlider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm } from "@fortawesome/free-solid-svg-icons";
import website_name from "@/src/config/website";

function AtoZ({ path: propPath }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();

  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const page = parseInt(searchParams.get("page")) || 1;

  // Resolve current active letter from URL params or location
  const rawLetter = useMemo(() => {
    if (params.letter) return params.letter.toLowerCase();
    const segments = location.pathname.replace(/^\/az-list\/?/, "").split("/").filter(Boolean);
    if (segments[0]) return segments[0].toLowerCase();
    if (propPath) {
      const p = propPath.split("/").pop().toLowerCase();
      if (p !== "az-list") return p;
    }
    return "all";
  }, [params.letter, location.pathname, propPath]);

  const activeKey = rawLetter === "az-list" ? "all" : rawLetter || "all";
  const targetPath = activeKey === "all" ? "az-list" : `az-list/${activeKey}`;

  // Human readable title for current filter
  const displayLabel = useMemo(() => {
    if (activeKey === "all") return "All Anime";
    if (activeKey === "other") return "Special Characters (#)";
    if (activeKey === "0-9") return "Numbers (0-9)";
    return `Letter "${activeKey.toUpperCase()}"`;
  }, [activeKey]);

  useEffect(() => {
    document.title = `Sort By Letters (${displayLabel}) - ${website_name}`;

    let isMounted = true;
    const fetchAtoZInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCategoryInfo(targetPath, page);
        if (isMounted) {
          setCategoryInfo(data?.data || []);
          setTotalPages(data?.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching AtoZ category info:", err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAtoZInfo();
    window.scrollTo(0, 0);

    return () => {
      isMounted = false;
    };
  }, [targetPath, page, displayLabel]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const lettersList = useMemo(() => {
    return [
      { label: "All", key: "all", href: "/az-list" },
      { label: "#", key: "other", href: "/az-list/other" },
      { label: "0-9", key: "0-9", href: "/az-list/0-9" },
      ...Array.from({ length: 26 }, (_, i) => {
        const char = String.fromCharCode(65 + i);
        return {
          label: char,
          key: char.toLowerCase(),
          href: `/az-list/${char.toLowerCase()}`,
        };
      }),
    ];
  }, []);

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 min-h-screen text-zinc-100">
      {/* Header Banner */}
      <div className="flex flex-col gap-y-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Sort By Letters
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Browse the entire anime database alphabetically. Currently showing:{" "}
              <span className="text-white font-semibold">{displayLabel}</span>
            </p>
          </div>
          {categoryInfo && (
            <div className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300">
              Page <span className="text-white font-bold">{page}</span> of{" "}
              <span className="text-white font-bold">{totalPages}</span>
            </div>
          )}
        </div>

        {/* Letter Navigation Pills Bar */}
        <div className="flex gap-1.5 sm:gap-2 flex-wrap items-center bg-[#131317] border border-white/5 rounded-2xl p-2.5 sm:p-3 shadow-lg">
          {lettersList.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <Link
                to={item.href}
                key={item.key}
                className={`text-xs sm:text-sm px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl font-bold transition-all duration-200 text-center ${
                  isActive
                    ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-[1.05]"
                    : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <Loader type="AtoZ" />
      ) : error ? (
        <Error />
      ) : !categoryInfo || categoryInfo.length === 0 ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center rounded-3xl bg-[#121214] border border-white/5 p-8 text-center my-8">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 border border-white/10 flex items-center justify-center text-zinc-400 text-xl mb-4">
            <FontAwesomeIcon icon={faFilm} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            No Anime Found
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-6">
            There are no anime titles matching {displayLabel}. Try selecting another letter or view all anime.
          </p>
          <Link
            to="/az-list"
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
          >
            Show All Anime
          </Link>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-y-8">
          <CategoryCard
            data={categoryInfo}
            limit={categoryInfo.length}
            showViewMore={false}
            className="mt-2"
            gridClass="grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3.5 sm:gap-4"
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center w-full mt-8 pb-8">
              <PageSlider
                page={page}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AtoZ;
