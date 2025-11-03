import type { MediaTitle } from '../types/media';
import type { RecognizedTextSegment } from '../types/ocr';

export const demoMediaTitles: MediaTitle[] = [
  {
    id: 'demo-1',
    title: 'The Last of Us',
    releaseYear: '2023',
    kind: 'series',
    synopsis:
      'A post-apocalyptic drama following Joel and Ellie as they navigate a dangerous world filled with infected and desperate survivors.',
    genres: ['Drama', 'Sci-Fi'],
    posterUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=1200&h=800&fit=crop',
    ratings: {
      imdb: 8.8,
      rottenTomatoes: 96,
      screenCritic: 92,
      friends: 9.2,
    },
    providerIds: {
      tmdb: 100088,
      imdb: 'tt11198330',
    },
    friendsReviews: [
      {
        id: 'sarah-chen',
        name: 'Sarah Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        rating: 9.5,
        comment: 'Absolutely incredible! The acting and storytelling are phenomenal.',
        relativeDate: '2 days ago',
      },
      {
        id: 'mike-johnson',
        name: 'Mike Johnson',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        rating: 8.5,
        comment: 'Great adaptation of the game. Some slow moments but overall amazing.',
        relativeDate: '1 week ago',
      },
      {
        id: 'emma-wilson',
        name: 'Emma Wilson',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        rating: 9.5,
        comment: "Best show I've watched this year. Can't wait for season 2!",
        relativeDate: '3 days ago',
      },
    ],
    friendsSummary: {
      average: 9.2,
      totalReviews: 3,
    },
    sourceAttribution: 'Demo dataset',
  },
  {
    id: 'demo-2',
    title: 'Dune: Part Two',
    releaseYear: '2024',
    kind: 'movie',
    synopsis:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family.',
    genres: ['Sci-Fi', 'Adventure'],
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=800&fit=crop',
    ratings: {
      imdb: 8.9,
      rottenTomatoes: 93,
      screenCritic: 90,
      friends: 8.8,
    },
    providerIds: {
      tmdb: 693134,
      imdb: 'tt15239678',
    },
    friendsReviews: [
      {
        id: 'david-park',
        name: 'David Park',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        rating: 9.0,
        comment: 'Visually stunning masterpiece. Denis Villeneuve never disappoints!',
        relativeDate: '5 days ago',
      },
      {
        id: 'lisa-martinez',
        name: 'Lisa Martinez',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        rating: 8.5,
        comment: 'Even better than the first one. Epic on every level.',
        relativeDate: '1 week ago',
      },
    ],
    friendsSummary: {
      average: 8.8,
      totalReviews: 2,
    },
    sourceAttribution: 'Demo dataset',
  },
  {
    id: 'demo-3',
    title: 'Oppenheimer',
    releaseYear: '2023',
    kind: 'movie',
    synopsis:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    genres: ['Biography', 'Drama'],
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=800&fit=crop',
    ratings: {
      imdb: 8.5,
      rottenTomatoes: 93,
      screenCritic: 88,
      friends: 8.7,
    },
    providerIds: {
      tmdb: 872585,
      imdb: 'tt15398776',
    },
    friendsReviews: [
      {
        id: 'tom-anderson',
        name: 'Tom Anderson',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
        rating: 9.0,
        comment: 'Nolan at his best. Complex, thrilling, and thought-provoking.',
        relativeDate: '4 days ago',
      },
      {
        id: 'rachel-kim',
        name: 'Rachel Kim',
        avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
        rating: 8.0,
        comment: 'Powerful storytelling. Cillian Murphy deserved that Oscar.',
        relativeDate: '6 days ago',
      },
    ],
    friendsSummary: {
      average: 8.7,
      totalReviews: 2,
    },
    sourceAttribution: 'Demo dataset',
  },
];

export const demoRecognizedSegments: RecognizedTextSegment[] = [
  {
    rawText: 'The Last of Us - Season 1',
    candidates: [
      {
        title: 'The Last of Us',
        releaseYear: '2023',
        confidence: 0.94,
      },
      {
        title: 'The Last of Us Part II',
        releaseYear: '2020',
        confidence: 0.42,
      },
    ],
  },
  {
    rawText: 'Dune Part Two Premiere Now Streaming',
    candidates: [
      {
        title: 'Dune: Part Two',
        releaseYear: '2024',
        confidence: 0.91,
      },
      {
        title: 'Dune',
        releaseYear: '2021',
        confidence: 0.35,
      },
    ],
  },
  {
    rawText: 'Oppenheimer Christopher Nolan',
    candidates: [
      {
        title: 'Oppenheimer',
        releaseYear: '2023',
        confidence: 0.89,
      },
    ],
  },
];

export const demoFullText = demoRecognizedSegments.map((segment) => segment.rawText).join('\n');
