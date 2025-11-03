import { appEnv } from '../../config/env';

interface OmdbRating {
  Source: string;
  Value: string;
}

export interface OmdbTitleResponse {
  Response: 'True' | 'False';
  Error?: string;
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings?: OmdbRating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: 'movie' | 'series' | 'episode';
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
}

const DEFAULT_OMDB_KEY = 'trilogy';

export async function fetchOmdbTitle(title: string, apiKey: string | undefined = appEnv.omdbKey) {
  const key = apiKey || DEFAULT_OMDB_KEY;

  const params = new URLSearchParams({
    t: title,
    plot: 'short',
    apikey: key,
  });

  const response = await fetch(`https://www.omdbapi.com/?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`OMDb request failed (${response.status})`);
  }

  const data = (await response.json()) as OmdbTitleResponse | { Response: 'False'; Error: string };
  if (data.Response === 'False') {
    return null;
  }

  return data as OmdbTitleResponse;
}
