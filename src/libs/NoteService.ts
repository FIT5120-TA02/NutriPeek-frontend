import { v4 as uuidv4 } from 'uuid';
import storageService from './StorageService';
import { NutritionalNote, type NutritionalNoteData } from '@/types/notes';
import { type NutrientInfo } from '@/api/types';
import { STORAGE_DEFAULTS, STORAGE_KEYS } from '@/types/storage';
import { calculateNutritionScore, type NutrientDataForScoring } from '@/utils/NutritionScoreUtils';

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
    
    // Dispatch event to notify listeners about the new note
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('noteCreated', { 
        detail: { note: newNote }
      }));
    }
    
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
    
    // Dispatch event to notify listeners about the updated note
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('noteUpdated', { 
        detail: { note: updatedNote }
      }));
    }
    
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
    
    // Dispatch event to notify listeners about the deleted note
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('noteDeleted', { 
        detail: { noteId: id }
      }));
    }
    
    return true;
  }

  /**
   * Delete all notes
   * @returns True if notes were deleted, false if there were no notes
   */
  deleteAllNotes(): boolean {
    const notes = this.getAllNotes();
    
    if (notes.length === 0) {
      return false;
    }
    
    // Save an empty array
    storageService.setLocalItem<NutritionalNote[]>(STORAGE_KEYS.NUTRI_NOTES, []);
    
    // Dispatch event to notify listeners about all notes being deleted
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('allNotesDeleted'));
    }
    
    return true;
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
   * 
   * This method serves as a bridge between the NoteService and the centralized
   * nutrition scoring utility, maintaining backward compatibility while ensuring
   * consistent scoring logic across the application.
   * 
   * @param nutrients Record of nutrient information
   * @param missingNutrients Optional count of missing nutrients for fallback calculation
   * @param excessNutrients Optional count of excess nutrients for fallback calculation
   * @returns A score from 0-100 representing nutritional completeness
   * 
   * @deprecated Consider using calculateNutritionScore from NutritionScoreUtils directly
   */
  calculateNutritionalScore(
    nutrients: Record<string, NutrientInfo>,
    missingNutrients: number = 0,
    excessNutrients: number = 0
  ): number {
    // Convert NutrientInfo to NutrientDataForScoring format
    const convertedNutrients: Record<string, NutrientDataForScoring> = {};
    
    Object.entries(nutrients).forEach(([key, nutrient]) => {
      convertedNutrients[key] = {
        current_intake: nutrient.current_intake,
        recommended_intake: nutrient.recommended_intake,
        unit: nutrient.unit
      };
    });
    
    // Use the centralized scoring utility
    return calculateNutritionScore(convertedNutrients, missingNutrients, excessNutrients);
  }
}

// Create a singleton instance
const noteService = new NoteService();

export default noteService; 