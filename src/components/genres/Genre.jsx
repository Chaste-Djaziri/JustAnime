import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const DEFAULT_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];

function Genre({ data }) {
  const scrollContainerRef = useRef(null);

  const genresList =
    Array.isArray(data) && data.length > 0
      ? data.map((item) => (typeof item === "string" ? item : item.name || item.title || String(item)))
      : DEFAULT_GENRES;

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full flex items-center gap-2 select-none">
      {/* Left scroll button */}
      <button
        type="button"
        onClick={() => scroll("left")}
        className="w-9 h-9 rounded-lg bg-[#141414] hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-white flex items-center justify-center transition-all flex-shrink-0 cursor-pointer active:scale-95 shadow-md"
        aria-label="Scroll genres left"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
      </button>

      {/* Scrollable genre pills container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-2 py-1"
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {genresList.map((item, index) => {
          const genreSlug = encodeURIComponent(item.toLowerCase().replace(/\s+/g, "-"));
          const genreName = item.charAt(0).toUpperCase() + item.slice(1);
          return (
            <Link
              to={`/genre/${genreSlug}`}
              key={index}
              className="px-4 h-9 rounded-lg bg-[#141414] hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium tracking-wide flex items-center justify-center whitespace-nowrap transition-all duration-200 flex-shrink-0 active:scale-95 shadow-sm"
            >
              {genreName}
            </Link>
          );
        })}
      </div>

      {/* Right scroll button */}
      <button
        type="button"
        onClick={() => scroll("right")}
        className="w-9 h-9 rounded-lg bg-[#141414] hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-white flex items-center justify-center transition-all flex-shrink-0 cursor-pointer active:scale-95 shadow-md"
        aria-label="Scroll genres right"
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
      </button>
    </div>
  );
}

export default React.memo(Genre);

