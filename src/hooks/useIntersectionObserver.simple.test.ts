import { renderHook } from '@testing-library/react';
import { useIntersectionObserver, useInfiniteScrollTrigger } from './useIntersectionObserver';

// Simple tests to improve coverage without complex mocking
describe('useIntersectionObserver - Simple Tests', () => {
  it('should return initial values', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
    expect(result.current.inView).toBe(false);
    expect(result.current.entry).toBeUndefined();
  });
  
  it('should accept options', () => {
    const { result } = renderHook(() => 
      useIntersectionObserver({
        threshold: 0.5,
        rootMargin: '20px',
        enabled: true,
      })
    );
    
    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
  });
  
  it('should not crash when disabled', () => {
    const { result } = renderHook(() => 
      useIntersectionObserver({ enabled: false })
    );
    
    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
  });
});

describe('useInfiniteScrollTrigger - Simple Tests', () => {
  it('should return initial values', () => {
    const onTrigger = jest.fn();
    const { result } = renderHook(() => useInfiniteScrollTrigger(onTrigger));
    
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
    expect(result.current.inView).toBe(false);
    expect(onTrigger).not.toHaveBeenCalled();
  });
  
  it('should accept options', () => {
    const onTrigger = jest.fn();
    const { result } = renderHook(() => 
      useInfiniteScrollTrigger(onTrigger, {
        triggerOnce: true,
        delay: 500,
        threshold: 0.8,
      })
    );
    
    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
    expect(onTrigger).not.toHaveBeenCalled();
  });
});