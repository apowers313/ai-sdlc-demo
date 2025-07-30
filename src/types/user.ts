export interface UserStats {
  jokesRead: number;
  favoritesCount: number;
  reactionsCount: number;
  sharedCount: number;
  currentStreak: number;
  lastVisit: Date;
}

export interface Collection {
  id: string;
  name: string;
  jokeIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
