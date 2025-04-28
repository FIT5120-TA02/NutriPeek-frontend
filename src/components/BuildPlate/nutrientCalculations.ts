/**
 * Nutrition calculation utilities
 * Provides functions for calculating nutrition scores based on age-appropriate targets
 */
import { PlacedFood, PlateSummary } from './types';
import { NutrientIntakeResponse } from '@/api/types';

/**
 * Calculate nutrition summary and score based on age-appropriate targets
 * @param placedFoods - Foods placed on the plate
 * @param nutrientIntakeResponse - Response from nutrient intake API
 * @returns Nutrition summary with score
 */
export function calculatePersonalizedNutritionSummary(
  placedFoods: PlacedFood[],
  nutrientIntakeResponse: NutrientIntakeResponse | null
): PlateSummary {
  // Default summary with zeros
  const summary: PlateSummary = {
    totalEnergy: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    totalFibre: 0,
    nutritionScore: 0
  };
  
  if (placedFoods.length === 0) {
    return summary;
  }
  
  // Calculate totals from placed foods
  for (const food of placedFoods) {
    summary.totalEnergy += food.nutrients.energy_kj || 0;
    summary.totalProtein += food.nutrients.protein_g || 0;
    summary.totalFat += food.nutrients.fat_g || 0;
    summary.totalCarbs += food.nutrients.carbohydrate_g || 0;
    summary.totalFibre += food.nutrients.fiber_g || 0;
  }
  
  // If we don't have personalized targets, use default calculation
  if (!nutrientIntakeResponse || !nutrientIntakeResponse.nutrient_intakes) {
    return calculateDefaultNutritionScore(summary);
  }
  
  // Extract recommended intakes from API response
  const intakes = nutrientIntakeResponse.nutrient_intakes;
  
  // Define targets based on API response
  // Note: API might use different key names than our internal ones
  const targets = {
    energy: getRecommendedIntake(intakes, ['energy', 'energy_kj', 'kilojoules'], 1000),
    protein: getRecommendedIntake(intakes, ['protein', 'protein_g'], 20),
    fat: getRecommendedIntake(intakes, ['fat', 'total_fat', 'total_fat_g'], 30),
    carbs: getRecommendedIntake(intakes, ['carbohydrate', 'carbs', 'carbohydrate_g'], 60),
    fibre: getRecommendedIntake(intakes, ['fiber', 'fibre', 'dietary_fibre', 'dietary_fibre_g'], 10)
  };
  
  // Calculate nutrient scores as percentage of recommended intake (capped at 100%)
  const energyScore = calculateNutrientScore(summary.totalEnergy, targets.energy);
  const proteinScore = calculateNutrientScore(summary.totalProtein, targets.protein);
  const carbsScore = calculateNutrientScore(summary.totalCarbs, targets.carbs);
  const fibreScore = calculateNutrientScore(summary.totalFibre, targets.fibre);
  
  // Calculate fat penalty (if exceeding recommended amount)
  // Assume max fat is 150% of recommended amount before penalties
  const maxFat = targets.fat * 1.5;
  const fatPenalty = summary.totalFat > maxFat ? 
    Math.min(50, ((summary.totalFat - maxFat) / maxFat) * 50) : 0;
  
  // Calculate overall score (average of nutrient scores minus fat penalty)
  summary.nutritionScore = Math.round(
    (energyScore + proteinScore + carbsScore + fibreScore) / 4 - fatPenalty
  );
  
  // Ensure score is between 0-100
  summary.nutritionScore = Math.max(0, Math.min(100, summary.nutritionScore));
  
  return summary;
}

/**
 * Calculate a score for a nutrient as percentage of target
 * @param value - Current nutrient value
 * @param target - Target nutrient value
 * @returns Score (0-100)
 */
function calculateNutrientScore(value: number, target: number): number {
  // Ideal range is 70-120% of target
  if (value < target * 0.7) {
    // Below 70%: Linear score from 0-70
    return Math.min(70, (value / target) * 100);
  } else if (value > target * 1.2) {
    // Above 120%: Penalize excess (but not as harshly as deficiency)
    const excess = value - target * 1.2;
    const penalty = Math.min(30, (excess / target) * 50);
    return 100 - penalty;
  } else {
    // Within ideal range: 70-100 score
    const rangePercent = (value - target * 0.7) / (target * 0.5);
    return 70 + (rangePercent * 30);
  }
}

/**
 * Get recommended intake for a nutrient from the API response
 * @param intakes - Nutrient intakes from API
 * @param possibleKeys - Possible keys for the nutrient
 * @param defaultValue - Default value if not found
 * @returns Recommended intake value
 */
function getRecommendedIntake(
  intakes: Record<string, { recommended_intake: number; unit: string; }>,
  possibleKeys: string[],
  defaultValue: number
): number {
  for (const key of possibleKeys) {
    if (intakes[key] && typeof intakes[key].recommended_intake === 'number') {
      return intakes[key].recommended_intake;
    }
  }
  return defaultValue;
}

/**
 * Calculate nutrition score using default targets
 * Used as fallback when personalized targets aren't available
 * @param summary - Nutrition summary
 * @returns Updated summary with score
 */
function calculateDefaultNutritionScore(summary: PlateSummary): PlateSummary {
  // Default targets for a typical child
  const defaultTargets = {
    protein: 20,  // g
    carbs: 60,    // g
    fibre: 10,    // g
    maxFat: 30    // g
  };
  
  // Calculate nutrient scores
  const proteinScore = Math.min(100, (summary.totalProtein / defaultTargets.protein) * 100);
  const carbsScore = Math.min(100, (summary.totalCarbs / defaultTargets.carbs) * 100);
  const fibreScore = Math.min(100, (summary.totalFibre / defaultTargets.fibre) * 100);
  
  // Penalize excessive fat
  const fatPenalty = summary.totalFat > defaultTargets.maxFat ? 
    Math.min(50, ((summary.totalFat - defaultTargets.maxFat) / defaultTargets.maxFat) * 50) : 0;
  
  // Calculate overall score
  summary.nutritionScore = Math.round(
    (proteinScore + carbsScore + fibreScore) / 3 - fatPenalty
  );
  
  // Ensure score is between 0-100
  summary.nutritionScore = Math.max(0, Math.min(100, summary.nutritionScore));
  
  return summary;
} 