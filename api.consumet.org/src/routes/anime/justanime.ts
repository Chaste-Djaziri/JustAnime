import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { ANIME } from '@consumet/extensions';
import { StreamingServers, SubOrSub } from '@consumet/extensions/dist/models';

import cache from '../../utils/cache';
import { redis, REDIS_TTL } from '../../main';
import { Redis } from 'ioredis';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const justanime = new (ANIME as any).JustAnime();

  fastify.get('/', (_, rp) => {
    rp.status(200).send({
      intro: `Welcome to the justanime provider: check out the provider's website @ ${justanime.toString.baseUrl || 'https://justanime.to'}`,
      routes: [
        '/:query',
        '/info',
        '/watch/:episodeId',
        '/servers/:episodeId',
        '/genres',
        '/genre/:genre',
        '/schedule',
        '/spotlight',
        '/top-airing',
        '/most-popular',
        '/most-favorite',
        '/latest-completed',
        '/recently-updated',
        '/recently-added',
        '/top-upcoming',
        '/search-suggestions/:query',
      ],
      documentation: 'https://docs.consumet.org/#tag/justanime',
    });
  });

  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;
    const page = (request.query as { page: number }).page;

    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:search:${query}:${page}`,
            async () => await justanime.search(query, page),
            REDIS_TTL,
          )
        : await justanime.search(query, page);

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/info', async (request: FastifyRequest, reply: FastifyReply) => {
    const id = (request.query as { id: string }).id;

    if (typeof id === 'undefined')
      return reply.status(400).send({ message: 'id is required' });

    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:info:${id}`,
            async () => await justanime.fetchAnimeInfo(id),
            REDIS_TTL,
          )
        : await justanime.fetchAnimeInfo(id);

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get(
    '/watch/:episodeId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const episodeId = (request.params as { episodeId: string }).episodeId;
      const server = (request.query as { server: StreamingServers }).server;
      const category = (request.query as { category: SubOrSub }).category;

      if (typeof episodeId === 'undefined')
        return reply.status(400).send({ message: 'episodeId is required' });

      try {
        let res = redis
          ? await cache.fetch(
              redis as Redis,
              `justanime:watch:${episodeId}:${server}:${category}`,
              async () => await justanime.fetchEpisodeSources(episodeId, server, category),
              REDIS_TTL,
            )
          : await justanime.fetchEpisodeSources(episodeId, server, category);

        reply.status(200).send(res);
      } catch (err) {
        reply
          .status(500)
          .send({ message: 'Something went wrong. Contact developer for help.' });
      }
    },
  );

  fastify.get(
    '/servers/:episodeId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const episodeId = (request.params as { episodeId: string }).episodeId;

      if (typeof episodeId === 'undefined')
        return reply.status(400).send({ message: 'episodeId is required' });

      try {
        let res = redis
          ? await cache.fetch(
              redis as Redis,
              `justanime:servers:${episodeId}`,
              async () => await justanime.fetchEpisodeServers(episodeId),
              REDIS_TTL,
            )
          : await justanime.fetchEpisodeServers(episodeId);

        reply.status(200).send(res);
      } catch (err) {
        reply
          .status(500)
          .send({ message: 'Something went wrong. Contact developer for help.' });
      }
    },
  );

  fastify.get('/genres', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:genres`,
            async () => await justanime.fetchGenres(),
            REDIS_TTL,
          )
        : await justanime.fetchGenres();

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get(
    '/genre/:genre',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const genre = (request.params as { genre: string }).genre;
      const page = (request.query as { page: number }).page;

      if (typeof genre === 'undefined')
        return reply.status(400).send({ message: 'genre is required' });

      try {
        let res = redis
          ? await cache.fetch(
              redis as Redis,
              `justanime:genre:${genre}:${page}`,
              async () => await justanime.fetchGenreAnime(genre, page),
              REDIS_TTL,
            )
          : await justanime.fetchGenreAnime(genre, page);

        reply.status(200).send(res);
      } catch (err) {
        reply
          .status(500)
          .send({ message: 'Something went wrong. Contact developer for help.' });
      }
    },
  );

  fastify.get('/schedule', async (request: FastifyRequest, reply: FastifyReply) => {
    const date = (request.query as { date: string }).date;

    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:schedule:${date}`,
            async () => await justanime.fetchSchedule(date),
            REDIS_TTL,
          )
        : await justanime.fetchSchedule(date);

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/spotlight', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:spotlight`,
            async () => await justanime.fetchSpotlight(),
            REDIS_TTL,
          )
        : await justanime.fetchSpotlight();

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/top-airing', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:top-airing:${page}`,
            async () => await justanime.fetchTopAiring(page),
            REDIS_TTL,
          )
        : await justanime.fetchTopAiring(page);

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/most-popular', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:most-popular:${page}`,
            async () => await justanime.fetchMostPopular(page),
            REDIS_TTL,
          )
        : await justanime.fetchMostPopular(page);

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/most-favorite', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:most-favorite:${page}`,
            async () => await justanime.fetchMostFavorite(page),
            REDIS_TTL,
          )
        : await justanime.fetchMostFavorite(page);

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/latest-completed', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:latest-completed:${page}`,
            async () => await justanime.fetchLatestCompleted(page),
            REDIS_TTL,
          )
        : await justanime.fetchLatestCompleted(page);

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/recently-updated', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:recently-updated:${page}`,
            async () => await justanime.fetchRecentlyUpdated(page),
            REDIS_TTL,
          )
        : await justanime.fetchRecentlyUpdated(page);

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/recently-added', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:recently-added:${page}`,
            async () => await justanime.fetchRecentlyAdded(page),
            REDIS_TTL,
          )
        : await justanime.fetchRecentlyAdded(page);

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/top-upcoming', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      let res = redis
        ? await cache.fetch(
            redis as Redis,
            `justanime:top-upcoming:${page}`,
            async () => await justanime.fetchTopUpcoming(page),
            REDIS_TTL,
          )
        : await justanime.fetchTopUpcoming(page);

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get(
    '/search-suggestions/:query',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = (request.params as { query: string }).query;

      try {
        let res = redis
          ? await cache.fetch(
              redis as Redis,
              `justanime:search-suggestions:${query}`,
              async () => await justanime.fetchSearchSuggestions(query),
              REDIS_TTL,
            )
          : await justanime.fetchSearchSuggestions(query);

        reply.status(200).send(res);
      } catch (err) {
        reply
          .status(500)
          .send({ message: 'Something went wrong. Contact developer for help.' });
      }
    },
  );
};

export default routes;
