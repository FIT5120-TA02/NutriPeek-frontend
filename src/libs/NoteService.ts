import { v4 as uuidv4 } from 'uuid';
import storageService from './StorageService';
import { FoodItem, NutritionalNote, isValidNote, calculateNutritionalScore, NutrientComparison } from '@/types/notes';
import { NutrientInfo } from '@/api/types';
import { generateNutrientComparisons } from '@/components/Note/gapCalculator';

// Storage keys
const NOTES_STORAGE_KEY = 'nutri_notes';

/**
 * Service for managing nutritional notes
 * Handles saving, retrieving, updating and deleting notes
 */
export class NoteService {
  constructor() {
    // Automatically migrate old format notes when service is instantiated
    this.migrateOldNotes();
  }

  /**
   * Migrate old format notes to the new format
   * This ensures backward compatibility with previously saved notes
   */
  private migrateOldNotes(): void {
    // Only run in client
    if (typeof window === 'undefined') return;
    
    // Get notes from storage
    const savedNotes = storageService.getLocalItem<any[]>({ 
      key: NOTES_STORAGE_KEY, 
      defaultValue: [] 
    });
    
    if (!Array.isArray(savedNotes) || savedNotes.length === 0) return;
    
    // Check if we need to migrate notes
    const needsMigration = savedNotes.some(note => {
      return note && 
        !note.updatedAt || // Missing updatedAt field
        !note.summary?.overallScore || // Missing overallScore
        (!note.originalFoods && !note.additionalFoods); // Missing food categorization
    });
    
    if (!needsMigration) return;
    
    // Migrate notes to new format
    const migratedNotes = savedNotes.map(note => {
      // Skip already valid notes
      if (isValidNote(note)) return note;
      
      // Basic validation
      if (!note || typeof note.id === 'undefined' || 
          !note.childName || !note.childGender || 
          !note.createdAt || !note.nutrient_gaps) {
        return null; // Skip invalid notes
      }
      
      try {
        // Use ID from the note or generate a new one
        const id = note.id || uuidv4();
        
        // Calculate the score if missing
        const overallScore = calculateNutritionalScore(note.nutrient_gaps);
        
        // Create updated note with proper structure
        const migratedNote: NutritionalNote = {
          id,
          childName: note.childName,
          childGender: note.childGender,
          childAge: note.childAge || undefined,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt || note.createdAt,
          
          // Ensure summary has all required fields
          summary: {
            totalCalories: note.summary?.totalCalories || 0,
            missingCount: note.summary?.missingCount || 0,
            excessCount: note.summary?.excessCount || 0,
            overallScore: note.summary?.overallScore || overallScore
          },
          
          // Migrate nutrient gaps
          nutrient_gaps: note.nutrient_gaps,
          
          // Migrate food items
          selectedFoods: note.selectedFoods || [],
          
          // If originalFoods doesn't exist, use selectedFoods
          originalFoods: note.originalFoods || note.selectedFoods || [],
          additionalFoods: note.additionalFoods || [],
          
          // Generate nutrient comparisons if missing
          nutrientComparisons: note.nutrientComparisons || generateNutrientComparisons(
            note.nutrient_gaps,
            note.selectedFoods || []
          )
        };
        
        return migratedNote;
      } catch (error) {
        console.error('Error migrating note:', error);
        return null;
      }
    }).filter(Boolean) as NutritionalNote[]; // Remove null entries
    
    // Save migrated notes
    if (migratedNotes.length > 0) {
      storageService.setLocalItem(NOTES_STORAGE_KEY, migratedNotes);
    }
  }

