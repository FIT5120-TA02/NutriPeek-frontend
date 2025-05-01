// src/components/NutriGapChart/calculateUpdatedNutrients.ts
import { FoodItem } from '@/types/notes';
import { NutrientGapDetails } from '@/api/types';

export function calculateUpdatedNutrients(
  gaps: NutrientGapDetails[],
  selectedFoods: FoodItem[]
): NutrientGapDetails[] {
  const foodMap = new Map<string, number>();

  for (const food of selectedFoods) {
    for (const nutrientName in food.nutrients) {
      const value = food.nutrients[nutrientName] || 0;
      foodMap.set(nutrientName, (foodMap.get(nutrientName) || 0) + value);
    }
  }

  return gaps.map((nutrient) => {
    const added = foodMap.get(nutrient.name) || 0;
    const updatedCurrent = nutrient.current_intake + added;
    return {
      ...nutrient,
      current_intake: updatedCurrent,
      gap: nutrient.recommended_intake - updatedCurrent,
    };
  });
}
