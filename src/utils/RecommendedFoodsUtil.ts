/**
 * RecommendedFoodsUtil.ts
 * 
 * Utility service for handling recommended foods functionality across different pages
 * Provides functions to get, save, and process recommended foods and their impact on nutritional data
 */

import storageService from '@/libs/StorageService';
import { FoodItem, NutrientComparison } from '@/types/notes';
import { NutrientGapResponse } from '@/api/types';
import { STORAGE_KEYS, STORAGE_DEFAULTS } from '@/types/storage';
import noteService from '@/libs/NoteService';

/**
 * Interface for the nutrient comparison result showing the impact of recommended foods
 */
export interface RecommendedFoodsImpact {
  hasRecommendedFoods: boolean;
  foodItems: FoodItem[];
  nutrientComparisons: NutrientComparison[];
}

/**
 * Utility class for handling recommended foods functionality
 */
export const RecommendedFoodsUtil = {
  /**
   * Get currently active recommended foods from storage and active note
   * @returns An object containing food items and their impact on nutrition
   */
  getRecommendedFoodsData(): RecommendedFoodsImpact {
    // First check if there's an active note ID
    const activeNoteId = storageService.getLocalItem<string | null>({
      key: STORAGE_KEYS.ACTIVE_NOTE_ID,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ACTIVE_NOTE_ID]
    });

    // Initialize the result
    const result: RecommendedFoodsImpact = {
      hasRecommendedFoods: false,
      foodItems: [],
      nutrientComparisons: []
    };

    // If there's an active note, get its data
    if (activeNoteId) {
      const note = noteService.getNoteById(activeNoteId);
      
      if (note && note.additionalFoods && note.additionalFoods.length > 0) {
        result.hasRecommendedFoods = true;
        result.foodItems = note.additionalFoods;
        result.nutrientComparisons = note.nutrientComparisons || [];
        return result;
      }
    }

    // If no active note with additional foods, check local storage
    const recommendedFoodIds = storageService.getLocalItem<string[]>({
      key: STORAGE_KEYS.RECOMMENDED_FOOD_IDS,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.RECOMMENDED_FOOD_IDS]
    });

    // If we have IDs but no food items, we can't do much
    if (!recommendedFoodIds || recommendedFoodIds.length === 0) {
      return result;
    }

    // The IDs exist, but we need the actual food items
    // Get the nutrient gap results to check for nutrient comparisons
    const gapResults = storageService.getLocalItem<NutrientGapResponse>({
      key: STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS]
    });

    // Try to find these foods in existing notes
    const allNotes = noteService.getAllNotes();
    let foundFoods: FoodItem[] = [];
    let foundComparisons: NutrientComparison[] = [];

    // Look through notes for matching food items
    for (const note of allNotes) {
      if (note.additionalFoods && note.additionalFoods.length > 0) {
        const matchingFoods = note.additionalFoods.filter(food => 
          recommendedFoodIds.includes(food.id)
        );
        
        if (matchingFoods.length > 0) {
          foundFoods = matchingFoods;
          foundComparisons = note.nutrientComparisons || [];
          break;
        }
      }
    }

    if (foundFoods.length > 0) {
      result.hasRecommendedFoods = true;
      result.foodItems = foundFoods;
      result.nutrientComparisons = foundComparisons;
    }

    return result;
  },

  /**
   * Save recommended food IDs to local storage
   * @param foodItems The food items to save
   */
  saveRecommendedFoodIds(foodItems: FoodItem[]): void {
    const foodIds = foodItems.map(food => food.id);
    storageService.setLocalItem<string[]>(STORAGE_KEYS.RECOMMENDED_FOOD_IDS, foodIds);
  },

  /**
   * Calculate the impact of recommended foods on a nutrient
   * @param nutrientName Name of the nutrient
   * @param nutrientComparisons Array of nutrient comparisons
   * @returns Object with percentage change and absolute value change
   */
  calculateNutrientImpact(nutrientName: string, nutrientComparisons: NutrientComparison[]): {
    percentageChange: number;
    valueChange: number;
    valueUnit: string;
  } {
    const comparison = nutrientComparisons.find(comp => comp.name === nutrientName);
    
    if (!comparison) {
      return {
        percentageChange: 0,
        valueChange: 0,
        valueUnit: ''
      };
    }

    const percentageChange = comparison.percentAfter - comparison.percentBefore;
    const valueChange = comparison.afterValue - comparison.beforeValue;

    return {
      percentageChange,
      valueChange,
      valueUnit: comparison.unit
    };
  }
};

export default RecommendedFoodsUtil; 