import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('should render children', () => {
    render(
      <ThemeProvider>
        <div>Theme Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Theme Test Content')).toBeInTheDocument();
  });
});