import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseIntersectionObserverResult {
  ref: RefObject<HTMLDivElement | null>;
  inView: boolean;
  entry?: IntersectionObserverEntry;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverResult {
  const { 
    threshold = 0.1, 
    root = null, 
    rootMargin = '0px', 
    enabled = true 
  } = options;
  
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const targetRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!enabled || !targetRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('📍 Intersection Observer:', {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            target: entry.target,
            threshold,
            rootMargin
          });
        }
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      { 
        threshold, 
        root, 
        rootMargin 
      }
    );
    
    const currentTarget = targetRef.current;
    observer.observe(currentTarget);
    
    return (): void => {
      observer.disconnect();
    };
  }, [enabled, threshold, root, rootMargin]);
  
  return { 
    ref: targetRef, 
    inView: isIntersecting,
    entry 
  };
}

// Hook specifically for infinite scroll loading
interface UseInfiniteScrollTriggerResult {
  ref: RefObject<HTMLDivElement | null>;
  inView: boolean;
}

export function useInfiniteScrollTrigger(
  onTrigger: () => void,
  options: UseIntersectionObserverOptions & { 
    triggerOnce?: boolean;
    delay?: number;
  } = {}
): UseInfiniteScrollTriggerResult {
  const { triggerOnce = false, delay = 0, ...observerOptions } = options;
  const hasTriggeredRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const { ref, inView } = useIntersectionObserver(observerOptions);
  
  useEffect(() => {
    if (inView && (!triggerOnce || !hasTriggeredRef.current)) {
      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          onTrigger();
          hasTriggeredRef.current = true;
        }, delay);
      } else {
        onTrigger();
        hasTriggeredRef.current = true;
      }
    }
    
    return (): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inView, onTrigger, triggerOnce, delay]);
  
  return { ref, inView };
}