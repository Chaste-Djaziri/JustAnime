import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IAnimeEpisode,
  IEpisodeServer,
  MediaFormat,
  StreamingServers,
  SubOrSub,
} from '../../models';

class JustAnime extends AnimeParser {
  override readonly name = 'JustAnime';
  protected override baseUrl = 'https://core.justanime.to/api';
  protected override logo = 'https://justanime.to/logo.png';
  protected override classPath = 'ANIME.JustAnime';
  protected readonly isDubAvailableSeparately: boolean = true;

  private defaultHeaders = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Referer: 'https://justanime.to/',
    Origin: 'https://justanime.to',
  };

  private mapCard(item: any): IAnimeResult {
    if (!item) return {} as IAnimeResult;
    const title =
      typeof item.title === 'string'
        ? item.title
        : item.title?.english || item.title?.romaji || item.title?.native || '';

    const image =
      item.cover ||
      item.coverImage?.extraLarge ||
      item.coverImage?.large ||
      item.coverImage ||
      item.image ||
      '';

    return {
      id: String(item.id || ''),
      title,
      japaneseTitle: item.title?.romaji || item.japaneseTitle || '',
      image,
      cover: item.bannerImage || item.banner || image,
      rating: item.averageScore ? item.averageScore / 10 : item.rating,
      releaseDate:
        item.year ||
        item.seasonYear ||
        (item.startDate?.year ? String(item.startDate.year) : undefined),
      type: (item.format || item.type || 'TV') as MediaFormat,
      duration: item.duration ? `${item.duration}m` : undefined,
      status:
        item.status === 'RELEASING'
          ? MediaStatus.ONGOING
          : item.status === 'FINISHED'
          ? MediaStatus.COMPLETED
          : MediaStatus.UNKNOWN,
      episodes: item.episodes || item.totalEpisodes,
      sub: item.sub ?? (item.episodes || item.nextAiringEpisode?.episode ? Math.max(1, (item.nextAiringEpisode?.episode || 1) - 1) : null),
      dub: item.dub ?? null,
      description: item.description || '',
    };
  }

  /**
   * Search for anime
   * @param query Search query string
   * @param page Page number
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/search`, {
        params: { query, page },
        headers: this.defaultHeaders,
      });

      const results = (data.results || []).map((item: any) => this.mapCard(item));
      return {
        currentPage: data.pageInfo?.currentPage || page,
        hasNextPage: data.pageInfo?.hasNextPage || false,
        totalPages: data.pageInfo?.lastPage,
        totalResults: data.pageInfo?.total,
        results,
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * Search suggestions for autocomplete
   */
  async fetchSearchSuggestions(query: string): Promise<ISearch<IAnimeResult>> {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/search/suggestions`, {
        params: { query },
        headers: this.defaultHeaders,
      });

      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      return {
        results: list.map((item: any) => this.mapCard(item)),
      };
    } catch (err) {
      try {
        return await this.search(query, 1);
      } catch (_) {
        return { results: [] };
      }
    }
  }

  /**
   * Fetch full anime information and episode list
   */
  override fetchAnimeInfo = async (animeId: string): Promise<IAnimeInfo> => {
    try {
      const [infoRes, epRes] = await Promise.allSettled([
        this.client.get(`${this.baseUrl}/anime/${animeId}`, {
          headers: this.defaultHeaders,
        }),
        this.client.get(`${this.baseUrl}/anime/${animeId}/episodes`, {
          headers: this.defaultHeaders,
        }),
      ]);

      const animeData = infoRes.status === 'fulfilled' ? infoRes.value.data?.data || infoRes.value.data : {};
      const episodesData = epRes.status === 'fulfilled' ? epRes.value.data : [];

      const episodesList: any[] = Array.isArray(episodesData)
        ? episodesData
        : Array.isArray(episodesData?.data)
        ? episodesData.data
        : [];

      const card = this.mapCard(animeData);

      const episodes: IAnimeEpisode[] = episodesList.map((ep: any, index: number) => {
        const epNum = typeof ep.number === 'number' ? ep.number : index + 1;
        return {
          id: `${animeId}$episode$${epNum}`,
          number: epNum,
          title: ep.title || `Episode ${epNum}`,
          image: ep.image,
          description: ep.description,
          airDate: ep.airDate,
          isFiller: Boolean(ep.filler),
          url: `https://justanime.to/watch/${animeId}/episode/${epNum}`,
        };
      });

      // If episodes API returned empty but anime has episodes count, synthesize fallback episodes
      if (episodes.length === 0 && card.episodes && card.episodes > 0) {
        for (let i = 1; i <= card.episodes; i++) {
          episodes.push({
            id: `${animeId}$episode$${i}`,
            number: i,
            title: `Episode ${i}`,
            url: `https://justanime.to/watch/${animeId}/episode/${i}`,
          });
        }
      }

      return {
        ...card,
        id: String(animeId),
        genres: animeData.genres || [],
        description: animeData.description || '',
        totalEpisodes: episodes.length || card.episodes,
        episodes,
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * Parse episode ID into animeId and episodeNumber
   */
  private parseEpisodeId(episodeId: string): { animeId: string; epNum: number } {
    let clean = decodeURIComponent(episodeId);
    let animeId = clean;
    let epNum = 1;

    if (clean.includes('$episode$')) {
      const parts = clean.split('$episode$');
      animeId = parts[0];
      epNum = parseInt(parts[1], 10) || 1;
    } else if (clean.includes('?ep=')) {
      const parts = clean.split('?ep=');
      animeId = parts[0];
      epNum = parseInt(parts[1], 10) || 1;
    } else if (clean.includes('/')) {
      const parts = clean.split('/');
      animeId = parts[0];
      epNum = parseInt(parts[parts.length - 1], 10) || 1;
    } else if (/^\d+$/.test(clean)) {
      animeId = clean;
      epNum = 1;
    }

    return { animeId, epNum };
  }

  /**
   * Fetch streaming sources for an episode
   */
  override fetchEpisodeSources = async (
    episodeId: string,
    server: StreamingServers = StreamingServers.MegaPlay,
    category: SubOrSub = SubOrSub.SUB,
  ): Promise<ISource> => {
    try {
      const { animeId, epNum } = this.parseEpisodeId(episodeId);
      const serverName = (server || 'megaplay').toString().toLowerCase();

      const { data } = await this.client.get(
        `${this.baseUrl}/watch/${animeId}/episode/${epNum}/${serverName}`,
        {
          headers: this.defaultHeaders,
        },
      );

      const isDub = category === SubOrSub.DUB;
      const target = isDub && data.dub ? data.dub : data.sub || data;

      const sources = (target.sources || []).map((s: any) => ({
        url: s.url,
        quality: s.quality || 'auto',
        isM3U8: s.isM3U8 ?? true,
      }));

      const subtitles = (target.subtitles || []).map((sub: any) => ({
        url: sub.file || sub.url,
        lang: sub.label || sub.lang || 'English',
        kind: sub.kind || 'captions',
        default: sub.default || false,
      }));

      return {
        headers: target.headers || {
          Referer: serverName === 'zokoanime' ? 'https://zokoanime.video/' : 'https://megaplay.buzz/',
        },
        intro: target.intro || { start: 0, end: 0 },
        outro: target.outro || { start: 0, end: 0 },
        sources,
        subtitles,
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * Fetch available streaming servers for an episode
   */
  override fetchEpisodeServers = async (episodeId: string): Promise<IEpisodeServer[]> => {
    try {
      const { animeId, epNum } = this.parseEpisodeId(episodeId);
      const { data } = await this.client.get(
        `${this.baseUrl}/watch/${animeId}/episode/${epNum}/availability`,
        {
          headers: this.defaultHeaders,
        },
      );

      const serversObj = data?.servers || {};
      const servers: IEpisodeServer[] = [];

      for (const [serverKey, formats] of Object.entries(serversObj)) {
        const fmt = formats as { sub?: boolean; dub?: boolean; hsub?: boolean };
        if (fmt.sub) {
          servers.push({
            name: `${serverKey} (sub)`,
            url: serverKey,
          });
        }
        if (fmt.dub) {
          servers.push({
            name: `${serverKey} (dub)`,
            url: serverKey,
          });
        }
        if (fmt.hsub) {
          servers.push({
            name: `${serverKey} (hsub)`,
            url: serverKey,
          });
        }
      }

      if (servers.length === 0) {
        return [
          { name: 'megaplay (sub)', url: 'megaplay' },
          { name: 'zokoanime (sub)', url: 'zokoanime' },
        ];
      }

      return servers;
    } catch (err) {
      return [
        { name: 'megaplay (sub)', url: 'megaplay' },
        { name: 'zokoanime (sub)', url: 'zokoanime' },
      ];
    }
  };

  /**
   * Fetch home page raw feeds
   */
  async fetchHome(): Promise<any> {
    const { data } = await this.client.get(`${this.baseUrl}/home`, {
      headers: this.defaultHeaders,
    });
    return data;
  }

  /**
   * Spotlight items (trending top 10)
   */
  async fetchSpotlight(): Promise<ISearch<IAnimeResult>> {
    try {
      const home = await this.fetchHome();
      const list = (home.trending || []).slice(0, 10);
      return {
        results: list.map((item: any) => this.mapCard(item)),
      };
    } catch (err) {
      return { results: [] };
    }
  }

  /**
   * Top Airing
   */
  async fetchTopAiring(page: number = 1): Promise<ISearch<IAnimeResult>> {
    try {
      if (page === 1) {
        const home = await this.fetchHome();
        if (home.airing && home.airing.length > 0) {
          return {
            currentPage: 1,
            hasNextPage: true,
            results: home.airing.map((item: any) => this.mapCard(item)),
          };
        }
      }
      return await this.search('', page);
    } catch (err) {
      return { results: [] };
    }
  }

  /**
   * Most Popular
   */
  async fetchMostPopular(page: number = 1): Promise<ISearch<IAnimeResult>> {
    try {
      if (page === 1) {
        const home = await this.fetchHome();
        if (home.popular && home.popular.length > 0) {
          return {
            currentPage: 1,
            hasNextPage: true,
            results: home.popular.map((item: any) => this.mapCard(item)),
          };
        }
      }
      return await this.search('', page);
    } catch (err) {
      return { results: [] };
    }
  }

  /**
   * Most Favorite
   */
  async fetchMostFavorite(page: number = 1): Promise<ISearch<IAnimeResult>> {
    try {
      const home = await this.fetchHome();
      const list = home.favourite || home.popular || [];
      return {
        currentPage: 1,
        hasNextPage: false,
        results: list.map((item: any) => this.mapCard(item)),
      };
    } catch (err) {
      return { results: [] };
    }
  }

  /**
   * Latest Completed
   */
  async fetchLatestCompleted(page: number = 1): Promise<ISearch<IAnimeResult>> {
    try {
      const home = await this.fetchHome();
      const list = home.latestCompleted || [];
      return {
        currentPage: 1,
        hasNextPage: false,
        results: list.map((item: any) => this.mapCard(item)),
      };
    } catch (err) {
      return { results: [] };
    }
  }

  /**
   * Recently Updated Episodes
   */
  async fetchRecentlyUpdated(page: number = 1): Promise<ISearch<IAnimeResult>> {
    try {
      const home = await this.fetchHome();
      const list = home.latestEpisode || [];
      return {
        currentPage: 1,
        hasNextPage: false,
        results: list.map((item: any) => this.mapCard(item)),
      };
    } catch (err) {
      return { results: [] };
    }
  }

  /**
   * Recently Added (New on JustAnime)
   */
  async fetchRecentlyAdded(page: number = 1): Promise<ISearch<IAnimeResult>> {
    try {
      const home = await this.fetchHome();
      const list = home.upcoming || home.latestEpisode || [];
      return {
        currentPage: 1,
        hasNextPage: false,
        results: list.map((item: any) => this.mapCard(item)),
      };
    } catch (err) {
      return { results: [] };
    }
  }

  /**
   * Top Upcoming
   */
  async fetchTopUpcoming(page: number = 1): Promise<ISearch<IAnimeResult>> {
    try {
      const home = await this.fetchHome();
      const list = home.upcoming || [];
      return {
        currentPage: 1,
        hasNextPage: false,
        results: list.map((item: any) => this.mapCard(item)),
      };
    } catch (err) {
      return { results: [] };
    }
  }

  /**
   * Fetch genre list
   */
  async fetchGenres(): Promise<string[]> {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/genre`, {
        headers: this.defaultHeaders,
      });
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Fetch anime by genre
   */
  async fetchGenreAnime(genre: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/search`, {
        params: { genre, page },
        headers: this.defaultHeaders,
      });
      return {
        currentPage: data.pageInfo?.currentPage || page,
        hasNextPage: data.pageInfo?.hasNextPage || false,
        totalPages: data.pageInfo?.lastPage,
        totalResults: data.pageInfo?.total,
        results: (data.results || []).map((item: any) => this.mapCard(item)),
      };
    } catch (err) {
      return { results: [] };
    }
  }

  /**
   * Fetch schedule
   * @param date Date string (YYYY-MM-DD) or day name
   */
  async fetchSchedule(date?: string): Promise<{ results: any[] }> {
    try {
      const dayParam = date
        ? new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        : undefined;

      const { data } = await this.client.get(`${this.baseUrl}/schedule`, {
        params: dayParam ? { day: dayParam } : {},
        headers: this.defaultHeaders,
      });

      const list = Array.isArray(data?.schedule)
        ? data.schedule
        : Array.isArray(data)
        ? data
        : [];

      const results = list.map((item: any) => {
        const anime = item.anime || {};
        const title =
          typeof anime.title === 'string'
            ? anime.title
            : anime.title?.english || anime.title?.romaji || 'Unknown';

        const timeStr = item.airingAt
          ? new Date(item.airingAt * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : '';

        return {
          id: String(anime.id || item.id),
          title,
          name: title,
          jname: anime.title?.romaji || '',
          time: timeStr,
          episode_no: String(item.episode || 'N/A'),
          airingEpisode: String(item.episode || 'N/A'),
          episode: item.episode,
          airingAt: item.airingAt,
        };
      });

      return { results };
    } catch (err) {
      return { results: [] };
    }
  }
}

export default JustAnime;
