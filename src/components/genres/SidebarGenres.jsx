import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

export default function SidebarGenres({ genres }) {
  const [showAll, setShowAll] = useState(false);

  const defaultGenres = [
    "Action",
    "Adventure",
    "Cars",
    "Comedy",
    "Dementia",
    "Demons",
    "Drama",
    "Ecchi",
    "Fantasy",
    "Game",
    "Harem",
    "Historical",
    "Horror",
    "Isekai",
    "Josei",
    "Kids",
    "Magic",
    "Martial Arts",
    "Mecha",
    "Military",
    "Music",
    "Mystery",
    "Parody",
    "Police",
    "Psychological",
    "Romance",
    "Samurai",
    "School",
    "Sci-Fi",
    "Seinen",
    "Shoujo",
    "Shounen",
    "Space",
    "Sports",
    "Super Power",
    "Supernatural",
    "Thriller",
    "Vampire",
  ];

  const list =
    Array.isArray(genres) && genres.length > 0 ? genres : defaultGenres;

  const visibleGenres = showAll ? list : list.slice(0, 24);

  return (
    <div className="bg-[#141419] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        <FontAwesomeIcon icon={faTags} className="text-amber-400 text-base" />
        <h3 className="text-lg font-bold text-white tracking-wide">Genres</h3>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {visibleGenres.map((item, index) => {
          const name = typeof item === "string" ? item : item.name || item.title;
          const slug = name.toLowerCase().replace(/\s+/g, "-");
          return (
            <Link
              key={index}
              to={`/genre/${slug}`}
              className="px-2.5 py-1.5 text-center text-xs font-medium text-gray-300 hover:text-white bg-[#1c1c24] hover:bg-amber-400/20 hover:border-amber-400/40 border border-transparent rounded-lg transition-all truncate"
              title={name}
            >
              {name}
            </Link>
          );
        })}
      </div>

      {list.length > 24 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3.5 w-full py-2 text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>{showAll ? "Show less" : "Show more"}</span>
          <FontAwesomeIcon
            icon={showAll ? faChevronUp : faChevronDown}
            className="text-[10px]"
          />
        </button>
      )}
    </div>
  );
}
