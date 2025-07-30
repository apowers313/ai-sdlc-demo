import { act } from '@testing-library/react';
import { useFilterStore } from './filterStore';

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: <T,>(config: T): T => config,
}));

describe('filterStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useFilterStore.setState({
        isEnabled: true,
        strength: 'strict',
        customBlocklist: [],
        stats: undefined,
      });
    });
  });

  it('should toggle filter', () => {
    const { toggleFilter } = useFilterStore.getState();
    expect(useFilterStore.getState().isEnabled).toBe(true);
    
    act(() => {
      toggleFilter();
    });
    
    expect(useFilterStore.getState().isEnabled).toBe(false);
    
    act(() => {
      toggleFilter();
    });
    
    expect(useFilterStore.getState().isEnabled).toBe(true);
  });

  it('should set strength', () => {
    const { setStrength } = useFilterStore.getState();
    
    act(() => {
      setStrength('minimal');
    });
    
    expect(useFilterStore.getState().strength).toBe('minimal');
    
    act(() => {
      setStrength('moderate');
    });
    
    expect(useFilterStore.getState().strength).toBe('moderate');
  });

  it('should add to blocklist', () => {
    const { addToBlocklist } = useFilterStore.getState();
    
    act(() => {
      addToBlocklist('test1');
    });
    
    expect(useFilterStore.getState().customBlocklist).toEqual(['test1']);
    
    act(() => {
      addToBlocklist('test2');
    });
    
    expect(useFilterStore.getState().customBlocklist).toEqual(['test1', 'test2']);
  });

  it('should remove from blocklist', () => {
    const { addToBlocklist, removeFromBlocklist } = useFilterStore.getState();
    
    act(() => {
      addToBlocklist('test1');
      addToBlocklist('test2');
      addToBlocklist('test3');
    });
    
    expect(useFilterStore.getState().customBlocklist).toEqual(['test1', 'test2', 'test3']);
    
    act(() => {
      removeFromBlocklist('test2');
    });
    
    expect(useFilterStore.getState().customBlocklist).toEqual(['test1', 'test3']);
  });

  it('should update stats', () => {
    const { updateStats } = useFilterStore.getState();
    const now = new Date();
    
    act(() => {
      updateStats({
        totalChecked: 10,
        totalBlocked: 2,
        lastChecked: now,
      });
    });
    
    expect(useFilterStore.getState().stats).toEqual({
      totalChecked: 10,
      totalBlocked: 2,
      blockedByCategory: {},
      lastChecked: now,
    });
    
    act(() => {
      updateStats({
        totalChecked: 15,
        blockedByCategory: { profanity: 3 },
      });
    });
    
    expect(useFilterStore.getState().stats).toEqual({
      totalChecked: 15,
      totalBlocked: 2,
      blockedByCategory: { profanity: 3 },
      lastChecked: now,
    });
  });
});