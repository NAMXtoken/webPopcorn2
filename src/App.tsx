import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { ScannerView } from './components/ScannerView';
import { ResultsView } from './components/ResultsView';
import { MovieDetail } from './components/MovieDetail';
import type { MediaTitle } from './types/media';

export default function App() {
  const [view, setView] = useState<'scanner' | 'results' | 'detail'>('scanner');
  const [scannedResults, setScannedResults] = useState<MediaTitle[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaTitle | null>(null);

  const handleScanComplete = (results: MediaTitle[]) => {
    setScannedResults(results);
    setView('results');
  };

  const handleMediaSelect = (media: MediaTitle) => {
    setSelectedMedia(media);
    setView('detail');
  };

  const handleBack = () => {
    if (view === 'detail') {
      setView('results');
    } else if (view === 'results') {
      setView('scanner');
    }
  };

  const handleNewScan = () => {
    setView('scanner');
    setScannedResults([]);
    setSelectedMedia(null);
  };

  return (
    <div className="min-h-screen bg-[#1c1b1f]">
      {view === 'scanner' && <ScannerView onScanComplete={handleScanComplete} />}
      {view === 'results' && (
        <ResultsView
          results={scannedResults}
          onMediaSelect={handleMediaSelect}
          onBack={handleBack}
          onNewScan={handleNewScan}
        />
      )}
      {view === 'detail' && selectedMedia && (
        <MovieDetail media={selectedMedia} onBack={handleBack} onNewScan={handleNewScan} />
      )}
      <Toaster />
    </div>
  );
}
