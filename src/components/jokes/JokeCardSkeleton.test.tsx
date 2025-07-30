/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render } from '@testing-library/react';
import { JokeCardSkeleton } from './JokeCardSkeleton';

describe('JokeCardSkeleton', () => {
  it('renders skeleton loading state', () => {
    const { container } = render(<JokeCardSkeleton />);
    
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('bg-white');
    expect(skeleton).toHaveClass('dark:bg-gray-800');
  });

  it('renders text placeholder lines', () => {
    const { container } = render(<JokeCardSkeleton />);
    
    const textLines = container.querySelectorAll('.h-4.bg-gray-200');
    expect(textLines).toHaveLength(3);
    
    expect(textLines[0]).toHaveClass('w-3/4');
    expect(textLines[1]).toHaveClass('w-full');
    expect(textLines[2]).toHaveClass('w-5/6');
  });

  it('renders button placeholders', () => {
    const { container } = render(<JokeCardSkeleton />);
    
    const buttons = container.querySelectorAll('.w-10.h-10.bg-gray-200');
    expect(buttons).toHaveLength(3);
    
    buttons.forEach(button => {
      expect(button).toHaveClass('rounded-full');
    });
  });

  it('has correct spacing', () => {
    const { container } = render(<JokeCardSkeleton />);
    
    const textContainer = container.querySelector('.space-y-3');
    expect(textContainer).toBeInTheDocument();
    
    const buttonContainer = container.querySelector('.mt-6.flex.gap-2');
    expect(buttonContainer).toBeInTheDocument();
  });
});