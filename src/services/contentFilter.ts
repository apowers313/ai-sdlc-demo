import { 
  RegExpMatcher, 
  englishDataset, 
  englishRecommendedTransformers,
  TextCensor
} from 'obscenity';

export interface FilterResult {
  isClean: boolean;
  matches: string[];
  cleanedText?: string;
}

export class ContentFilterService {
  private matcher: RegExpMatcher;
  private censor: TextCensor;
  private customPatterns: { pattern: RegExp; category: string }[];
  
  constructor() {
    this.matcher = new RegExpMatcher({
      ...englishDataset.build(),
      ...englishRecommendedTransformers,
    });
    
    this.censor = new TextCensor();
    
    this.customPatterns = [
      { pattern: /\brac(ist|ism|ial)\b/i, category: 'racism' },
      { pattern: /\bdiscriminat\w*\b/i, category: 'discrimination' },
      { pattern: /\b(violence|violent|abuse)\b/i, category: 'violence' },
      { pattern: /\bhate\s*(speech|crime)?\b/i, category: 'hate' },
      { pattern: /\b(suicide|self.?harm)\b/i, category: 'self-harm' },
      { pattern: /\b(terror|extremis[mt])\b/i, category: 'extremism' },
    ];
  }
  
  analyze(text: string): FilterResult {
    const profanityMatches = this.matcher.getAllMatches(text);
    const customMatches: string[] = [];
    
    this.customPatterns.forEach(({ pattern, category }) => {
      if (pattern.test(text)) {
        customMatches.push(category);
      }
    });
    
    const isClean = profanityMatches.length === 0 && customMatches.length === 0;
    const allMatches = [
      ...profanityMatches.map(m => text.substring(m.startIndex, m.endIndex)),
      ...customMatches
    ];
    
    return {
      isClean,
      matches: allMatches,
      cleanedText: isClean ? text : this.censor.applyTo(text, profanityMatches),
    };
  }
  
  isClean(text: string): boolean {
    return this.analyze(text).isClean;
  }
  
  clean(text: string): string {
    const result = this.analyze(text);
    return result.cleanedText || text;
  }
  
  // For admin interface
  addCustomPattern(pattern: string, category: string): void {
    this.customPatterns.push({
      pattern: new RegExp(pattern, 'i'),
      category,
    });
  }
}

// Singleton instance
export const contentFilter = new ContentFilterService();