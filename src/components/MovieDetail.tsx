import { ArrowLeft, Star, ThumbsUp, Users, TrendingUp, Scan } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import type { MediaTitle } from '../types/media';
import { getAverageCommunityScore } from '../types/media';

interface MovieDetailProps {
  media: MediaTitle;
  onBack: () => void;
  onNewScan: () => void;
}

interface RatingCardProps {
  icon: React.ElementType;
  label: string;
  score?: number;
  maxScore?: number;
  color: string;
}

function RatingCard({
  icon: Icon,
  label,
  score,
  maxScore = 10,
  color,
}: RatingCardProps) {
  const safeScore = typeof score === 'number' && !Number.isNaN(score) ? score : null;
  const percentage = safeScore !== null ? Math.min((safeScore / maxScore) * 100, 100) : 0;

  return (
    <Card className="p-4 bg-[#2b2930] border border-[#3a3740] shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold text-white">
          {safeScore !== null ? safeScore.toFixed(1) : '—'}
        </span>
        <span className="text-gray-500 mb-1">/ {maxScore}</span>
      </div>
      <div className="mt-2 h-2 bg-[#1c1b1f] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Card>
  );
}

function FriendReview({ review }: { review: MediaTitle['friendsReviews'][0] }) {
  return (
    <Card className="p-4 bg-[#2b2930] border border-[#3a3740] shadow-md">
      <div className="flex gap-3">
        <Avatar className="w-12 h-12 border-2 border-[#6750a4]">
          <img src={review.avatarUrl} alt={review.name} className="w-full h-full object-cover" />
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{review.name}</span>
            <div className="flex items-center gap-1 bg-[#fef7cd]/10 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-[#fef7cd] text-[#fef7cd]" />
              <span className="text-sm text-[#fef7cd]">{review.rating}</span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mb-2">{review.comment}</p>
          <span className="text-xs text-gray-500">{review.relativeDate}</span>
        </div>
      </div>
    </Card>
  );
}

export function MovieDetail({ media, onBack, onNewScan }: MovieDetailProps) {
  const avgRating = getAverageCommunityScore(media.ratings);
  const overallLabel = avgRating !== null ? avgRating.toFixed(1) : '—';
  const isHighlyRated = avgRating !== null && avgRating >= 8.5;
  const posterUrl =
    media.backdropUrl ??
    media.posterUrl ??
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=800&fit=crop';
  const releaseMeta = [media.releaseYear, media.genres.join(', ')].filter(Boolean).join(' • ');
  const friendsAverage =
    media.friendsSummary?.average ?? media.ratings.friends ?? undefined;

  return (
    <div className="min-h-screen bg-[#1c1b1f]">
      <ScrollArea className="h-screen">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={posterUrl}
              alt={media.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1f] via-black/60 to-black/30" />
          </div>

          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 backdrop-blur-sm bg-black/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewScan}
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 backdrop-blur-sm bg-black/20"
            >
              <Scan className="w-6 h-6" />
            </Button>
          </div>

          {/* Title and Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#6750a4] backdrop-blur-sm border-0 text-white">
                {media.kind}
              </Badge>
              {isHighlyRated && (
                <Badge className="bg-[#eaddff] text-[#6750a4] border-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Highly Rated
                </Badge>
              )}
            </div>
            <h1 className="text-white mb-2">{media.title}</h1>
            {releaseMeta && <p className="text-gray-400 mb-3">{releaseMeta}</p>}
            
            {/* Overall Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Star className="w-5 h-5 fill-[#fef7cd] text-[#fef7cd]" />
                <span className="text-xl font-semibold">{overallLabel}</span>
                <span className="text-sm text-gray-300">/ 10</span>
              </div>
              <span className="text-gray-300">Overall Rating</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Synopsis */}
          <Card className="p-5 bg-[#2b2930] border border-[#3a3740] shadow-md">
            <h2 className="mb-3 text-white">Synopsis</h2>
            <p className="text-gray-300 leading-relaxed">
              {media.synopsis ?? 'Synopsis coming soon. Connect metadata providers to populate this section.'}
            </p>
            {media.sourceAttribution && (
              <p className="text-xs text-gray-500 mt-3">
                Source: {media.sourceAttribution}
              </p>
            )}
          </Card>

          {/* Ratings Grid */}
          <div>
            <h2 className="mb-4 text-white">Ratings & Reviews</h2>
            <div className="grid grid-cols-2 gap-4">
              <RatingCard
                icon={Star}
                label="IMDb"
                score={media.ratings.imdb}
                color="bg-[#fef7cd]/10 text-[#fef7cd]"
              />
              <RatingCard
                icon={ThumbsUp}
                label="Rotten Tomatoes"
                score={media.ratings.rottenTomatoes}
                maxScore={100}
                color="bg-[#ffb4ab]/10 text-[#ffb4ab]"
              />
              <RatingCard
                icon={TrendingUp}
                label="Screen Critic"
                score={media.ratings.screenCritic}
                maxScore={100}
                color="bg-[#a8c7fa]/10 text-[#a8c7fa]"
              />
              <RatingCard
                icon={Users}
                label="Friends Rating"
                score={friendsAverage}
                color="bg-[#d0bcff]/10 text-[#d0bcff]"
              />
            </div>
          </div>

          <Separator className="bg-[#3a3740]" />

          {/* Friends Reviews */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#d0bcff]" />
              <h2 className="text-white">Friends Reviews ({media.friendsReviews.length})</h2>
            </div>
            {media.friendsReviews.length > 0 ? (
              <div className="space-y-3">
                {media.friendsReviews.map((review) => (
                  <FriendReview key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <Card className="p-4 bg-[#2b2930] border border-[#3a3740] text-gray-400 text-sm">
                No friend reviews yet. Invite your friends to share what they thought!
              </Card>
            )}
          </div>

          {/* Bottom spacing */}
          <div className="h-8" />
        </div>
      </ScrollArea>
    </div>
  );
}
