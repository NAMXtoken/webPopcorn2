import { ArrowLeft, Scan, Star, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { MediaTitle } from '../types/media';
import { getAverageCommunityScore } from '../types/media';

interface ResultsViewProps {
  results: MediaTitle[];
  onMediaSelect: (media: MediaTitle) => void;
  onBack: () => void;
  onNewScan: () => void;
}

function RatingBadge({ label, score, color }: { label: string; score?: number; color: string }) {
  const displayScore =
    typeof score === 'number' && !Number.isNaN(score) ? score.toFixed(1) : '—';
  return (
    <div className={`flex flex-col items-center p-2 rounded-xl ${color}`}>
      <span className="text-xs opacity-90 mb-0.5">{label}</span>
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 fill-current" />
        <span className="font-semibold">{displayScore}</span>
      </div>
    </div>
  );
}

function MediaCard({ media, onClick }: { media: MediaTitle; onClick: () => void }) {
  const avgRating = getAverageCommunityScore(media.ratings);
  const isHighlyRated = typeof avgRating === 'number' && avgRating >= 8.5;
  const imdb = media.ratings.imdb;
  const rottenTomatoes = media.ratings.rottenTomatoes;
  const screenCritic = media.ratings.screenCritic;
  const friends = media.ratings.friends;
  const genresLabel = media.genres.join(', ');
  const posterUrl =
    media.posterUrl ??
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop';

  return (
    <Card
      onClick={onClick}
      className="overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-[#6750a4]/20 transition-all duration-300 active:scale-98 bg-[#2b2930] border border-[#3a3740] shadow-lg"
    >
      <div className="flex gap-4 p-4">
        {/* Poster */}
        <div className="relative flex-shrink-0">
          <img src={posterUrl} alt={media.title} className="w-24 h-36 object-cover rounded-xl" />
          {isHighlyRated && (
            <div className="absolute -top-2 -right-2 bg-[#eaddff] rounded-full p-1.5 shadow-lg">
              <TrendingUp className="w-4 h-4 text-[#6750a4]" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="truncate mb-1 text-white">{media.title}</h3>
              <p className="text-sm text-gray-400">
                {media.releaseYear ? `${media.releaseYear} • ` : ''}
                {genresLabel}
              </p>
            </div>
            <Badge
              variant={media.kind === 'movie' ? 'default' : 'secondary'}
              className="shrink-0 rounded-full bg-[#6750a4] text-white border-0"
            >
              {media.kind}
            </Badge>
          </div>

          {/* Ratings Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <RatingBadge label="IMDb" score={imdb} color="bg-[#fef7cd]/10 text-[#fef7cd]" />
            <RatingBadge
              label="RT"
              score={typeof rottenTomatoes === 'number' ? rottenTomatoes / 10 : undefined}
              color="bg-[#ffb4ab]/10 text-[#ffb4ab]"
            />
            <RatingBadge
              label="Critic"
              score={typeof screenCritic === 'number' ? screenCritic / 10 : undefined}
              color="bg-[#a8c7fa]/10 text-[#a8c7fa]"
            />
            <RatingBadge label="Friends" score={friends} color="bg-[#d0bcff]/10 text-[#d0bcff]" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ResultsView({ results, onMediaSelect, onBack, onNewScan }: ResultsViewProps) {
  const sortedResults = [...results].sort((a, b) => {
    const aScore = a.ratings.friends ?? getAverageCommunityScore(a.ratings) ?? 0;
    const bScore = b.ratings.friends ?? getAverageCommunityScore(b.ratings) ?? 0;
    return bScore - aScore;
  });

  return (
    <div className="min-h-screen bg-[#1c1b1f] pb-24">
      {/* Header */}
      <div className="bg-[#2b2930] text-white px-6 pt-8 pb-6 border-b border-[#3a3740]">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-gray-300 hover:bg-[#3a3740] rounded-full h-10 w-10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="mb-1">Scanned Results</h1>
            <p className="text-gray-400">Found {results.length} titles</p>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="px-6 py-6 space-y-4">
        {sortedResults.map((media) => (
          <MediaCard key={media.id} media={media} onClick={() => onMediaSelect(media)} />
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={onNewScan}
          size="icon"
          className="h-16 w-16 rounded-full bg-[#6750a4] hover:bg-[#7965af] shadow-2xl"
        >
          <Scan className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
}
