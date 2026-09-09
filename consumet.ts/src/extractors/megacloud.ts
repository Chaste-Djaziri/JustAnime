import { VideoExtractor, IVideo, ISubtitle } from '../models';

interface IMegaCloudOutput {
  sources: {
    url: string;
    quality: string;
  }[];
  tracks: {
    file: string;
    label?: string;
    kind?: string;
  }[];
  audio: any[];
  intro: { start: number; end: number };
  outro: { start: number; end: number };
  headers: {
    Referer: string;
    'User-Agent': string;
  };
}

class MegaCloud extends VideoExtractor {
  protected override serverName = 'MegaCloud';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<{ sources: IVideo[]; subtitles: ISubtitle[]; intro?: { start: number; end: number }; outro?: { start: number; end: number }; headers?: Record<string, string> }> => {
    try {
      this.sources = [];
      const href = videoUrl.href;

      if (videoUrl.hostname.includes('megaplay.buzz')) {
        const pageRes = await this.client.get(href, {
          headers: {
            Referer: 'https://hianime.at/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        const match = pageRes.data.match(/data-id=["'](\d+)["']/);
        const dataId = match ? match[1] : null;
        if (!dataId) {
          throw new Error('Unable to find player data-id for Megaplay');
        }

        const sourcesRes = await this.client.get(`https://megaplay.buzz/stream/getSourcesNew?id=${dataId}`, {
          headers: {
            Referer: href,
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        const data = sourcesRes.data;
        const sources: IVideo[] = [];
        if (data.sources) {
          if (typeof data.sources === 'object' && data.sources.file) {
            sources.push({
              url: data.sources.file,
              quality: 'auto',
              isM3U8: data.sources.file.includes('.m3u8'),
            });
          } else if (Array.isArray(data.sources)) {
            for (const s of data.sources) {
              const url = s.file || s.url;
              if (url) {
                sources.push({
                  url,
                  quality: s.quality || 'auto',
                  isM3U8: url.includes('.m3u8'),
                });
              }
            }
          }
        }

        const subtitles: ISubtitle[] = (data.tracks || []).map((t: any) => ({
          lang: t.label || 'Unknown',
          url: t.file,
          kind: t.kind || 'captions',
        }));

        return {
          sources,
          subtitles,
          intro: data.intro,
          outro: data.outro,
          headers: {
            Referer: 'https://megaplay.buzz/',
          },
        };
      }

      // Fallback to crawlr.cc or other endpoints if needed
      try {
        const apiUrl = 'https://crawlr.cc/9D7F1B3E8?url=' + encodeURIComponent(href);
        const { data } = await this.client.get<IMegaCloudOutput>(apiUrl);
        if (data.sources && data.sources.length > 0) {
          for (const src of data.sources) {
            this.sources.push({
              url: src.url,
              quality: src.quality ?? 'auto',
              isM3U8: src.url.includes('.m3u8'),
            });
          }
          const subtitles: ISubtitle[] =
            data.tracks?.map(t => ({
              lang: t.label ?? 'Unknown',
              url: t.file,
              kind: t.kind ?? 'captions',
            })) ?? [];
          return {
            sources: this.sources,
            subtitles,
          };
        }
      } catch (_) {}

      throw new Error('No sources found for video');
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default MegaCloud;
