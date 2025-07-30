export const setupIntersectionObserverMock = (): typeof IntersectionObserver => {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    
    private callback: IntersectionObserverCallback;
    private elements = new Set<Element>();
    
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.callback = callback;
      this.root = options?.root || null;
      this.rootMargin = options?.rootMargin || '';
      this.thresholds = Array.isArray(options?.threshold) ? options.threshold : [options?.threshold || 0];
    }
    
    observe(target: Element): void {
      this.elements.add(target);
      // Immediately trigger the callback
      this.callback([{
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRatio: 0,
        intersectionRect: new DOMRect(),
        isIntersecting: false,
        rootBounds: null,
        target,
        time: Date.now(),
      }], this);
    }
    
    unobserve(target: Element): void {
      this.elements.delete(target);
    }
    
    disconnect(): void {
      this.elements.clear();
    }
    
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    
    // Helper method for tests to trigger intersection
    triggerIntersection(entries: Partial<IntersectionObserverEntry>[]): void {
      const fullEntries = entries.map(entry => ({
        boundingClientRect: entry.boundingClientRect || new DOMRect(),
        intersectionRatio: entry.intersectionRatio || 0,
        intersectionRect: entry.intersectionRect || new DOMRect(),
        isIntersecting: entry.isIntersecting || false,
        rootBounds: entry.rootBounds || null,
        target: entry.target || document.createElement('div'),
        time: entry.time || Date.now(),
      }));
      this.callback(fullEntries, this);
    }
  }
  
  return MockIntersectionObserver;
};