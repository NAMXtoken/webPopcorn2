import type { OcrResult, ScanRequest } from '../../types/ocr';
import type { OcrProvider } from './provider';

export interface GoogleVisionConfig {
  apiKey?: string;
  endpoint?: string;
}

export function createGoogleVisionProvider(config: GoogleVisionConfig): OcrProvider {
  return {
    name: 'googleVision',
    async scan(request: ScanRequest): Promise<OcrResult> {
      const message = [
        'Google Vision OCR is not wired up yet.',
        'Attempted request:',
        JSON.stringify(
          {
            hasFrame: Boolean(request.frameDataUrl),
            demoMode: request.demoMode,
            endpoint: config.endpoint ?? 'https://vision.googleapis.com/v1/images:annotate',
          },
          null,
          2,
        ),
      ].join('\n');

      throw new Error(message);
    },
  };
}
