import axios from 'axios';

// Create a mock adapter
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('API Client Interceptors', () => {
  let mockCreate: jest.Mock;
  let requestInterceptor: { use: jest.Mock };
  let responseInterceptor: { use: jest.Mock };
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Reset the interceptors
    requestInterceptor = { use: jest.fn() };
    responseInterceptor = { use: jest.fn() };
    
    mockCreate = jest.fn().mockReturnValue({
      interceptors: {
        request: requestInterceptor,
        response: responseInterceptor,
      },
    });
    
    mockAxios.create = mockCreate;
    
    // Import the module to trigger the interceptor setup
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./client');
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('Request Interceptor', () => {
    it('should log requests in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Get the request interceptor function
      const onFulfilled = requestInterceptor.use.mock.calls[0][0];
      
      const request = {
        method: 'get',
        url: '/test',
      };
      
      const result = onFulfilled(request);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('API Request:', 'GET', '/test');
      expect(result).toBe(request);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log requests in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Get the request interceptor function
      const onFulfilled = requestInterceptor.use.mock.calls[0][0];
      
      const request = {
        method: 'get',
        url: '/test',
      };
      
      const result = onFulfilled(request);
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(result).toBe(request);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle request errors', async () => {
      const onRejected = requestInterceptor.use.mock.calls[0][1];
      const error = new Error('Request error');
      
      await expect(onRejected(error)).rejects.toEqual(error);
    });
  });

  describe('Response Interceptor', () => {
    it('should log responses in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const onFulfilled = responseInterceptor.use.mock.calls[0][0];
      
      const response = {
        status: 200,
        config: { url: '/test' },
      };
      
      const result = onFulfilled(response);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('API Response:', 200, '/test');
      expect(result).toBe(response);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log responses in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const onFulfilled = responseInterceptor.use.mock.calls[0][0];
      
      const response = {
        status: 200,
        config: { url: '/test' },
      };
      
      const result = onFulfilled(response);
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(result).toBe(response);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle timeout errors', async () => {
      const onRejected = responseInterceptor.use.mock.calls[0][1];
      const error = {
        code: 'ECONNABORTED',
        config: { url: '/test' },
      };
      
      await expect(onRejected(error)).rejects.toEqual(new Error('Request timeout'));
    });

    it('should handle rate limit errors', async () => {
      const onRejected = responseInterceptor.use.mock.calls[0][1];
      const error = {
        response: { status: 429 },
        config: { url: '/test' },
      };
      
      await expect(onRejected(error)).rejects.toEqual(
        new Error('Rate limit exceeded. Please try again later.')
      );
    });

    it('should handle server errors', async () => {
      const onRejected = responseInterceptor.use.mock.calls[0][1];
      
      const serverErrors = [500, 502, 503, 504];
      
      for (const status of serverErrors) {
        const error = {
          response: { status },
          config: { url: '/test' },
        };
        
        await expect(onRejected(error)).rejects.toEqual(
          new Error('Server error. Please try again later.')
        );
      }
    });

    it('should handle network errors', async () => {
      const onRejected = responseInterceptor.use.mock.calls[0][1];
      const error = {
        request: {},
        config: { url: '/test' },
      };
      
      await expect(onRejected(error)).rejects.toEqual(
        new Error('Network error. Please check your connection.')
      );
    });

    it('should pass through other errors', async () => {
      const onRejected = responseInterceptor.use.mock.calls[0][1];
      const error = {
        response: { status: 404 },
        config: { url: '/test' },
      };
      
      await expect(onRejected(error)).rejects.toEqual(error);
    });

    it('should handle errors without response or request', async () => {
      const onRejected = responseInterceptor.use.mock.calls[0][1];
      const error = new Error('Unknown error');
      
      await expect(onRejected(error)).rejects.toEqual(error);
    });

    it('should log errors in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const onRejected = responseInterceptor.use.mock.calls[0][1];
      const error = {
        response: { status: 404 },
        config: { url: '/test' },
      };
      
      try {
        await onRejected(error);
      } catch {
        // Expected to throw
      }
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', 404, '/test');
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});