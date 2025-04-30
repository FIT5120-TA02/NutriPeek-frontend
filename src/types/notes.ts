import { NutrientInfo, ChildProfile as ApiChildProfile } from '@/api/types';

/**
 * Food item details within a note
 */
export interface FoodItem {
  id: string;
  name: string;
  imageUrl?: string;
  nutrients?: Record<string, number>;
}

/**
 * Simplified child profile information to store in notes
 */
export interface NoteChildProfile {
  name: string;
  gender: string;
  age?: string;
}

/**
 * Summary statistics shown in note cards
 */
export interface NoteSummary {
  totalCalories?: number;
  missingCount: number;
  excessCount: number;
}

/**
 * Nutritional note saved when a nutrition gap analysis is performed
 */
export interface NutritionalNote {
  id: number | string;
  childName: string;
  childGender: string;
  summary: NoteSummary;
  nutrient_gaps: Record<string, NutrientInfo>;
  createdAt: string;
  selectedFoods?: FoodItem[];
}

/**
 * Type guard to check if an object is a valid NutritionalNote
 */
export function isValidNote(note: any): note is NutritionalNote {
  return (
    note &&
    (typeof note.id === 'string' || typeof note.id === 'number') &&
    typeof note.childName === 'string' &&
    typeof note.childGender === 'string' &&
    typeof note.createdAt === 'string' &&
    typeof note.summary === 'object' &&
    typeof note.nutrient_gaps === 'object'
  );
} 