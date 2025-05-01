import { nutripeekApi } from '@/api/nutripeekApi';
import { NutrientGapResponse, NutrientGapRequest } from '@/api/types';
import { ChildProfile } from '@/types/profile';
import { NutritionalNote, calculateNutritionalScore } from '@/types/notes';
import { getFoodImageUrl } from '@/utils/assetHelpers';
import { mapNutrientNameToDbField, mapDbFieldToNutrientName } from '@/utils/nutritionMappings';
import storageService from '@/libs/StorageService';
import { ExtendedNutrientGap, FoodItem } from './types';
import noteService from '@/libs/NoteService';

const CHILDREN_KEY = 'user_children';

/**
 * Service for handling NutriRecommend data processing
 */
export const NutriRecommendService = {
  /**
   * Process the nutrient gap result and fetch recommended foods
   */
  async processNutrientGapResult(
    result: NutrientGapResponse, 
    childProfile: ChildProfile
  ): Promise<{
    missingNutrients: ExtendedNutrientGap[],
    totalEnergy: number | null
  }> {
    const totalEnergy = result.total_calories || 0;
    
    // Get missing nutrients
    const missingNutrientsArray = Object.entries(result.nutrient_gaps)
      .filter(([_, info]) => info.recommended_intake > 0 && info.current_intake / info.recommended_intake < 1)
      .map(([name, info]) => {
        const percentage = (info.current_intake / info.recommended_intake) * 100;
        return {
          name,
          gap: info.gap,
          unit: info.unit,
          recommended_intake: info.recommended_intake,
          current_intake: info.current_intake,
          percentage: percentage,
          updatedPercentage: percentage,
          recommendedFoods: []
        };
      });

    // Create a map of nutrient DB fields to their display names for quick lookup
    const missingNutrientFields = new Map<string, string>();
    missingNutrientsArray.forEach(nutrient => {
      const dbField = mapNutrientNameToDbField(nutrient.name);
      if (dbField) {
        missingNutrientFields.set(dbField, nutrient.name);
      }
    });

    // Fetch recommended foods for each missing nutrient
    const enrichedNutrients = await Promise.all(
      missingNutrientsArray.map(async (nutrient) => {
        const dbField = mapNutrientNameToDbField(nutrient.name);
        if (!dbField) return nutrient;

        try {
          const recommendedFoods = await nutripeekApi.getRecommendedFoods(dbField, 8);
          
          // Convert to FoodItem format
          const foodItems: FoodItem[] = recommendedFoods.map((food) => {
            // Create a complete nutrients map with all available nutrients
            const completeNutrients: Record<string, number> = {};
            
            // Initialize with the specific nutrient that was being searched for
            completeNutrients[nutrient.name] = food.nutrient_value;
            
            // Add all other nutrients from the food
            if (food.nutrients) {
              // Process each nutrient in the food
              Object.entries(food.nutrients).forEach(([dbFieldName, value]) => {
                // Try to find this nutrient in our missing nutrients list first
                if (missingNutrientFields.has(dbFieldName)) {
                  // Use the mapped display name we've already identified
                  const displayName = missingNutrientFields.get(dbFieldName);
                  if (displayName) {
                    completeNutrients[displayName] = value;
                  }
                } else {
                  // Try the generic mapping for nutrients not in our missing list
                  const displayName = mapDbFieldToNutrientName(dbFieldName);
                  if (displayName && missingNutrientsArray.some(n => n.name === displayName)) {
                    completeNutrients[displayName] = value;
                  }
                }
              });
            }
            
            return {
              id: food.id,
              name: food.food_name || food.food_category,
              category: food.food_category,
              imageUrl: getFoodImageUrl(food.food_category),
              nutrients: completeNutrients,
              selected: false,
              quantity: 1
            };
          });

          return {
            ...nutrient,
            recommendedFoods: foodItems
          };
        } catch (error) {
          console.error(`Failed to fetch recommendations for ${nutrient.name}:`, error);
          return nutrient;
        }
      })
    );

    // Store gap results in local storage for future reference
    // without creating a note
    storageService.setLocalItem('nutripeekGapResults', result);

    return {
      missingNutrients: enrichedNutrients,
      totalEnergy
    };
  },

  /**
   * Save selected foods - creates a new note with the selection
   * Also recalculates nutritional data with the combined foods
   */
  async saveSelectedFoods(selectedFoods: FoodItem[]): Promise<void> {
    if (selectedFoods.length === 0) return;
    
    // Get the stored gap results
    const storedResults = storageService.getLocalItem<NutrientGapResponse | null>({
      key: 'nutripeekGapResults',
      defaultValue: null
    });
    
    if (!storedResults) {
      console.error('Cannot save foods: No nutrient gap results found');
      return;
    }
    
    // Get the child profile
    const childProfile = this.getChildProfile(null);
    if (!childProfile) {
      console.error('Cannot save foods: No child profile found');
      return;
    }

    try {
      // Get the original ingredient IDs
      const originalIngredientIds = storageService.getLocalItem<string[]>({
        key: 'selectedIngredientIds',
        defaultValue: []
      }) || [];

      // Extract IDs from the selected (recommended) foods
      const recommendedFoodIds = selectedFoods.map(food => food.id);
      
      // Combine all ingredient IDs
      const allIngredientIds = [...originalIngredientIds, ...recommendedFoodIds];
      
      // Prepare API request 
      const apiGender = childProfile.gender.toLowerCase() === 'female' ? 'girl' : 'boy';
      
      // Call API to recalculate nutrient data with all ingredients
      const updatedResults = await nutripeekApi.calculateNutrientGap({
        child_profile: {
          age: parseInt(childProfile.age, 10),
          gender: apiGender
        },
        ingredient_ids: allIngredientIds
      });
      
      // Get missing and excess nutrient counts
      const missingCount = Object.keys(updatedResults.nutrient_gaps).filter(
        key => updatedResults.nutrient_gaps[key].current_intake / updatedResults.nutrient_gaps[key].recommended_intake < 1
      ).length;
      
      // Create a note with the updated nutritional data
      this.saveNutritionalNote(
        updatedResults, 
        childProfile, 
        selectedFoods,
        missingCount,
        updatedResults.excess_nutrients?.length ?? 0,
        updatedResults.total_calories
      );
    } catch (error) {
      console.error('Error recalculating nutritional data:', error);
      
      // Fallback: create note with existing data if recalculation fails
      const missingCount = Object.keys(storedResults.nutrient_gaps).filter(
        key => storedResults.nutrient_gaps[key].current_intake / storedResults.nutrient_gaps[key].recommended_intake < 1
      ).length;
      
      this.saveNutritionalNote(
        storedResults, 
        childProfile, 
        selectedFoods,
        missingCount,
        storedResults.excess_nutrients?.length ?? 0
      );
    }
  },

  /**
   * Save nutritional note to local storage
   * This is only called explicitly when the user chooses to save
   */
  saveNutritionalNote(
    result: NutrientGapResponse, 
    childProfile: ChildProfile, 
    selectedFoods: FoodItem[] = [],
    missingCount?: number,
    excessCount?: number,
    totalCalories?: number
  ): void {
    // Calculate the overall score for nutrition
    const overallScore = calculateNutritionalScore(
      result.nutrient_gaps, 
      missingCount || 0,
      excessCount || 0
    );
    
    // Use provided counts or calculate if not provided
    const actualMissingCount = missingCount !== undefined ? missingCount :
      Object.keys(result.nutrient_gaps).filter(
        key => result.nutrient_gaps[key].current_intake / result.nutrient_gaps[key].recommended_intake < 1
      ).length;
    
    const actualExcessCount = excessCount !== undefined ? excessCount :
      result.excess_nutrients?.length ?? 0;
      
    // Get original ingredient IDs for tracking original foods
    const originalIngredientIds = storageService.getLocalItem<string[]>({
      key: 'selectedIngredientIds',
      defaultValue: []
    }) || [];
    
    // Get originally scanned foods if available
    const scannedFoods = storageService.getLocalItem<FoodItem[]>({
      key: 'scannedFoods',
      defaultValue: []
    }) || [];
        
    // Process original foods to ensure they have unique IDs and proper names
    let originalFoods: FoodItem[] = [];
    
    if (scannedFoods.length > 0) {
      // Use scanned foods and ensure uniqueness
      originalFoods = scannedFoods.map((food, index) => ({
        ...food,
        // Ensure the id is unique by appending the index
        id: `${food.id}-original-${index}`
      }));
    } else {
      // Fallback to create placeholder foods with unique IDs if no scanned foods found
      // This should rarely happen after our fix, but keeping as fallback
      originalFoods = originalIngredientIds.map((id, index) => ({
        id: `${id}-original-${index}`, // Make ID unique with index suffix
        name: `Food ${index + 1}`,
        category: 'Unknown',
        imageUrl: '',
        nutrients: {},
        selected: false,
        quantity: 1
      }));
    }
    
    // Ensure additional foods have unique IDs too
    const processedAdditionalFoods = selectedFoods.map((food, index) => ({
      ...food,
      id: `${food.id}-additional-${index}`
    }));
    
    // Create note with all the data
    const noteData = {
      childName: childProfile.name,
      childGender: childProfile.gender,
      childAge: childProfile.age,
      nutrient_gaps: result.nutrient_gaps,
      missingCount: actualMissingCount,
      excessCount: actualExcessCount,
      totalCalories: totalCalories || result.total_calories,
      // Include foods
      originalFoods: originalFoods, // Original foods from scan with unique IDs
      additionalFoods: processedAdditionalFoods, // Foods selected from recommendations with unique IDs
      selectedFoods: [...originalFoods, ...processedAdditionalFoods] // All combined foods
    };
        
    // Use the noteService to create the note
    noteService.createNote(noteData);
  },

  /**
   * Get child profile from storage
   */
  getChildProfile(selectedChildId: number | null): ChildProfile | null {
    const childProfiles = storageService.getLocalItem({
      key: CHILDREN_KEY,
      defaultValue: []
    }) as ChildProfile[];

    if (!childProfiles.length) return null;

    const profileIndex = selectedChildId ?? 0;
    return childProfiles[profileIndex] || null;
  },

  /**
   * Process stored nutrient gap results from local storage
   */
  async processStoredResults(
    result: NutrientGapResponse, 
    selectedChildId: number | null
  ): Promise<{
    missingNutrients: ExtendedNutrientGap[], 
    totalEnergy: number | null,
    childProfile: ChildProfile | null
  }> {
    const childProfile = this.getChildProfile(selectedChildId);
    
    if (!childProfile) {
      return { missingNutrients: [], totalEnergy: null, childProfile: null };
    }
    
    const { missingNutrients, totalEnergy } = await this.processNutrientGapResult(result, childProfile);
    
    return { missingNutrients, totalEnergy, childProfile };
  }
};