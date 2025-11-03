import type { OcrResult, ScanRequest } from '../../types/ocr';

export interface OcrProvider {
  name: string;
  scan(request: ScanRequest): Promise<OcrResult>;
}

export type OcrProviderKey = 'mock' | 'googleVision' | 'tesseract';

export interface OcrProviderConfig {
  provider?: OcrProviderKey;
}

export interface OcrClient {
  provider: OcrProvider;
  runScan(request?: ScanRequest): Promise<OcrResult>;
}

export function createOcrClient(provider: OcrProvider): OcrClient {
  return {
    provider,
    runScan: (request = {}) => provider.scan(request),
  };
}
