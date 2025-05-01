import { NutrientGapDetails } from '@/api/types';

/**
 * Type for a food item with complete information
 */
export interface FoodItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  nutrients: Record<string, number>;
  selected: boolean;
  quantity: number;
}

/**
 * Type for a nutrient with extended information
 */
export interface ExtendedNutrientGap extends NutrientGapDetails {
  percentage: number;
  updatedPercentage: number;
  recommendedFoods: FoodItem[];
  isAdjustedForActivity?: boolean;
}