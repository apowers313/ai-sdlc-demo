import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useIntersectionObserver, useInfiniteScrollTrigger } from './useIntersectionObserver';

// Mock IntersectionObserver
interface MockIntersectionObserverInstance extends MockIntersectionObserver {
  trigger: (entries: Partial<IntersectionObserverEntry>[]) => void;
}

let mockIntersectionObserverInstances: MockIntersectionObserverInstance[] = [];

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    mockIntersectionObserverInstances.push(this as MockIntersectionObserverInstance);
  }

  observe(element: Element): void {
    this.elements.push(element);
  }

  unobserve(element: Element): void {
    this.elements = this.elements.filter(el => el !== element);
  }

  disconnect(): void {
    this.elements = [];
  }

  // Test helper
  trigger(entries: Partial<IntersectionObserverEntry>[]): void {
    const fullEntries = entries.map(entry => ({
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 0,
      intersectionRect: {} as DOMRectReadOnly,
      isIntersecting: false,
      rootBounds: null,
      target: document.createElement('div'),
      time: 0,
      ...entry,
    })) as IntersectionObserverEntry[];
    
    this.callback(fullEntries, this as unknown as IntersectionObserver);
  }
}

// @ts-expect-error - Mocking IntersectionObserver
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Test component to properly use the hook
interface TestComponentProps {
  hookResult: (result: ReturnType<typeof useIntersectionObserver>) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ hookResult }) => {
  const result = useIntersectionObserver();
  React.useEffect(() => {
    hookResult(result);
  }, [result, hookResult]);
  
  return <div ref={result.ref}>Test</div>;
};

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    mockIntersectionObserverInstances = [];
  });

  it('should return ref and initial state', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
    expect(result.current.entry).toBeUndefined();
  });

  it('should create observer when ref is set', () => {
    render(<TestComponent hookResult={() => {}} />);
    
    // The effect runs synchronously after render
    
    // IntersectionObserver is created in useEffect
    expect(mockIntersectionObserverInstances).toHaveLength(1);
    expect(mockIntersectionObserverInstances[0].elements).toHaveLength(1);
  });

  it('should update state when intersection changes', () => {
    let hookResult: ReturnType<typeof useIntersectionObserver>;
    render(<TestComponent hookResult={(r) => { hookResult = r; }} />);
    const element = screen.getByText('Test');
    
    // The effect runs synchronously after render
    
    const observer = mockIntersectionObserverInstances[0];
    
    // Trigger intersection
    act(() => {
      observer.trigger([{ isIntersecting: true, target: element }]);
    });
    
    expect(hookResult.inView).toBe(true);
    
    // Trigger no intersection
    act(() => {
      observer.trigger([{ isIntersecting: false, target: element }]);
    });
    
    expect(hookResult.inView).toBe(false);
  });

  it('should not create observer when disabled', () => {
    const TestComponentDisabled: React.FC = () => {
      const result = useIntersectionObserver({ enabled: false });
      return <div ref={result.ref}>Test</div>;
    };
    
    render(<TestComponentDisabled />);
    
    // The effect runs synchronously after render
    
    expect(mockIntersectionObserverInstances).toHaveLength(0);
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = render(<TestComponent hookResult={() => {}} />);
    
    // The effect runs synchronously after render
    
    const observer = mockIntersectionObserverInstances[0];
    const disconnectSpy = jest.spyOn(observer, 'disconnect');
    
    unmount();
    
    expect(disconnectSpy).toHaveBeenCalled();
  });
});

// Test component for useInfiniteScrollTrigger
interface TestInfiniteScrollComponentProps {
  onTrigger: () => void;
  options?: Parameters<typeof useInfiniteScrollTrigger>[1];
  hookResult?: (result: ReturnType<typeof useInfiniteScrollTrigger>) => void;
}

const TestInfiniteScrollComponent: React.FC<TestInfiniteScrollComponentProps> = ({ onTrigger, options, hookResult }) => {
  const result = useInfiniteScrollTrigger(onTrigger, options);
  React.useEffect(() => {
    if (hookResult) hookResult(result);
  }, [result, hookResult]);
  
  return <div ref={result.ref}>Scroll Target</div>;
};

describe('useInfiniteScrollTrigger', () => {
  beforeEach(() => {
    mockIntersectionObserverInstances = [];
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should trigger callback when in view', () => {
    const onTrigger = jest.fn();
    render(<TestInfiniteScrollComponent onTrigger={onTrigger} />);
    const element = screen.getByText('Scroll Target');
    
    // The effect runs synchronously after render
    
    const observer = mockIntersectionObserverInstances[0];
    
    act(() => {
      observer.trigger([{ isIntersecting: true, target: element }]);
    });
    
    expect(onTrigger).toHaveBeenCalled();
  });

  it('should trigger once when triggerOnce is true', () => {
    const onTrigger = jest.fn();
    render(
      <TestInfiniteScrollComponent onTrigger={onTrigger} options={{ triggerOnce: true }} />
    );
    const element = screen.getByText('Scroll Target');
    
    // The effect runs synchronously after render
    
    const observer = mockIntersectionObserverInstances[0];
    
    // First trigger
    act(() => {
      observer.trigger([{ isIntersecting: true, target: element }]);
    });
    
    expect(onTrigger).toHaveBeenCalledTimes(1);
    
    // Leave view
    act(() => {
      observer.trigger([{ isIntersecting: false, target: element }]);
    });
    
    // Re-enter view - should not trigger again
    act(() => {
      observer.trigger([{ isIntersecting: true, target: element }]);
    });
    
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('should delay trigger when delay is set', () => {
    const onTrigger = jest.fn();
    render(
      <TestInfiniteScrollComponent onTrigger={onTrigger} options={{ delay: 1000 }} />
    );
    const element = screen.getByText('Scroll Target');
    
    // The effect runs synchronously after render
    
    const observer = mockIntersectionObserverInstances[0];
    
    act(() => {
      observer.trigger([{ isIntersecting: true, target: element }]);
    });
    
    expect(onTrigger).not.toHaveBeenCalled();
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(onTrigger).toHaveBeenCalled();
  });
});