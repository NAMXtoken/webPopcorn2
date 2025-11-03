import { useCallback, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Scan, ScanLine, Tv, Sparkles, TimerReset, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useScanSession } from '../hooks/useScanSession';
import type { MediaTitle } from '../types/media';
import { useCameraFeed } from '../hooks/useCameraFeed';

interface ScannerViewProps {
  onScanComplete: (results: MediaTitle[]) => void;
}

const phaseDisplayText: Record<string, string> = {
  idle: 'Ready to scan',
  detecting: 'Detecting text on screen…',
  capturing: 'Capturing a clean frame…',
  analyzing: 'Analyzing OCR results…',
  fetching: 'Fetching ratings and reviews…',
};

const scanTips = [
  'Allow camera access so we can capture what is on your TV screen.',
  'Point your camera directly at the title card for crisp text.',
  'Avoid glare and reflections from your TV screen.',
  'Hold steady for a moment while we capture the frame.',
];

export function ScannerView({ onScanComplete }: ScannerViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fallbackFrame, setFallbackFrame] = useState<string | null>(null);

  const { videoRef, startCamera, error: cameraError, isReady } = useCameraFeed({
    onError: (err) => {
      console.warn('Camera error', err);
    },
  });

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (video && video.videoWidth && video.videoHeight) {
      const canvas = canvasRef.current ?? document.createElement('canvas');
      canvasRef.current = canvas;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return undefined;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      return canvas.toDataURL('image/jpeg', 0.92);
    }

    if (fallbackFrame) {
      return fallbackFrame;
    }

    return undefined;
  }, [fallbackFrame, videoRef]);

  const {
    startScan,
    reset,
    status,
    phase,
    progress,
    isScanning,
    error,
    segments,
    lastCompletedAt,
  } = useScanSession({
    onComplete: onScanComplete,
    captureFrame,
  });

  const hasFallbackFrame = Boolean(fallbackFrame);
  const canScan = (isReady || hasFallbackFrame) && !isScanning;
  const showCameraOverlay = (!isReady || cameraError) && !hasFallbackFrame;

  const handleUploadSnapshot = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFallbackFrame(reader.result);
        }
      };
      reader.readAsDataURL(file);
      // Reset the input so the same file can be selected again later.
      event.target.value = '';
    },
    [],
  );

  const clearState = useCallback(() => {
    reset();
    setFallbackFrame(null);
  }, [reset]);

  const primaryLabel = useMemo(() => {
    if (isScanning) {
      return 'Scanning…';
    }
    if (status === 'success') {
      return 'Scan Again';
    }
    return 'Start Scan';
  }, [isScanning, status]);

  const secondaryLabel = useMemo(() => {
    if (status === 'error') {
      return 'Reset';
    }
    if (status === 'success') {
      return 'New Scan';
    }
    return 'Cancel';
  }, [status]);

  const showSecondaryAction = status !== 'idle' || isScanning;

  return (
    <div className="min-h-screen flex flex-col bg-[#1c1b1f] p-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Header */}
      <div className="text-center mb-8 mt-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#6750a4]/20 backdrop-blur-lg mb-4 border border-[#6750a4]/30">
          <Tv className="w-10 h-10 text-[#d0bcff]" />
        </div>
        <h1 className="text-white mb-2">TV Scanner</h1>
        <p className="text-gray-400">
          Point your camera at your TV and we&apos;ll surface live ratings within seconds.
        </p>
      </div>

      {/* Scanner Card */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#6750a4]/30 bg-[#2b2930] shadow-2xl aspect-[3/4]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />

            <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-[#d0bcff] rounded-tl-3xl" />
            <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-[#d0bcff] rounded-tr-3xl" />
            <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-[#d0bcff] rounded-bl-3xl" />
            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-[#d0bcff] rounded-br-3xl" />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-40 h-40 border-2 border-dashed border-[#6750a4]/60 rounded-3xl">
                <ScanLine
                  className={`absolute top-0 left-0 w-full h-full text-[#6750a4]/70 ${
                    isScanning ? 'animate-pulse' : ''
                  }`}
                />
                <div
                  className={`absolute inset-x-2 top-1/2 -translate-y-1/2 h-1 bg-[#6750a4]/40 rounded-full ${
                    isScanning ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''
                  }`}
                />
              </div>
            </div>

            {showCameraOverlay && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c1b1f]/80 text-center px-6">
                <AlertTriangle className="w-10 h-10 text-[#ffb4ab] mb-3" />
                <p className="text-sm text-gray-300 mb-4">
                  {cameraError ?? 'Waiting for camera access…'}
                </p>
                <Button variant="secondary" onClick={startCamera} className="rounded-full px-6">
                  Try Again
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Progress
              value={progress}
              className="flex-1 h-2 bg-[#2b2930] [&>div]:bg-[#6750a4]"
            />
            <span className="text-sm text-gray-400 font-medium">{progress}%</span>
          </div>

          <div className="bg-[#2b2930] rounded-2xl p-4 border border-[#3a3740] mt-4">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-[#d0bcff]" />
              <span className="text-gray-300">
                {error ? error : phaseDisplayText[phase] ?? 'Ready for your next scan'}
              </span>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              {scanTips.map((tip) => (
                <li key={tip} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6750a4]" />
                  {tip}
                </li>
              ))}
            </ul>
            {segments.length > 0 && (
              <div className="mt-4 bg-[#1c1b1f] border border-[#3a3740] rounded-xl p-3 text-left">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Recognized Lines</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  {segments.slice(0, 5).map((segment, index) => (
                    <li key={`${segment.rawText}-${index}`} className="truncate">
                      “{segment.rawText}”
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasFallbackFrame && (
              <p className="mt-3 text-xs text-[#d0bcff]">
                Snapshot loaded — we&apos;ll use it for the next scan.
              </p>
            )}
            {lastCompletedAt && (
              <p className="text-xs text-gray-500 mt-4">
                Last scan completed {new Date(lastCompletedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <Button
            onClick={() => {
              if (status === 'success' || status === 'error') {
                clearState();
              }
              startScan();
            }}
            disabled={!canScan}
            className="bg-[#6750a4] hover:bg-[#7965af] text-white rounded-full px-6 py-6 h-14 min-w-[160px] shadow-lg shadow-[#6750a4]/30"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#eaddff] text-[#6750a4]">
                <Scan className="w-5 h-5" />
              </span>
              <span>{primaryLabel}</span>
            </div>
          </Button>
          {showSecondaryAction && (
            <Button
              variant="outline"
              onClick={() => {
                clearState();
                startCamera();
              }}
              disabled={isScanning}
              className="border-[#3a3740] text-white hover:bg-[#2b2930] rounded-full px-6 py-6 h-14 min-w-[160px]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#2b2930] text-[#6750a4] border border-[#3a3740]">
                  {status === 'error' ? <TimerReset className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
                </span>
                <span>{secondaryLabel}</span>
              </div>
            </Button>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={handleUploadSnapshot}
            className="rounded-full px-6"
            disabled={isScanning}
          >
            Upload Snapshot
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Works when live camera access is blocked. We&apos;ll run OCR on your photo instantly.
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-12 bg-[#2b2930] rounded-3xl p-6 border border-[#3a3740] shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-[#d0bcff]" />
          <h2 className="text-white">What You&apos;ll See</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#1c1b1f] rounded-2xl p-4 border border-[#3a3740]">
            <h3 className="text-white mb-2">Instant Ratings</h3>
            <p className="text-sm text-gray-400">
              Compare IMDb, Rotten Tomatoes, ScreenCritic, and friends scores at a glance.
            </p>
          </div>
          <div className="bg-[#1c1b1f] rounded-2xl p-4 border border-[#3a3740]">
            <h3 className="text-white mb-2">Friends Reviews</h3>
            <p className="text-sm text-gray-400">
              See what your friends thought before you commit to a binge session.
            </p>
          </div>
          <div className="bg-[#1c1b1f] rounded-2xl p-4 border border-[#3a3740]">
            <h3 className="text-white mb-2">Swipe to Details</h3>
            <p className="text-sm text-gray-400">
              Dive into cast info, plot summaries, and critic highlights with a single tap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
