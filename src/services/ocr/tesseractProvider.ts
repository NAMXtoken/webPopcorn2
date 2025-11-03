import { getTesseractWorker } from '../../lib/tesseractLoader';
import type { CandidateTitle, OcrResult, RecognizedTextSegment, ScanRequest } from '../../types/ocr';
import type { OcrProvider } from './provider';
import { demoFullText, demoRecognizedSegments } from '../../lib/mock-data';

const STREAMING_MARKETING_PATTERNS = [
  /(now|today|tonight) streaming/gi,
  /new episodes? (available|streaming)/gi,
  /only on [a-z\s]+/gi,
  /watch (it|now) on [a-z\s]+/gi,
  /available now/gi,
  /premiere[s]?/gi,
  /exclusive/gi,
];

const SERVICE_NAMES = [
  'netflix',
  'prime video',
  'amazon prime',
  'disney+',
  'hbo max',
  'max',
  'apple tv',
  'apple tv+',
  'hulu',
];

function sanitizeText(raw: string): string {
  return raw
    .replace(/[^\w:'&!?.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripMarketingPhrases(value: string): string {
  let result = value;
  STREAMING_MARKETING_PATTERNS.forEach((pattern) => {
    result = result.replace(pattern, '');
  });

  SERVICE_NAMES.forEach((name) => {
    const regex = new RegExp(name, 'gi');
    result = result.replace(regex, '');
  });

  result = result
    .replace(/\b(season|episode|ep|s\d+|e\d+)\b/gi, '')
    .replace(/\b(official|trailer|exclusive)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return result;
}

function deriveCandidatesFromLine(lineText: string, confidence: number): CandidateTitle[] {
  const candidates = new Set<string>();
  const cleaned = stripMarketingPhrases(sanitizeText(lineText));

  if (cleaned) {
    candidates.add(cleaned);
  }

  const withoutSubtitle = cleaned.replace(/[:\-].*$/, '').trim();
  if (withoutSubtitle && withoutSubtitle !== cleaned) {
    candidates.add(withoutSubtitle);
  }

  const uppercase = cleaned.toUpperCase();
  if (uppercase && uppercase !== cleaned) {
    candidates.add(uppercase);
  }

  const spaced = cleaned.replace(/\d{2}:\d{2}/g, '').trim();
  if (spaced.length && spaced !== cleaned) {
    candidates.add(spaced);
  }

  return Array.from(candidates)
    .map((title) => title.replace(/\s{2,}/g, ' ').trim())
    .filter((title) => title.length > 1)
    .map((title, index) => ({
      title,
      confidence: Math.max(Math.min(confidence - index * 0.1, 1), 0.1),
    }));
}

function buildSegmentsFromLines(lines: Array<{ text: string; confidence: number }>): RecognizedTextSegment[] {
  return lines
    .map((line) => {
      const rawText = line.text.trim();
      if (!rawText) {
        return null;
      }

      const confidence = Math.min(Math.max(line.confidence / 100, 0.05), 1);
      const candidates = deriveCandidatesFromLine(rawText, confidence);

      return {
        rawText,
        candidates,
      } satisfies RecognizedTextSegment;
    })
    .filter(Boolean) as RecognizedTextSegment[];
}

export function createTesseractOcrProvider(): OcrProvider {
  return {
    name: 'tesseract',
    async scan(request: ScanRequest): Promise<OcrResult> {
      if (!request.frameDataUrl || request.demoMode) {
        return {
          segments: demoRecognizedSegments,
          fullText: demoFullText,
          capturedAt: new Date().toISOString(),
          provider: 'tesseract-demo',
        };
      }

      try {
        const worker = await getTesseractWorker();
        const { data } = await worker.recognize(request.frameDataUrl);
        const segments = buildSegmentsFromLines(data.lines ?? []);

        return {
          segments: segments.length ? segments : demoRecognizedSegments,
          fullText: data.text ?? demoFullText,
          capturedAt: new Date().toISOString(),
          provider: 'tesseract',
        } satisfies OcrResult;
      } catch (error) {
        console.error('Tesseract OCR failed', error);
        return {
          segments: demoRecognizedSegments,
          fullText: demoFullText,
          capturedAt: new Date().toISOString(),
          provider: 'tesseract-fallback',
        } satisfies OcrResult;
      }
    },
  };
}
