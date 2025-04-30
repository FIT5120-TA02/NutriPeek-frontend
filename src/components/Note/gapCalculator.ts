import { FoodItem } from '@/types/notes';
import { NutrientInfo } from '@/api/types';

interface NoteData {
  id: string;
  timestamp: number;
  selectedFoods: FoodItem[];
  nutrient_gaps: Record<string, NutrientInfo>;
}

interface ComparisonResult {
  name: string;
  unit: string;
  added: number;
  updated: number;
  recommended: number;
  percentBefore: number;
  percentAfter: number;
}

export function calculateGapSummary(note: NoteData): {
  totalMet: number;
  comparison: ComparisonResult[];
} {
  const { nutrient_gaps, selectedFoods } = note;

  const addedNutrients: Record<string, number> = {};
  selectedFoods.forEach((food) => {
    if (food.nutrients) {
      for (const [nutrient, value] of Object.entries(food.nutrients)) {
        addedNutrients[nutrient] = (addedNutrients[nutrient] || 0) + value;
      }
    }
  });

  const comparison: ComparisonResult[] = Object.entries(nutrient_gaps).map(([name, info]) => {
    const added = addedNutrients[name] || 0;
    const updated = info.current_intake + added;
    const percentBefore = (info.current_intake / info.recommended_intake) * 100;
    const percentAfter = (updated / info.recommended_intake) * 100;

    return {
      name,
      unit: info.unit,
      added,
      updated,
      recommended: info.recommended_intake,
      percentBefore: Math.min(percentBefore, 100),
      percentAfter: Math.min(percentAfter, 100),
    };
  });

  const totalMet =
    comparison.reduce((sum, item) => sum + item.percentAfter, 0) / (comparison.length || 1);

  return { totalMet, comparison };
}
