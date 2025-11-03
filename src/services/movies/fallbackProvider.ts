import type { MediaTitle } from '../../types/media';
import type { LookupContext, MovieMetadataProvider } from './types';
import { demoMediaTitles } from '../../lib/mock-data';

const fallbackMap = new Map<string, MediaTitle>();

demoMediaTitles.forEach((item) => {
  fallbackMap.set(item.title.toLowerCase(), item);
  if (item.releaseYear) {
    fallbackMap.set(`${item.title.toLowerCase()} ${item.releaseYear}`, item);
  }
});

export function createFallbackProvider(): MovieMetadataProvider {
  return {
    name: 'mock',
    async resolveCandidates(contexts: LookupContext[]) {
      const matches = new Set<MediaTitle>();

      contexts.forEach((context) => {
        context.candidates.forEach((candidate) => {
          const normalized = candidate.title.toLowerCase();
          const direct = fallbackMap.get(normalized);
          if (direct) {
            matches.add(direct);
            return;
          }

          for (const [key, value] of fallbackMap.entries()) {
            if (key.includes(normalized) || normalized.includes(key)) {
              matches.add(value);
            }
          }
        });
      });

      return Array.from(matches);
    },
  };
}
