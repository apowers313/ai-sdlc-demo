import React from 'react';
import { render } from '@testing-library/react';
import { SWRProvider } from './SWRProvider';

// Test to improve branch coverage by testing the onError callback
describe('SWRProvider - onError callback', () => {
  it('should handle onError callback in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock SWRConfig to capture the configuration
    const mockSWRConfig = jest.fn(({ children }) => children);
    jest.doMock('swr', () => ({
      SWRConfig: mockSWRConfig,
    }));
    
    // Clear the module cache and re-import
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SWRProvider: FreshSWRProvider } = require('./SWRProvider');
    
    // Render the provider
    render(
      <FreshSWRProvider>
        <div>Test</div>
      </FreshSWRProvider>
    );
    
    // Get the config that was passed to SWRConfig
    expect(mockSWRConfig).toHaveBeenCalled();
    const config = mockSWRConfig.mock.calls[0][0].value;
    
    // Test the onError callback
    expect(config.onError).toBeDefined();
    config.onError(new Error('Test error'), 'test-key');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'SWR Error for test-key:',
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
    jest.dontMock('swr');
  });
  
  it('should not log errors in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <SWRProvider>
        <div>Test</div>
      </SWRProvider>
    );
    
    // onError should not log in production
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });
});