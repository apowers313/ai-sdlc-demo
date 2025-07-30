import { config } from '@/config/env';

// We need to test the module after it's been loaded,
// so we'll need to use dynamic imports
let apiClient: typeof import('./client').apiClient;

describe('API Client', () => {
  beforeAll(async () => {
    const clientModule = await import('./client');
    apiClient = clientModule.apiClient;
  });

  it('should be configured with correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBe(config.api.baseUrl);
  });

  it('should be configured with correct timeout', () => {
    expect(apiClient.defaults.timeout).toBe(config.api.timeout);
  });

  it('should have correct default headers', () => {
    expect(apiClient.defaults.headers['Accept']).toBe('application/json');
    expect(apiClient.defaults.headers['User-Agent']).toBe(config.api.headers['User-Agent']);
  });

  describe('interceptors', () => {
    it('should have request and response interceptors', () => {
      // Check if interceptors are defined
      expect(apiClient.interceptors.request).toBeDefined();
      expect(apiClient.interceptors.response).toBeDefined();
    });
  });
});