import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterStats } from '@/types/filter';

interface FilterState {
  isEnabled: boolean;
  strength: 'strict' | 'moderate' | 'minimal';
  customBlocklist: string[];
  stats?: FilterStats;
  toggleFilter: () => void;
  setStrength: (strength: FilterState['strength']) => void;
  addToBlocklist: (word: string) => void;
  removeFromBlocklist: (word: string) => void;
  updateStats: (stats: Partial<FilterStats>) => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      isEnabled: true,
      strength: 'strict',
      customBlocklist: [],
      stats: undefined,
      toggleFilter: (): void => set((state) => ({ isEnabled: !state.isEnabled })),
      setStrength: (strength): void => set({ strength }),
      addToBlocklist: (word): void => set((state) => ({
        customBlocklist: [...state.customBlocklist, word]
      })),
      removeFromBlocklist: (word): void => set((state) => ({
        customBlocklist: state.customBlocklist.filter(w => w !== word)
      })),
      updateStats: (newStats): void => set((state) => ({
        stats: state.stats ? { ...state.stats, ...newStats } : {
          totalChecked: 0,
          totalBlocked: 0,
          blockedByCategory: {},
          lastChecked: new Date(),
          ...newStats
        }
      })),
    }),
    {
      name: 'filter-settings',
    }
  )
);