import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfiniteJokeList } from './InfiniteJokeList';
import { useInfiniteJokes } from '@/hooks/useInfiniteJokes';

jest.mock('@/hooks/useInfiniteJokes');
jest.mock('./JokeCard', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
  JokeCard: ({ joke }: any) => <div data-testid="joke-card">{joke.joke}</div>
}));
jest.mock('./JokeCardSkeleton', () => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  JokeCardSkeleton: () => <div data-testid="joke-skeleton">Loading...</div>
}));
jest.mock('@/components/common/LoadingSpinner', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
  LoadingSpinner: ({ size }: any) => <div data-testid="loading-spinner">Loading {size}</div>
}));

const mockUseInfiniteJokes = useInfiniteJokes as jest.MockedFunction<typeof useInfiniteJokes>;

describe('InfiniteJokeList', () => {
  const mockJokes = [
    { id: '1', joke: 'Joke 1', status: 200 },
    { id: '2', joke: 'Joke 2', status: 200 },
  ];

  const mockSetSize = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeletons when loading with no jokes', () => {
    mockUseInfiniteJokes.mockReturnValue({
      jokes: [],
      size: 1,
      setSize: mockSetSize,
      isLoading: true,
      isValidating: false,
      error: null,
      hasMore: true,
      mutate: jest.fn(),
      data: undefined,
      totalJokes: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InfiniteJokeList />);

    const skeletons = screen.getAllByTestId('joke-skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('renders jokes when loaded', () => {
    mockUseInfiniteJokes.mockReturnValue({
      jokes: mockJokes,
      size: 1,
      setSize: mockSetSize,
      isLoading: false,
      isValidating: false,
      error: null,
      hasMore: true,
      mutate: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: [{ results: mockJokes }] as any,
      totalJokes: 2,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InfiniteJokeList />);

    expect(screen.getByText('Joke 1')).toBeInTheDocument();
    expect(screen.getByText('Joke 2')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    mockUseInfiniteJokes.mockReturnValue({
      jokes: [],
      size: 1,
      setSize: mockSetSize,
      isLoading: false,
      isValidating: false,
      error: new Error('Failed to load'),
      hasMore: false,
      mutate: jest.fn(),
      data: undefined,
      totalJokes: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InfiniteJokeList />);

    expect(screen.getByText('Oops! Something went wrong loading jokes.')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try Again');
    await userEvent.click(retryButton);
    
    expect(mockSetSize).toHaveBeenCalledWith(1);
  });

  it('renders empty state with no search term', () => {
    mockUseInfiniteJokes.mockReturnValue({
      jokes: [],
      size: 1,
      setSize: mockSetSize,
      isLoading: false,
      isValidating: false,
      error: null,
      hasMore: false,
      mutate: jest.fn(),
      data: [],
      totalJokes: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InfiniteJokeList />);

    expect(screen.getByText('No jokes available. Please try again later.')).toBeInTheDocument();
  });

  it('renders empty state with search term', () => {
    mockUseInfiniteJokes.mockReturnValue({
      jokes: [],
      size: 1,
      setSize: mockSetSize,
      isLoading: false,
      isValidating: false,
      error: null,
      hasMore: false,
      mutate: jest.fn(),
      data: [],
      totalJokes: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InfiniteJokeList searchTerm="funny" />);

    expect(screen.getByText('No jokes found for "funny". Try a different search!')).toBeInTheDocument();
  });

  it('loads more jokes when scrolled near bottom', async () => {
    mockUseInfiniteJokes.mockReturnValue({
      jokes: mockJokes,
      size: 1,
      setSize: mockSetSize,
      isLoading: false,
      isValidating: false,
      error: null,
      hasMore: true,
      mutate: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: [{ results: mockJokes }] as any,
      totalJokes: 10,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InfiniteJokeList />);

    // Mock scrolling near bottom
    Object.defineProperty(window, 'scrollY', { value: 1000, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1400, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });

    // Trigger scroll event
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(mockSetSize).toHaveBeenCalledWith(2);
    });
  });

  it('shows loading spinner when validating', () => {
    mockUseInfiniteJokes.mockReturnValue({
      jokes: mockJokes,
      size: 1,
      setSize: mockSetSize,
      isLoading: false,
      isValidating: true,
      error: null,
      hasMore: true,
      mutate: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: [{ results: mockJokes }] as any,
      totalJokes: 2,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InfiniteJokeList />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows end message when no more jokes', () => {
    mockUseInfiniteJokes.mockReturnValue({
      jokes: mockJokes,
      size: 1,
      setSize: mockSetSize,
      isLoading: false,
      isValidating: false,
      error: null,
      hasMore: false,
      mutate: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: [{ results: mockJokes }] as any,
      totalJokes: 2,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InfiniteJokeList />);

    expect(screen.getByText("You've reached the end of the jokes!")).toBeInTheDocument();
  });

  it('does not load more when already validating', async () => {
    mockUseInfiniteJokes.mockReturnValue({
      jokes: mockJokes,
      size: 1,
      setSize: mockSetSize,
      isLoading: false,
      isValidating: true,
      error: null,
      hasMore: true,
      mutate: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: [{ results: mockJokes }] as any,
      totalJokes: 10,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InfiniteJokeList />);

    // Mock scrolling near bottom
    Object.defineProperty(window, 'scrollY', { value: 1000, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1400, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });

    // Trigger scroll event
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(mockSetSize).not.toHaveBeenCalled();
    });
  });

  it('does not load more when no more jokes available', async () => {
    mockUseInfiniteJokes.mockReturnValue({
      jokes: mockJokes,
      size: 1,
      setSize: mockSetSize,
      isLoading: false,
      isValidating: false,
      error: null,
      hasMore: false,
      mutate: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: [{ results: mockJokes }] as any,
      totalJokes: 2,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InfiniteJokeList />);

    // Mock scrolling near bottom
    Object.defineProperty(window, 'scrollY', { value: 1000, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1400, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });

    // Trigger scroll event
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(mockSetSize).not.toHaveBeenCalled();
    });
  });
});