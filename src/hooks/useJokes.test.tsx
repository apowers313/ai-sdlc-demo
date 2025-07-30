import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { useRandomJoke, useJokeById, useJokeSearch, usePrefetchJokes } from './useJokes';
import { jokeService } from '@/services/api/jokeService';
import { useFilterStore } from '@/stores/filterStore';
import { Joke } from '@/types/joke';

jest.mock('@/services/api/jokeService');
jest.mock('@/stores/filterStore');

const mockJokeService = jokeService as jest.Mocked<typeof jokeService>;

const createWrapper = (): React.FC<{ children: ReactNode }> => {
  return function Wrapper({ children }: { children: ReactNode }): React.ReactElement {
    return (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );
  };
};

describe('useJokes hooks', () => {
  const mockJoke: Joke = {
    id: 'test-id',
    joke: 'Test joke',
    status: 200,
  };

  const mockFilterState = {
    isEnabled: true,
    strength: 'moderate' as const,
    customBlocklist: [],
    stats: undefined,
    toggleFilter: jest.fn(),
    setStrength: jest.fn(),
    addToBlocklist: jest.fn(),
    removeFromBlocklist: jest.fn(),
    updateStats: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFilterStore as unknown as jest.Mock).mockReturnValue(mockFilterState);
  });

  describe('useRandomJoke', () => {
    it('should fetch a random joke', async () => {
      mockJokeService.getRandomJoke.mockResolvedValueOnce(mockJoke);

      const { result } = renderHook(() => useRandomJoke(), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.joke).toEqual(mockJoke);
      expect(result.current.error).toBeUndefined();
      expect(mockJokeService.getRandomJoke).toHaveBeenCalledWith({ filterEnabled: true });
    });

    it('should handle errors', async () => {
      const error = new Error('Failed to fetch');
      mockJokeService.getRandomJoke.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useRandomJoke(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.joke).toBeUndefined();
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useJokeById', () => {
    it('should fetch joke by ID', async () => {
      mockJokeService.getJokeById.mockResolvedValueOnce(mockJoke);

      const { result } = renderHook(() => useJokeById('test-id'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.joke).toEqual(mockJoke);
      expect(mockJokeService.getJokeById).toHaveBeenCalledWith('test-id');
    });

    it('should not fetch when ID is null', () => {
      const { result } = renderHook(() => useJokeById(null), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.joke).toBeUndefined();
      expect(mockJokeService.getJokeById).not.toHaveBeenCalled();
    });
  });

  describe('useJokeSearch', () => {
    const mockSearchResponse = {
      current_page: 1,
      limit: 20,
      next_page: 2,
      previous_page: null,
      results: [mockJoke],
      search_term: 'test',
      status: 200,
      total_jokes: 100,
      total_pages: 5,
    };

    it('should search jokes', async () => {
      mockJokeService.searchJokes.mockResolvedValueOnce(mockSearchResponse);

      const { result } = renderHook(() => useJokeSearch('test'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.searchResults).toEqual(mockSearchResponse);
      expect(mockJokeService.searchJokes).toHaveBeenCalledWith(
        { term: 'test', page: 1, limit: 20 },
        { filterEnabled: true }
      );
    });

    it('should not search with empty term', () => {
      const { result } = renderHook(() => useJokeSearch(''), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.searchResults).toBeUndefined();
      expect(mockJokeService.searchJokes).not.toHaveBeenCalled();
    });
  });

  describe('usePrefetchJokes', () => {
    it('should prefetch multiple jokes', async () => {
      const jokes = [mockJoke, { ...mockJoke, id: 'test-id-2' }];
      mockJokeService.getRandomJokes.mockResolvedValueOnce(jokes);

      const { result } = renderHook(() => usePrefetchJokes(2), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.jokes).toEqual(jokes);
      expect(mockJokeService.getRandomJokes).toHaveBeenCalledWith(2, { filterEnabled: true });
    });
  });
});