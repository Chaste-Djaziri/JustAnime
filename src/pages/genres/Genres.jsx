import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTags,
  faMagnifyingGlass,
  faXmark,
  faSliders,
  faFire,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

export const ALL_ANIME_GENRES = [
  { id: "action", name: "Action", icon: "⚔️", desc: "Fast-paced battles, thrilling martial arts, and high-octane combat." },
  { id: "adventure", name: "Adventure", icon: "🗺️", desc: "Epic quests, grand journeys, and exploring uncharted worlds." },
  { id: "adult-cast", name: "Adult Cast", icon: "🍸", desc: "Stories centered around mature adult characters and workplace life." },
  { id: "cars", name: "Cars", icon: "🏎️", desc: "High-speed track racing, drift legends, and automotive thrills." },
  { id: "comedy", name: "Comedy", icon: "😂", desc: "Hilarious antics, slapstick humor, and witty parodies." },
  { id: "dementia", name: "Dementia", icon: "🌀", desc: "Mind-bending psychological plots and avant-garde surreal visuals." },
  { id: "demons", name: "Demons", icon: "👹", desc: "Supernatural creatures, dark underworlds, and hellish confrontations." },
  { id: "drama", name: "Drama", icon: "🎭", desc: "Emotional tension, character growth, and heartfelt human stories." },
  { id: "ecchi", name: "Ecchi", icon: "✨", desc: "Playful fanservice and cheeky comedic situations." },
  { id: "fantasy", name: "Fantasy", icon: "🔮", desc: "Magic, mythical realms, dragons, and mystical legendary powers." },
  { id: "game", name: "Game", icon: "🎮", desc: "Virtual reality MMOs, tabletop strategy, and deadly survival games." },
  { id: "historical", name: "Historical", icon: "🏛️", desc: "Feudal Japan, ancient empires, samurai eras, and period dramas." },
  { id: "horror", name: "Horror", icon: "👻", desc: "Spine-chilling terror, macabre suspense, and terrifying monsters." },
  { id: "isekai", name: "Isekai", icon: "🚪", desc: "Reincarnated or transported into another fantasy game world." },
  { id: "josei", name: "Josei", icon: "🌸", desc: "Mature romance, career struggles, and realistic relationships." },
  { id: "kids", name: "Kids", icon: "🎈", desc: "Wholesome, family-friendly adventures crafted for all ages." },
  { id: "magic", name: "Magic", icon: "🪄", desc: "Spellcasting, wizard academies, and supernatural arcane arts." },
  { id: "martial-arts", name: "Martial Arts", icon: "🥋", desc: "Hand-to-hand combat, dojo rivalries, and tournament showdowns." },
  { id: "mecha", name: "Mecha", icon: "🤖", desc: "Giant robotic suits, futuristic tech, and sci-fi warfare." },
  { id: "military", name: "Military", icon: "🎖️", desc: "Tactical battles, soldier camaraderie, strategy, and wartime drama." },
  { id: "music", name: "Music", icon: "🎵", desc: "Idol bands, classical recitals, rock concerts, and musical dreams." },
  { id: "mystery", name: "Mystery", icon: "🔍", desc: "Puzzles, detective deductions, dark secrets, and unsolved cases." },
  { id: "parody", name: "Parody", icon: "🤡", desc: "Satirical spoofs poking fun at classic anime tropes." },
  { id: "police", name: "Police", icon: "🚨", desc: "Law enforcement, criminal investigations, and cop partnerships." },
  { id: "psychological", name: "Psychological", icon: "🧠", desc: "Mind games, moral dilemmas, and intense psychological thrillers." },
  { id: "romance", name: "Romance", icon: "💖", desc: "Love stories, heart-fluttering drama, and romantic chemistry." },
  { id: "samurai", name: "Samurai", icon: "🗡️", desc: "Katana duels, bushido code of honor, and wandering ronin." },
  { id: "school", name: "School", icon: "🏫", desc: "High school youth, afterschool clubs, friendships, and exams." },
  { id: "sci-fi", name: "Sci-Fi", icon: "🚀", desc: "Futuristic civilizations, space travel, AI, and cybernetic tech." },
  { id: "seinen", name: "Seinen", icon: "🍷", desc: "Gritty, thought-provoking stories targeted at mature audiences." },
  { id: "shoujo", name: "Shoujo", icon: "🎀", desc: "Sweet romance, sparkling friendship, and coming-of-age tales." },
  { id: "shounen", name: "Shounen", icon: "🔥", desc: "High energy, friendship, perseverance, and battle power." },
  { id: "slice-of-life", name: "Slice of Life", icon: "☕", desc: "Cozy everyday life, relaxation, and heartwarming friendships." },
  { id: "space", name: "Space", icon: "🪐", desc: "Cosmic voyages, intergalactic exploration, and starship fleets." },
  { id: "sports", name: "Sports", icon: "⚽", desc: "Teamwork, athletic triumphs, sweat, passion, and championships." },
  { id: "super-power", name: "Super Power", icon: "⚡", desc: "Superheroes, extraordinary powers, and superhuman clashes." },
  { id: "supernatural", name: "Supernatural", icon: "🌙", desc: "Ghosts, spirits, yokai, vampires, curses, and the occult." },
  { id: "thriller", name: "Thriller", icon: "⏱️", desc: "High stakes, nail-biting suspense, conspiracies, and tension." },
  { id: "vampire", name: "Vampire", icon: "🧛", desc: "Bloodlust, night creatures, immortal curses, and gothic lore." },
  { id: "harem", name: "Harem", icon: "💘", desc: "Multiple romantic suitors vying for one lucky protagonist." },
];

