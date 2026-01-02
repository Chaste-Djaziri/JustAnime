import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import website_name from "@/src/config/website";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import Loader from "@/src/components/Loader/Loader";
import Error from "@/src/components/error/Error";
import { useLanguage } from "@/src/context/LanguageContext";

function InfoItem({ label, value, isProducer = true }) {
  return (
    value && (
      <div className="text-[11px] sm:text-[14px] font-medium transition-all duration-300">
        <span className="text-gray-400">{`${label}: `}</span>
        <span className="font-light text-white/90">
          {Array.isArray(value) ? (
            value.map((item, index) =>
              isProducer ? (
                <Link
                  to={`/producer/${item
                    .replace(/[&'"^%$#@!()+=<>:;,.?/\\|{}[\]`~*_]/g, "")
                    .split(" ")
                    .join("-")
                    .replace(/-+/g, "-")}`}
                  key={index}
                  className="cursor-pointer transition-colors duration-300 hover:text-gray-300"
                >
                  {item}
                  {index < value.length - 1 && ", "}
                </Link>
              ) : (
                <span key={index}>
                  {item}
                  {index < value.length - 1 && ", "}
                </span>
              )
            )
          ) : isProducer ? (
            <Link
              to={`/producer/${value
                .replace(/[&'"^%$#@!()+=<>:;,.?/\\|{}[\]`~*_]/g, "")
                .split(" ")
                .join("-")
                .replace(/-+/g, "-")}`}
              className="cursor-pointer transition-colors duration-300 hover:text-gray-300"
            >
              {value}
            </Link>
          ) : (
            <span>{value}</span>
          )}
        </span>
      </div>
    )
  );
}

function Tag({ bgColor, index, icon, text }) {
  return (
    <div
      className="flex space-x-1 justify-center items-center px-2 sm:px-3 py-0.5 sm:py-1 text-white backdrop-blur-md bg-white/10 font-medium text-[10px] sm:text-[13px] rounded-md sm:rounded-full transition-all duration-300 hover:bg-white/20"
    >
      {icon && <FontAwesomeIcon icon={icon} className="text-[10px] sm:text-[12px] mr-1" />}
      <p className="text-[10px] sm:text-[12px]">{text}</p>
    </div>
  );
}

function AnimeInfo({ random = false }) {
  const { language } = useLanguage();
  const { id: paramId } = useParams();
  const id = random ? null : paramId;
  const [isFull, setIsFull] = useState(false);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (id === "404-not-found-page") {
      console.log("404 got!");
      return null;
    } else {
      const fetchAnimeInfo = async () => {
        setLoading(true);
        try {
          const data = await getAnimeInfo(id, random);
          setAnimeInfo(data);
        } catch (err) {
          console.error("Error fetching anime info:", err);
          setError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnimeInfo();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [id, random]);
  useEffect(() => {
    if (animeInfo && location.pathname === `/${animeInfo.id}`) {
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  }, [animeInfo]);
  if (loading) return <Loader type="animeInfo" />;
  if (error) {
    return <Error />;
  }
  if (!animeInfo) {
    navigate("/404-not-found-page");
    return undefined;
  }
  const {
    title,
    japaneseTitle,
    image,
    description,
    status,
    type,
    otherName,
    totalEpisodes,
    subOrDub,
    hasSub,
    hasDub,
    genres,
    recommendations,
    relations,
    episodes,
  } = animeInfo;
  const japanese_title = japaneseTitle || otherName || "";
  const poster = image;
  const isNotReleased = status?.toLowerCase().includes("not");
  const tags = [
    {
      condition: type,
      bgColor: "#FFBADE",
      text: type,
    },
    {
      condition: status,
      bgColor: "#ffffff",
      text: status,
    },
    {
      condition: hasSub,
      icon: faClosedCaptioning,
      bgColor: "#B0E3AF",
      text: "Sub",
    },
    {
      condition: hasDub,
      icon: faMicrophone,
      bgColor: "#B9E7FF",
      text: "Dub",
    },
    {
      condition: totalEpisodes,
      bgColor: "#ffffff",
      text: `${totalEpisodes} EP`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="relative w-full overflow-hidden mt-[74px] max-md:mt-[60px]">

        {/* Main Content */}
        <div className="relative z-10 container mx-auto py-4 sm:py-6 lg:py-12">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="flex flex-row gap-4">
              {/* Poster Section */}
              <div className="flex-shrink-0">
                <div className="relative w-[130px] xs:w-[150px] aspect-[2/3] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <img
                    src={`${poster}`}
                    alt={`${title} Poster`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Title */}
                <div className="space-y-0.5">
                  <h1 className="text-lg xs:text-xl font-bold tracking-tight truncate">
                    {language === "EN" ? title : japanese_title}
                  </h1>
                  {language === "EN" && japanese_title && (
                    <p className="text-white/50 text-[11px] xs:text-xs truncate">JP Title: {japanese_title}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(({ condition, icon, text }, index) =>
                    condition && (
                      <Tag
                        key={index}
                        index={index}
                        icon={icon}
                        text={text}
                      />
                    )
                  )}
                </div>

                {/* Overview - Limited for mobile */}
                {description && (
                  <div className="text-gray-300 leading-relaxed text-xs">
                    {description.length > 150 ? (
                      <>
                        {isFull ? (
                          description
                        ) : (
                          <div className="line-clamp-3">{description}</div>
                        )}
                        <button
                          className="mt-1 text-white/70 hover:text-white transition-colors text-[10px] font-medium"
                          onClick={() => setIsFull(!isFull)}
                        >
                          {isFull ? "Show Less" : "Read More"}
                        </button>
                      </>
                    ) : (
                      description
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Watch Button - Full Width on Mobile */}
            <div className="mt-6">
              {!isNotReleased ? (
                <Link
                  to={`/watch/${animeInfo.id}`}
                  className="flex justify-center items-center w-full px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg text-white transition-all duration-300 hover:bg-white/20 group"
                >
                  <FontAwesomeIcon
                    icon={faPlay}
                    className="mr-2 text-xs group-hover:text-white"
                  />
                  <span className="font-medium text-sm">Watch Now</span>
                </Link>
              ) : (
                <div className="flex justify-center items-center w-full px-4 py-3 bg-gray-700/50 rounded-lg">
                  <span className="font-medium text-sm">Not released</span>
                </div>
              )}
            </div>

            {/* Details Section - Full Width on Mobile */}
              <div className="mt-6 space-y-3 py-3 backdrop-blur-md bg-white/5 rounded-lg px-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Japanese", value: japanese_title },
                    { label: "Other Name", value: otherName },
                    { label: "Type", value: type },
                    { label: "Status", value: status },
                    { label: "Sub/Dub", value: subOrDub },
                    { label: "Total Episodes", value: totalEpisodes },
                  ].map((item, index) => (
                    <InfoItem
                      key={index}
                      label={item.label}
                      value={item.value}
                    isProducer={false}
                  />
                ))}
              </div>

              {/* Genres */}
              {genres && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-gray-400 text-xs mb-1.5">Genres</p>
                  <div className="flex flex-wrap gap-1">
                    {genres.map((genre, index) => (
                      <Link
                        to={`/genre/${genre.split(" ").join("-")}`}
                        key={index}
                        className="px-2 py-0.5 text-[10px] bg-white/5 rounded-md hover:bg-white/10 transition-colors"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Studios & Producers */}
              {animeInfo?.url && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <InfoItem label="Source" value={animeInfo.url} isProducer={false} />
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout - Existing Code */}
          <div className="hidden md:block">
            <div className="flex flex-row gap-6 lg:gap-10">
              {/* Poster Section */}
              <div className="flex-shrink-0">
                <div className="relative w-[220px] lg:w-[260px] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <img
                    src={`${poster}`}
                    alt={`${title} Poster`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 space-y-4 lg:space-y-5 min-w-0">
                {/* Title */}
                <div className="space-y-1">
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight truncate">
                    {language === "EN" ? title : japanese_title}
                  </h1>
                  {language === "EN" && japanese_title && (
                    <p className="text-white/50 text-sm lg:text-base truncate">JP Title: {japanese_title}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {tags.map(({ condition, icon, text }, index) =>
                    condition && (
                      <Tag
                        key={index}
                        index={index}
                        icon={icon}
                        text={text}
                      />
                    )
                  )}
                </div>

                {/* Overview */}
                {description && (
                  <div className="text-gray-300 leading-relaxed max-w-3xl text-sm lg:text-base">
                    {description.length > 270 ? (
                      <>
                        {isFull
                          ? description
                          : `${description.slice(0, 270)}...`}
                        <button
                          className="ml-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
                          onClick={() => setIsFull(!isFull)}
                        >
                          {isFull ? "Show Less" : "Read More"}
                        </button>
                      </>
                    ) : (
                      description
                    )}
                  </div>
                )}

                {/* Watch Button */}
                {!isNotReleased ? (
                  <Link
                    to={`/watch/${animeInfo.id}`}
                    className="inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] group"
                  >
                    <FontAwesomeIcon
                      icon={faPlay}
                      className="mr-2 text-sm group-hover:text-white"
                    />
                    <span className="font-medium">Watch Now</span>
                  </Link>
                ) : (
                  <div className="inline-flex items-center px-5 py-2.5 bg-gray-700/50 rounded-xl">
                    <span className="font-medium">Not released</span>
                  </div>
                )}

                {/* Details Section */}
                <div className="space-y-4 py-4 backdrop-blur-md bg-white/5 rounded-xl px-5">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Japanese", value: japanese_title },
                      { label: "Other Name", value: otherName },
                      { label: "Type", value: type },
                      { label: "Status", value: status },
                      { label: "Sub/Dub", value: subOrDub },
                      { label: "Total Episodes", value: totalEpisodes },
                    ].map((item, index) => (
                      <InfoItem
                        key={index}
                        label={item.label}
                        value={item.value}
                        isProducer={false}
                      />
                    ))}
                  </div>

                  {/* Genres */}
                  {genres && (
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-gray-400 text-sm mb-2">Genres</p>
                      <div className="flex flex-wrap gap-1.5">
                        {genres.map((genre, index) => (
                          <Link
                            to={`/genre/${genre.split(" ").join("-")}`}
                            key={index}
                            className="px-3 py-1 text-xs bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            {genre}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {animeInfo?.url && (
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <InfoItem label="Source" value={animeInfo.url} isProducer={false} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      {episodes?.length > 0 && (
        <div className="container mx-auto py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Episodes</h2>
            <Link
              to={`/watch/${animeInfo.id}`}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {episodes.slice(0, 24).map((episode) => (
              <Link
                key={episode.id}
                to={`/watch/${animeInfo.id}?episode=${episode.number}`}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs text-white/60">Episode {episode.number}</p>
                  <p className="text-sm font-semibold truncate">
                    {episode.title || `Episode ${episode.number}`}
                  </p>
                </div>
                <FontAwesomeIcon icon={faPlay} className="text-xs text-white/70" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations?.length > 0 && (
        <div className="container mx-auto py-12">
          <CategoryCard
            label="Recommended for you"
            data={recommendations.map((item) => ({
              id: item.id,
              title: item.title,
              japanese_title: item.japaneseTitle ?? "",
              poster: item.image ?? "",
              tvInfo: {
                showType: item.type,
                sub: item.sub,
                dub: item.dub,
              },
            }))}
            limit={recommendations.length}
            showViewMore={false}
          />
        </div>
      )}

      {/* Relations Section */}
      {relations?.length > 0 && (
        <div className="container mx-auto py-12">
          <h2 className="text-2xl font-bold mb-6">Related</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relations.map((relation) => (
              <Link
                key={relation.id}
                to={`/${relation.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <img
                  src={relation.image}
                  alt={relation.title}
                  className="h-16 w-12 object-cover rounded-md"
                />
                <div className="min-w-0">
                  <p className="text-xs text-white/60">{relation.relationType}</p>
                  <p className="text-sm font-semibold truncate">{relation.title}</p>
                  <p className="text-xs text-white/50 truncate">
                    {relation.japaneseTitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnimeInfo;
