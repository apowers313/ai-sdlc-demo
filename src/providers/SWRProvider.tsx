'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { config } from '@/config/env';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps): React.ReactElement {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: config.cache.staleTime,
        focusThrottleInterval: 5000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        onError: (error, key) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(`SWR Error for ${key}:`, error);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}