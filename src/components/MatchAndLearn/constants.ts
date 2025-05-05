import { DifficultyLevel } from './types';

/**
 * Difficulty levels with corresponding card counts for desktop and mobile
 */
export const DIFFICULTY_LEVELS: Record<DifficultyLevel, { desktop: number, mobile: number }> = {
  easy: { 
    desktop: 12, // 6 pairs (will form a 3x4 grid)
    mobile: 8,   // 4 pairs (will form a 2x4 grid)
  },
  medium: { 
    desktop: 24, // 12 pairs (will form a 4x6 grid)
    mobile: 12,  // 6 pairs (will form a 3x4 grid)
  },
  hard: { 
    desktop: 40, // 20 pairs (will form a 5x8 grid)
    mobile: 16,  // 8 pairs (will form a 4x4 grid)
  },
}; 