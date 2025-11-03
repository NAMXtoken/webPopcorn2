import { useState, useEffect } from 'react';
import { Scan, ScanLine, Tv, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import type { MediaItem } from '../App';

interface ScannerViewProps {
  onScanComplete: (results: MediaItem[]) => void;
}

// Mock data for demonstration
const mockResults: MediaItem[] = [
  {
    id: '1',
    title: 'The Last of Us',
    year: '2023',
    type: 'series',
    poster: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop',
    imdb: 8.8,
    rottenTomatoes: 96,
    screenCritic: 92,
    friendsRating: 9.2,
    genre: 'Drama, Sci-Fi',
    synopsis: 'A post-apocalyptic drama following Joel and Ellie as they navigate a dangerous world filled with infected and desperate survivors.',
    friendsReviews: [
      {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        rating: 9.5,
        comment: 'Absolutely incredible! The acting and storytelling are phenomenal.',
        date: '2 days ago'
      },
      {
        name: 'Mike Johnson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        rating: 8.5,
        comment: 'Great adaptation of the game. Some slow moments but overall amazing.',
        date: '1 week ago'
      },
      {
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        rating: 9.5,
        comment: 'Best show I\'ve watched this year. Can\'t wait for season 2!',
        date: '3 days ago'
      }
    ]
  },
  {
    id: '2',
    title: 'Dune: Part Two',
    year: '2024',
    type: 'movie',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    imdb: 8.9,
    rottenTomatoes: 93,
    screenCritic: 90,
    friendsRating: 8.8,
    genre: 'Sci-Fi, Adventure',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family.',
    friendsReviews: [
      {
        name: 'David Park',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        rating: 9.0,
        comment: 'Visually stunning masterpiece. Denis Villeneuve never disappoints!',
        date: '5 days ago'
      },
      {
        name: 'Lisa Martinez',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        rating: 8.5,
        comment: 'Even better than the first one. Epic on every level.',
        date: '1 week ago'
      }
    ]
  },
  {
    id: '3',
    title: 'Oppenheimer',
    year: '2023',
    type: 'movie',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
    imdb: 8.5,
    rottenTomatoes: 93,
    screenCritic: 88,
    friendsRating: 8.7,
    genre: 'Biography, Drama',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    friendsReviews: [
      {
        name: 'Tom Anderson',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
        rating: 9.0,
        comment: 'Nolan at his best. Complex, thrilling, and thought-provoking.',
        date: '4 days ago'
      },
      {
        name: 'Rachel Kim',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
        rating: 8.0,
        comment: 'Powerful storytelling. Cillian Murphy deserved that Oscar.',
        date: '6 days ago'
      }
    ]
  }
];

export function ScannerView({ onScanComplete }: ScannerViewProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<'idle' | 'detecting' | 'analyzing' | 'fetching'>('idle');

  useEffect(() => {
    if (isScanning) {
      // Simulate scanning phases
      const phases = [
        { phase: 'detecting' as const, duration: 1500, message: 'Detecting text on screen...' },
        { phase: 'analyzing' as const, duration: 1500, message: 'Analyzing content...' },
        { phase: 'fetching' as const, duration: 2000, message: 'Fetching ratings and reviews...' }
      ];

      let currentProgress = 0;
      const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);
      const interval = setInterval(() => {
        currentProgress += 2;
        setProgress(Math.min(currentProgress, 100));
      }, totalDuration / 50);

      phases.forEach((phaseInfo, index) => {
        const startTime = phases.slice(0, index).reduce((sum, p) => sum + p.duration, 0);
        setTimeout(() => {
          setScanPhase(phaseInfo.phase);
          toast.info(phaseInfo.message);
        }, startTime);
      });

      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        toast.success('Scan complete! Found 3 titles');
        setTimeout(() => {
          onScanComplete(mockResults);
        }, 500);
      }, totalDuration);
    }
  }, [isScanning, onScanComplete]);

  const handleStartScan = () => {
    setIsScanning(true);
    setProgress(0);
    setScanPhase('detecting');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1c1b1f] p-6">
      {/* Header */}
      <div className="text-center mb-8 mt-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#6750a4]/20 backdrop-blur-lg mb-4 border border-[#6750a4]/30">
          <Tv className="w-10 h-10 text-[#d0bcff]" />
        </div>
        <h1 className="text-white mb-2">TV Scanner</h1>
        <p className="text-gray-400">Point your camera at your TV screen to scan titles</p>
      </div>

      {/* Camera Preview Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-[#2b2930] border-2 border-[#6750a4]/30 shadow-2xl">
          {/* Simulated camera view */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2b2930] to-[#1c1b1f]" />
          
          {/* Scan overlay */}
          {isScanning && (
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[#6750a4]/10 animate-pulse" />
              <ScanLine className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-[#d0bcff] animate-pulse" />
            </div>
          )}

          {/* Center icon when idle */}
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Scan className="w-24 h-24 text-[#938f99] mx-auto mb-4" />
                <p className="text-gray-400">Ready to scan</p>
              </div>
            </div>
          )}

          {/* Scanning frame corners */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-[#d0bcff] rounded-tl-2xl" />
          <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-[#d0bcff] rounded-tr-2xl" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-[#d0bcff] rounded-bl-2xl" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-[#d0bcff] rounded-br-2xl" />
        </div>

        {/* Progress indicator */}
        {isScanning && (
          <div className="mt-6 w-full">
            <Progress value={progress} className="h-2 bg-[#2b2930]" />
            <p className="text-center text-gray-300 mt-3 capitalize">{scanPhase}...</p>
          </div>
        )}
      </div>

      {/* Scan Button */}
      <div className="mt-8 mb-8">
        <Button
          onClick={handleStartScan}
          disabled={isScanning}
          className="w-full h-16 rounded-full bg-[#6750a4] text-white hover:bg-[#7965af] disabled:bg-[#6750a4]/50 disabled:text-gray-400 shadow-xl transition-all"
          size="lg"
        >
          {isScanning ? (
            <>
              <Sparkles className="w-6 h-6 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Scan className="w-6 h-6 mr-2" />
              Start Scanning
            </>
          )}
        </Button>
        
        <div className="mt-4 text-center">
          <p className="text-gray-400">Tap the button to scan your TV screen</p>
        </div>
      </div>
    </div>
  );
}
