'use client';

import { CSSProperties, memo } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Joke } from '@/types/joke';
import { JokeCard } from './JokeCard';

interface VirtualJokeListProps {
  jokes: Joke[];
}

interface JokeRowProps {
  index: number;
  style: CSSProperties;
  data: Joke[];
}

const JokeRow = memo(({ index, style, data }: JokeRowProps) => {
  const joke = data[index];

  return (
    <div style={style} className="px-4 py-2">
      <JokeCard joke={joke} index={index} showAnimation={false} />
    </div>
  );
});

JokeRow.displayName = 'JokeRow';

export function VirtualJokeList({ jokes }: VirtualJokeListProps): React.ReactElement {
  const getItemSize = (index: number): number => {
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