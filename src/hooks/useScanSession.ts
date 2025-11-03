import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { MediaTitle } from '../types/media';
import type { CandidateTitle, OcrResult, ScanPhase } from '../types/ocr';
import { runOcrScan } from '../services/ocr';
import { resolveTitlesFromCandidates } from '../services/movies';
import type { MovieProviderKey } from '../services/movies/types';
import type { OcrProviderKey } from '../services/ocr/provider';
import { sleep } from '../lib/sleep';
import { demoMediaTitles } from '../lib/mock-data';

export type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

interface UseScanSessionOptions {
  ocrProvider?: OcrProviderKey;
  movieProvider?: MovieProviderKey;
  onComplete?: (titles: MediaTitle[]) => void;
  captureFrame?: () => Promise<string | undefined> | string | undefined;
}

interface ScanPhaseTimelineEntry {
  id: ScanPhase;
  duration: number;
  progress: number;
  message: string;
}

const phaseTimeline: ScanPhaseTimelineEntry[] = [
  { id: 'detecting', duration: 1000, progress: 20, message: 'Detecting text on screen…' },
  { id: 'capturing', duration: 900, progress: 40, message: 'Capturing crisp frame…' },
  { id: 'analyzing', duration: 1400, progress: 70, message: 'Analyzing OCR results…' },
  { id: 'fetching', duration: 1600, progress: 95, message: 'Fetching ratings and reviews…' },
];

function normalizeCandidate(candidate: CandidateTitle): CandidateTitle {
  const simplified = candidate.title
    .replace(/\b(season|episode|official|trailer)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    ...candidate,
    title: simplified || candidate.title,
  };
}

function buildLookupContexts(segments: OcrResult['segments']) {
  const contexts = segments.map((segment) => ({
    candidates: segment.candidates.map(normalizeCandidate),
  }));

  const aggregateCandidates: CandidateTitle[] = [];
  const topCandidates = segments
    .map((segment) => segment.candidates[0])
    .filter((candidate): candidate is CandidateTitle => Boolean(candidate && candidate.title))
    .map(normalizeCandidate);

  if (topCandidates.length) {
    const combinedTitle = topCandidates
      .map((candidate) => candidate.title)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (combinedTitle.length > 2) {
      aggregateCandidates.push({ title: combinedTitle, confidence: 0.9 });
    }

    topCandidates.forEach((candidate) => {
      if (candidate.title.length > 2) {
        aggregateCandidates.push({ ...candidate, confidence: 0.95 });
      }
    });
  }

  if (aggregateCandidates.length) {
    contexts.unshift({ candidates: aggregateCandidates });
  }

  return contexts;
}

export function useScanSession(options: UseScanSessionOptions = {}) {
  const { movieProvider, ocrProvider, onComplete, captureFrame } = options;

  const [status, setStatus] = useState<ScanStatus>('idle');
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<MediaTitle[]>([]);
  const [segments, setSegments] = useState<OcrResult['segments']>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const resetState = useCallback(() => {
    setStatus('idle');
    setPhase('idle');
    setProgress(0);
    setResults([]);
    setError(null);
    setSegments([]);
  }, []);

  const startScan = useCallback(async () => {
    if (status === 'scanning') {
      return;
    }

    setStatus('scanning');
    setPhase('detecting');
    setProgress(phaseTimeline[0].progress);
    setError(null);
    setSegments([]);

    try {
      toast.info(phaseTimeline[0].message, { duration: phaseTimeline[0].duration });
      await sleep(phaseTimeline[0].duration);
      if (!isMounted.current) return;

      setPhase('capturing');
      setProgress(phaseTimeline[1].progress);
      toast.info(phaseTimeline[1].message, { duration: phaseTimeline[1].duration });

      let frameDataUrl: string | undefined;
      if (captureFrame) {
        const captured = await captureFrame();
        frameDataUrl = captured ?? undefined;
      }

      await sleep(phaseTimeline[1].duration);
      if (!isMounted.current) return;

      setPhase('analyzing');
      setProgress(phaseTimeline[2].progress);
      toast.info(phaseTimeline[2].message, { duration: phaseTimeline[2].duration });

      const ocrResult = await runOcrScan({
        providerOverride: ocrProvider,
        frameDataUrl,
        demoMode: !frameDataUrl,
      });

      setSegments(ocrResult.segments);

      await sleep(phaseTimeline[2].duration);
      if (!isMounted.current) return;

      setPhase('fetching');
      setProgress(phaseTimeline[3].progress);
      toast.info(phaseTimeline[3].message, { duration: phaseTimeline[3].duration });

      const contexts = buildLookupContexts(ocrResult.segments);

      const mediaTitles = await resolveTitlesFromCandidates(contexts, movieProvider);

      const finalResults = mediaTitles.length ? mediaTitles : demoMediaTitles;

      await sleep(phaseTimeline[3].duration / 2);

      if (!isMounted.current) {
        return;
      }

      setResults(finalResults);
      setStatus('success');
      setPhase('idle');
      setProgress(100);
      setLastCompletedAt(new Date().toISOString());
      toast.success(`Scan complete! Found ${finalResults.length} titles`);

      onComplete?.(finalResults);

      return finalResults;
    } catch (err) {
      if (!isMounted.current) {
        return;
      }

      const message = err instanceof Error ? err.message : 'Unexpected scan error.';
      setError(message);
      setStatus('error');
      setPhase('idle');
      setProgress(0);
      toast.error(message);
    }

    return undefined;
  }, [captureFrame, movieProvider, ocrProvider, onComplete, status]);

  const cancel = useCallback(() => {
    resetState();
  }, [resetState]);

  const state = useMemo(
    () => ({
      status,
      phase,
      progress,
      results,
      error,
      segments,
      lastCompletedAt,
      isScanning: status === 'scanning',
      hasCompleted: status === 'success',
    }),
    [status, phase, progress, results, error, segments, lastCompletedAt],
  );

  return {
    ...state,
    startScan,
    reset: resetState,
    cancel,
  };
}
