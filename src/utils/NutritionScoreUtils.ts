/**
 * Nutrition Score Utilities
 * 
 * Centralized utilities for calculating nutrition scores and determining score-based styling.
 * This ensures consistent scoring logic across all components that display nutritional scores.
 * 
 * @author NutriPeek Team
 * @version 1.0.0
 */

/**
 * Generic interface for nutrient data used in score calculations
 * This interface captures the essential fields needed for scoring from various data sources
 */
export interface NutrientDataForScoring {
  /** Current intake amount */
  current_intake: number;
  /** Recommended intake amount */
  recommended_intake: number;
  /** Unit of measurement (optional, for display purposes) */
  unit?: string;
}

/**
 * Score color configuration for different score ranges
 */
export interface ScoreColorConfig {
  /** Text color class */
  textColor: string;
  /** Border color class */
  borderColor: string;
  /** Background color class (optional) */
  backgroundColor?: string;
}

/**
 * Calculate the overall nutritional score based on nutrient intake data
 * 
 * The scoring algorithm:
 * 1. For each nutrient with a positive recommended intake, calculate the percentage met (capped at 100%)
 * 2. Average all nutrient percentages to get the overall score
 * 3. If no nutrient data is available, fall back to a simple calculation based on missing/excess counts
 * 
 * @param nutrients - Record of nutrient data with current and recommended intake values
 * @param missingNutrients - Count of missing nutrients (used in fallback calculation)
 * @param excessNutrients - Count of excess nutrients (used in fallback calculation)
 * @returns A score from 0-100 representing nutritional completeness
 * 
 * @example
 * ```typescript
 * const nutrients = {
 *   'protein': { current_intake: 20, recommended_intake: 25 },
 *   'vitamin_c': { current_intake: 80, recommended_intake: 60 }
 * };
 * const score = calculateNutritionScore(nutrients); // Returns 90 (average of 80% and 100%)
 * ```
 */
export function calculateNutritionScore(
  nutrients: Record<string, NutrientDataForScoring>,
  missingNutrients: number = 0,
  excessNutrients: number = 0
): number {
  // Primary calculation: Use nutrient data if available
  if (Object.keys(nutrients).length > 0) {
    let totalPercentage = 0;
    let nutrientCount = 0;
    
    Object.values(nutrients).forEach(nutrient => {
      // Only include nutrients with positive recommended intake
      if (nutrient.recommended_intake > 0) {
        // Calculate percentage of recommended intake met (capped at 100%)
        const percentage = Math.min(100, (nutrient.current_intake / nutrient.recommended_intake) * 100);
        totalPercentage += percentage;
        nutrientCount++;
      }
    });
    
    // Return the average percentage, rounded to nearest integer
    return nutrientCount > 0 ? Math.round(totalPercentage / nutrientCount) : 50;
  }
  
  // Fallback calculation: Use missing/excess counts when nutrient data is unavailable
  // This provides a rough estimate based on the number of nutritional gaps
  const fallbackScore = 100 - (missingNutrients * 3) - (excessNutrients * 2);
  return Math.max(0, Math.min(100, fallbackScore));
}

/**
 * Get the appropriate color designation based on nutrition score
 * 
 * Score ranges:
 * - 0-59: Poor (red)
 * - 60-79: Fair (yellow/amber)
 * - 80-100: Good (green)
 * 
 * @param score - Nutrition score (0-100)
 * @returns Color designation string
 */
export function getNutritionScoreColor(score: number): 'red' | 'yellow' | 'green' {
  if (score < 60) return 'red';
  if (score < 80) return 'yellow';
  return 'green';
}

/**
 * Get Tailwind CSS classes for styling based on nutrition score
 * 
 * @param score - Nutrition score (0-100)
 * @param includeBackground - Whether to include background color classes
 * @returns Object containing CSS classes for different styling aspects
 */
export function getNutritionScoreColorClasses(
  score: number, 
  includeBackground: boolean = false
): ScoreColorConfig {
  const colorType = getNutritionScoreColor(score);
  
  switch (colorType) {
    case 'red':
      return {
        textColor: 'text-red-500',
        borderColor: 'border-red-200',
        backgroundColor: includeBackground ? 'bg-red-50' : undefined
      };
    case 'yellow':
      return {
        textColor: 'text-yellow-500',
        borderColor: 'border-yellow-200',
        backgroundColor: includeBackground ? 'bg-yellow-50' : undefined
      };
    case 'green':
      return {
        textColor: 'text-green-500',
        borderColor: 'border-green-200',
        backgroundColor: includeBackground ? 'bg-green-50' : undefined
      };
    default:
      return {
        textColor: 'text-gray-500',
        borderColor: 'border-gray-200',
        backgroundColor: includeBackground ? 'bg-gray-50' : undefined
      };
  }
}

/**
 * Get a human-readable description of the nutrition score
 * 
 * @param score - Nutrition score (0-100)
 * @returns Descriptive text for the score
 */
export function getNutritionScoreDescription(score: number): string {
  if (score < 60) return 'Needs Improvement';
  if (score < 80) return 'Fair';
  return 'Good';
}

/**
 * Validate nutrient data for score calculation
 * 
 * @param nutrients - Nutrient data to validate
 * @returns True if the data is valid for scoring
 */
export function validateNutrientData(nutrients: Record<string, any>): boolean {
  if (!nutrients || typeof nutrients !== 'object') return false;
  
  return Object.values(nutrients).every(nutrient => 
    nutrient &&
    typeof nutrient.current_intake === 'number' &&
    typeof nutrient.recommended_intake === 'number' &&
    nutrient.current_intake >= 0 &&
    nutrient.recommended_intake >= 0
  );
} 