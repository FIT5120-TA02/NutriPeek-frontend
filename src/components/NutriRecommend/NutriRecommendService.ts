import { nutripeekApi } from '@/api/nutripeekApi';
import { NutrientGapResponse } from '@/api/types';
import { ChildProfile } from '@/types/profile';
import { NutritionalNote } from '@/types/notes';
import { getFoodImageUrl } from '@/utils/assetHelpers';
import { mapNutrientNameToDbField, mapDbFieldToNutrientName } from '@/utils/nutritionMappings';
import storageService from '@/libs/StorageService';
import { ExtendedNutrientGap, FoodItem } from './types';

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

    // Save a nutritional note
    NutriRecommendService.saveNutritionalNote(result, childProfile);

    return {
      missingNutrients: enrichedNutrients,
      totalEnergy
    };
  },

  /**
   * Save nutritional note to local storage
   */
  saveNutritionalNote(result: NutrientGapResponse, childProfile: ChildProfile): void {
    const previousNotes = storageService.getLocalItem({
      key: 'nutri_notes',
      defaultValue: [],
    }) as NutritionalNote[];

    const newNote: NutritionalNote = {
      id: Date.now(),
      childName: childProfile.name,
      childGender: childProfile.gender,
      summary: {
        totalCalories: result.total_calories,
        missingCount: Object.keys(result.nutrient_gaps).filter(
          key => result.nutrient_gaps[key].current_intake / result.nutrient_gaps[key].recommended_intake < 1
        ).length,
        excessCount: result.excess_nutrients?.length ?? 0,
      },
      nutrient_gaps: result.nutrient_gaps,
      selectedFoods: [],
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [...previousNotes, newNote];
    storageService.setLocalItem('nutri_notes', updatedNotes);
  },

  /**
   * Save selected foods to the latest nutritional note
   */
  saveSelectedFoods(selectedFoods: FoodItem[]): void {
    if (selectedFoods.length === 0) return;
    
    const notes = storageService.getLocalItem({
      key: 'nutri_notes',
      defaultValue: [],
    }) as NutritionalNote[];
    
    if (notes.length > 0) {
      const latestNote = notes[notes.length - 1];
      latestNote.selectedFoods = selectedFoods.map(food => ({
        id: food.id,
        name: food.name,
        imageUrl: food.imageUrl,
        nutrients: food.nutrients
      }));
      
      storageService.setLocalItem('nutri_notes', notes);
    }
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