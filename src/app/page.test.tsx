import { render, screen } from '@testing-library/react';
import Home from './page';

jest.mock('@/components/features/FilterSettings', () => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  FilterSettings: () => <div>Content Filter</div>
}));

jest.mock('@/components/jokes/InfiniteJokeList', () => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  InfiniteJokeList: () => <div>Joke List</div>
}));

describe('Home', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByText(/JokeStream/i)).toBeInTheDocument();
  });

  it('renders filter settings', () => {
    render(<Home />);
    expect(screen.getByText('Content Filter')).toBeInTheDocument();
  });

  it('renders infinite joke list', () => {
    render(<Home />);
    expect(screen.getByText('Joke List')).toBeInTheDocument();
  });
});
