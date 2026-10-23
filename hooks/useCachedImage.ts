import { useQueries, useQuery } from '@tanstack/react-query';

function imageQueryOptions(imageUrl: string | null | undefined) {
  return {
    queryKey: ['image', imageUrl],
    queryFn: async () => {
      if (!imageUrl) return null;

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    },
    enabled: !!imageUrl,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
  };
}

/**
 * Hook to cache images in memory using TanStack Query.
 * Images are fetched once and stored as blob URLs for instant access.
 */
export function useCachedImage(imageUrl: string | null | undefined) {
  return useQuery(imageQueryOptions(imageUrl));
}

/**
 * Prefetch multiple images into the cache.
 * Useful for preloading thumbnails.
 */
export function usePrefetchImages(imageUrls: string[]) {
  useQueries({
    queries: imageUrls.map((imageUrl) => imageQueryOptions(imageUrl)),
  });
}
