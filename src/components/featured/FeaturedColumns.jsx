import { Link } from "react-router-dom";
import { FaChevronRight, FaClosedCaptioning, FaMicrophone } from "react-icons/fa";
import PropTypes from "prop-types";

export default function FeaturedColumns({
  topAiring = [],
  mostPopular = [],
  mostFavorite = [],
  latestCompleted = [],
}) {
  const sections = [
    { title: "Top Airing", path: "top-airing", items: Array.isArray(topAiring) ? topAiring.slice(0, 5) : [] },
    { title: "Most Popular", path: "most-popular", items: Array.isArray(mostPopular) ? mostPopular.slice(0, 5) : [] },
    { title: "Most Favorite", path: "most-favorite", items: Array.isArray(mostFavorite) ? mostFavorite.slice(0, 5) : [] },
    { title: "Latest Completed", path: "completed", items: Array.isArray(latestCompleted) ? latestCompleted.slice(0, 5) : [] },
  ];

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {sections.map((sec, idx) => (
        <div
          key={idx}
          className="bg-[#141414] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between shadow-md"
        >
          <div>
            <h2 className="text-[17px] font-bold text-white mb-3 pb-2 border-b border-zinc-800 flex items-center justify-between">
              <span className="tracking-wide">{sec.title}</span>
            </h2>
            <div className="flex flex-col space-y-2.5">
              {sec.items.map((item, i) => (
                <Link
                  key={i}
                  to={`/${item.id}`}
                  className="flex items-center gap-3 group hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors"
                >
                  <img
                    src={item.poster || item.image}
                    alt={item.title || item.name}
                    className="w-12 h-16 rounded object-cover flex-shrink-0 bg-zinc-800"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-zinc-200 group-hover:text-primary transition-colors line-clamp-1">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400">
                      {item.tvInfo?.sub !== undefined && item.tvInfo?.sub !== null ? (
                        <span className="flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-300">
                          <FaClosedCaptioning className="text-[10px]" />
                          {item.tvInfo.sub}
                        </span>
                      ) : null}
                      {item.tvInfo?.dub !== undefined && item.tvInfo?.dub !== null && item.tvInfo?.dub > 0 ? (
                        <span className="flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-300">
                          <FaMicrophone className="text-[10px]" />
                          {item.tvInfo.dub}
                        </span>
                      ) : null}
                      <span className="text-zinc-500 font-medium text-[11px]">
                        {item.tvInfo?.showType || item.type || "TV"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <Link
            to={`/${sec.path}`}
            className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-white transition-colors group"
          >
            <span>View more</span>
            <FaChevronRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      ))}
    </div>
  );
}

FeaturedColumns.propTypes = {
  topAiring: PropTypes.array,
  mostPopular: PropTypes.array,
  mostFavorite: PropTypes.array,
  latestCompleted: PropTypes.array,
};
