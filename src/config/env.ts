export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://icanhazdadjoke.com',
    timeout: 10000,
    headers: {
      'User-Agent': 'JokeStream/1.0 (https://github.com/yourusername/jokestream)',
    },
  },
  app: {
    name: 'JokeStream',
    description: 'Endless dad jokes for everyone',
    version: '1.0.0',
  },
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  },
} as const;
