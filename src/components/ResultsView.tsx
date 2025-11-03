import { ArrowLeft, Scan, Star, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { MediaItem } from '../App';

interface ResultsViewProps {
  results: MediaItem[];
  onMediaSelect: (media: MediaItem) => void;
  onBack: () => void;
  onNewScan: () => void;
}

function RatingBadge({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className={`flex flex-col items-center p-2 rounded-xl ${color}`}>
      <span className="text-xs opacity-90 mb-0.5">{label}</span>
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 fill-current" />
        <span className="font-semibold">{score.toFixed(1)}</span>
      </div>
    </div>
  );
}

function MediaCard({ media, onClick }: { media: MediaItem; onClick: () => void }) {
  // Calculate average rating
  const avgRating = ((media.imdb + media.rottenTomatoes / 10 + media.screenCritic / 10 + media.friendsRating) / 4).toFixed(1);
  const isHighlyRated = parseFloat(avgRating) >= 8.5;

  return (
    <Card
      onClick={onClick}
      className="overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-[#6750a4]/20 transition-all duration-300 active:scale-98 bg-[#2b2930] border border-[#3a3740] shadow-lg"
    >
      <div className="flex gap-4 p-4">
        {/* Poster */}
        <div className="relative flex-shrink-0">
          <img
            src={media.poster}
            alt={media.title}
            className="w-24 h-36 object-cover rounded-xl"
          />
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
              <p className="text-sm text-gray-400">{media.year} • {media.genre}</p>
            </div>
            <Badge variant={media.type === 'movie' ? 'default' : 'secondary'} className="shrink-0 rounded-full bg-[#6750a4] text-white border-0">
              {media.type}
            </Badge>
          </div>

          {/* Ratings Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <RatingBadge label="IMDb" score={media.imdb} color="bg-[#fef7cd]/10 text-[#fef7cd]" />
            <RatingBadge label="RT" score={media.rottenTomatoes / 10} color="bg-[#ffb4ab]/10 text-[#ffb4ab]" />
            <RatingBadge label="Critic" score={media.screenCritic / 10} color="bg-[#a8c7fa]/10 text-[#a8c7fa]" />
            <RatingBadge label="Friends" score={media.friendsRating} color="bg-[#d0bcff]/10 text-[#d0bcff]" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ResultsView({ results, onMediaSelect, onBack, onNewScan }: ResultsViewProps) {
  // Sort by friends rating (highest first)
  const sortedResults = [...results].sort((a, b) => b.friendsRating - a.friendsRating);

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
