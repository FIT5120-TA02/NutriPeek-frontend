import { NutrientInfo } from '@/api/types';

/**
 * Food item details within a note
 * Represents a food item that was selected during the nutrition analysis
 */
export interface FoodItem {
  id: string;
  name: string;
  imageUrl?: string;
  nutrients?: Record<string, number>;
  category?: string;
  quantity?: number;
}

/**
 * Simplified child profile information to store in notes
 */
export interface NoteChildProfile {
  name: string;
  gender: string;
  age?: string | number;
}

/**
 * Summary statistics shown in note cards
 */
export interface NoteSummary {
  totalCalories?: number;
  missingCount: number;
  excessCount: number;
  overallScore: number; // 0-100 score based on nutritional requirements met
}

/**
 * Represents nutrient information with before/after values
 * Shows the impact of added foods on nutritional intake
 */
export interface NutrientComparison {
  name: string;
  unit: string;
  beforeValue: number;
  afterValue: number;
  recommendedValue: number;
  percentBefore: number;
  percentAfter: number;
  added: number;
}

/**
 * Nutritional note saved when a nutrition gap analysis is performed
 */
export interface NutritionalNote {
  id: number | string;
  childName: string;
  childGender: string;
  childAge?: string | number;
  createdAt: string;
  updatedAt?: string;
  
  // Nutritional data
  summary: NoteSummary;
  nutrient_gaps: Record<string, NutrientInfo>;
  
  // Food items
  originalFoods?: FoodItem[]; // Foods initially scanned/selected
  additionalFoods?: FoodItem[]; // Foods recommended and selected later
  
  // Combined list of all foods
  selectedFoods?: FoodItem[];
  
  // Nutrient comparisons (showing before/after values)
  nutrientComparisons?: NutrientComparison[];
}

/**
 * Type guard to check if an object is a valid NutritionalNote
 */
export function isValidNote(note: any): note is NutritionalNote {
  return (
    note &&
    // Basic required fields
    (typeof note.id === 'string' || typeof note.id === 'number') &&
    typeof note.childName === 'string' &&
    typeof note.childGender === 'string' &&
    typeof note.createdAt === 'string' &&
    typeof note.nutrient_gaps === 'object' &&
    // Summary validation
    typeof note.summary === 'object' &&
    typeof note.summary.missingCount === 'number' &&
    typeof note.summary.excessCount === 'number' &&
    // If summary.overallScore doesn't exist, we'll calculate it
    (typeof note.summary.overallScore === 'number' || (
      note.summary.overallScore = calculateNutritionalScore(note.nutrient_gaps)
    ))
  );
}

/**
 * Calculate the overall nutritional score based on nutrient data
 * @param nutrients Record of nutrient information
 * @param missingNutrients Optional count of missing nutrients for fallback calculation
 * @param excessNutrients Optional count of excess nutrients for fallback calculation
 * @returns A score from 0-100 representing nutritional completeness
 */
export function calculateNutritionalScore(
  nutrients: Record<string, NutrientInfo>,
  missingNutrients: number = 0,
  excessNutrients: number = 0
): number {
  // If we have nutrient data, calculate the average percentage
  if (Object.keys(nutrients).length > 0) {
    let totalPercentage = 0;
    let nutrientCount = 0;
    
    Object.values(nutrients).forEach(nutrient => {
      if (nutrient.recommended_intake > 0) {
        // Calculate percentage (capped at 100%)
        const percentage = Math.min(100, (nutrient.current_intake / nutrient.recommended_intake) * 100);
        totalPercentage += percentage;
        nutrientCount++;
      }
    });
    
    // Return the average percentage, rounded to nearest integer
    return nutrientCount > 0 ? Math.round(totalPercentage / nutrientCount) : 50;
  }
  
  // Fallback to the old method if no nutrient data is available
  const totalNutrientsScore = 100 - (missingNutrients * 3) - (excessNutrients * 2);
  return Math.max(0, Math.min(100, totalNutrientsScore));
} 