# JokeStream Implementation Plan

## Overview

This document provides a detailed, step-by-step implementation plan for the JokeStream application. Each step is designed to be small, testable, and build upon previous work. The plan emphasizes test-driven development, code quality, and maintainability.

## Success Criteria

- **Functional website** deployed and accessible
- **Maintainable code** with clear architecture and documentation
- **Unit test coverage** of at least 80%
- **Solid architecture** that supports future expansion
- **Performance targets** met (< 3s load time, > 90 Lighthouse score)
- **Accessibility** WCAG 2.1 AA compliance

## Implementation Phases

### Phase 0: Project Setup and Foundation (Days 1-3)

#### Step 0.1: Initialize Next.js Project with TypeScript
```bash
npx create-next-app@latest jokestream --typescript --tailwind --app --src-dir --import-alias "@/*"
```

**Tasks:**
1. Create new Next.js project with App Router
2. Configure TypeScript with strict mode
3. Set up path aliases in tsconfig.json
4. Create initial folder structure

**Success Criteria:**
- `npm run dev` starts without errors
- TypeScript compiles without warnings
- Basic "Hello World" page renders

**Test:**
```bash
npm run dev
# Visit http://localhost:3000
npm run build
npm run lint
```

#### Step 0.2: Configure Development Tools
**Tasks:**
1. **ESLint Configuration**
   ```json
   // .eslintrc.json
   {
     "extends": [
       "next/core-web-vitals",
       "plugin:@typescript-eslint/recommended",
       "plugin:jest/recommended",
       "plugin:testing-library/react",
       "prettier"
     ],
     "rules": {
       "@typescript-eslint/explicit-function-return-type": "warn",
       "@typescript-eslint/no-unused-vars": "error"
     }
   }
   ```

2. **Prettier Configuration**
   ```json
   // .prettierrc.json
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 100,
     "tabWidth": 2
   }
   ```

3. **Husky & Lint-staged**
   ```bash
   npm install --save-dev husky lint-staged
   npx husky install
   ```

4. **VS Code Settings**
   ```json
   // .vscode/settings.json
   {
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     }
   }
   ```

**Dependencies to Install:**
```bash
npm install --save-dev \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-config-prettier \
  eslint-plugin-jest \
  eslint-plugin-testing-library \
  prettier \
  husky \
  lint-staged
```

**Success Criteria:**
- ESLint runs without configuration errors
- Prettier formats code consistently
- Pre-commit hooks prevent bad commits

#### Step 0.3: Set Up Testing Framework
**Tasks:**
1. **Install Testing Dependencies**
   ```bash
   npm install --save-dev \
     jest \
     jest-environment-jsdom \
     @testing-library/react \
     @testing-library/jest-dom \
     @testing-library/user-event \
     @types/jest \
     jest-fetch-mock
   ```

2. **Configure Jest**
   ```javascript
   // jest.config.js
   const nextJest = require('next/jest')
   
   const createJestConfig = nextJest({
     dir: './',
   })
   
   const customJestConfig = {
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },
     testEnvironment: 'jest-environment-jsdom',
     collectCoverageFrom: [
       'src/**/*.{js,jsx,ts,tsx}',
       '!src/**/*.d.ts',
       '!src/**/*.stories.{js,jsx,ts,tsx}',
       '!src/**/_*.{js,jsx,ts,tsx}',
     ],
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80,
       },
     },
   }
   
   module.exports = createJestConfig(customJestConfig)
   ```

3. **Create Test Setup**
   ```javascript
   // jest.setup.js
   import '@testing-library/jest-dom'
   import 'jest-fetch-mock'
   ```

4. **Write First Test**
   ```typescript
   // src/app/page.test.tsx
   import { render, screen } from '@testing-library/react';
   import Home from './page';
   
   describe('Home', () => {
     it('renders without crashing', () => {
       render(<Home />);
       expect(screen.getByText(/JokeStream/i)).toBeInTheDocument();
     });
   });
   ```

**Success Criteria:**
- `npm test` runs successfully
- Coverage report generates
- First test passes

#### Step 0.4: Set Up Core Dependencies
**Tasks:**
1. **Install Production Dependencies**
   ```bash
   npm install \
     axios \
     swr \
     zustand \
     obscenity \
     clsx \
     tailwind-merge
   ```

2. **Install UI/UX Dependencies**
   ```bash
   npm install \
     @radix-ui/react-dialog \
     @radix-ui/react-dropdown-menu \
     @radix-ui/react-switch \
     @radix-ui/react-tooltip \
     framer-motion \
     react-intersection-observer
   ```

