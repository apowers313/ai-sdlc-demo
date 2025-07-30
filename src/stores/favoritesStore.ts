import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Joke } from '@/types/joke';
import { Collection } from '@/types/user';

interface FavoritesState {
  favorites: Joke[];
  collections: Collection[];
  addFavorite: (joke: Joke, collectionId?: string) => void;
  removeFavorite: (jokeId: string) => void;
  isFavorite: (jokeId: string) => boolean;
  createCollection: (name: string) => Collection;
  deleteCollection: (collectionId: string) => void;
  addJokeToCollection: (jokeId: string, collectionId: string) => void;
  removeJokeFromCollection: (jokeId: string, collectionId: string) => void;
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
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
      addFavorite: (joke, collectionId = 'default'): void =>
        set((state) => {
          const isAlreadyFavorite = state.favorites.some((fav) => fav.id === joke.id);
          if (isAlreadyFavorite) {
            return state;
          }

          const collection = state.collections.find((c) => c.id === collectionId);
          if (!collection) {
            return state;
          }

          return {
            favorites: [...state.favorites, joke],
            collections: state.collections.map((c) =>
              c.id === collectionId
                ? {
                    ...c,
                    jokeIds: [...c.jokeIds, joke.id],
                    updatedAt: new Date(),
                  }
                : c
            ),
          };
        }),
      removeFavorite: (jokeId): void =>
        set((state) => ({
          favorites: state.favorites.filter((j) => j.id !== jokeId),
          collections: state.collections.map((c) => ({
            ...c,
            jokeIds: c.jokeIds.filter((id) => id !== jokeId),
            updatedAt: new Date(),
          })),
        })),
      isFavorite: (jokeId): boolean => {
        const state = get();
        return state.favorites.some((fav) => fav.id === jokeId);
      },
      createCollection: (name): Collection => {
        const newCollection: Collection = {
          id: generateId(),
          name,
          jokeIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          collections: [...state.collections, newCollection],
        }));
        return newCollection;
      },
      deleteCollection: (collectionId): void => {
        if (collectionId === 'default') {
          return;
        }
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== collectionId),
        }));
      },
      addJokeToCollection: (jokeId, collectionId): void =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId && !c.jokeIds.includes(jokeId)
              ? {
                  ...c,
                  jokeIds: [...c.jokeIds, jokeId],
                  updatedAt: new Date(),
                }
              : c
          ),
        })),
      removeJokeFromCollection: (jokeId, collectionId): void =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  jokeIds: c.jokeIds.filter((id) => id !== jokeId),
                  updatedAt: new Date(),
                }
              : c
          ),
        })),
    }),
    {
      name: 'favorites',
    }
  )
);