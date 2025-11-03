export type MediaKind = 'movie' | 'series';

export interface RatingAggregate {
  imdb?: number; // 0-10
  rottenTomatoes?: number; // 0-100 percentage
  screenCritic?: number; // 0-100 percentage
  friends?: number; // 0-10
}

export interface FriendReview {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  relativeDate: string;
}

export interface ProviderIds {
  tmdb?: number;
  imdb?: string;
  rottenTomatoes?: string;
}

export interface MediaTitle {
  id: string;
  title: string;
  releaseYear?: string;
  kind: MediaKind;
  synopsis?: string;
  genres: string[];
  posterUrl?: string;
  backdropUrl?: string;
  ratings: RatingAggregate;
  providerIds?: ProviderIds;
  friendsReviews: FriendReview[];
  friendsSummary?: {
    average: number;
    totalReviews: number;
  };
  sourceAttribution?: string;
}

export function getAverageCommunityScore(ratings: RatingAggregate): number | null {
  const normalized: number[] = [];

  if (typeof ratings.imdb === 'number') {
    normalized.push(ratings.imdb);
  }
  if (typeof ratings.rottenTomatoes === 'number') {
    normalized.push(ratings.rottenTomatoes / 10);
  }
  if (typeof ratings.screenCritic === 'number') {
    normalized.push(ratings.screenCritic / 10);
  }
  if (typeof ratings.friends === 'number') {
    normalized.push(ratings.friends);
  }

  if (!normalized.length) {
    return null;
  }

  const total = normalized.reduce((sum, value) => sum + value, 0);
  const average = total / normalized.length;
  return Math.round(average * 10) / 10;
}
