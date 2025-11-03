import type { CandidateTitle } from '../../types/ocr';
import type { MediaTitle } from '../../types/media';

export interface LookupContext {
  candidates: CandidateTitle[];
}

export interface MovieMetadataProvider {
  name: string;
  /**
   * Attempt to resolve candidates derived from OCR into full media titles.
   */
  resolveCandidates(contexts: LookupContext[]): Promise<MediaTitle[]>;
}

export type MovieProviderKey = 'open' | 'mock';

export interface MovieMetadataClient {
  provider: MovieMetadataProvider;
  resolve(contexts: LookupContext[]): Promise<MediaTitle[]>;
}

export function createMovieMetadataClient(provider: MovieMetadataProvider): MovieMetadataClient {
  return {
    provider,
    resolve: (contexts) => provider.resolveCandidates(contexts),
  };
}
