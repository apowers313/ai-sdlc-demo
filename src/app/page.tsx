'use client';

import { FilterSettings } from '@/components/features/FilterSettings';
import { InfiniteJokeList } from '@/components/jokes/InfiniteJokeList';

export default function Home(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">JokeStream</h1>
          <FilterSettings />
          <div className="mt-8">
            <InfiniteJokeList />
          </div>
        </div>
      </main>
    </div>
  );
}
