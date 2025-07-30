import { renderHook, act } from '@testing-library/react';
import { useFavoritesStore } from './favoritesStore';
import { Joke } from '@/types/joke';

const mockJoke1: Joke = {
  id: 'joke-1',
  joke: 'Why did the chicken cross the road? To get to the other side!',
  status: 200,
};

const mockJoke2: Joke = {
  id: 'joke-2',
  joke: 'What do you call a bear with no teeth? A gummy bear!',
  status: 200,
};

describe('useFavoritesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset the store state
    useFavoritesStore.setState({
      favorites: [],
      collections: [
        {
          id: 'default',
          name: 'All Favorites',
          jokeIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addFavorite', () => {
    it('adds a joke to favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite(mockJoke1);
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0]).toEqual(mockJoke1);
      expect(result.current.collections[0].jokeIds).toContain(mockJoke1.id);
    });

    it('does not add duplicate jokes', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite(mockJoke1);
        result.current.addFavorite(mockJoke1);
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.collections[0].jokeIds).toHaveLength(1);
    });

    it('adds joke to specific collection', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        const newCollection = result.current.createCollection('Funny Ones');
        result.current.addFavorite(mockJoke1, newCollection.id);
      });

      const customCollection = result.current.collections.find(c => c.name === 'Funny Ones');
      expect(customCollection?.jokeIds).toContain(mockJoke1.id);
    });

    it('ignores invalid collection ID', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite(mockJoke1, 'invalid-id');
      });

      expect(result.current.favorites).toHaveLength(0);
    });
  });

  describe('removeFavorite', () => {
    it('removes a joke from favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite(mockJoke1);
        result.current.addFavorite(mockJoke2);
      });

      expect(result.current.favorites).toHaveLength(2);

      act(() => {
        result.current.removeFavorite(mockJoke1.id);
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0]).toEqual(mockJoke2);
      expect(result.current.collections[0].jokeIds).not.toContain(mockJoke1.id);
    });

    it('removes joke from all collections', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        const collection = result.current.createCollection('Test Collection');
        result.current.addFavorite(mockJoke1);
        result.current.addJokeToCollection(mockJoke1.id, collection.id);
      });

      expect(result.current.collections[1].jokeIds).toContain(mockJoke1.id);

      act(() => {
        result.current.removeFavorite(mockJoke1.id);
      });

      expect(result.current.collections[0].jokeIds).not.toContain(mockJoke1.id);
      expect(result.current.collections[1].jokeIds).not.toContain(mockJoke1.id);
    });
  });

  describe('isFavorite', () => {
    it('returns true for favorited jokes', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite(mockJoke1);
      });

      expect(result.current.isFavorite(mockJoke1.id)).toBe(true);
    });

    it('returns false for non-favorited jokes', () => {
      const { result } = renderHook(() => useFavoritesStore());

      expect(result.current.isFavorite('non-existent')).toBe(false);
    });
  });

  describe('createCollection', () => {
    it('creates a new collection', () => {
      const { result } = renderHook(() => useFavoritesStore());

      let newCollection;
      act(() => {
        newCollection = result.current.createCollection('My Collection');
      });

      expect(result.current.collections).toHaveLength(2);
      expect(result.current.collections[1].name).toBe('My Collection');
      expect(newCollection).toBeDefined();
    });

    it('generates unique IDs for collections', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.createCollection('Collection 1');
        result.current.createCollection('Collection 2');
      });

      const ids = result.current.collections.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('deleteCollection', () => {
    it('deletes a collection', () => {
      const { result } = renderHook(() => useFavoritesStore());

      let collection;
      act(() => {
        collection = result.current.createCollection('To Delete');
      });

      expect(result.current.collections).toHaveLength(2);

      act(() => {
        result.current.deleteCollection(collection!.id);
      });

      expect(result.current.collections).toHaveLength(1);
      expect(result.current.collections.find(c => c.id === collection!.id)).toBeUndefined();
    });

    it('cannot delete default collection', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.deleteCollection('default');
      });

      expect(result.current.collections).toHaveLength(1);
      expect(result.current.collections[0].id).toBe('default');
    });
  });

  describe('addJokeToCollection', () => {
    it('adds joke to collection', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite(mockJoke1);
        const collection = result.current.createCollection('Test');
        result.current.addJokeToCollection(mockJoke1.id, collection.id);
      });

      const testCollection = result.current.collections.find(c => c.name === 'Test');
      expect(testCollection?.jokeIds).toContain(mockJoke1.id);
    });

    it('does not add duplicate jokes to collection', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite(mockJoke1);
        const collection = result.current.createCollection('Test');
        result.current.addJokeToCollection(mockJoke1.id, collection.id);
        result.current.addJokeToCollection(mockJoke1.id, collection.id);
      });

      const testCollection = result.current.collections.find(c => c.name === 'Test');
      expect(testCollection?.jokeIds).toHaveLength(1);
    });
  });

  describe('removeJokeFromCollection', () => {
    it('removes joke from collection', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite(mockJoke1);
        const collection = result.current.createCollection('Test');
        result.current.addJokeToCollection(mockJoke1.id, collection.id);
      });

      const testCollection = result.current.collections.find(c => c.name === 'Test');
      expect(testCollection?.jokeIds).toContain(mockJoke1.id);

      act(() => {
        result.current.removeJokeFromCollection(mockJoke1.id, testCollection!.id);
      });

      const updatedCollection = result.current.collections.find(c => c.name === 'Test');
      expect(updatedCollection?.jokeIds).not.toContain(mockJoke1.id);
    });
  });

  describe('persistence', () => {
    it('persists favorites across store instances', () => {
      const { result: result1 } = renderHook(() => useFavoritesStore());

      act(() => {
        result1.current.addFavorite(mockJoke1);
      });

      // Create new hook instance
      const { result: result2 } = renderHook(() => useFavoritesStore());

      expect(result2.current.favorites).toHaveLength(1);
      expect(result2.current.favorites[0]).toEqual(mockJoke1);
    });

    it('persists collections across store instances', () => {
      const { result: result1 } = renderHook(() => useFavoritesStore());

      act(() => {
        result1.current.createCollection('Persisted Collection');
      });

      // Create new hook instance  
      const { result: result2 } = renderHook(() => useFavoritesStore());

      expect(result2.current.collections).toHaveLength(2);
      expect(result2.current.collections[1].name).toBe('Persisted Collection');
    });
  });
});