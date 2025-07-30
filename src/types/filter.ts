export type FilterStrength = 'strict' | 'moderate' | 'minimal';

export interface FilterConfig {
  enabled: boolean;
  strength: FilterStrength;
  customBlocklist: string[];
  allowedCategories: string[];
}

export interface FilterStats {
  totalChecked: number;
  totalBlocked: number;
  blockedByCategory: Record<string, number>;
  lastChecked: Date;
}