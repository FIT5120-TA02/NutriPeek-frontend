import { FoodItem, NutrientComparison } from '@/types/notes';
import { NutrientInfo } from '@/api/types';

interface NoteData {
  id: string | number;
  timestamp: number;
  selectedFoods: FoodItem[];
  nutrient_gaps: Record<string, NutrientInfo>;
  originalFoods?: FoodItem[];
  additionalFoods?: FoodItem[];
}

/**
 * Calculates a summary of how selected foods impact nutrient gaps
 * Shows nutrient information before and after adding selected foods
 * 
 * @param note Note data with food and nutrient information
 * @returns Object with total percentage met and detailed comparisons
 */
export function calculateGapSummary(note: NoteData): {
  totalMet: number;
  comparison: NutrientComparison[];
} {
  const { nutrient_gaps, selectedFoods, originalFoods, additionalFoods } = note;

  // Calculate nutrients added from all selected foods
  const addedNutrients: Record<string, number> = {};
  
  // Use the foods list in priority: selectedFoods > (originalFoods + additionalFoods) > empty
  const foodsToProcess = selectedFoods && selectedFoods.length > 0 
    ? selectedFoods 
    : [...(originalFoods || []), ...(additionalFoods || [])];
  
  // Calculate total added nutrients from all foods
  foodsToProcess.forEach((food) => {
    if (food.nutrients) {
      for (const [nutrient, value] of Object.entries(food.nutrients)) {
        // Multiple by quantity if available
        const actualValue = food.quantity ? value * food.quantity : value;
        addedNutrients[nutrient] = (addedNutrients[nutrient] || 0) + actualValue;
      }
    }
  });

  // Create comparison data for each nutrient
  const comparison: NutrientComparison[] = Object.entries(nutrient_gaps).map(([name, info]) => {
    const added = addedNutrients[name] || 0;
    const beforeValue = info.current_intake;
    const afterValue = beforeValue + added;
    const recommendedValue = info.recommended_intake;
    
    const percentBefore = recommendedValue > 0 
      ? Math.min(100, (beforeValue / recommendedValue) * 100) 
      : 0;
      
    const percentAfter = recommendedValue > 0 
      ? Math.min(100, (afterValue / recommendedValue) * 100) 
      : 0;

    return {
      name,
      unit: info.unit,
      beforeValue,
      afterValue,
      recommendedValue,
      percentBefore,
      percentAfter,
      added,
    };
  });

  // Calculate total percentage of nutrients met across all nutrients
  const totalMetBefore = comparison.reduce((sum, item) => sum + item.percentBefore, 0) / (comparison.length || 1);
  const totalMetAfter = comparison.reduce((sum, item) => sum + item.percentAfter, 0) / (comparison.length || 1);
  
  // Sort comparison by the percentage improvement (descending)
  comparison.sort((a, b) => {
    // Calculate percentage improvement for each
    const improvementA = a.percentAfter - a.percentBefore;
    const improvementB = b.percentAfter - b.percentBefore;
    return improvementB - improvementA;
  });

  return { 
    totalMet: totalMetAfter,
    comparison
  };
}

/**
 * Generate nutrient comparisons for a note
 * This can be used when creating or updating a note
 * 
 * @param nutrientGaps Current nutrient information
 * @param foods Foods to calculate added nutrients from
 * @returns Array of nutrient comparisons
 */
export function generateNutrientComparisons(
  nutrientGaps: Record<string, NutrientInfo>,
  foods: FoodItem[]
): NutrientComparison[] {
  const addedNutrients: Record<string, number> = {};
  
  // Calculate added nutrients from foods
  foods.forEach((food) => {
    if (food.nutrients) {
      for (const [nutrient, value] of Object.entries(food.nutrients)) {
        // Multiple by quantity if available
        const actualValue = food.quantity ? value * food.quantity : value;
        addedNutrients[nutrient] = (addedNutrients[nutrient] || 0) + actualValue;
      }
    }
  });

  // Create comparison data for each nutrient
  return Object.entries(nutrientGaps).map(([name, info]) => {
    const added = addedNutrients[name] || 0;
    const beforeValue = info.current_intake;
    const afterValue = beforeValue + added;
    const recommendedValue = info.recommended_intake;
    
    const percentBefore = recommendedValue > 0 
      ? Math.min(100, (beforeValue / recommendedValue) * 100) 
      : 0;
      
    const percentAfter = recommendedValue > 0 
      ? Math.min(100, (afterValue / recommendedValue) * 100) 
      : 0;

    return {
      name,
      unit: info.unit,
      beforeValue,
      afterValue,
      recommendedValue,
      percentBefore,
      percentAfter,
      added,
    };
  }).sort((a, b) => {
    // Sort by improvement (descending)
    const improvementA = a.percentAfter - a.percentBefore;
    const improvementB = b.percentAfter - b.percentBefore;
    return improvementB - improvementA;
  });
}
