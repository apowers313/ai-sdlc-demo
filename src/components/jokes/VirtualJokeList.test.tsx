import { render, screen } from '@testing-library/react';
import { VirtualJokeList } from './VirtualJokeList';
import { Joke } from '@/types/joke';

jest.mock('react-window', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
  VariableSizeList: ({ children, itemData, itemCount, itemSize }: any) => {
    const Row = children;
    // Call itemSize to ensure it's tested
    const sizes = Array.from({ length: itemCount }).map((_, i) => itemSize(i));
    return (
      <div data-testid="virtual-list" data-sizes={sizes.join(',')}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index}>
            <Row index={index} style={{}} data={itemData} />
          </div>
        ))}
      </div>
    );
  },
}));

jest.mock('react-virtualized-auto-sizer', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
  default: ({ children }: any) => children({ height: 600, width: 800 }),
}));

jest.mock('./JokeCard', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
  JokeCard: ({ joke }: any) => <div data-testid="joke-card">{joke.joke}</div>
}));

describe('VirtualJokeList', () => {
  const mockJokes: Joke[] = [
    { id: '1', joke: 'Short joke', status: 200 },
    { id: '2', joke: 'This is a much longer joke that should result in a taller row height', status: 200 },
    { id: '3', joke: 'Another joke', status: 200 },
  ];

  it('renders jokes in virtual list', () => {
    render(<VirtualJokeList jokes={mockJokes} />);

    expect(screen.getByTestId('virtual-list')).toBeInTheDocument();
    expect(screen.getByText('Short joke')).toBeInTheDocument();
    expect(screen.getByText('This is a much longer joke that should result in a taller row height')).toBeInTheDocument();
    expect(screen.getByText('Another joke')).toBeInTheDocument();
  });

  it('renders empty list when no jokes provided', () => {
    render(<VirtualJokeList jokes={[]} />);

    expect(screen.getByTestId('virtual-list')).toBeInTheDocument();
    expect(screen.queryByTestId('joke-card')).not.toBeInTheDocument();
  });

  it('applies correct container styles', () => {
    const { container } = render(<VirtualJokeList jokes={mockJokes} />);
    
    // eslint-disable-next-line testing-library/no-node-access
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('h-[calc(100vh-200px)]');
    expect(wrapper).toHaveClass('w-full');
  });

  it('handles jokes with varying lengths', () => {
    const longJoke: Joke = {
      id: '4',
      joke: 'a'.repeat(300), // Very long joke
      status: 200,
    };

    render(<VirtualJokeList jokes={[...mockJokes, longJoke]} />);

    const jokeCards = screen.getAllByTestId('joke-card');
    expect(jokeCards).toHaveLength(4);
  });

  it('renders with proper item data', () => {
    render(<VirtualJokeList jokes={mockJokes} />);

    const jokeCards = screen.getAllByTestId('joke-card');
    expect(jokeCards[0]).toHaveTextContent('Short joke');
    expect(jokeCards[1]).toHaveTextContent('This is a much longer joke');
    expect(jokeCards[2]).toHaveTextContent('Another joke');
  });

  it('calculates correct item sizes based on joke length', () => {
    render(<VirtualJokeList jokes={mockJokes} />);
    
    const virtualList = screen.getByTestId('virtual-list');
    const sizes = virtualList.getAttribute('data-sizes')?.split(',').map(Number);
    
    expect(sizes).toBeDefined();
    expect(sizes![0]).toBe(150); // Short joke: base height
    expect(sizes![1]).toBe(170); // Long joke: base + extra height
    expect(sizes![2]).toBe(150); // Another joke: base height
  });

  it('calculates sizes for very short and very long jokes', () => {
    const extremeJokes: Joke[] = [
      { id: '1', joke: 'Hi', status: 200 }, // Very short
      { id: '2', joke: 'a'.repeat(250), status: 200 }, // Very long
      { id: '3', joke: 'a'.repeat(50), status: 200 }, // Exactly one extra block
    ];

    render(<VirtualJokeList jokes={extremeJokes} />);
    
    const virtualList = screen.getByTestId('virtual-list');
    const sizes = virtualList.getAttribute('data-sizes')?.split(',').map(Number);
    
    expect(sizes![0]).toBe(150); // Very short: base height
    expect(sizes![1]).toBe(250); // 250 chars: base + (5 * 20)
    expect(sizes![2]).toBe(170); // 50 chars: base + (1 * 20)
  });
});