/**
 * Types related to seasonal foods
 */

/**
 * Represents a seasonal food item that can be pinned by users
 */
export interface SeasonalFood {
  /**
   * Unique identifier for the food
   */
  id: string;
  
  /**
   * Name of the food
   */
  name: string;

  /**
   * Database category of the food
   */
  dbCategory: string;

  /**
   * URL to the food's image
   */
  image?: string;
  
  /**
   * Description of the food
   */
  description?: string;
  
  /**
   * Season(s) when the food is available
   */
  seasons: Season[];
  
  /**
   * When the food was pinned
   */
  pinnedAt: string;
  
  /**
   * Region where this food is available
   */
  region?: string;
  
  /**
   * Additional nutritional information
   */
  nutritionalInfo?: {
    calories?: number;
    proteins?: number;
    carbs?: number;
    fats?: number;
    fiber?: number;
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
  };
}

/**
 * Seasons of the year
 */
export enum Season {
  Spring = 'Spring',
  Summer = 'Summer',
  Autumn = 'Autumn',
  Winter = 'Winter'
}

/**
 * Data structure for adding a new pinned food
 * Omits system fields that will be generated
 */
export type SeasonalFoodData = Omit<SeasonalFood, 'id' | 'pinnedAt'>; 