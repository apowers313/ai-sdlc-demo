import { ContentFilterService } from './contentFilter';

describe('ContentFilterService', () => {
  let filter: ContentFilterService;
  
  beforeEach(() => {
    filter = new ContentFilterService();
  });
  
  describe('isClean', () => {
    it('detects common profanity', () => {
      expect(filter.isClean('This is fucking awesome')).toBe(false);
      expect(filter.isClean('This shit is bad')).toBe(false);
    });
    
    it('detects obfuscated profanity', () => {
      expect(filter.isClean('This is f*cking bad')).toBe(false);
      expect(filter.isClean('sh!t happens')).toBe(false);
    });
    
    it('allows clean content', () => {
      expect(filter.isClean('This is a nice joke')).toBe(true);
      expect(filter.isClean('Why did the chicken cross the road?')).toBe(true);
    });
    
    it('detects sensitive topics', () => {
      expect(filter.isClean('racist joke here')).toBe(false);
      expect(filter.isClean('discrimination is bad')).toBe(false);
      expect(filter.isClean('violent content')).toBe(false);
    });
  });
  
  describe('analyze', () => {
    it('provides detailed analysis', () => {
      const result = filter.analyze('This fucking racist joke');
      expect(result.isClean).toBe(false);
      expect(result.matches.some(m => m.includes('fuc'))).toBe(true);
      expect(result.matches).toContain('racism');
      expect(result.cleanedText).toBeTruthy();
    });
    
    it('handles clean content', () => {
      const result = filter.analyze('A clean dad joke');
      expect(result.isClean).toBe(true);
      expect(result.matches).toHaveLength(0);
      expect(result.cleanedText).toBe('A clean dad joke');
    });
  });
  
  describe('clean', () => {
    it('censors profanity', () => {
      const cleaned = filter.clean('What the fuck is this?');
      expect(cleaned).not.toContain('fuck');
      expect(cleaned).toMatch(/[*@$%]/); // Censor uses various replacement characters
    });
  });
  
  describe('performance', () => {
    it.skip('processes text quickly', () => {
      const longText = 'This is a very long text '.repeat(100);
      const start = performance.now();
      filter.isClean(longText);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(5);
    });
  });
});