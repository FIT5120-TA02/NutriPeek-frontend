import { FoodItem, NutritionalNote } from '@/types/notes';
import { NutrientInfo } from '@/api/types';
import noteService from '@/libs/NoteService';

/**
 * Creates a new note from the NutriGap analysis and recommended foods
 * 
 * @param params Parameters for creating a nutrition note
 * @returns The created note, or undefined if creation failed
 */
export function createNutritionNote(params: {
  childName: string;
  childGender: string;
  childAge?: string | number;
  nutrientGaps: Record<string, NutrientInfo>;
  originalFoods: FoodItem[];
  recommendedFoods: FoodItem[];
  missingNutrients: number;
  excessNutrients: number;
  totalCalories: number;
}): NutritionalNote | undefined {
  try {
    const {
      childName,
      childGender,
      childAge,
      nutrientGaps,
      originalFoods,
      recommendedFoods,
      missingNutrients,
      excessNutrients,
      totalCalories,
    } = params;

    // Ensure we have the required data
    if (!childName || !childGender || !nutrientGaps) {
      console.error('Missing required data for note creation');
      return undefined;
    }

    // Create the note using the note service
    const newNote = noteService.createNote({
      childName,
      childGender,
      childAge,
      nutrient_gaps: nutrientGaps,
      originalFoods: originalFoods || [],
      additionalFoods: recommendedFoods || [],
      missingCount: missingNutrients,
      excessCount: excessNutrients,
      totalCalories,
    });

    return newNote;
  } catch (error) {
    console.error('Error creating nutrition note:', error);
    return undefined;
  }
}

/**
 * Updates an existing note with new recommended foods
 * 
 * @param noteId ID of the note to update
 * @param recommendedFoods Array of recommended foods to add
 * @returns The updated note, or undefined if update failed
 */
export function addRecommendedFoodsToNote(
  noteId: string | number,
  recommendedFoods: FoodItem[]
): NutritionalNote | undefined {
  try {
    // Get the existing note
    const existingNote = noteService.getNoteById(noteId);
    if (!existingNote) {
      console.error(`Note with ID ${noteId} not found`);
      return undefined;
    }

    // Merge the new foods with any existing additional foods
    const updatedAdditionalFoods = [
      ...(existingNote.additionalFoods || []),
      ...recommendedFoods,
    ];

    // Update the foods in the note
    const updatedNote = noteService.updateNote(noteId, {
      additionalFoods: updatedAdditionalFoods,
      // Update the selected foods to include all foods
      selectedFoods: [
        ...(existingNote.originalFoods || []),
        ...updatedAdditionalFoods,
      ],
    });

    return updatedNote;
  } catch (error) {
    console.error('Error updating note with recommended foods:', error);
    return undefined;
  }
} 