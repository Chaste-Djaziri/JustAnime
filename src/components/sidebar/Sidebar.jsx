import { FaChevronLeft } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faRandom, faHome, faClock, faFire, faTv, faPlay, faCirclePlay, faFilePen, faUser, faSliders, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/src/context/LanguageContext";
import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const MENU_ITEMS = [
  { name: "Home", path: "/home", icon: faHome },
  { name: "Release Schedule", path: "/schedule", icon: faCalendarDays },
  { name: "Filter Anime", path: "/filter", icon: faSliders },
  { name: "Profile & Watchlist", path: "/profile", icon: faUser },
  { name: "Recently Added", path: "/recently-added", icon: faCirclePlay },
  { name: "Top Upcoming", path: "/top-upcoming", icon: faFilePen },
  { name: "Subbed Anime", path: "/subbed-anime", icon: faFilePen },
  { name: "Dubbed Anime", path: "/dubbed-anime", icon: faPlay },
  { name: "Most Popular", path: "/most-popular", icon: faFire },
  { name: "Movies", path: "/movie", icon: faFilm },
  { name: "TV Series", path: "/tv", icon: faTv },
  { name: "OVAs", path: "/ova", icon: faCirclePlay },
  { name: "ONAs", path: "/ona", icon: faPlay },
  { name: "Specials", path: "/special", icon: faClock },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const scrollPosition = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!isOpen) {
        scrollPosition.current = window.scrollY;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollPosition.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition.current}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPosition.current);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  useEffect(() => {
    onClose();
  }, [location]);

  return (
    <div className="sidebar-container" aria-hidden={!isOpen}>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar-main ${isOpen ? 'sidebar-open' : ''}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="sidebar-content">
          {/* Header */}
          <div className="sidebar-header">
            <button
              onClick={onClose}
              className="close-button"
            >
              <FaChevronLeft className="text-sm" />
              <span className="text-sm font-medium">Close Menu</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="quick-actions-grid">
              <Link
                to="/random"
                className="quick-action-item"
              >
                <FontAwesomeIcon icon={faRandom} className="text-lg" />
                <span className="text-xs font-medium">Random</span>
              </Link>
              <Link
                to="/movie"
                className="quick-action-item"
              >
                <FontAwesomeIcon icon={faFilm} className="text-lg" />
                <span className="text-xs font-medium">Movie</span>
              </Link>
              <div className="quick-action-item">
                <div className="language-switcher">
                  {["EN", "JP"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`lang-button ${language === lang ? 'active' : ''}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium text-white/60">Language</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="menu-items">
            {MENU_ITEMS.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="menu-item"
              >
                <FontAwesomeIcon icon={item.icon} className="text-lg w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