function Genres() {
  const [searchFilter, setSearchFilter] = useState("");

  const filteredGenres = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return ALL_ANIME_GENRES;
    return ALL_ANIME_GENRES.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q) ||
        g.desc.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  return (
    <div className="w-full min-h-screen bg-black text-white pt-[76px] pb-16">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/80 via-zinc-900/50 to-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-pink-500/[0.05] rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl" />

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200">Genres Directory</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <FontAwesomeIcon icon={faTags} className="text-base" />
                </div>
                <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  Anime Genres Directory
                </h1>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                  {ALL_ANIME_GENRES.length} Categories
                </span>
              </div>
              <p className="text-sm text-zinc-400 max-w-xl">
                Browse our complete collection of anime genres, themes, and demographics.
                Find exactly the mood or style of story you're craving.
              </p>
            </div>

            {/* Controls: Search Genre & Filter Button */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full lg:w-72">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter genres by name..."
                  className="w-full bg-zinc-950/90 text-white placeholder-zinc-500 pl-9 pr-8 py-2.5 rounded-xl border border-zinc-800 focus:border-pink-500/60 focus:outline-none text-xs transition-all shadow-inner"
                />
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs pointer-events-none"
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-xs" />
                  </button>
                )}
              </div>

              <Link
                to="/filter"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-all shrink-0 shadow-sm"
              >
                <FontAwesomeIcon icon={faSliders} className="text-xs text-pink-400" />
                <span>Advanced Filter</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Genres Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGenres.map((genre) => (
            <Link
              key={genre.id}
              to={`/genre/${genre.id}`}
              className="group relative flex flex-col p-5 rounded-2xl bg-[#141419]/90 hover:bg-[#1c1c24] border border-white/5 hover:border-pink-500/40 transition-all duration-300 shadow-lg hover:shadow-pink-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-2xl select-none group-hover:scale-110 transition-transform">
                  {genre.icon}
                </span>
                <span className="text-zinc-600 group-hover:text-pink-400 transition-colors text-xs">
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
              </div>

              <h2 className="text-base font-bold text-white group-hover:text-pink-400 transition-colors mb-1 tracking-wide">
                {genre.name}
              </h2>

              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                {genre.desc}
              </p>
            </Link>
          ))}
        </div>

        {filteredGenres.length === 0 && (
          <div className="py-20 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800">
            <p className="text-zinc-300 text-base font-semibold mb-2">
              No genres matching "{searchFilter}"
            </p>
            <button
              onClick={() => setSearchFilter("")}
              className="text-xs text-pink-400 underline hover:text-pink-300"
            >
              Clear filter and view all genres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Genres;
