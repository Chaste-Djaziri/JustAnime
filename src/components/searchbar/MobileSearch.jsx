import Suggestion from '../suggestion/Suggestion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faRandom, faSliders } from '@fortawesome/free-solid-svg-icons';
import useSearch from '@/src/hooks/useSearch';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function MobileSearch({ onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        isSearchVisible,
        searchValue,
        setSearchValue,
        isFocused,
        setIsFocused,
        debouncedValue,
        suggestionRefs,
        addSuggestionRef,
    } = useSearch();

    const handleSearchClick = () => {
        if (searchValue.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(searchValue)}`);
            onClose?.();
        } else {
            navigate('/filter');
            onClose?.();
        }
    };

    const handleRandomClick = () => {
        if (location.pathname === "/random") {
            window.location.reload();
        }
        onClose?.();
    };

    return (
        <div className="w-full p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        className="w-full px-5 py-2 bg-[#2a2a2a]/75 text-white rounded-lg focus:outline-none transition-colors placeholder-white/50"
                        placeholder="Search anime..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            setTimeout(() => {
                                const isInsideSuggestionBox = suggestionRefs.current.some(
                                    (ref) => ref && ref.contains(document.activeElement),
                                );
                                if (!isInsideSuggestionBox) {
                                    setIsFocused(false);
                                }
                            }, 100);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearchClick();
                            }
                        }}
                    />
                    <button 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                        onClick={handleSearchClick}
                    >
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="text-lg"
                        />
                    </button>
                </div>
                <Link
                    to="/filter"
                    onClick={() => onClose?.()}
                    className="p-[10px] aspect-square bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
                    title="Filter Anime"
                >
                    <FontAwesomeIcon icon={faSliders} className="text-lg" />
                </Link>
                <Link
                    to={location.pathname === "/random" ? "#" : "/random"}
                    onClick={handleRandomClick}
                    className="p-[10px] aspect-square bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
                    title="Random Anime"
                >
                    <FontAwesomeIcon icon={faRandom} className="text-lg" />
                </Link>
            </div>
            {searchValue.trim() && isFocused && (
                <div
                    ref={addSuggestionRef}
                    className="absolute z-[100000] left-0 right-0 px-4 mt-[60px]"
                >
                    <Suggestion 
                        keyword={debouncedValue} 
                        className="w-full" 
                        onSuggestionClick={onClose}
                    />
                </div>
            )}
        </div>
    );
}

export default MobileSearch;
