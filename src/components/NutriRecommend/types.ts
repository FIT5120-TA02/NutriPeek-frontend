import { NutrientGapDetails } from '@/api/types';
import { FoodItem } from '@/types/notes';

/**
 * Type for a nutrient with extended information
 */
export interface ExtendedNutrientGap extends NutrientGapDetails {
  percentage: number;
  updatedPercentage: number;
  recommendedFoods: FoodItem[];
  isAdjustedForActivity?: boolean;
}