  /**
   * Get all saved nutritional notes
   * @returns Array of nutritional notes, sorted by date (most recent first)
   */
  getAllNotes(): NutritionalNote[] {
    const savedNotes = storageService.getLocalItem<NutritionalNote[]>({ 
      key: NOTES_STORAGE_KEY, 
      defaultValue: [] 
    });
    
    const filteredNotes: NutritionalNote[] = Array.isArray(savedNotes) ? savedNotes.filter(isValidNote) : [];
    
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
  createNote(data: {
    childName: string;
    childGender: string;
    childAge?: string | number;
    nutrient_gaps: Record<string, NutrientInfo>;
    originalFoods?: FoodItem[];
    additionalFoods?: FoodItem[];
    selectedFoods?: FoodItem[];
    missingCount: number;
    excessCount: number;
    totalCalories?: number;
  }): NutritionalNote {
    const now = new Date();
    const id = uuidv4();
    
    // Determine the foods to use - preferring selectedFoods if provided
    const originalFoods = data.originalFoods || [];
    const additionalFoods = data.additionalFoods || [];
    
    // If selectedFoods is provided, use it; otherwise combine original and additional
    const foodsToUse = data.selectedFoods && data.selectedFoods.length > 0
      ? data.selectedFoods
      : [...originalFoods, ...additionalFoods];
    
    // Calculate nutrient comparisons
    const nutrientComparisons = generateNutrientComparisons(
      data.nutrient_gaps,
      foodsToUse
    );
    
    // Calculate the overall score
    const overallScore = calculateNutritionalScore(
      data.nutrient_gaps, 
      data.missingCount, 
      data.excessCount
    );
    
    // Create the note object
    const newNote: NutritionalNote = {
      id,
      childName: data.childName,
      childGender: data.childGender,
      childAge: data.childAge,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      
      // Nutritional data
      summary: {
        totalCalories: data.totalCalories || 0,
        missingCount: data.missingCount,
        excessCount: data.excessCount,
        overallScore,
      },
      nutrient_gaps: data.nutrient_gaps,
      
      // Food items
      originalFoods,
      additionalFoods,
      selectedFoods: foodsToUse,
      
      // Nutrient comparisons
      nutrientComparisons,
    };
    
    // Save the note
    const existingNotes = this.getAllNotes();
    storageService.setLocalItem(NOTES_STORAGE_KEY, [newNote, ...existingNotes]);
    
    return newNote;
  }
  
  /**
   * Update an existing note
   * @param id The ID of the note to update
   * @param data The data to update
   * @returns The updated note if found, or undefined
   */
  updateNote(id: string | number, data: Partial<NutritionalNote>): NutritionalNote | undefined {
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
    
    // If foods were updated, recalculate nutrient comparisons and update summary
    if (data.originalFoods || data.additionalFoods || data.selectedFoods) {
      // Determine which foods to use, preferring selectedFoods if provided
      const originalFoods = data.originalFoods || updatedNote.originalFoods || [];
      const additionalFoods = data.additionalFoods || updatedNote.additionalFoods || [];
      
      // If selectedFoods is provided, use it; otherwise combine original and additional
      const foodsToUse = data.selectedFoods && data.selectedFoods.length > 0
        ? data.selectedFoods
        : [...originalFoods, ...additionalFoods];
      
      // Update the foods in the note
      updatedNote.originalFoods = originalFoods;
      updatedNote.additionalFoods = additionalFoods;
      updatedNote.selectedFoods = foodsToUse;
          
      // Recalculate nutrient comparisons
      updatedNote.nutrientComparisons = generateNutrientComparisons(
        updatedNote.nutrient_gaps,
        foodsToUse
      );
      
      // Update the overall score
      updatedNote.summary.overallScore = calculateNutritionalScore(
        updatedNote.nutrient_gaps,
        updatedNote.summary.missingCount,
        updatedNote.summary.excessCount
      );
    }
    
    // If nutrient data was updated, recalculate the score
    if (data.nutrient_gaps || data.summary) {
      // Create a combined summary object
      const summary = {
        ...updatedNote.summary,
        ...(data.summary || {})
      };
      
      // Update summary in the note
      updatedNote.summary = summary;
      
      // Recalculate the score
      updatedNote.summary.overallScore = calculateNutritionalScore(
        updatedNote.nutrient_gaps,
        updatedNote.summary.missingCount,
        updatedNote.summary.excessCount
      );
    }
    
    // Save the updated notes
    notes[noteIndex] = updatedNote;
    storageService.setLocalItem(NOTES_STORAGE_KEY, notes);
    
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
    
    storageService.setLocalItem(NOTES_STORAGE_KEY, updatedNotes);
    return true;
  }
}

// Create a singleton instance
const noteService = new NoteService();

export default noteService; 