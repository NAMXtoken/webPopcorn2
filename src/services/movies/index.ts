import { appEnv } from '../../config/env';
import type { LookupContext, MovieMetadataClient, MovieMetadataProvider, MovieProviderKey } from './types';
import { createMovieMetadataClient } from './types';
import { createOpenMediaProvider } from './openProvider';
import { createFallbackProvider } from './fallbackProvider';

export function resolveMovieProvider(providerKey?: MovieProviderKey): MovieMetadataProvider {
  const key = providerKey ?? 'open';

  switch (key) {
    case 'open':
      return createOpenMediaProvider({
        omdbKey: appEnv.omdbKey,
      });
    case 'mock':
    default:
      return createFallbackProvider();
  }
}

export function getMovieMetadataClient(providerKey?: MovieProviderKey): MovieMetadataClient {
  return createMovieMetadataClient(resolveMovieProvider(providerKey));
}

export async function resolveTitlesFromCandidates(
  contexts: LookupContext[],
  providerKey?: MovieProviderKey,
) {
  const client = getMovieMetadataClient(providerKey);
  return client.resolve(contexts);
}
