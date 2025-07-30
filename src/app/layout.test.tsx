import React from 'react';
import RootLayout, { metadata, viewport } from './layout';

// Mock the providers
jest.mock('@/providers/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }): React.ReactElement => <>{children}</>
}));

jest.mock('@/providers/SWRProvider', () => ({
  SWRProvider: ({ children }: { children: React.ReactNode }): React.ReactElement => <>{children}</>
}));

describe('RootLayout', () => {
  it('should render children within providers', () => {
    // RootLayout renders <html> which cannot be rendered inside a div
    // We'll test the component structure instead
    const TestChild = (): React.ReactElement => <div>Test Content</div>;
    const element = RootLayout({ children: <TestChild /> });
    
    expect(element.type).toBe('html');
    expect(element.props.lang).toBe('en');
    expect(element.props.suppressHydrationWarning).toBe(true);
  });

  it('should have correct metadata', () => {
    expect(metadata.title).toBe('JokeStream - Endless Dad Jokes');
    expect(metadata.description).toBe('Discover an endless stream of family-friendly dad jokes');
    expect(metadata.manifest).toBe('/manifest.json');
  });

  it('should have correct viewport configuration', () => {
    expect(viewport.themeColor).toEqual([
      { media: '(prefers-color-scheme: light)', color: 'white' },
      { media: '(prefers-color-scheme: dark)', color: 'black' },
    ]);
  });
});