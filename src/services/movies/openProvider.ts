import type { MediaTitle, RatingAggregate } from '../../types/media';
import type { LookupContext, MovieMetadataProvider } from './types';
import { fetchOmdbTitle } from './omdbClient';
import { searchTvMaze } from './tvmazeClient';

export interface OpenMediaProviderConfig {
  omdbKey?: string;
}

function mergeRatings(into: RatingAggregate, updates: RatingAggregate): RatingAggregate {
  return {
    imdb: updates.imdb ?? into.imdb,
    rottenTomatoes: updates.rottenTomatoes ?? into.rottenTomatoes,
    screenCritic: updates.screenCritic ?? into.screenCritic,
    friends: updates.friends ?? into.friends,
  };
}

function buildResultKey(title: string, releaseYear: string | undefined, kind: MediaTitle['kind']) {
  return [kind, title.toLowerCase(), releaseYear ?? ''].join('::');
}

function normalizeOmdbResult(result: Awaited<ReturnType<typeof fetchOmdbTitle>>): MediaTitle | null {
  if (!result) {
    return null;
  }

  if (!result.Title) {
    return null;
  }

  const ratings: RatingAggregate = {};
  if (result.imdbRating && result.imdbRating !== 'N/A') {
    ratings.imdb = Number.parseFloat(result.imdbRating);
  }
  result.Ratings?.forEach((rating) => {
    if (rating.Source === 'Rotten Tomatoes') {
      ratings.rottenTomatoes = Number.parseInt(rating.Value.replace('%', ''), 10);
    }
    if (rating.Source === 'Metacritic') {
      const value = Number.parseInt(rating.Value.split('/')[0], 10);
      ratings.screenCritic = Number.isNaN(value) ? undefined : value;
    }
  });

  const posterUrl = result.Poster && result.Poster !== 'N/A' ? result.Poster : undefined;

  const releaseYear = result.Year !== 'N/A' ? result.Year : undefined;
  const kind = result.Type === 'series' ? 'series' : 'movie';

  return {
    id: `omdb-${result.imdbID ?? result.Title}`,
    title: result.Title,
    releaseYear,
    kind,
    synopsis: result.Plot !== 'N/A' ? result.Plot : undefined,
    genres: result.Genre?.split(',').map((item) => item.trim()).filter(Boolean) ?? [],
    posterUrl,
    backdropUrl: posterUrl,
    ratings,
    providerIds: {
      imdb: result.imdbID,
    },
    friendsReviews: [],
    sourceAttribution: 'OMDb',
  };
}

function normalizeTvMazeResult(result: Awaited<ReturnType<typeof searchTvMaze>>[number]): MediaTitle | null {
  const show = result.show;
  if (!show?.name) {
    return null;
  }
  const ratings: RatingAggregate = {};
  if (show.rating?.average) {
    ratings.screenCritic = Math.round(show.rating.average * 10);
  }

  const releaseYear = show.premiered ? show.premiered.slice(0, 4) : undefined;
  const kind = show.type === 'Movie' ? 'movie' : 'series';

  return {
    id: `tvmaze-${show.id}`,
    title: show.name,
    releaseYear,
    kind,
    synopsis: show.summary ? show.summary.replace(/<[^>]+>/g, '') : undefined,
    genres: show.genres ?? [],
    posterUrl: show.image?.medium ?? show.image?.original ?? undefined,
    backdropUrl: show.image?.original ?? undefined,
    ratings,
    providerIds: {
      tmdb: show.externals?.thetvdb,
    },
    friendsReviews: [],
    sourceAttribution: 'TVmaze',
  };
}

export function createOpenMediaProvider(config: OpenMediaProviderConfig): MovieMetadataProvider {
  return {
    name: 'open-media',
    async resolveCandidates(contexts: LookupContext[]) {
      const results = new Map<string, MediaTitle>();
      const processedQueries = new Set<string>();

      for (const context of contexts) {
        for (const candidate of context.candidates) {
          const query = candidate.title.trim();
          if (!query) {
            continue;
          }

          const normalizedQuery = query.toLowerCase();
          if (processedQueries.has(normalizedQuery)) {
            continue;
          }
          processedQueries.add(normalizedQuery);

          try {
            const omdb = await fetchOmdbTitle(query, config.omdbKey);
            const normalizedOmdb = normalizeOmdbResult(omdb);
            if (normalizedOmdb) {
              const key = buildResultKey(
                normalizedOmdb.title,
                normalizedOmdb.releaseYear,
                normalizedOmdb.kind,
              );
              const existing = results.get(key);
              if (existing) {
                existing.ratings = mergeRatings(existing.ratings, normalizedOmdb.ratings);
                existing.synopsis = existing.synopsis ?? normalizedOmdb.synopsis;
                existing.posterUrl = existing.posterUrl ?? normalizedOmdb.posterUrl;
                existing.backdropUrl = existing.backdropUrl ?? normalizedOmdb.backdropUrl;
                existing.providerIds = { ...existing.providerIds, ...normalizedOmdb.providerIds };
                existing.sourceAttribution = existing.sourceAttribution
                  ? `${existing.sourceAttribution}, OMDb`
                  : 'OMDb';
              } else {
                results.set(key, normalizedOmdb);
              }
            }
          } catch (error) {
            console.warn('OMDb lookup failed', error);
          }

          try {
            const tvResults = await searchTvMaze(query);
            tvResults.forEach((entry) => {
              const normalized = normalizeTvMazeResult(entry);
              if (!normalized) {
                return;
              }
              const key = buildResultKey(normalized.title, normalized.releaseYear, normalized.kind);
              const existing = results.get(key);
              if (existing) {
                existing.ratings = mergeRatings(existing.ratings, normalized.ratings);
                existing.genres = existing.genres.length ? existing.genres : normalized.genres;
                existing.synopsis = existing.synopsis ?? normalized.synopsis;
                existing.posterUrl = existing.posterUrl ?? normalized.posterUrl;
                existing.backdropUrl = existing.backdropUrl ?? normalized.backdropUrl;
                existing.sourceAttribution = existing.sourceAttribution
                  ? `${existing.sourceAttribution}, TVmaze`
                  : 'TVmaze';
                existing.providerIds = { ...existing.providerIds, ...normalized.providerIds };
              } else {
                results.set(key, normalized);
              }
            });
          } catch (error) {
            console.warn('TVmaze lookup failed', error);
          }
        }
      }

      return results.size ? Array.from(results.values()) : [];
    },
  };
}