3. **Create Utility Functions**
   ```typescript
   // src/lib/utils.ts
   import { type ClassValue, clsx } from 'clsx';
   import { twMerge } from 'tailwind-merge';
   
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

**Success Criteria:**
- All dependencies install without conflicts
- No TypeScript errors in imports
- Utility functions have tests

#### Step 0.5: Create Base Architecture
**Tasks:**
1. **Create Folder Structure**
   ```
   src/
   ├── app/
   │   ├── layout.tsx
   │   ├── page.tsx
   │   └── globals.css
   ├── components/
   │   ├── common/
   │   ├── jokes/
   │   ├── layout/
   │   └── features/
   ├── hooks/
   ├── lib/
   ├── services/
   ├── stores/
   ├── types/
   └── config/
   ```

2. **Define Base Types**
   ```typescript
   // src/types/joke.ts
   export interface Joke {
     id: string;
     joke: string;
     status: number;
   }
   
   export interface JokeSearchResponse {
     current_page: number;
     limit: number;
     next_page: number;
     previous_page: number;
     results: Joke[];
     search_term: string;
     status: number;
     total_jokes: number;
     total_pages: number;
   }
   
   // src/types/user.ts
   export interface UserStats {
     jokesRead: number;
     favoritesCount: number;
     reactionsCount: number;
     sharedCount: number;
     currentStreak: number;
     lastVisit: Date;
   }
   
   export interface Collection {
     id: string;
     name: string;
     jokeIds: string[];
     createdAt: Date;
     updatedAt: Date;
   }
   ```

3. **Create Environment Configuration**
   ```typescript
   // src/config/env.ts
   export const config = {
     api: {
       baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://icanhazdadjoke.com',
       timeout: 10000,
       headers: {
         'User-Agent': 'JokeStream/1.0 (https://github.com/yourusername/jokestream)',
       },
     },
     app: {
       name: 'JokeStream',
       description: 'Endless dad jokes for everyone',
       version: '1.0.0',
     },
     cache: {
       ttl: 5 * 60 * 1000, // 5 minutes
       staleTime: 2 * 60 * 1000, // 2 minutes
     },
   } as const;
   ```

4. **Create Base Layout**
   ```typescript
   // src/app/layout.tsx
   import type { Metadata } from 'next';
   import { Inter } from 'next/font/google';
   import './globals.css';
   import { ThemeProvider } from '@/providers/ThemeProvider';
   import { SWRProvider } from '@/providers/SWRProvider';

   const inter = Inter({ subsets: ['latin'] });

   export const metadata: Metadata = {
     title: 'JokeStream - Endless Dad Jokes',
     description: 'Discover an endless stream of family-friendly dad jokes',
     manifest: '/manifest.json',
     themeColor: [
       { media: '(prefers-color-scheme: light)', color: 'white' },
       { media: '(prefers-color-scheme: dark)', color: 'black' },
     ],
   };

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en" suppressHydrationWarning>
         <body className={inter.className}>
           <ThemeProvider>
             <SWRProvider>
               {children}
             </SWRProvider>
           </ThemeProvider>
         </body>
       </html>
     );
   }
   ```

5. **Create Initial Home Page**
   ```typescript
   // src/app/page.tsx
   'use client';

   import { Header } from '@/components/layout/Header';
   import { InfiniteJokeList } from '@/components/jokes/InfiniteJokeList';
   import { FilterSettings } from '@/components/features/FilterSettings';

   export default function Home() {
     return (
       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
         <Header />
         <main className="container mx-auto px-4 py-8">
           <div className="max-w-4xl mx-auto">
             <h1 className="text-4xl font-bold text-center mb-8">
               JokeStream
             </h1>
             <FilterSettings />
             <InfiniteJokeList />
           </div>
         </main>
       </div>
     );
   }
   ```

**Success Criteria:**
- Clean architecture established
- Types compile without errors
- Configuration is type-safe
- Initial page renders correctly

### Phase 1: Content Filtering System (Days 4-6)

#### Step 1.1: Implement Content Filter Service
**Tasks:**
1. **Create Filter Service**
   ```typescript
   // src/services/contentFilter.ts
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
       const dataset = englishDataset.build();
       this.matcher = new RegExpMatcher({
         ...dataset,
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
   ```

2. **Write Comprehensive Tests**
   ```typescript
   // src/services/contentFilter.test.ts
   import { ContentFilterService } from './contentFilter';
   
   describe('ContentFilterService', () => {
     let filter: ContentFilterService;
     
     beforeEach(() => {
       filter = new ContentFilterService();
     });
     
     describe('isClean', () => {
       it('detects common profanity', () => {
         expect(filter.isClean('This is fucking awesome')).toBe(false);
         expect(filter.isClean('What the hell')).toBe(false);
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
         expect(result.matches).toContain('fucking');
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
         expect(cleaned).toContain('***');
       });
     });
     
     describe('performance', () => {
       it('processes text quickly', () => {
         const longText = 'This is a very long text '.repeat(100);
         const start = performance.now();
         filter.isClean(longText);
         const duration = performance.now() - start;
         expect(duration).toBeLessThan(5);
       });
     });
   });
   ```

3. **Create Filter Configuration Interface**
   ```typescript
   // src/types/filter.ts
   export type FilterStrength = 'strict' | 'moderate' | 'minimal';
   
   export interface FilterConfig {
     enabled: boolean;
     strength: FilterStrength;
     customBlocklist: string[];
     allowedCategories: string[];
   }
   
   export interface FilterStats {
     totalChecked: number;
     totalBlocked: number;
     blockedByCategory: Record<string, number>;
     lastChecked: Date;
   }
   ```

**Success Criteria:**
- Filter service detects inappropriate content 
- Tests cover edge cases
- Performance < 5ms per check

#### Step 1.2: Create Filter Configuration Store
**Tasks:**
1. **Implement Zustand Store**
   ```typescript
   // src/stores/filterStore.ts
   import { create } from 'zustand';
   import { persist } from 'zustand/middleware';
   
   interface FilterState {
     isEnabled: boolean;
     strength: 'strict' | 'moderate' | 'minimal';
     customBlocklist: string[];
     toggleFilter: () => void;
     setStrength: (strength: FilterState['strength']) => void;
     addToBlocklist: (word: string) => void;
   }
   
   export const useFilterStore = create<FilterState>()(
     persist(
       (set) => ({
         isEnabled: true,
         strength: 'moderate',
         customBlocklist: [],
         toggleFilter: () => set((state) => ({ isEnabled: !state.isEnabled })),
         setStrength: (strength) => set({ strength }),
         addToBlocklist: (word) => set((state) => ({
           customBlocklist: [...state.customBlocklist, word]
         })),
       }),
       {
         name: 'filter-settings',
       }
     )
   );
   ```

2. **Create Filter Settings Component**
   ```typescript
   // src/components/features/FilterSettings.tsx
   'use client';
   
   import { Switch } from '@/components/ui/Switch';
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
   import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
   import { useFilterStore } from '@/stores/filterStore';
   
   export function FilterSettings() {
     const { isEnabled, strength, toggleFilter, setStrength, stats } = useFilterStore();
     
     const getShieldIcon = () => {
       if (!isEnabled) return <Shield className="w-5 h-5 text-gray-400" />;
       if (strength === 'strict') return <ShieldAlert className="w-5 h-5 text-red-500" />;
       return <ShieldCheck className="w-5 h-5 text-green-500" />;
     };
     
     return (
       <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             {getShieldIcon()}
             <h3 className="text-lg font-medium">Content Filter</h3>
           </div>
           <Switch 
             checked={isEnabled} 
             onCheckedChange={toggleFilter}
             aria-label="Toggle content filter"
           />
         </div>
         
         {isEnabled && (
           <>
             <Select value={strength} onValueChange={setStrength}>
               <SelectTrigger className="w-full">
                 <SelectValue placeholder="Select filter strength" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="minimal">
                   <div className="flex items-center gap-2">
                     <Shield className="w-4 h-4" />
                     <span>Minimal - Only explicit content</span>
                   </div>
                 </SelectItem>
                 <SelectItem value="moderate">
                   <div className="flex items-center gap-2">
                     <ShieldCheck className="w-4 h-4" />
                     <span>Moderate - Balanced filtering</span>
                   </div>
                 </SelectItem>
                 <SelectItem value="strict">
                   <div className="flex items-center gap-2">
                     <ShieldAlert className="w-4 h-4" />
                     <span>Strict - Maximum safety</span>
                   </div>
                 </SelectItem>
               </SelectContent>
             </Select>
             
             {stats && (
               <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                 <p>Jokes filtered: {stats.totalBlocked} / {stats.totalChecked}</p>
               </div>
             )}
           </>
         )}
       </div>
     );
   }
   ```
   
   3. **Create UI Components**
   ```typescript
   // src/components/ui/Switch.tsx
   'use client';
   
   import * as React from 'react';
   import * as SwitchPrimitives from '@radix-ui/react-switch';
   import { cn } from '@/lib/utils';
   
   const Switch = React.forwardRef<
     React.ElementRef<typeof SwitchPrimitives.Root>,
     React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
   >(({ className, ...props }, ref) => (
     <SwitchPrimitives.Root
       className={cn(
         'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
         className
       )}
       {...props}
       ref={ref}
     >
       <SwitchPrimitives.Thumb
         className={cn(
           'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
         )}
       />
     </SwitchPrimitives.Root>
   ));
   Switch.displayName = SwitchPrimitives.Root.displayName;
   
   export { Switch };
   ```

**Success Criteria:**
- Settings persist across sessions
- UI updates reflect store changes
- No race conditions

### Phase 2: API Integration Layer (Days 7-9)

#### Step 2.1: Create API Client
**Tasks:**
1. **Implement Axios Client**
   ```typescript
   // src/services/api/client.ts
   import axios from 'axios';
   import { config } from '@/config/env';
   
   export const apiClient = axios.create({
     baseURL: config.api.baseUrl,
     timeout: config.api.timeout,
     headers: {
       'Accept': 'application/json',
       'User-Agent': 'JokeStream/1.0 (https://github.com/yourusername/jokestream)',
     },
   });
   
   // Add interceptors for error handling
   apiClient.interceptors.response.use(
     (response) => response,
     (error) => {
       // Handle errors globally
       return Promise.reject(error);
     }
   );
   ```

2. **Create Joke Service**
   ```typescript
   // src/services/api/jokeService.ts
   import { apiClient } from './client';
   import { Joke, JokeSearchResponse } from '@/types/joke';
   import { contentFilter } from '@/services/contentFilter';
   
   export interface JokeServiceOptions {
     filterEnabled?: boolean;
     maxRetries?: number;
   }
   
   class JokeService {
     async getRandomJoke(options: JokeServiceOptions = {}): Promise<Joke> {
       const { filterEnabled = true, maxRetries = 10 } = options;
       let attempts = 0;
       
       while (attempts < maxRetries) {
         const { data } = await apiClient.get<Joke>('/');
         
         if (!filterEnabled || contentFilter.isClean(data.joke)) {
           return data;
         }
         
         attempts++;
       }
       
       // If we can't find a clean joke, return a fallback
       return {
         id: 'fallback-1',
         joke: "I'm reading a book about anti-gravity. It's impossible to put down!",
         status: 200,
       };
     }
     
     async getJokeById(id: string): Promise<Joke> {
       const { data } = await apiClient.get<Joke>(`/j/${id}`);
       return data;
     }
     
     async searchJokes(params: {
       term: string;
       page?: number;
       limit?: number;
     }, options: JokeServiceOptions = {}): Promise<JokeSearchResponse> {
       const { filterEnabled = true } = options;
       const { data } = await apiClient.get<JokeSearchResponse>('/search', {
         params,
       });
       
       if (filterEnabled) {
         // Filter out inappropriate jokes
         const filteredResults = data.results.filter(joke => 
           contentFilter.isClean(joke.joke)
         );
         
         return {
           ...data,
           results: filteredResults,
           total_jokes: filteredResults.length,
         };
       }
       
       return data;
     }
     
     // Batch fetch for prefetching
     async getRandomJokes(count: number, options: JokeServiceOptions = {}): Promise<Joke[]> {
       const jokes: Joke[] = [];
       const promises = Array.from({ length: count }, () => 
         this.getRandomJoke(options)
       );
       
       const results = await Promise.allSettled(promises);
       
       results.forEach(result => {
         if (result.status === 'fulfilled') {
           jokes.push(result.value);
         }
       });
       
       return jokes;
     }
   }
   
   export const jokeService = new JokeService();
   ```
   
   3. **Create Error Handling**
   ```typescript
   // src/services/api/errors.ts
   export class APIError extends Error {
     constructor(
       public statusCode: number,
       message: string,
       public endpoint?: string
     ) {
       super(message);
       this.name = 'APIError';
     }
   }
   
   export class NetworkError extends Error {
     constructor(message: string = 'Network connection failed') {
       super(message);
       this.name = 'NetworkError';
     }
   }
   
   export class RateLimitError extends APIError {
     constructor(public retryAfter?: number) {
       super(429, 'Rate limit exceeded');
       this.name = 'RateLimitError';
     }
   }
   ```

**Success Criteria:**
- API calls return expected data
- Error handling works correctly
- Tests use mocked responses

#### Step 2.2: Implement SWR Hooks
**Tasks:**
1. **Create Custom Hooks**
   ```typescript
   // src/hooks/useJokes.ts
   import useSWR from 'swr';
   import { jokeService } from '@/services/api/jokeService';
   import { useFilterStore } from '@/stores/filterStore';
   import { ContentFilterService } from '@/services/contentFilter';
   
   const filter = new ContentFilterService();
   
   export function useRandomJoke() {
     const { isEnabled: filterEnabled } = useFilterStore();
     
     return useSWR(
       'random-joke',
       async () => {
         let joke = await jokeService.getRandomJoke();
         
         // Keep fetching until we get a clean joke if filter is enabled
         while (filterEnabled && !filter.isClean(joke.joke)) {
           joke = await jokeService.getRandomJoke();
         }
         
         return joke;
       },
       {
         revalidateOnFocus: false,
         revalidateOnReconnect: false,
       }
     );
   }
   ```

2. **Create Infinite Scroll Hook**
   ```typescript
   // src/hooks/useInfiniteJokes.ts
   import useSWRInfinite from 'swr/infinite';
   import { jokeService } from '@/services/api/jokeService';
   import { useFilterStore } from '@/stores/filterStore';
   import { JokeSearchResponse } from '@/types/joke';
   
   export function useInfiniteJokes(searchTerm?: string) {
     const { isEnabled: filterEnabled } = useFilterStore();
     
     const getKey = (pageIndex: number, previousPageData: JokeSearchResponse | null) => {
       if (previousPageData && !previousPageData.next_page) return null;
       
       return [`jokes-${searchTerm}-${pageIndex}`, {
         term: searchTerm || '',
         page: pageIndex + 1,
         limit: 20,
       }, { filterEnabled }];
     };
     
     const fetcher = async (key: string, params: any, options: any) => {
       return jokeService.searchJokes(params, options);
     };
     
     const result = useSWRInfinite(getKey, fetcher, {
       revalidateFirstPage: false,
       revalidateAll: false,
       persistSize: true,
     });
     
     return {
       ...result,
       jokes: result.data?.flatMap(page => page.results) ?? [],
       hasMore: result.data ? 
         result.data[result.data.length - 1]?.next_page !== null : true,
       totalJokes: result.data?.[0]?.total_jokes ?? 0,
     };
   }
   ```
   
   3. **Create Intersection Observer Hook**
   ```typescript
   // src/hooks/useIntersectionObserver.ts
   import { useEffect, useRef, useState } from 'react';
   
   interface UseIntersectionObserverOptions {
     threshold?: number;
     root?: Element | null;
     rootMargin?: string;
     enabled?: boolean;
   }
   
   export function useIntersectionObserver(
     options: UseIntersectionObserverOptions = {}
   ) {
     const { threshold = 0.1, root = null, rootMargin = '0px', enabled = true } = options;
     const [isIntersecting, setIsIntersecting] = useState(false);
     const targetRef = useRef<HTMLDivElement>(null);
     
     useEffect(() => {
       if (!enabled || !targetRef.current) return;
       
       const observer = new IntersectionObserver(
         ([entry]) => {
           setIsIntersecting(entry.isIntersecting);
         },
         { threshold, root, rootMargin }
       );
       
       observer.observe(targetRef.current);
       
       return () => {
         observer.disconnect();
       };
     }, [enabled, threshold, root, rootMargin]);
     
     return { ref: targetRef, inView: isIntersecting };
   }
   ```

**Success Criteria:**
- Hooks handle loading/error states
- Caching works as expected
- Filter integration functions properly

### Phase 3: Core UI Components (Days 10-13)

#### Step 3.1: Create Joke Card Component
**Tasks:**
1. **Basic Joke Card**
   ```typescript
   // src/components/jokes/JokeCard.tsx
   'use client';
   
   import { useState } from 'react';
   import { Joke } from '@/types/joke';
   import { motion, AnimatePresence } from 'framer-motion';
   import { Heart, Share2, Copy, RotateCcw } from 'lucide-react';
   import { cn } from '@/lib/utils';
   import { ShareMenu } from '@/components/features/ShareMenu';
   import { useFavoritesStore } from '@/stores/favoritesStore';
   
   interface JokeCardProps {
     joke: Joke;
     index?: number;
     showAnimation?: boolean;
   }
   
   export function JokeCard({ joke, index = 0, showAnimation = true }: JokeCardProps) {
     const [isFlipped, setIsFlipped] = useState(false);
     const [copied, setCopied] = useState(false);
     const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
     const isFavorite = favorites.some(fav => fav.id === joke.id);
     
     const handleCopy = async () => {
       await navigator.clipboard.writeText(joke.joke);
       setCopied(true);
       setTimeout(() => setCopied(false), 2000);
     };
     
     const handleFavorite = () => {
       if (isFavorite) {
         removeFavorite(joke.id);
       } else {
         addFavorite(joke);
       }
     };
     
     const cardVariants = {
       hidden: { opacity: 0, y: 50 },
       visible: { 
         opacity: 1, 
         y: 0,
         transition: {
           type: 'spring',
           damping: 25,
           stiffness: 300,
           delay: index * 0.1,
         }
       },
       exit: { 
         opacity: 0, 
         x: -100,
         transition: { duration: 0.2 }
       }
     };
     
     return (
       <motion.article
         data-testid="joke-card"
         variants={cardVariants}
         initial={showAnimation ? 'hidden' : false}
         animate="visible"
         exit="exit"
         layout
         className="relative"
       >
         <motion.div
           className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
         >
           <div className="p-6">
             {/* Joke Content */}
             <AnimatePresence mode="wait">
               <motion.div
                 key={isFlipped ? 'back' : 'front'}
                 initial={{ rotateY: 90 }}
                 animate={{ rotateY: 0 }}
                 exit={{ rotateY: -90 }}
                 transition={{ duration: 0.3 }}
               >
                 <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                   {joke.joke}
                 </p>
               </motion.div>
             </AnimatePresence>
             
             {/* Action Buttons */}
             <div className="mt-6 flex items-center justify-between">
               <div className="flex gap-2">
                 <motion.button
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={handleFavorite}
                   className={cn(
                     'p-2 rounded-full transition-colors',
                     isFavorite
                       ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                   )}
                   aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                 >
                   <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
                 </motion.button>
                 
                 <ShareMenu joke={joke} />
                 
                 <motion.button
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={handleCopy}
                   className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 transition-colors"
                   aria-label="Copy joke"
                 >
                   {copied ? (
                     <motion.span
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       className="text-green-600 dark:text-green-400"
                     >
                       ✓
                     </motion.span>
                   ) : (
                     <Copy className="w-5 h-5" />
                   )}
                 </motion.button>
               </div>
               
               <motion.button
                 whileHover={{ rotate: 180 }}
                 onClick={() => setIsFlipped(!isFlipped)}
                 className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 transition-colors"
                 aria-label="Flip card"
               >
                 <RotateCcw className="w-5 h-5" />
               </motion.button>
             </div>
           </div>
           
           {/* Joke ID Badge */}
           <div className="px-6 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
             <p className="text-xs text-gray-500 dark:text-gray-400">#{joke.id}</p>
           </div>
         </motion.div>
       </motion.article>
     );
   }
   ```

2. **Write Component Tests**
   ```typescript
   // src/components/jokes/JokeCard.test.tsx
   describe('JokeCard', () => {
     const mockJoke: Joke = {
       id: '1',
       joke: 'Test joke',
       status: 200,
     };
     
     it('renders joke text', () => {
       render(<JokeCard joke={mockJoke} />);
       expect(screen.getByText('Test joke')).toBeInTheDocument();
     });
     
     it('calls onShare when share button clicked', () => {
       const onShare = jest.fn();
       render(<JokeCard joke={mockJoke} onShare={onShare} />);
       fireEvent.click(screen.getByText('Share'));
       expect(onShare).toHaveBeenCalled();
     });
   });
   ```

**Success Criteria:**
- Component renders correctly
- Animations work smoothly
- All interactions tested

#### Step 3.2: Implement Infinite Scroll Component
**Tasks:**
1. **Create Scroll Container**
   ```typescript
   // src/components/jokes/InfiniteJokeList.tsx
   import { useInfiniteJokes } from '@/hooks/useInfiniteJokes';
   import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
   import { JokeCard } from './JokeCard';
   
   export function InfiniteJokeList() {
     const { data, error, size, setSize, isValidating } = useInfiniteJokes();
     const { ref, inView } = useIntersectionObserver();
     
     useEffect(() => {
       if (inView && !isValidating) {
         setSize(size + 1);
       }
     }, [inView, isValidating, size, setSize]);
     
     const jokes = data?.flatMap(page => page.results) ?? [];
     
     return (
       <div className="space-y-4">
         {jokes.map((joke) => (
           <JokeCard key={joke.id} joke={joke} />
         ))}
         <div ref={ref} className="h-10" />
         {isValidating && <LoadingSpinner />}
       </div>
     );
   }
   ```

2. **Add Virtual Scrolling**
   ```typescript
   // src/components/jokes/VirtualJokeList.tsx
   'use client';
   
   import { CSSProperties, memo } from 'react';
   import { VariableSizeList as List } from 'react-window';
   import AutoSizer from 'react-virtualized-auto-sizer';
   import { Joke } from '@/types/joke';
   import { JokeCard } from './JokeCard';
   
   interface VirtualJokeListProps {
     jokes: Joke[];
   }
   
   const JokeRow = memo(({ 
     index, 
     style, 
     data 
   }: { 
     index: number; 
     style: CSSProperties; 
     data: Joke[] 
   }) => {
     const joke = data[index];
     
     return (
       <div style={style} className="px-4 py-2">
         <JokeCard joke={joke} index={index} showAnimation={false} />
       </div>
     );
   });
   
   JokeRow.displayName = 'JokeRow';
   
   export function VirtualJokeList({ jokes }: VirtualJokeListProps) {
     // Estimate item size based on average joke length
     const getItemSize = (index: number) => {
       const jokeLength = jokes[index]?.joke.length || 100;
       const baseHeight = 150;
       const extraHeight = Math.floor(jokeLength / 50) * 20;
       return baseHeight + extraHeight;
     };
     
     return (
       <div className="h-[calc(100vh-200px)] w-full">
         <AutoSizer>
           {({ height, width }) => (
             <List
               height={height}
               itemCount={jokes.length}
               itemSize={getItemSize}
               width={width}
               itemData={jokes}
               overscanCount={3}
             >
               {JokeRow}
             </List>
           )}
         </AutoSizer>
       </div>
     );
   }
   ```
   
   3. **Create Loading States**
   ```typescript
   // src/components/jokes/JokeCardSkeleton.tsx
   export function JokeCardSkeleton() {
     return (
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
         <div className="space-y-3">
           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
         </div>
         <div className="mt-6 flex gap-2">
           <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
           <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
           <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
         </div>
       </div>
     );
   }
   
   // src/components/common/LoadingSpinner.tsx
   export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
     const sizeClasses = {
       sm: 'w-4 h-4',
       md: 'w-8 h-8',
       lg: 'w-12 h-12',
     };
     
     return (
       <div className="flex justify-center items-center p-4">
         <div className={cn(
           'animate-spin rounded-full border-b-2 border-primary',
           sizeClasses[size]
         )} />
       </div>
     );
   }
   ```

**Success Criteria:**
- Smooth scrolling performance
- New jokes load automatically
- No memory leaks

### Phase 4: Search and Filtering UI (Days 14-16)

#### Step 4.1: Implement Search Component
**Tasks:**
1. **Create Search Input**
   ```typescript
   // src/components/features/SearchBar.tsx
   'use client';
   
   import { useState, useCallback, useRef, useEffect } from 'react';
   import { Search, X, History } from 'lucide-react';
   import { motion, AnimatePresence } from 'framer-motion';
   import { cn } from '@/lib/utils';
   import { useSearchHistory } from '@/hooks/useSearchHistory';
   
   interface SearchBarProps {
     onSearch: (term: string) => void;
     placeholder?: string;
     className?: string;
   }
   
   export function SearchBar({ 
     onSearch, 
     placeholder = 'Search jokes...', 
     className 
   }: SearchBarProps) {
     const [value, setValue] = useState('');
     const [isFocused, setIsFocused] = useState(false);
     const { history, addToHistory, clearHistory } = useSearchHistory();
     const inputRef = useRef<HTMLInputElement>(null);
     const timeoutRef = useRef<NodeJS.Timeout>();
     
     const debouncedSearch = useCallback((term: string) => {
       clearTimeout(timeoutRef.current);
       timeoutRef.current = setTimeout(() => {
         onSearch(term);
         if (term.trim()) {
           addToHistory(term);
         }
       }, 300);
     }, [onSearch, addToHistory]);
     
     useEffect(() => {
       return () => {
         clearTimeout(timeoutRef.current);
       };
     }, []);
     
     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const newValue = e.target.value;
       setValue(newValue);
       debouncedSearch(newValue);
     };
     
     const handleClear = () => {
       setValue('');
       onSearch('');
       inputRef.current?.focus();
     };
     
     const handleHistoryClick = (term: string) => {
       setValue(term);
       onSearch(term);
       setIsFocused(false);
     };
     
     const handleKeyDown = (e: React.KeyboardEvent) => {
       if (e.key === 'Escape') {
         handleClear();
       }
     };
     
     return (
       <div className={cn('relative', className)}>
         <div className="relative">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
           <input
             ref={inputRef}
             type="search"
             value={value}
             onChange={handleChange}
             onFocus={() => setIsFocused(true)}
             onBlur={() => setTimeout(() => setIsFocused(false), 200)}
             onKeyDown={handleKeyDown}
             placeholder={placeholder}
             className={cn(
               'w-full pl-10 pr-10 py-3 rounded-lg',
               'bg-white dark:bg-gray-800',
               'border border-gray-300 dark:border-gray-600',
               'focus:outline-none focus:ring-2 focus:ring-primary',
               'transition-all duration-200'
             )}
             aria-label="Search jokes"
           />
           <AnimatePresence>
             {value && (
               <motion.button
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.8 }}
                 onClick={handleClear}
                 className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                 aria-label="Clear search"
               >
                 <X className="w-4 h-4 text-gray-400" />
               </motion.button>
             )}
           </AnimatePresence>
         </div>
         
         {/* Search History Dropdown */}
         <AnimatePresence>
           {isFocused && !value && history.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
             >
               <div className="p-2">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                     <History className="w-4 h-4" />
                     Recent searches
                   </span>
                   <button
                     onClick={clearHistory}
                     className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                   >
                     Clear
                   </button>
                 </div>
                 {history.map((term, index) => (
                   <button
                     key={index}
                     onClick={() => handleHistoryClick(term)}
                     className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                   >
                     {term}
                   </button>
                 ))}
               </div>
             </motion.div>
           )}
         </AnimatePresence>
       </div>
     );
   }
   ```

2. **Add Search History**
   ```typescript
   // src/hooks/useSearchHistory.ts
   export function useSearchHistory() {
     const [history, setHistory] = useState<string[]>(() => {
       const saved = localStorage.getItem('search-history');
       return saved ? JSON.parse(saved) : [];
     });
     
     const addToHistory = (term: string) => {
       const updated = [term, ...history.filter(h => h !== term)].slice(0, 10);
       setHistory(updated);
       localStorage.setItem('search-history', JSON.stringify(updated));
     };
     
     return { history, addToHistory };
   }
   ```

**Success Criteria:**
- Search debouncing works correctly
- History persists across sessions
- Autocomplete functions properly

### Phase 5: User Preferences and Storage (Days 17-19)

#### Step 5.1: Implement Theme System
**Tasks:**
1. **Create Theme Provider**
   ```typescript
   // src/providers/ThemeProvider.tsx
   import { createContext, useContext, useEffect, useState } from 'react';
   
   type Theme = 'light' | 'dark' | 'system';
   
   const ThemeContext = createContext<{
     theme: Theme;
     setTheme: (theme: Theme) => void;
   }>({
     theme: 'system',
     setTheme: () => {},
   });
   
   export function ThemeProvider({ children }: { children: React.ReactNode }) {
     const [theme, setTheme] = useState<Theme>('system');
     
     useEffect(() => {
       const root = window.document.documentElement;
       root.classList.remove('light', 'dark');
       
       if (theme === 'system') {
         const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
           ? 'dark'
           : 'light';
         root.classList.add(systemTheme);
       } else {
         root.classList.add(theme);
       }
     }, [theme]);
     
     return (
       <ThemeContext.Provider value={{ theme, setTheme }}>
         {children}
       </ThemeContext.Provider>
     );
   }
   ```

2. **Create Preferences Store**
   ```typescript
   // src/stores/preferencesStore.ts
   export const usePreferencesStore = create<PreferencesState>()(
     persist(
       (set) => ({
         fontSize: 'medium',
         autoScrollSpeed: 0,
         jokeRevealDelay: 0,
         cardLayout: 'list',
         setFontSize: (fontSize) => set({ fontSize }),
         setAutoScrollSpeed: (speed) => set({ autoScrollSpeed: speed }),
         setJokeRevealDelay: (delay) => set({ jokeRevealDelay: delay }),
         setCardLayout: (layout) => set({ cardLayout: layout }),
       }),
       {
         name: 'user-preferences',
       }
     )
   );
   ```

**Success Criteria:**
- Theme switches work instantly
- Preferences persist correctly
- No flash of unstyled content

#### Step 5.2: Implement Favorites System
**Tasks:**
1. **Create Favorites Store**
   ```typescript
   // src/stores/favoritesStore.ts
   interface FavoritesState {
     favorites: Joke[];
     collections: Collection[];
     addFavorite: (joke: Joke, collectionId?: string) => void;
     removeFavorite: (jokeId: string) => void;
     createCollection: (name: string) => void;
   }
   
   export const useFavoritesStore = create<FavoritesState>()(
     persist(
       (set) => ({
         favorites: [],
         collections: [{ id: 'default', name: 'All Favorites' }],
         addFavorite: (joke, collectionId = 'default') =>
           set((state) => ({
             favorites: [...state.favorites, joke],
           })),
         removeFavorite: (jokeId) =>
           set((state) => ({
             favorites: state.favorites.filter((j) => j.id !== jokeId),
           })),
         createCollection: (name) =>
           set((state) => ({
             collections: [...state.collections, { id: nanoid(), name }],
           })),
       }),
       {
         name: 'favorites',
       }
     )
   );
   ```

2. **Create Favorites UI**
   ```typescript
   // src/components/features/FavoritesList.tsx
   export function FavoritesList() {
     const { favorites, removeFavorite } = useFavoritesStore();
     
     return (
       <div className="space-y-4">
         {favorites.map((joke) => (
           <JokeCard
             key={joke.id}
             joke={joke}
             onRemove={() => removeFavorite(joke.id)}
           />
         ))}
       </div>
     );
   }
   ```

**Success Criteria:**
- Favorites persist across sessions
- Collections work correctly
- UI updates are instant

### Phase 6: Social Features (Days 20-22)

#### Step 6.1: Implement Share Functionality
**Tasks:**
1. **Create Share Service**
   ```typescript
   // src/services/shareService.ts
   import { Joke } from '@/types/joke';
   import { trackEvent } from '@/lib/analytics';
   
   export interface ShareOptions {
     platform: 'twitter' | 'facebook' | 'whatsapp' | 'clipboard' | 'native';
     joke: Joke;
   }
   
   export class ShareService {
     private trackShare(platform: string, jokeId: string) {
       trackEvent('joke_shared', {
         platform,
         jokeId,
         timestamp: Date.now(),
       });
     }
     
     async shareToTwitter(joke: Joke): Promise<void> {
       const text = `${joke.joke}\n\n😂 Get more dad jokes at JokeStream!`;
       const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(`${window.location.origin}/joke/${joke.id}`)}`;
       
       window.open(url, '_blank', 'width=550,height=420');
       this.trackShare('twitter', joke.id);
     }
     
     async shareToFacebook(joke: Joke): Promise<void> {
       const url = `${window.location.origin}/joke/${joke.id}`;
       const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(joke.joke)}`;
       
       window.open(fbUrl, '_blank', 'width=550,height=420');
       this.trackShare('facebook', joke.id);
     }
     
     async shareToWhatsApp(joke: Joke): Promise<void> {
       const text = `${joke.joke}\n\nCheck out more jokes at: ${window.location.origin}`;
       const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
       
       window.open(waUrl, '_blank');
       this.trackShare('whatsapp', joke.id);
     }
     
     async copyToClipboard(joke: Joke): Promise<boolean> {
       try {
         const text = `${joke.joke}\n\n- Shared from JokeStream`;
         await navigator.clipboard.writeText(text);
         this.trackShare('clipboard', joke.id);
         return true;
       } catch (error) {
         console.error('Failed to copy:', error);
         return false;
       }
     }
     
     async shareNative(joke: Joke): Promise<boolean> {
       if (!navigator.share) {
         return false;
       }
       
       try {
         await navigator.share({
           title: 'Check out this dad joke!',
           text: joke.joke,
           url: `${window.location.origin}/joke/${joke.id}`,
         });
         this.trackShare('native', joke.id);
         return true;
       } catch (error) {
         if (error instanceof Error && error.name !== 'AbortError') {
           console.error('Share failed:', error);
         }
         return false;
       }
     }
     
     canShareNative(): boolean {
       return typeof navigator !== 'undefined' && !!navigator.share;
     }
   }
   
   export const shareService = new ShareService();
   ```

2. **Create Share Component**
   ```typescript
   // src/components/features/ShareMenu.tsx
   'use client';
   
   import { useState } from 'react';
   import { Joke } from '@/types/joke';
   import { shareService } from '@/services/shareService';
   import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
   } from '@/components/ui/DropdownMenu';
   import { 
     Share2, 
     Twitter, 
     Facebook, 
     MessageCircle, 
     Copy, 
     Smartphone 
   } from 'lucide-react';
   import { motion } from 'framer-motion';
   import { cn } from '@/lib/utils';
   
   interface ShareMenuProps {
     joke: Joke;
     className?: string;
   }
   
   export function ShareMenu({ joke, className }: ShareMenuProps) {
     const [copied, setCopied] = useState(false);
     const canShareNative = shareService.canShareNative();
     
     const handleCopy = async () => {
       const success = await shareService.copyToClipboard(joke);
       if (success) {
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
       }
     };
     
     const handleNativeShare = async () => {
       await shareService.shareNative(joke);
     };
     
     return (
       <DropdownMenu>
         <DropdownMenuTrigger asChild>
           <motion.button
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             className={cn(
               'p-2 rounded-full bg-gray-100 text-gray-600',
               'hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400',
               'transition-colors',
               className
             )}
             aria-label="Share joke"
           >
             <Share2 className="w-5 h-5" />
           </motion.button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="w-56">
           {canShareNative && (
             <>
               <DropdownMenuItem onClick={handleNativeShare}>
                 <Smartphone className="w-4 h-4 mr-2" />
                 Share via...
               </DropdownMenuItem>
               <DropdownMenuSeparator />
             </>
           )}
           
           <DropdownMenuItem onClick={() => shareService.shareToTwitter(joke)}>
             <Twitter className="w-4 h-4 mr-2" />
             Share on Twitter
           </DropdownMenuItem>
           
           <DropdownMenuItem onClick={() => shareService.shareToFacebook(joke)}>
             <Facebook className="w-4 h-4 mr-2" />
             Share on Facebook
           </DropdownMenuItem>
           
           <DropdownMenuItem onClick={() => shareService.shareToWhatsApp(joke)}>
             <MessageCircle className="w-4 h-4 mr-2" />
             Share on WhatsApp
           </DropdownMenuItem>
           
           <DropdownMenuSeparator />
           
           <DropdownMenuItem onClick={handleCopy}>
             <Copy className="w-4 h-4 mr-2" />
             <span className="flex-1">
               {copied ? 'Copied!' : 'Copy joke'}
             </span>
             {copied && (
               <motion.span
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="text-green-600 dark:text-green-400"
               >
                 ✓
               </motion.span>
             )}
           </DropdownMenuItem>
         </DropdownMenuContent>
       </DropdownMenu>
     );
   }
   ```

**Success Criteria:**
- All share methods work
- Native share API used when available
- Copy feedback is clear

### Phase 7: Advanced Features (Days 23-26)

#### Step 7.1: Implement Gamification
**Tasks:**
1. **Create Achievements System**
   ```typescript
   // src/services/achievementsService.ts
   export interface Achievement {
     id: string;
     name: string;
     description: string;
     icon: string;
     unlockedAt?: Date;
   }
   
   export const achievements: Achievement[] = [
     {
       id: 'first-laugh',
       name: 'First Laugh',
       description: 'React to your first joke',
       icon: '😄',
     },
     {
       id: 'joke-collector',
       name: 'Joke Collector',
       description: 'Save 50 favorites',
       icon: '📚',
     },
     // More achievements...
   ];
   
   export class AchievementsService {
     checkAchievements(stats: UserStats): Achievement[] {
       const newAchievements: Achievement[] = [];
       
       if (stats.reactionsCount === 1) {
         newAchievements.push(achievements[0]);
       }
       
       if (stats.favoritesCount >= 50) {
         newAchievements.push(achievements[1]);
       }
       
       return newAchievements;
     }
   }
   ```

2. **Create Statistics Dashboard**
   ```typescript
   // src/components/features/StatsDashboard.tsx
   export function StatsDashboard() {
     const stats = useUserStats();
     
     return (
       <div className="grid grid-cols-2 gap-4">
         <StatCard title="Jokes Read" value={stats.jokesRead} />
         <StatCard title="Favorites" value={stats.favoritesCount} />
         <StatCard title="Streak" value={stats.currentStreak} />
         <StatCard title="Shared" value={stats.sharedCount} />
       </div>
     );
   }
   ```

**Success Criteria:**
- Achievements unlock correctly
- Statistics track accurately
- UI provides clear feedback

#### Step 7.2: Implement PWA Features
**Tasks:**
1. **Create Service Worker**
   ```javascript
   // public/sw.js
   const CACHE_NAME = 'jokestream-v1';
   const urlsToCache = [
     '/',
     '/offline',
     '/manifest.json',
     '/icon-192.png',
     '/icon-512.png',
   ];
   
   // Cache jokes for offline access
   const JOKE_CACHE = 'jokes-v1';
   const MAX_CACHED_JOKES = 50;
   
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME)
         .then((cache) => cache.addAll(urlsToCache))
     );
   });
   
   self.addEventListener('activate', (event) => {
     event.waitUntil(
       caches.keys().then((cacheNames) => {
         return Promise.all(
           cacheNames.map((cacheName) => {
             if (cacheName !== CACHE_NAME && cacheName !== JOKE_CACHE) {
               return caches.delete(cacheName);
             }
           })
         );
       })
     );
   });
   
   self.addEventListener('fetch', (event) => {
     const { request } = event;
     
     // Handle API requests
     if (request.url.includes('icanhazdadjoke.com')) {
       event.respondWith(
         fetch(request)
           .then((response) => {
             // Cache successful joke responses
             if (response.ok && request.url.includes('/j/')) {
               const responseClone = response.clone();
               caches.open(JOKE_CACHE).then((cache) => {
                 cache.put(request, responseClone);
               });
             }
             return response;
           })
           .catch(() => {
             // Return cached joke if offline
             return caches.match(request);
           })
       );
       return;
     }
     
     // Handle app requests
     event.respondWith(
       caches.match(request)
         .then((response) => response || fetch(request))
         .catch(() => {
           if (request.destination === 'document') {
             return caches.match('/offline');
           }
         })
     );
   });
   
   // Background sync for favorites
   self.addEventListener('sync', (event) => {
     if (event.tag === 'sync-favorites') {
       event.waitUntil(syncFavorites());
     }
   });
   
   async function syncFavorites() {
     // Sync logic here
   }
   ```

2. **Add Manifest**
   ```json
   // public/manifest.json
   {
     "name": "JokeStream",
     "short_name": "JokeStream",
     "description": "Endless dad jokes for everyone",
     "start_url": "/",
     "display": "standalone",
     "theme_color": "#000000",
     "background_color": "#ffffff",
     "icons": [
       {
         "src": "/icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/icon-512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

**Success Criteria:**
- App installable on mobile
- Offline mode works
- Push notifications ready

### Phase 8: Performance Optimization (Days 27-28)

#### Step 8.1: Optimize Bundle Size
**Tasks:**
1. **Analyze Bundle**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```

2. **Implement Code Splitting**
   ```typescript
   // Dynamic imports for heavy components
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <Skeleton />,
   });
   ```

3. **Optimize Images**
   ```typescript
   // Use Next.js Image component
   import Image from 'next/image';
   ```

**Success Criteria:**
- Bundle size < 200KB (gzipped)
- Lighthouse score > 90
- First paint < 1.5s

#### Step 8.2: Implement Caching Strategy
**Tasks:**
1. **Configure SWR Cache**
   ```typescript
   // src/lib/swrConfig.ts
   export const swrConfig = {
     revalidateOnFocus: false,
     revalidateOnReconnect: false,
     dedupingInterval: 10000,
     focusThrottleInterval: 5000,
     errorRetryCount: 3,
     errorRetryInterval: 5000,
   };
   ```

2. **Add Response Caching**
   ```typescript
   // API route caching
   export const config = {
     runtime: 'edge',
   };
   
   export default async function handler(req: Request) {
     return new Response(JSON.stringify(data), {
       headers: {
         'Content-Type': 'application/json',
         'Cache-Control': 's-maxage=300, stale-while-revalidate',
       },
     });
   }
   ```

**Success Criteria:**
- API calls minimized
- Cache hit rate > 80%
- Smooth offline experience

### Phase 9: Testing & Quality Assurance (Days 29-31)

#### Step 9.1: Complete Unit Test Coverage
**Tasks:**
1. **Test All Services**
   ```typescript
   // Ensure 80% coverage for:
   - Content filter service
   - API services
   - Share service
   - Achievement service
   ```

2. **Test All Components**
   ```typescript
   // Component tests with:
   - Render tests
   - Interaction tests
   - Accessibility tests
   - Snapshot tests
   ```

3. **Test All Hooks**
   ```typescript
   // Hook tests using:
   - renderHook from testing-library
   - Mock SWR responses
   - State change validations
   ```

**Success Criteria:**
- Overall coverage > 80%
- All critical paths tested
- No console errors/warnings

#### Step 9.2: Integration Testing
**Tasks:**
1. **Set Up Playwright**
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. **Write E2E Tests**
   ```typescript
   // tests/e2e/jokes.spec.ts
   import { test, expect } from '@playwright/test';
   
   test('loads jokes and allows interaction', async ({ page }) => {
     await page.goto('/');
     await expect(page.locator('text=JokeStream')).toBeVisible();
     
     // Test infinite scroll
     const jokeCount = await page.locator('[data-testid="joke-card"]').count();
     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
     await page.waitForTimeout(1000);
     const newJokeCount = await page.locator('[data-testid="joke-card"]').count();
     expect(newJokeCount).toBeGreaterThan(jokeCount);
   });
   ```

**Success Criteria:**
- All user flows tested
- Tests run in CI
- < 5 min test execution

#### Step 9.3: Accessibility Testing
**Tasks:**
1. **Install A11y Tools**
   ```bash
   npm install --save-dev jest-axe
   ```

2. **Add A11y Tests**
   ```typescript
   // Component accessibility tests
   import { axe } from 'jest-axe';
   
   test('has no accessibility violations', async () => {
     const { container } = render(<JokeCard joke={mockJoke} />);
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
   ```

3. **Manual Testing Checklist**
   - Keyboard navigation
   - Screen reader testing
   - Color contrast
   - Focus indicators

**Success Criteria:**
- WCAG 2.1 AA compliance
- All components keyboard accessible
- Screen reader friendly

### Phase 10: Documentation & Deployment (Days 32-33)

#### Step 10.1: Create README.md
**Tasks:**
1. **Create Comprehensive README**
   ```markdown
   # JokeStream 🎭

   An endless stream of family-friendly dad jokes with advanced content filtering, built with Next.js, TypeScript, and React.

   ![JokeStream Demo](public/demo.gif)

   ## Features

   - 🔍 **Smart Content Filtering** - AI-powered profanity and sensitive content detection
   - ♾️ **Infinite Scrolling** - Smooth, performant endless joke feed
   - 🎨 **Dark Mode** - Automatic theme detection with manual override
   - 💾 **Offline Support** - PWA with cached jokes for offline reading
   - ❤️ **Favorites System** - Save and organize your favorite jokes
   - 🔎 **Advanced Search** - Real-time search with history
   - 🏆 **Gamification** - Achievements and reading statistics
   - 📱 **Responsive Design** - Mobile-first, works on all devices
   - ♿ **Accessible** - WCAG 2.1 AA compliant

   ## Tech Stack

   - **Framework**: Next.js 14 with App Router
   - **Language**: TypeScript
   - **Styling**: Tailwind CSS
   - **State Management**: Zustand
   - **Data Fetching**: SWR
   - **Animations**: Framer Motion
   - **Content Filter**: Obscenity
   - **Testing**: Jest, React Testing Library, Playwright
   - **API**: icanhazdadjoke API

   ## Getting Started

   ### Prerequisites

   - Node.js 18+ and npm/yarn/pnpm
   - Git

   ### Installation

   1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/jokestream.git
   cd jokestream
   ```

   2. Install dependencies:
   ```bash
   npm install
   ```

   3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

   4. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

   ## Scripts

   - `npm run dev` - Start development server
   - `npm run build` - Build for production
   - `npm start` - Start production server
   - `npm test` - Run unit tests
   - `npm run test:coverage` - Run tests with coverage
   - `npm run test:e2e` - Run E2E tests
   - `npm run lint` - Lint code
   - `npm run format` - Format code with Prettier

   ## Architecture

   ```
   src/
   ├── app/              # Next.js app router pages
   ├── components/       # React components
   │   ├── common/      # Shared components
   │   ├── jokes/       # Joke-specific components
   │   ├── layout/      # Layout components
   │   └── features/    # Feature components
   ├── hooks/           # Custom React hooks
   ├── lib/             # Utilities and helpers
   ├── services/        # API and external services
   ├── stores/          # Zustand state stores
   ├── types/           # TypeScript type definitions
   └── config/          # Configuration files
   ```

   ## Content Filtering

   JokeStream uses a multi-layer content filtering system:

   1. **Obscenity NPM Package** - Detects profanity with advanced obfuscation handling
   2. **Custom Patterns** - Filters sensitive topics (violence, discrimination, etc.)
   3. **User Preferences** - Three filter strength levels (Minimal, Moderate, Strict)

   ## API Integration

   The app integrates with the [icanhazdadjoke API](https://icanhazdadjoke.com/api):

   - No authentication required
   - Automatic retry on filter rejection
   - Intelligent caching with SWR
   - Fallback jokes for rate limiting

   ## Testing

   - **Unit Tests**: 80%+ coverage requirement
   - **Integration Tests**: API and component integration
   - **E2E Tests**: Critical user flows with Playwright
   - **Accessibility Tests**: Automated with jest-axe

   Run all tests:
   ```bash
   npm test
   npm run test:e2e
   ```

   ## Performance

   - Lighthouse Score: 95+
   - First Contentful Paint: < 1.5s
   - Time to Interactive: < 3s
   - Bundle Size: < 200KB gzipped

   ## Contributing

   1. Fork the repository
   2. Create your feature branch (`git checkout -b feature/amazing-feature`)
   3. Commit your changes (`git commit -m 'Add amazing feature'`)
   4. Push to the branch (`git push origin feature/amazing-feature`)
   5. Open a Pull Request

   Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

   ## License

   This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

   ## Acknowledgments

   - [icanhazdadjoke](https://icanhazdadjoke.com) for the amazing API
   - [Obscenity](https://github.com/jo3-l/obscenity) for content filtering
   - All contributors and testers

   ## Support

   - 📧 Email: support@jokestream.app
   - 🐛 Issues: [GitHub Issues](https://github.com/yourusername/jokestream/issues)
   - 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/jokestream/discussions)
   ```

2. **Create Contributing Guide**
   ```markdown
   # Contributing to JokeStream

   ## Code of Conduct
   Be respectful and inclusive. No inappropriate jokes in PRs!

   ## Development Process
   1. Check existing issues/PRs
   2. Fork and create feature branch
   3. Write tests for new features
   4. Ensure all tests pass
   5. Submit PR with clear description

   ## Code Style
   - Use TypeScript strict mode
   - Follow ESLint rules
   - Format with Prettier
   - Write meaningful commit messages

   ## Testing Requirements
   - Unit test coverage > 80%
   - All PRs must pass CI/CD
   - Add E2E tests for new features
   ```

**Success Criteria:**
- README provides clear setup instructions
- All features are documented
- Contributing guidelines are clear

#### Step 10.2: Set Up Deployment
**Tasks:**
1. **Configure Vercel**
   ```json
   // vercel.json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "devCommand": "npm run dev",
     "installCommand": "npm install"
   }
   ```

2. **Set Up GitHub Actions**
   ```yaml
   # .github/workflows/ci.yml
   name: CI
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npm run lint
         - run: npm run test:ci
         - run: npm run build
   ```

**Success Criteria:**
- Automatic deployments work
- CI/CD pipeline passes
- Preview deployments available

**Success Criteria:**
- Error tracking functional
- Analytics collecting data
- Performance metrics tracked

## Validation Checklist

### Functional Requirements
- [ ] Content filter blocks inappropriate jokes
- [ ] Infinite scroll loads jokes smoothly
- [ ] Search works with debouncing
- [ ] Favorites persist across sessions
- [ ] Share functionality works on all platforms
- [ ] Theme switching works without flash
- [ ] PWA installs correctly
- [ ] Offline mode shows cached content

### Technical Requirements
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Test coverage > 80%
- [ ] Lighthouse score > 90
- [ ] Bundle size < 200KB gzipped
- [ ] No console errors in production
- [ ] Accessibility audit passes

### Performance Metrics
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] 60fps scrolling performance
- [ ] API response caching works

## Risk Mitigation

### Potential Issues & Solutions

1. **API Rate Limiting**
   - Solution: Implement aggressive caching
   - Fallback: Local joke database

2. **Content Filter False Positives**
   - Solution: Whitelist mechanism
   - User reporting system

3. **Performance on Low-End Devices**
   - Solution: Progressive enhancement
   - Reduced motion options

4. **Browser Compatibility**
   - Solution: Polyfills for older browsers
   - Graceful degradation

## Maintenance Plan

### Regular Tasks
- Weekly dependency updates
- Monthly accessibility audits
- Quarterly performance reviews
- Continuous monitoring of filter effectiveness

### Documentation Requirements
- API documentation
- Component storybook
- Architecture decision records
- Deployment runbooks

## Conclusion

This implementation plan provides a comprehensive roadmap for building JokeStream with a focus on quality, maintainability, and user experience. Each phase builds upon the previous one, ensuring a solid foundation for future enhancements.

Total estimated time: 33 days
Expected outcome: Production-ready application meeting all success criteria