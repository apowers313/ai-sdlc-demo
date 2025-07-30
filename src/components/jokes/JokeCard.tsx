'use client';

import { useState } from 'react';
import { Joke } from '@/types/joke';
import { motion } from 'framer-motion';
import { Heart, Share2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavoritesStore } from '@/stores/favoritesStore';

interface JokeCardProps {
  joke: Joke;
  index?: number;
  showAnimation?: boolean;
}

export function JokeCard({ joke, index = 0, showAnimation = true }: JokeCardProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const isFav = isFavorite(joke.id);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(joke.joke);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy joke:', error);
    }
  };

  const handleFavorite = (): void => {
    if (isFav) {
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
      },
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.2 },
    },
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
          <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
            {joke.joke}
          </p>

          <div className="mt-6 flex items-center justify-start gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavorite}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  isFav
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                )}
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={cn('w-5 h-5', isFav && 'fill-current')} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 transition-colors"
                aria-label="Share joke"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>

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
        </div>

        <div className="px-6 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">#{joke.id}</p>
        </div>
      </motion.div>
    </motion.article>
  );
}