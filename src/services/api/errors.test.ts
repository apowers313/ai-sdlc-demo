import {
  APIError,
  NetworkError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  ServerError
} from './errors';

describe('API Errors', () => {
  describe('APIError', () => {
    it('should create an APIError with correct properties', () => {
      const error = new APIError(400, 'Bad Request', '/api/test');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe('APIError');
      expect(error.message).toBe('Bad Request');
      expect(error.statusCode).toBe(400);
      expect(error.endpoint).toBe('/api/test');
    });

    it('should work without endpoint', () => {
      const error = new APIError(500, 'Internal Server Error');
      
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal Server Error');
      expect(error.endpoint).toBeUndefined();
    });
  });

  describe('NetworkError', () => {
    it('should create a NetworkError with default message', () => {
      const error = new NetworkError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Network connection failed');
    });

    it('should create a NetworkError with custom message', () => {
      const error = new NetworkError('Custom network error');
      
      expect(error.message).toBe('Custom network error');
    });
  });

  describe('RateLimitError', () => {
    it('should create a RateLimitError', () => {
      const error = new RateLimitError();
      
      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.name).toBe('RateLimitError');
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBeUndefined();
    });

    it('should create a RateLimitError with retryAfter', () => {
      const error = new RateLimitError(60);
      
      expect(error.retryAfter).toBe(60);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError', () => {
      const errors = {
        email: ['Email is required', 'Email is invalid'],
        password: ['Password is too short']
      };
      const error = new ValidationError('Validation failed', errors);
      
      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(errors);
    });

    it('should work without errors object', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.errors).toBeUndefined();
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError', () => {
      const error = new NotFoundError('User');
      
      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ServerError', () => {
    it('should create a ServerError with default message', () => {
      const error = new ServerError();
      
      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(ServerError);
      expect(error.name).toBe('ServerError');
      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
    });

    it('should create a ServerError with custom message', () => {
      const error = new ServerError('Database connection failed');
      
      expect(error.message).toBe('Database connection failed');
    });
  });
});