import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/src/context/LanguageContext";
import { Link } from "react-router-dom";
import useToolTipPosition from "@/src/hooks/useToolTipPosition";
import Qtip from "../qtip/Qtip";

function Sidecard({ data, label, className, path, limit }) {
  const { language } = useLanguage();
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const handleMouseEnter = (item, index) => {
    const timeout = setTimeout(() => {
      setHoveredItem(item.id + index);
    }, 400);
    setHoverTimeout(timeout);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setHoveredItem(null);
  };

  const [hoveredItem, setHoveredItem] = useState(null);
  const displayData = limit && Array.isArray(data) ? data.slice(0, limit) : data || [];
  const { tooltipPosition, tooltipHorizontalPosition, cardRefs } =
    useToolTipPosition(hoveredItem, displayData);

  return (
    <div className={`flex flex-col space-y-4 ${className || ""}`}>
      {label && (
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-2xl text-white tracking-tight">{label}</h2>
          {path && (
            <Link
              to={`/${path}`}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              View all
            </Link>
          )}
        </div>
      )}
      <div className="flex flex-col space-y-2">
        {displayData &&
          displayData.map((item, index) => (
            <div
              key={index}
              className="group"
              ref={(el) => (cardRefs.current[index] = el)}
              onMouseEnter={() => handleMouseEnter(item, index)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to={`/${item.id}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="block"
              >
                <div className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-[#1f1f1f]">
                  {hoveredItem === item.id + index && window.innerWidth > 1024 && (
                    <div
                      className={`absolute ${tooltipPosition} ${tooltipHorizontalPosition} ${
                        tooltipPosition === "top-1/2"
                          ? "translate-y-[50px]"
                          : "translate-y-[-50px]"
                      } z-[100000] transform transition-all duration-300 ease-in-out ${
                        hoveredItem === item.id + index
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2"
                      }`}
                    >
                      <Qtip id={item.id} />
                    </div>
                  )}
                  <img
                    src={`${item.poster}`}
                    alt={item.title}
                    className="w-[50px] h-[70px] rounded object-cover"
                  />
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                      {language === "EN" ? item.title : item.japanese_title}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.tvInfo?.sub && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#2a2a2a] rounded text-gray-300">
                          <FontAwesomeIcon
                            icon={faClosedCaptioning}
                            className="text-[10px]"
                          />
                          <span className="text-[10px] font-medium">
                            {item.tvInfo.sub}
                          </span>
                        </div>
                      )}
                      {item.tvInfo?.dub && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#2a2a2a] rounded text-gray-300">
                          <FontAwesomeIcon
                            icon={faMicrophone}
                            className="text-[10px]"
                          />
                          <span className="text-[10px] font-medium">
                            {item.tvInfo.dub}
                          </span>
                        </div>
                      )}
                      {item.tvInfo?.showType && (
                        <span className="text-xs text-gray-400">
                          {item.tvInfo.showType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}

export default React.memo(Sidecard);
