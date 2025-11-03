import { demoFullText, demoRecognizedSegments } from '../../lib/mock-data';
import type { OcrResult, ScanRequest } from '../../types/ocr';
import type { OcrProvider } from './provider';

function createMockScanResult(): OcrResult {
  return {
    segments: demoRecognizedSegments,
    fullText: demoFullText,
    capturedAt: new Date().toISOString(),
    provider: 'mock',
  };
}

export function createMockOcrProvider(): OcrProvider {
  return {
    name: 'mock',
    async scan(request: ScanRequest) {
      if (!request.demoMode && request.frameDataUrl) {
        // In the mock provider we ignore the actual frame data, but keeping this branch
        // makes it simpler to drop in a real provider later without touching callers.
      }

      // Simulate network/processing latency to mimic a real OCR call.
      await new Promise((resolve) => setTimeout(resolve, 1200));

      return createMockScanResult();
    },
  };
}
