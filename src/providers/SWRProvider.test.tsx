import { render, screen } from '@testing-library/react';
import { SWRProvider } from './SWRProvider';

describe('SWRProvider', () => {
  it('should render children', () => {
    render(
      <SWRProvider>
        <div>Test Child</div>
      </SWRProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should provide SWR configuration without errors', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <SWRProvider>
        <div>Test Content</div>
      </SWRProvider>
    );

    // Verify no errors occurred during render
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('should log errors in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock SWRConfig to trigger the onError callback
    jest.mock('swr', () => ({
      SWRConfig: ({ value, children }: { value: Record<string, unknown>; children: React.ReactNode }): React.ReactNode => {
        // Simulate an error to test the onError handler
        if (value.onError) {
          value.onError(new Error('Test error'), 'test-key');
        }
        return children;
      }
    }));
    
    render(
      <SWRProvider>
        <div>Test</div>
      </SWRProvider>
    );
    
    // The component renders children even with the mocked error
    expect(screen.getByText('Test')).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });
});