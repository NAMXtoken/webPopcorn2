const runtimeEnv = import.meta.env ?? {};

const defaultConfig = {
  ocrProvider: 'tesseract',
  googleVisionKey: undefined,
  tmdbKey: undefined,
  omdbKey: undefined,
};

export type AppEnv = typeof defaultConfig;

export const appEnv: AppEnv = {
  ocrProvider: (runtimeEnv.VITE_OCR_PROVIDER as string | undefined) ?? defaultConfig.ocrProvider,
  googleVisionKey: runtimeEnv.VITE_GOOGLE_VISION_KEY as string | undefined,
  tmdbKey: runtimeEnv.VITE_TMDB_KEY as string | undefined,
  omdbKey: runtimeEnv.VITE_OMDB_KEY as string | undefined,
};

export function requireEnv(key: keyof AppEnv, hint?: string): string {
  const value = appEnv[key];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  const suffix = hint ? ` ${hint}` : '';
  throw new Error(`Missing environment variable for ${key}.${suffix}`);
}

export function isDemoMode(): boolean {
  return appEnv.ocrProvider === 'mock';
}
