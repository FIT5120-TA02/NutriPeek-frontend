import { NutrientInfo, type ActivityEntry, type ActivityResult, type ChildEnergyRequirementsResponse, type NutrientGapResponse } from '@/api/types';

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
 * Simplified child profile information to store in notes
 */
export interface NoteChildProfile {
  name: string;
  gender: string;
  age?: string | number;
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
 * Data for a nutritional note
 */
export interface NutritionalNoteData {
  // Profile data
  childName: string;
  childGender: string;
  childAge?: string | number;

  // Nutritional data
  nutrient_gaps: NutrientGapResponse;
  
  // Food items
  originalFoods?: FoodItem[]; // Foods initially scanned/selected (Scanned Foods)
  additionalFoods?: FoodItem[]; // Foods recommended and selected later (Recommended Foods)
  
  // Nutrient comparisons (showing before/after values)
  nutrientComparisons?: NutrientComparison[];

  // Activity data
  activityResult?: ActivityResult;
  activityPAL?: number;
  selectedActivities?: ActivityEntry[];

  // Energy requirements
  energyRequirements?: ChildEnergyRequirementsResponse;
}


/**
 * Nutritional note saved when a nutrition gap analysis is performed
 */
export interface NutritionalNote extends NutritionalNoteData {
  id: string;
  createdAt: string;
  updatedAt?: string;
}