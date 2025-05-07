import { v4 as uuidv4 } from 'uuid';
import storageService from './StorageService';
import { NutritionalNote, type NutritionalNoteData } from '@/types/notes';
import { type NutrientInfo } from '@/api/types';
import { STORAGE_DEFAULTS, STORAGE_KEYS } from '@/types/storage';

/**
 * Service for managing nutritional notes
 * Handles saving, retrieving, updating and deleting notes
 */
export class NoteService {
  /**
   * Get all saved nutritional notes
   * @returns Array of nutritional notes, sorted by date (most recent first)
   */
  getAllNotes(): NutritionalNote[] {
    const savedNotes = storageService.getLocalItem<NutritionalNote[]>({ 
      key: STORAGE_KEYS.NUTRI_NOTES, 
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.NUTRI_NOTES]
    });
    
    const filteredNotes: NutritionalNote[] = Array.isArray(savedNotes) ? savedNotes.filter(this.isValidNote) : [];
    
    // Sort by date (newest first)
    return filteredNotes.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }
  
  /**
   * Get a specific note by ID
   * @param id The ID of the note to retrieve
   * @returns The note if found, or undefined
   */
  getNoteById(id: string | number): NutritionalNote | undefined {
    const notes = this.getAllNotes();
    return notes.find(note => note.id === id);
  }
  
  /**
   * Create a new nutritional note
   * @param data Note data without ID and timestamp
   * @returns The created note with ID and timestamps
   */
  createNote(data: NutritionalNoteData): NutritionalNote {
    const now = new Date();
    const id = uuidv4();
    
    // Create the note object
    const newNote: NutritionalNote = {
      id,
      childName: data.childName,
      childGender: data.childGender,
      childAge: data.childAge,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      
      // Nutritional data
      nutrient_gaps: data.nutrient_gaps,
      
      // Food items
      originalFoods: data.originalFoods || [],
      additionalFoods: data.additionalFoods || [],
            
      // Nutrient comparisons
      nutrientComparisons: data.nutrientComparisons || [],

      // Activity data
      activityResult: data.activityResult,
      activityPAL: data.activityPAL,
      selectedActivities: data.selectedActivities,

      // Energy requirements
      energyRequirements: data.energyRequirements,
    };
    
    // Save the note
    const existingNotes = this.getAllNotes();
    storageService.setLocalItem<NutritionalNote[]>(STORAGE_KEYS.NUTRI_NOTES, [newNote, ...existingNotes]);
    
    return newNote;
  }
  
  /**
   * Update an existing note
   * @param id The ID of the note to update
   * @param data The data to update
   * @returns The updated note if found, or undefined
   */
  updateNote(id: string | number, data: NutritionalNoteData): NutritionalNote | undefined {
    const notes = this.getAllNotes();
    const noteIndex = notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) {
      return undefined;
    }
    
    // Create the updated note
    const updatedNote: NutritionalNote = {
      ...notes[noteIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    // Save the updated notes
    notes[noteIndex] = updatedNote;
    storageService.setLocalItem<NutritionalNote[]>(STORAGE_KEYS.NUTRI_NOTES, notes);
    
    return updatedNote;
  }
  
  /**
   * Delete a note by ID
   * @param id The ID of the note to delete
   * @returns True if the note was deleted, false if not found
   */
  deleteNote(id: string | number): boolean {
    const notes = this.getAllNotes();
    const updatedNotes = notes.filter(note => note.id !== id);
    
    if (updatedNotes.length === notes.length) {
      return false;
    }
    
    storageService.setLocalItem<NutritionalNote[]>(STORAGE_KEYS.NUTRI_NOTES, updatedNotes);
    return true;
  }

  /**
   * Delete all nutritional notes
   * @returns True if notes were successfully cleared
   */
  deleteAllNotes(): boolean {
    try {
      storageService.setLocalItem<NutritionalNote[]>(STORAGE_KEYS.NUTRI_NOTES, []);
      return true;
    } catch (error) {
      console.error('Error deleting all notes:', error);
      return false;
    }
  }

  /**
   * Type guard to check if an object is a valid NutritionalNote
   */
  isValidNote(note: any): note is NutritionalNote {
    return (
      note &&
      // Basic required fields
      typeof note.id === 'string' &&
      typeof note.childName === 'string' &&
      typeof note.childGender === 'string' &&
      typeof note.createdAt === 'string' &&
      typeof note.nutrient_gaps === 'object' &&
      
      // Optional fields validation
      (note.childAge === undefined || typeof note.childAge === 'string' || typeof note.childAge === 'number') &&
      (note.updatedAt === undefined || typeof note.updatedAt === 'string') &&
      
      // Array fields validation
      (note.originalFoods === undefined || Array.isArray(note.originalFoods)) &&
      (note.additionalFoods === undefined || Array.isArray(note.additionalFoods)) &&
      (note.selectedFoods === undefined || Array.isArray(note.selectedFoods)) &&
      (note.nutrientComparisons === undefined || Array.isArray(note.nutrientComparisons)) &&
      (note.selectedActivities === undefined || Array.isArray(note.selectedActivities)) &&
      
      // Object fields validation
      (note.activityResult === undefined || typeof note.activityResult === 'object') &&
      (note.activityPAL === undefined || typeof note.activityPAL === 'number') &&
      (note.energyRequirements === undefined || typeof note.energyRequirements === 'object')
    );
  }

  /**
   * Calculate the overall nutritional score based on nutrient data
   * @param nutrients Record of nutrient information
   * @param missingNutrients Optional count of missing nutrients for fallback calculation
   * @param excessNutrients Optional count of excess nutrients for fallback calculation
   * @returns A score from 0-100 representing nutritional completeness
   */
  calculateNutritionalScore(
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
}

// Create a singleton instance
const noteService = new NoteService();

export default noteService; 