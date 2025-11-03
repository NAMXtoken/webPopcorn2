interface TvMazeShow {
  id: number;
  name: string;
  type: string;
  language?: string;
  genres?: string[];
  status?: string;
  premiered?: string;
  rating?: {
    average?: number;
  };
  image?: {
    medium?: string;
    original?: string;
  };
  summary?: string;
  externals?: {
    thetvdb?: number;
    imdb?: string;
  };
}

export interface TvMazeSearchResult {
  score: number;
  show: TvMazeShow;
}

export async function searchTvMaze(query: string): Promise<TvMazeSearchResult[]> {
  const params = new URLSearchParams({
    q: query,
  });

  const response = await fetch(`https://api.tvmaze.com/search/shows?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`TVmaze search failed (${response.status})`);
  }

  const data = (await response.json()) as TvMazeSearchResult[];
  return data ?? [];
}
