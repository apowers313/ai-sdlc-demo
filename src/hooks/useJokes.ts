import useSWR from 'swr';
import { jokeService } from '@/services/api/jokeService';
import { useFilterStore } from '@/stores/filterStore';
import { Joke, JokeSearchResponse } from '@/types/joke';
import { config } from '@/config/env';

interface UseRandomJokeReturn {
  joke: Joke | undefined;
  error: Error | undefined;
  isLoading: boolean;
  refresh: () => void;
}

export function useRandomJoke(): UseRandomJokeReturn {
  const { isEnabled: filterEnabled } = useFilterStore();
  
  const { data, error, isLoading, mutate } = useSWR<Joke>(
    ['random-joke', filterEnabled],
    async () => {
      return jokeService.getRandomJoke({ filterEnabled });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: config.cache.staleTime,
    }
  );

  return {
    joke: data,
    error,
    isLoading,
    refresh: (): void => { mutate(); },
  };
}

interface UseJokeByIdReturn {
  joke: Joke | undefined;
  error: Error | undefined;
  isLoading: boolean;
}

export function useJokeById(id: string | null): UseJokeByIdReturn {
  const { data, error, isLoading } = useSWR<Joke>(
    id ? ['joke', id] : null,
    () => jokeService.getJokeById(id!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: config.cache.ttl,
    }
  );

  return {
    joke: data,
    error,
    isLoading,
  };
}

interface UseJokeSearchReturn {
  searchResults: JokeSearchResponse | undefined;
  error: Error | undefined;
  isLoading: boolean;
}

export function useJokeSearch(searchTerm: string, page: number = 1, limit: number = 20): UseJokeSearchReturn {
  const { isEnabled: filterEnabled } = useFilterStore();
  
  const { data, error, isLoading } = useSWR(
    searchTerm ? ['joke-search', searchTerm, page, limit, filterEnabled] : null,
    () => jokeService.searchJokes({ term: searchTerm, page, limit }, { filterEnabled }),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: config.cache.staleTime,
    }
  );

  return {
    searchResults: data,
    error,
    isLoading,
  };
}

// Hook for prefetching jokes
interface UsePrefetchJokesReturn {
  jokes: Joke[];
  error: Error | undefined;
  isLoading: boolean;
}

export function usePrefetchJokes(count: number = 5): UsePrefetchJokesReturn {
  const { isEnabled: filterEnabled } = useFilterStore();
  
  const { data, error, isLoading } = useSWR(
    ['prefetch-jokes', count, filterEnabled],
    () => jokeService.getRandomJokes(count, { filterEnabled }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: config.cache.ttl,
    }
  );

  return {
    jokes: data || [],
    error,
    isLoading,
  };
}