import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JokeCard } from './JokeCard';
import { Joke } from '@/types/joke';
import { useFavoritesStore } from '@/stores/favoritesStore';

jest.mock('@/stores/favoritesStore');

const mockUseFavoritesStore = useFavoritesStore as jest.MockedFunction<typeof useFavoritesStore>;

const mockJoke: Joke = {
  id: 'test-123',
  joke: 'Why did the scarecrow win an award? He was outstanding in his field!',
  status: 200,
};

describe('JokeCard', () => {
  const mockAddFavorite = jest.fn();
  const mockRemoveFavorite = jest.fn();
  const mockIsFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFavoritesStore.mockReturnValue({
      favorites: [],
      collections: [],
      addFavorite: mockAddFavorite,
      removeFavorite: mockRemoveFavorite,
      isFavorite: mockIsFavorite,
      createCollection: jest.fn(),
      deleteCollection: jest.fn(),
      addJokeToCollection: jest.fn(),
      removeJokeFromCollection: jest.fn(),
    });
    mockIsFavorite.mockReturnValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders joke text correctly', () => {
    render(<JokeCard joke={mockJoke} />);
    expect(screen.getByText(mockJoke.joke)).toBeInTheDocument();
  });

  it('displays joke ID in footer', () => {
    render(<JokeCard joke={mockJoke} />);
    expect(screen.getByText('#test-123')).toBeInTheDocument();
  });

  it('toggles favorite state when heart button is clicked', async () => {
    const { rerender } = render(<JokeCard joke={mockJoke} />);
    
    const favoriteButton = screen.getByLabelText('Add to favorites');
    await userEvent.click(favoriteButton);

    expect(mockAddFavorite).toHaveBeenCalledWith(mockJoke);
    expect(mockAddFavorite).toHaveBeenCalledTimes(1);

    mockIsFavorite.mockReturnValue(true);
    rerender(<JokeCard joke={mockJoke} />);

    const unfavoriteButton = screen.getByLabelText('Remove from favorites');
    await userEvent.click(unfavoriteButton);

    expect(mockRemoveFavorite).toHaveBeenCalledWith(mockJoke.id);
    expect(mockRemoveFavorite).toHaveBeenCalledTimes(1);
  });

  it('shows filled heart icon when joke is favorited', () => {
    mockIsFavorite.mockReturnValue(true);
    render(<JokeCard joke={mockJoke} />);
    
    const favoriteButton = screen.getByLabelText('Remove from favorites');
    // eslint-disable-next-line testing-library/no-node-access
    const heartIcon = favoriteButton.firstElementChild;
    expect(heartIcon).toHaveClass('fill-current');
  });

  it('copies joke text to clipboard when copy button is clicked', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(<JokeCard joke={mockJoke} />);
    
    const copyButton = screen.getByLabelText('Copy joke');
    await userEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(mockJoke.joke);
    
    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles clipboard error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockWriteText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(<JokeCard joke={mockJoke} />);
    
    const copyButton = screen.getByLabelText('Copy joke');
    await userEvent.click(copyButton);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy joke:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });


  it('renders share button', () => {
    render(<JokeCard joke={mockJoke} />);
    expect(screen.getByLabelText('Share joke')).toBeInTheDocument();
  });

  it('applies correct styles for favorited jokes', () => {
    mockIsFavorite.mockReturnValue(true);
    render(<JokeCard joke={mockJoke} />);
    
    const favoriteButton = screen.getByLabelText('Remove from favorites');
    expect(favoriteButton).toHaveClass('bg-red-100');
    expect(favoriteButton).toHaveClass('text-red-600');
  });

  it('applies correct styles for non-favorited jokes', () => {
    mockIsFavorite.mockReturnValue(false);
    render(<JokeCard joke={mockJoke} />);
    
    const favoriteButton = screen.getByLabelText('Add to favorites');
    expect(favoriteButton).toHaveClass('bg-gray-100');
    expect(favoriteButton).toHaveClass('text-gray-600');
  });

  it('renders without animation when showAnimation is false', () => {
    render(<JokeCard joke={mockJoke} showAnimation={false} />);
    
    const article = screen.getByTestId('joke-card');
    expect(article).toBeInTheDocument();
  });

  it('renders with custom index for staggered animation', () => {
    render(<JokeCard joke={mockJoke} index={5} />);
    
    const article = screen.getByTestId('joke-card');
    expect(article).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<JokeCard joke={mockJoke} />);
    
    const article = screen.getByTestId('joke-card');
    expect(article).toBeInTheDocument();
    expect(article.tagName).toBe('ARTICLE');
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });

  it('handles multiple rapid clicks on favorite button', async () => {
    render(<JokeCard joke={mockJoke} />);
    
    const favoriteButton = screen.getByLabelText('Add to favorites');
    
    await userEvent.click(favoriteButton);
    await userEvent.click(favoriteButton);
    await userEvent.click(favoriteButton);
    
    expect(mockAddFavorite).toHaveBeenCalledTimes(3);
  });

});