export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends APIError {
  constructor(public retryAfter?: number) {
    super(429, 'Rate limit exceeded');
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends APIError {
  constructor(message: string = 'Internal server error') {
    super(500, message);
    this.name = 'ServerError';
  }
}