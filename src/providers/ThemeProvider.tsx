'use client';

import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.ReactElement {
  // Theme provider will be implemented in Phase 5
  // For now, just return children
  return <>{children}</>;
}