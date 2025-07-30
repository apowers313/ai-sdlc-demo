import { apiClient } from './client';
import { Joke, JokeSearchResponse } from '@/types/joke';
import { contentFilter } from '@/services/contentFilter';
import { useFilterStore } from '@/stores/filterStore';

export interface JokeServiceOptions {
  filterEnabled?: boolean;
  maxRetries?: number;
}

class JokeService {
  async getRandomJoke(options: JokeServiceOptions = {}): Promise<Joke> {
    const { filterEnabled = true, maxRetries = 10 } = options;
    let attempts = 0;
    
    while (attempts < maxRetries) {
      const { data } = await apiClient.get<Joke>('/');
      
      if (!filterEnabled || contentFilter.isClean(data.joke)) {
        // Update filter stats
        if (filterEnabled) {
          const filterStore = useFilterStore.getState();
          filterStore.updateStats({
            totalChecked: (filterStore.stats?.totalChecked || 0) + 1,
            lastChecked: new Date(),
          });
        }
        return data;
      }
      
      // Joke was filtered out, update stats
      if (filterEnabled) {
        const filterStore = useFilterStore.getState();
        const filterResult = contentFilter.analyze(data.joke);
        const categories = filterResult.matches;
        
        const blockedByCategory = { ...(filterStore.stats?.blockedByCategory || {}) };
        categories.forEach(category => {
          blockedByCategory[category] = (blockedByCategory[category] || 0) + 1;
        });
        
        filterStore.updateStats({
          totalChecked: (filterStore.stats?.totalChecked || 0) + 1,
          totalBlocked: (filterStore.stats?.totalBlocked || 0) + 1,
          blockedByCategory,
          lastChecked: new Date(),
        });
      }
      
      attempts++;
    }
    
    // If we can't find a clean joke, return a fallback
    return {
      id: 'fallback-1',
      joke: "I'm reading a book about anti-gravity. It's impossible to put down!",
      status: 200,
    };
  }
  
  async getJokeById(id: string): Promise<Joke> {
    const { data } = await apiClient.get<Joke>(`/j/${id}`);
    return data;
  }
  
  async searchJokes(params: {
    term: string;
    page?: number;
    limit?: number;
  }, options: JokeServiceOptions = {}): Promise<JokeSearchResponse> {
    const { filterEnabled = true } = options;
    const { data } = await apiClient.get<JokeSearchResponse>('/search', {
      params: {
        term: params.term,
        page: params.page || 1,
        limit: params.limit || 20,
      },
    });
    
    if (filterEnabled) {
      // Filter out inappropriate jokes
      const filteredResults = data.results.filter(joke => 
        contentFilter.isClean(joke.joke)
      );
      
      // Update filter stats
      const filterStore = useFilterStore.getState();
      const totalChecked = data.results.length;
      const totalBlocked = totalChecked - filteredResults.length;
      
      filterStore.updateStats({
        totalChecked: (filterStore.stats?.totalChecked || 0) + totalChecked,
        totalBlocked: (filterStore.stats?.totalBlocked || 0) + totalBlocked,
        lastChecked: new Date(),
      });
      
      return {
        ...data,
        results: filteredResults,
        // Don't modify pagination data - keep original totals
      };
    }
    
    return data;
  }
  
  // Batch fetch for prefetching
  async getRandomJokes(count: number, options: JokeServiceOptions = {}): Promise<Joke[]> {
    const jokes: Joke[] = [];
    const promises = Array.from({ length: count }, () => 
      this.getRandomJoke(options).catch(error => {
        console.error('Failed to fetch joke:', error);
        return null;
      })
    );
    
    const results = await Promise.allSettled(promises);
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        jokes.push(result.value);
      }
    });
    
    return jokes;
  }
  
  // Get a clean joke with specific strength setting
  async getCleanJoke(strength?: 'strict' | 'moderate' | 'minimal'): Promise<Joke> {
    const filterStore = useFilterStore.getState();
    const originalStrength = filterStore.strength;
    
    try {
      if (strength && strength !== originalStrength) {
        filterStore.setStrength(strength);
      }
      
      return await this.getRandomJoke({ filterEnabled: true });
    } finally {
      // Restore original strength
      if (strength && strength !== originalStrength) {
        filterStore.setStrength(originalStrength);
      }
    }
  }
}

export const jokeService = new JokeService();