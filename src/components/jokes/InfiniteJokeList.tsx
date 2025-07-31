'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteJokes } from '@/hooks/useInfiniteJokes';
import { JokeCard } from './JokeCard';
import { JokeCardSkeleton } from './JokeCardSkeleton';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

interface InfiniteJokeListProps {
  searchTerm?: string;
}

export function InfiniteJokeList({ searchTerm }: InfiniteJokeListProps): React.ReactElement {
  const { jokes, size, setSize, isLoading, isValidating, error, hasMore } = useInfiniteJokes(searchTerm);
  const loadingRef = useRef(false);

  // Simple scroll-based loading
  useEffect(() => {
    const handleScroll = (): void => {
      if (loadingRef.current || !hasMore || isValidating) return;

      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Load more when user is within 300px of the bottom
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        loadingRef.current = true;
        setSize(size + 1).finally(() => {
          loadingRef.current = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return (): void => window.removeEventListener('scroll', handleScroll);
  }, [size, setSize, hasMore, isValidating]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">
          Oops! Something went wrong loading jokes.
        </p>
        <button
          onClick={() => setSize(1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading && jokes.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <JokeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!isLoading && jokes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          {searchTerm
            ? `No jokes found for "${searchTerm}". Try a different search!`
            : 'No jokes available. Please try again later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {jokes.map((joke, index) => (
          <JokeCard key={joke.id} joke={joke} index={index} />
        ))}
      </AnimatePresence>
      
      <div className="h-10 flex items-center justify-center">
        {isValidating && <LoadingSpinner size="sm" />}
        {!hasMore && jokes.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 dark:text-gray-400 text-sm"
          >
            You&apos;ve reached the end of the jokes!
          </motion.p>
        )}
      </div>
    </div>
  );
}