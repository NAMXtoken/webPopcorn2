import { appEnv } from '../../config/env';
import type { ScanRequest, OcrResult } from '../../types/ocr';
import { createGoogleVisionProvider } from './googleVisionProvider';
import { createMockOcrProvider } from './mockProvider';
import { createTesseractOcrProvider } from './tesseractProvider';
import type { OcrClient, OcrProvider, OcrProviderKey } from './provider';
import { createOcrClient } from './provider';

export interface RunScanOptions extends ScanRequest {
  providerOverride?: OcrProviderKey;
}

export function resolveOcrProvider(key?: OcrProviderKey): OcrProvider {
  const providerKey = key ?? (appEnv.ocrProvider as OcrProviderKey);

  switch (providerKey) {
    case 'googleVision':
      return createGoogleVisionProvider({
        apiKey: appEnv.googleVisionKey,
      });
    case 'tesseract':
      return createTesseractOcrProvider();
    case 'mock':
    default:
      return createMockOcrProvider();
  }
}

export function getOcrClient(providerKey?: OcrProviderKey): OcrClient {
  return createOcrClient(resolveOcrProvider(providerKey));
}

export async function runOcrScan(options: RunScanOptions = {}): Promise<OcrResult> {
  const { providerOverride, ...scanRequest } = options;
  const client = getOcrClient(providerOverride);
  return client.runScan(scanRequest);
}
