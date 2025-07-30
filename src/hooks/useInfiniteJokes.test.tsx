import { renderHook, waitFor, act } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { useInfiniteJokes } from './useInfiniteJokes';
import { jokeService } from '@/services/api/jokeService';
import { useFilterStore } from '@/stores/filterStore';
import { Joke, JokeSearchResponse } from '@/types/joke';

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

describe('useInfiniteJokes', () => {
  const mockJoke: Joke = {
    id: 'test-id',
    joke: 'Test joke',
    status: 200,
  };

  const mockSearchResponse: JokeSearchResponse = {
    current_page: 1,
    limit: 20,
    next_page: 2,
    previous_page: null,
    results: [mockJoke],
    search_term: 'dad',
    status: 200,
    total_jokes: 100,
    total_pages: 5,
  };

  const mockSearchResponsePage2: JokeSearchResponse = {
    ...mockSearchResponse,
    current_page: 2,
    next_page: 3,
    previous_page: 1,
    results: [{ ...mockJoke, id: 'test-id-2' }],
  };

  const mockSearchResponseLastPage: JokeSearchResponse = {
    ...mockSearchResponse,
    current_page: 5,
    next_page: null,
    previous_page: 4,
    results: [{ ...mockJoke, id: 'test-id-last' }],
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

  it('should fetch jokes with infinite scroll', async () => {
    mockJokeService.searchJokes
      .mockResolvedValueOnce(mockSearchResponse)
      .mockResolvedValueOnce(mockSearchResponsePage2);

    const { result } = renderHook(() => useInfiniteJokes(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.jokes).toHaveLength(1);
    expect(result.current.jokes[0]).toEqual(mockJoke);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.totalJokes).toBe(100);

    // Load more
    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.jokes).toHaveLength(2);
    });

    expect(result.current.jokes[1].id).toBe('test-id-2');
    expect(mockJokeService.searchJokes).toHaveBeenCalledTimes(2);
  });

  it('should handle search term', async () => {
    mockJokeService.searchJokes.mockResolvedValueOnce(mockSearchResponse);

    const { result } = renderHook(() => useInfiniteJokes('funny'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockJokeService.searchJokes).toHaveBeenCalledWith(
      {
        term: 'funny',
        page: 1,
        limit: 20,
      },
      { filterEnabled: true }
    );
  });

  it('should detect when no more pages', async () => {
    mockJokeService.searchJokes.mockResolvedValueOnce(mockSearchResponseLastPage);

    const { result } = renderHook(() => useInfiniteJokes(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasMore).toBe(false);
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch');
    mockJokeService.searchJokes.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useInfiniteJokes(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.jokes).toHaveLength(0);
  });

  it('should not load more when already loading', async () => {
    mockJokeService.searchJokes.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockSearchResponse), 100))
    );

    const { result } = renderHook(() => useInfiniteJokes(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.loadMore();
      result.current.loadMore(); // Try to load more while already loading
    });

    expect(result.current.size).toBe(2); // Should only increment once
  });
});