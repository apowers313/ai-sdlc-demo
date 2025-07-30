import useSWRInfinite from 'swr/infinite';
import { jokeService } from '@/services/api/jokeService';
import { useFilterStore } from '@/stores/filterStore';
import { JokeSearchResponse, Joke } from '@/types/joke';
import { config } from '@/config/env';

interface UseInfiniteJokesReturn {
  jokes: Joke[];
  error: Error | undefined;
  size: number;
  setSize: (size: number | ((_size: number) => number)) => Promise<JokeSearchResponse[] | undefined>;
  isLoading: boolean;
  isLoadingMore: boolean;
  isValidating: boolean;
  hasMore: boolean;
  totalJokes: number;
  refresh: () => void;
  loadMore: () => void;
}

export function useInfiniteJokes(searchTerm?: string): UseInfiniteJokesReturn {
  const { isEnabled: filterEnabled } = useFilterStore();
  
  const getKey = (pageIndex: number, previousPageData: JokeSearchResponse | null): (string | number | boolean)[] | null => {
    // null means we've reached the end
    if (previousPageData && !previousPageData.next_page) return null;
    
    // first page, we return the key
    if (pageIndex === 0) {
      return ['infinite-jokes', searchTerm || '', 1, filterEnabled];
    }
    
    // return the key for the next page
    return ['infinite-jokes', searchTerm || '', pageIndex + 1, filterEnabled];
  };
  
  const fetcher = async (key: (string | number | boolean)[]): Promise<JokeSearchResponse> => {
    const [, term, page, filter] = key;
    return jokeService.searchJokes(
      {
        term: String(term) || 'dad',  // Default search term to get all jokes
        page: Number(page),
        limit: 20,
      },
      { filterEnabled: filter as boolean }
    );
  };
  
  const {
    data,
    error,
    size,
    setSize,
    isValidating,
    isLoading,
    mutate
  } = useSWRInfinite<JokeSearchResponse>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateAll: false,
      persistSize: true,
      dedupingInterval: config.cache.staleTime,
      parallel: false,
    }
  );
  
  // Flatten all jokes from all pages
  const jokes = data?.flatMap(page => page.results) ?? [];
  
  // Check if there are more pages to load
  const hasMore = data ? data[data.length - 1]?.next_page !== null : true;
  
  // Total number of jokes available
  const totalJokes = data?.[0]?.total_jokes ?? 0;
  
  // Check if we're loading more
  const isLoadingMore = Boolean(size > 0 && data && typeof data[size - 1] === 'undefined');
  
  return {
    jokes,
    error,
    size,
    setSize,
    isLoading,
    isLoadingMore,
    isValidating,
    hasMore,
    totalJokes,
    refresh: (): void => { mutate(); },
    loadMore: (): void => {
      if (!isLoadingMore && hasMore) {
        setSize(size + 1);
      }
    },
  };
}