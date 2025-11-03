export type ScanPhase = 'idle' | 'detecting' | 'capturing' | 'analyzing' | 'fetching';

export interface BoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CandidateTitle {
  title: string;
  confidence: number; // 0-1
  releaseYear?: string;
}

export interface RecognizedTextSegment {
  rawText: string;
  boundingBox?: BoundingBox;
  candidates: CandidateTitle[];
}

export interface OcrResult {
  segments: RecognizedTextSegment[];
  fullText: string;
  capturedAt: string;
  provider: string;
}

export interface ScanRequest {
  /**
   * Optional reference to the video frame/canvas data URL we should inspect.
   * This will be populated when the camera pipeline is wired up.
   */
  frameDataUrl?: string;
  /**
   * Fallback to indicate that we are running a simulated scan.
   */
  demoMode?: boolean;
}
