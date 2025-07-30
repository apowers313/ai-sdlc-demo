import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByText(/JokeStream/i)).toBeInTheDocument();
  });

  it('displays the coming soon message', () => {
    render(<Home />);
    expect(screen.getByText(/Coming soon: Endless dad jokes for everyone!/i)).toBeInTheDocument();
  });
});
