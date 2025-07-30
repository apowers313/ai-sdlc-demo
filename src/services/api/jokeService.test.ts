import { jokeService } from './jokeService';
import { apiClient } from './client';
import { contentFilter } from '@/services/contentFilter';
import { useFilterStore } from '@/stores/filterStore';
import { Joke, JokeSearchResponse } from '@/types/joke';

jest.mock('./client');
jest.mock('@/services/contentFilter');
jest.mock('@/stores/filterStore');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockContentFilter = contentFilter as jest.Mocked<typeof contentFilter>;

describe('JokeService', () => {
  const mockJoke: Joke = {
    id: 'test-id',
    joke: 'This is a clean test joke',
    status: 200,
  };

  const mockDirtyJoke: Joke = {
    id: 'dirty-id',
    joke: 'This is a dirty test joke',
    status: 200,
  };

  const mockFilterState = {
    isEnabled: true,
    strength: 'moderate' as const,
    customBlocklist: [],
    stats: {
      totalChecked: 0,
      totalBlocked: 0,
      blockedByCategory: {},
      lastChecked: new Date(),
    },
    toggleFilter: jest.fn(),
    setStrength: jest.fn(),
    addToBlocklist: jest.fn(),
    removeFromBlocklist: jest.fn(),
    updateStats: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFilterStore.getState as jest.Mock).mockReturnValue(mockFilterState);
  });

  describe('getRandomJoke', () => {
    it('should return a clean joke when filter is disabled', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockJoke });

      const result = await jokeService.getRandomJoke({ filterEnabled: false });

      expect(result).toEqual(mockJoke);
      expect(mockContentFilter.isClean).not.toHaveBeenCalled();
      expect(mockApiClient.get).toHaveBeenCalledWith('/');
    });

    it('should return a clean joke when filter is enabled', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockJoke });
      mockContentFilter.isClean.mockReturnValueOnce(true);

      const result = await jokeService.getRandomJoke({ filterEnabled: true });

      expect(result).toEqual(mockJoke);
      expect(mockContentFilter.isClean).toHaveBeenCalledWith(mockJoke.joke);
      expect(mockFilterState.updateStats).toHaveBeenCalled();
    });

    it('should retry when joke is dirty and filter is enabled', async () => {
      mockApiClient.get
        .mockResolvedValueOnce({ data: mockDirtyJoke })
        .mockResolvedValueOnce({ data: mockJoke });
      mockContentFilter.isClean
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      mockContentFilter.analyze.mockReturnValueOnce({
        isClean: false,
        matches: ['profanity'],
        cleanedText: 'This is a ***** test joke',
      });

      const result = await jokeService.getRandomJoke({ filterEnabled: true });

      expect(result).toEqual(mockJoke);
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      expect(mockContentFilter.isClean).toHaveBeenCalledTimes(2);
      expect(mockFilterState.updateStats).toHaveBeenCalledTimes(2);
    });

    it('should return fallback joke after max retries', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockDirtyJoke });
      mockContentFilter.isClean.mockReturnValue(false);
      mockContentFilter.analyze.mockReturnValue({
        isClean: false,
        matches: ['profanity'],
        cleanedText: 'This is a ***** test joke',
      });

      const result = await jokeService.getRandomJoke({ filterEnabled: true, maxRetries: 2 });

      expect(result.id).toBe('fallback-1');
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getJokeById', () => {
    it('should fetch joke by ID', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockJoke });

      const result = await jokeService.getJokeById('test-id');

      expect(result).toEqual(mockJoke);
      expect(mockApiClient.get).toHaveBeenCalledWith('/j/test-id');
    });
  });

  describe('searchJokes', () => {
    const mockSearchResponse: JokeSearchResponse = {
      current_page: 1,
      limit: 20,
      next_page: 2,
      previous_page: null,
      results: [mockJoke, mockDirtyJoke],
      search_term: 'test',
      status: 200,
      total_jokes: 100,
      total_pages: 5,
    };

    it('should search jokes without filtering when disabled', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockSearchResponse });

      const result = await jokeService.searchJokes(
        { term: 'test', page: 1, limit: 20 },
        { filterEnabled: false }
      );

      expect(result).toEqual(mockSearchResponse);
      expect(mockApiClient.get).toHaveBeenCalledWith('/search', {
        params: { term: 'test', page: 1, limit: 20 },
      });
    });

    it('should filter results when enabled', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockSearchResponse });
      mockContentFilter.isClean
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const result = await jokeService.searchJokes(
        { term: 'test', page: 1, limit: 20 },
        { filterEnabled: true }
      );

      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toEqual(mockJoke);
      // total_jokes should preserve the original count from API
      expect(result.total_jokes).toBe(100);
      expect(mockFilterState.updateStats).toHaveBeenCalled();
    });
  });

  describe('getRandomJokes', () => {
    it('should fetch multiple jokes in parallel', async () => {
      mockApiClient.get
        .mockResolvedValueOnce({ data: mockJoke })
        .mockResolvedValueOnce({ data: { ...mockJoke, id: 'test-id-2' } })
        .mockResolvedValueOnce({ data: { ...mockJoke, id: 'test-id-3' } });
      mockContentFilter.isClean.mockReturnValue(true);

      const result = await jokeService.getRandomJokes(3, { filterEnabled: false });

      expect(result).toHaveLength(3);
      expect(mockApiClient.get).toHaveBeenCalledTimes(3);
    });

    it('should handle failures gracefully', async () => {
      // Suppress console.error for this test since we expect errors
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockApiClient.get
        .mockResolvedValueOnce({ data: mockJoke })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: { ...mockJoke, id: 'test-id-3' } });
      mockContentFilter.isClean.mockReturnValue(true);

      const result = await jokeService.getRandomJokes(3, { filterEnabled: false });

      expect(result).toHaveLength(2);
      
      // Verify the error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch joke:', expect.any(Error));
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCleanJoke', () => {
    it('should temporarily change filter strength if specified', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockJoke });
      mockContentFilter.isClean.mockReturnValue(true);

      await jokeService.getCleanJoke('strict');

      expect(mockFilterState.setStrength).toHaveBeenCalledWith('strict');
      expect(mockFilterState.setStrength).toHaveBeenCalledWith('moderate'); // Reset
    });
  });
});