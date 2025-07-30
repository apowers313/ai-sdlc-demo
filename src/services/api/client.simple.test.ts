// Simple test to verify the module loads without errors
describe('API Client Module', () => {
  it('should export apiClient', async () => {
    // Clear module cache to ensure fresh import
    jest.resetModules();
    
    // Import the module - this will execute the code
    const clientModule = await import('./client');
    
    expect(clientModule.apiClient).toBeDefined();
    expect(clientModule.apiClient.defaults).toBeDefined();
    expect(clientModule.apiClient.interceptors).toBeDefined();
  });
});