import { nutripeekApi } from '@/api/nutripeekApi';
import { NutrientGapResponse, ChildEnergyRequirementsResponse, type ActivityResult, type ActivityEntry, type NutrientInfo, OptimizedFoodRecommendation, RecommendationType, FoodRecommendation } from '@/api/types';
import { ChildProfile } from '@/types/profile';
import { getFoodImageUrl } from '@/utils/assetHelpers';
import { mapNutrientNameToDbField, mapDbFieldToNutrientName } from '@/utils/nutritionMappings';
import storageService from '@/libs/StorageService';
import { ExtendedNutrientGap } from './types';
import { FoodItem, type NutritionalNoteData } from '@/types/notes';
import noteService from '@/libs/NoteService';
import { STORAGE_KEYS, STORAGE_DEFAULTS } from '@/types/storage';
import { NutrientComparison } from '@/types/notes';

const RECOMMENDED_FOODS_LIMIT = 8;

/**
 * Service for handling NutriRecommend data processing
 */
export const NutriRecommendService = {
  /**
   * Process the nutrient gap result and fetch recommended foods
   */
  async processNutrientGapResult(
    result: NutrientGapResponse, 
  ): Promise<{
    missingNutrients: ExtendedNutrientGap[],
    totalEnergy: number | null
  }> {
    const totalEnergy = result.total_calories || 0;
    
    // Apply energy requirements adjustment if available
    const energyRequirements = storageService.getLocalItem<ChildEnergyRequirementsResponse | null>({
      key: STORAGE_KEYS.ENERGY_REQUIREMENTS,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ENERGY_REQUIREMENTS]
    });
    
    let adjustedResult = { ...result };
    
    // If we have energy requirements that are higher than the base recommendation,
    // adjust the energy nutrient target in the result
    if (energyRequirements) {
      const energyNutrientKey = Object.keys(result.nutrient_gaps).find(key => 
        key.toLowerCase().includes('energy')
      );
      
      if (energyNutrientKey) {
        const baseEnergy = result.nutrient_gaps[energyNutrientKey];
        const adjustedTarget = energyRequirements.estimated_energy_requirement;
        
        // Only adjust if the estimated requirement is higher
        if (adjustedTarget > baseEnergy.recommended_intake) {
          adjustedResult = {
            ...result,
            nutrient_gaps: {
              ...result.nutrient_gaps,
              [energyNutrientKey]: {
                ...baseEnergy,
                recommended_intake: adjustedTarget,
                gap: Math.max(0, adjustedTarget - baseEnergy.current_intake),
                // Mark this as adjusted so UI can show it appropriately
                isAdjustedForActivity: true
              }
            }
          };
        }
      }
    }
    
    // Get missing nutrients from the potentially adjusted result
    // Exclude alcohol and caffeine from nutrition improvements display
    const missingNutrientsArray = Object.entries(adjustedResult.nutrient_gaps)
      .filter(([name, info]) => {
        // Exclude alcohol and caffeine from nutrition improvements
        if (name === 'Alcohol(d)' || name === 'Caffeine') {
          return false;
        }
        return info.recommended_intake > 0 && info.current_intake / info.recommended_intake < 1;
      })
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
          isAdjustedForActivity: (info as any).isAdjustedForActivity || false,
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
          const recommendedFoods = await nutripeekApi.getRecommendedFoods(dbField, RECOMMENDED_FOODS_LIMIT);
          
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
    // without creating a note - store the adjusted result
    storageService.setLocalItem<NutrientGapResponse>(STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS, adjustedResult);

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
      key: STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS]
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
        key: STORAGE_KEYS.SELECTED_INGREDIENT_IDS,
        defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.SELECTED_INGREDIENT_IDS]
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
      
      // Create a note with the updated nutritional data
      this.saveNutritionalNote(
        updatedResults, 
        childProfile, 
        selectedFoods,
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
    additionalFoods: FoodItem[] = [],
  ): void {    
    // Get originally scanned foods if available
    const originalFoods = storageService.getLocalItem<FoodItem[]>({
      key: STORAGE_KEYS.SCANNED_FOODS,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.SCANNED_FOODS]
    }) || [];

    // Get activity results if available
    const activityResult = storageService.getLocalItem<ActivityResult | null>({
      key: STORAGE_KEYS.ACTIVITY_RESULT,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ACTIVITY_RESULT]
    }) || null;

    // Get activity PAL if available
    const activityPAL = storageService.getLocalItem<number | null>({
      key: STORAGE_KEYS.ACTIVITY_PAL,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ACTIVITY_PAL]
    }) || null;

    // Get selected activities if available
    const selectedActivities = storageService.getLocalItem<ActivityEntry[]>({
      key: STORAGE_KEYS.SELECTED_ACTIVITIES,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.SELECTED_ACTIVITIES]
    }) || [];

    // Get energy requirements if available
    const energyRequirements = storageService.getLocalItem<ChildEnergyRequirementsResponse | null>({
      key: STORAGE_KEYS.ENERGY_REQUIREMENTS,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ENERGY_REQUIREMENTS]
    }) || null;
    
    // Create note data with all the data
    const noteData: NutritionalNoteData = {
      childName: childProfile.name,
      childGender: childProfile.gender,
      childAge: childProfile.age,

      // Nutritional data
      nutrient_gaps: result,

      // Include foods
      originalFoods: originalFoods, // Original foods from scan
      additionalFoods: additionalFoods, // Foods selected from recommendations

      // Nutrient comparisons (showing before/after values)
      nutrientComparisons: this.calculateGapSummary(result.nutrient_gaps, originalFoods, additionalFoods) || undefined,

      // Activity data
      activityResult: activityResult || undefined,
      activityPAL: activityPAL || undefined,
      selectedActivities: selectedActivities || undefined,

      // Energy requirements
      energyRequirements: energyRequirements || undefined
    };
    
    // Check if we're updating an existing note
    const activeNoteId = storageService.getLocalItem<string | null>({
      key: STORAGE_KEYS.ACTIVE_NOTE_ID,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ACTIVE_NOTE_ID]
    });
    
    if (activeNoteId) {
      // Update the existing note
      const updatedNote = noteService.updateNote(activeNoteId, noteData);
      
      // If the update fails (note doesn't exist anymore), create a new note
      if (!updatedNote) {
        noteService.createNote(noteData);
      }
      
      // Clear the active note ID after saving
      storageService.removeLocalItem(STORAGE_KEYS.ACTIVE_NOTE_ID);
    } else {
      // Create a new note if there's no active note ID
      noteService.createNote(noteData);
    }

    // Clear the local storage
    this.cleanLocalStorage();
  },

  /**
   * Get child profile from storage
   */
  getChildProfile(selectedChildId: number | null): ChildProfile | null {
    const childProfiles = storageService.getLocalItem<ChildProfile[]>({
      key: STORAGE_KEYS.CHILDREN_PROFILES,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.CHILDREN_PROFILES]
    }) as ChildProfile[];

    if (!childProfiles.length) return null;

    const profileIndex = selectedChildId ?? 0;
    return childProfiles[profileIndex] || null;
  },

  /**
   * Calculates a summary of how selected foods impact nutrient gaps
   * Shows nutrient information before and after adding selected foods
   * 
   * @param note Note data with food and nutrient information
   * @returns Object with total percentage met and detailed comparisons
   */
  calculateGapSummary(nutrient_gaps: Record<string, NutrientInfo>, originalFoods: FoodItem[], additionalFoods: FoodItem[]): NutrientComparison[] {
    // Calculate nutrients added from all selected foods
    const addedNutrients: Record<string, number> = {};
    
    // Use the foods list in priority: selectedFoods > (originalFoods + additionalFoods) > empty
    const foodsToProcess = [...(originalFoods || []), ...(additionalFoods || [])];
    
    // Calculate total added nutrients from all foods
    foodsToProcess.forEach((food) => {
      if (food.nutrients) {
        for (const [nutrient, value] of Object.entries(food.nutrients)) {
          // Multiple by quantity if available
          const actualValue = food.quantity ? value * food.quantity : value;
          addedNutrients[nutrient] = (addedNutrients[nutrient] || 0) + actualValue;
        }
      }
    });

    // Create comparison data for each nutrient
    const comparison: NutrientComparison[] = Object.entries(nutrient_gaps).map(([name, info]) => {
      const added = addedNutrients[name] || 0;
      const beforeValue = info.current_intake;
      const afterValue = beforeValue + added;
      const recommendedValue = info.recommended_intake;
      
      const percentBefore = recommendedValue > 0 
        ? Math.min(100, (beforeValue / recommendedValue) * 100) 
        : 0;
        
      const percentAfter = recommendedValue > 0 
        ? Math.min(100, (afterValue / recommendedValue) * 100) 
        : 0;

      return {
        name,
        unit: info.unit,
        beforeValue,
        afterValue,
        recommendedValue,
        percentBefore,
        percentAfter,
        added,
      };
    });
    
    // Sort comparison by the percentage improvement (descending)
    comparison.sort((a, b) => {
      // Calculate percentage improvement for each
      const improvementA = a.percentAfter - a.percentBefore;
      const improvementB = b.percentAfter - b.percentBefore;
      return improvementB - improvementA;
    });

    return comparison;
  },

  /**
   * Process the nutrient gap result and fetch optimized food recommendations
   * This provides recommendations that help fill specific nutrient gaps with optimized amounts
   */
  async processOptimizedFoodResults(
    result: NutrientGapResponse,
  ): Promise<{
    missingNutrients: ExtendedNutrientGap[],
    totalEnergy: number | null
  }> {
    const totalEnergy = result.total_calories || 0;
    
    // Apply energy requirements adjustment if available
    const energyRequirements = storageService.getLocalItem<ChildEnergyRequirementsResponse | null>({
      key: STORAGE_KEYS.ENERGY_REQUIREMENTS,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ENERGY_REQUIREMENTS]
    });
    
    let adjustedResult = { ...result };
    
    // If we have energy requirements that are higher than the base recommendation,
    // adjust the energy nutrient target in the result
    if (energyRequirements) {
      const energyNutrientKey = Object.keys(result.nutrient_gaps).find(key => 
        key.toLowerCase().includes('energy')
      );
      
      if (energyNutrientKey) {
        const baseEnergy = result.nutrient_gaps[energyNutrientKey];
        const adjustedTarget = energyRequirements.estimated_energy_requirement;
        
        // Only adjust if the estimated requirement is higher
        if (adjustedTarget > baseEnergy.recommended_intake) {
          adjustedResult = {
            ...result,
            nutrient_gaps: {
              ...result.nutrient_gaps,
              [energyNutrientKey]: {
                ...baseEnergy,
                recommended_intake: adjustedTarget,
                gap: Math.max(0, adjustedTarget - baseEnergy.current_intake),
                // Mark this as adjusted so UI can show it appropriately
                isAdjustedForActivity: true
              }
            }
          };
        }
      }
    }
    
    // Get missing nutrients from the potentially adjusted result
    const missingNutrientsArray = Object.entries(adjustedResult.nutrient_gaps)
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
          isAdjustedForActivity: (info as any).isAdjustedForActivity || false,
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

    // Fetch optimized food recommendations for each missing nutrient
    const enrichedNutrients = await Promise.all(
      missingNutrientsArray.map(async (nutrient) => {
        const dbField = mapNutrientNameToDbField(nutrient.name);
        if (!dbField) return nutrient;

        try {
          // Get recommendations for this nutrient with optimized amounts
          const optimizedRecommendations: FoodItem[] = [];
          
          // Get optimized foods for this nutrient directly, without specifying food categories
          const optimizedFoods = await nutripeekApi.getOptimizedFoodRecommendations({
            nutrient_name: dbField,
            target_amount: nutrient.recommended_intake,
            current_amount: nutrient.current_intake,
            limit: RECOMMENDED_FOODS_LIMIT
          });
          
          // Convert to FoodItem format
          const foodItems: FoodItem[] = optimizedFoods.map((food) => {
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
                    completeNutrients[displayName] = value as number;
                  }
                } else {
                  // Try the generic mapping for nutrients not in our missing list
                  const displayName = mapDbFieldToNutrientName(dbFieldName);
                  if (displayName && missingNutrientsArray.some(n => n.name === displayName)) {
                    completeNutrients[displayName] = value as number;
                  }
                }
              });
            }
            
            return {
              id: food.id,
              name: `${food.food_name} (${Math.round(food.amount_needed)}g)`,
              category: food.food_category,
              imageUrl: getFoodImageUrl(food.food_category),
              nutrients: completeNutrients,
              selected: false,
              quantity: 1,
              // Add optimized food specific properties
              amount_needed: food.amount_needed,
              gap_satisfaction_percentage: food.gap_satisfaction_percentage
            };
          });
          
          optimizedRecommendations.push(...foodItems);
          
          // Sort by gap satisfaction percentage (descending)
          optimizedRecommendations.sort((a, b) => {
            const aPercent = (a as any).gap_satisfaction_percentage ?? 0;
            const bPercent = (b as any).gap_satisfaction_percentage ?? 0;
            return bPercent - aPercent;
          });
          
          // Limit to recommended number of foods per nutrient
          const limitedRecommendations = optimizedRecommendations.slice(0, RECOMMENDED_FOODS_LIMIT);

          return {
            ...nutrient,
            recommendedFoods: limitedRecommendations
          };
        } catch (error) {
          console.error(`Failed to fetch optimized recommendations for ${nutrient.name}:`, error);
          return nutrient;
        }
      })
    );

    // Store gap results in local storage for future reference
    // without creating a note - store the adjusted result
    storageService.setLocalItem<NutrientGapResponse>(STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS, adjustedResult);

    return {
      missingNutrients: enrichedNutrients,
      totalEnergy
    };
  },

  /**
   * Process the nutrient gap result and fetch seasonal food recommendations
   * This provides recommendations for foods that are in season and rich in the missing nutrients
   */
  async processSeasonalFoodResults(
    result: NutrientGapResponse,
    region?: string,
  ): Promise<{
    missingNutrients: ExtendedNutrientGap[],
    totalEnergy: number | null
  }> {
    const totalEnergy = result.total_calories || 0;
    
    // Apply energy requirements adjustment if available
    const energyRequirements = storageService.getLocalItem<ChildEnergyRequirementsResponse | null>({
      key: STORAGE_KEYS.ENERGY_REQUIREMENTS,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ENERGY_REQUIREMENTS]
    });
    
    let adjustedResult = { ...result };
    
    // If we have energy requirements that are higher than the base recommendation,
    // adjust the energy nutrient target in the result
    if (energyRequirements) {
      const energyNutrientKey = Object.keys(result.nutrient_gaps).find(key => 
        key.toLowerCase().includes('energy')
      );
      
      if (energyNutrientKey) {
        const baseEnergy = result.nutrient_gaps[energyNutrientKey];
        const adjustedTarget = energyRequirements.estimated_energy_requirement;
        
        // Only adjust if the estimated requirement is higher
        if (adjustedTarget > baseEnergy.recommended_intake) {
          adjustedResult = {
            ...result,
            nutrient_gaps: {
              ...result.nutrient_gaps,
              [energyNutrientKey]: {
                ...baseEnergy,
                recommended_intake: adjustedTarget,
                gap: Math.max(0, adjustedTarget - baseEnergy.current_intake),
                // Mark this as adjusted so UI can show it appropriately
                isAdjustedForActivity: true
              }
            }
          };
        }
      }
    }
    
    // Get missing nutrients from the potentially adjusted result
    // Exclude alcohol and caffeine from nutrition improvements display
    const missingNutrientsArray = Object.entries(adjustedResult.nutrient_gaps)
      .filter(([name, info]) => {
        // Exclude alcohol and caffeine from nutrition improvements
        if (name === 'Alcohol(d)' || name === 'Caffeine') {
          return false;
        }
        return info.recommended_intake > 0 && info.current_intake / info.recommended_intake < 1;
      })
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
          isAdjustedForActivity: (info as any).isAdjustedForActivity || false,
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

    // Get the current month for seasonal food recommendations
    const currentMonth = new Date().toLocaleString('en-AU', { month: 'long' }).toLowerCase();
    // Use the provided region or get from storage, or default to Australia
    const selectedRegion = region || this.getSelectedRegion() || 'australia';

    // Fetch seasonal food recommendations for each missing nutrient
    const enrichedNutrients = await Promise.all(
      missingNutrientsArray.map(async (nutrient) => {
        const dbField = mapNutrientNameToDbField(nutrient.name);
        if (!dbField) return nutrient;

        try {
          // Call the new seasonal food recommendation endpoint
          const seasonalFoods = await nutripeekApi.getSeasonalFoodRecommendations({
            nutrient_name: dbField,
            region: selectedRegion,
            month: currentMonth,
            limit: RECOMMENDED_FOODS_LIMIT
          });
          
          // Convert to FoodItem format
          const foodItems: FoodItem[] = seasonalFoods.map((food: FoodRecommendation) => {
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
                    completeNutrients[displayName] = value as number;
                  }
                } else {
                  // Try the generic mapping for nutrients not in our missing list
                  const displayName = mapDbFieldToNutrientName(dbFieldName);
                  if (displayName && missingNutrientsArray.some(n => n.name === displayName)) {
                    completeNutrients[displayName] = value as number;
                  }
                }
              });
            }
            
            // Add a seasonal indicator to the food name
            return {
              id: food.id,
              name: `${food.food_name} (Seasonal)`,
              category: food.food_category,
              imageUrl: getFoodImageUrl(food.food_category),
              nutrients: completeNutrients,
              selected: false,
              quantity: 1,
              isSeasonal: true
            };
          });

          return {
            ...nutrient,
            recommendedFoods: foodItems
          };
        } catch (error) {
          console.error(`Failed to fetch seasonal recommendations for ${nutrient.name}:`, error);
          return nutrient;
        }
      })
    );

    // Store gap results in local storage for future reference
    storageService.setLocalItem<NutrientGapResponse>(STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS, adjustedResult);

    return {
      missingNutrients: enrichedNutrients,
      totalEnergy
    };
  },

  /**
   * Store the selected region for seasonal food recommendations
   * @param region The region to store
   */
  saveSelectedRegion(region: string): void {
    storageService.setLocalItem<string>(STORAGE_KEYS.SELECTED_REGION, region);
  },
  
  /**
   * Get the currently selected region for seasonal food recommendations
   * @returns The selected region or undefined if not set
   */
  getSelectedRegion(): string | undefined {
    const region = storageService.getLocalItem<string | null>({
      key: STORAGE_KEYS.SELECTED_REGION,
      defaultValue: null
    });
    
    return region || undefined;
  },
  
  /**
   * Check if a region has been selected for seasonal food recommendations
   * @returns True if a region has been selected
   */
  hasSelectedRegion(): boolean {
    return !!this.getSelectedRegion();
  },

  /**
   * Process stored results with a specific recommendation type
   * This method ensures the correct processing function is called for each recommendation type
   * and provides comprehensive error handling and logging for debugging
   */
  async processStoredResultsWithType(
    result: NutrientGapResponse, 
    selectedChildId: number | null,
    recommendationType: RecommendationType = RecommendationType.STANDARD,
    region?: string
  ): Promise<{
    missingNutrients: ExtendedNutrientGap[], 
    totalEnergy: number | null,
    childProfile: ChildProfile | null
  }> {
    console.log(`[NutriRecommendService] Processing stored results with type: ${recommendationType}`, {
      region,
      selectedChildId,
      hasNutrientGaps: !!result.nutrient_gaps
    });

    const childProfile = this.getChildProfile(selectedChildId);
    
    if (!childProfile) {
      console.warn('[NutriRecommendService] No child profile found');
      return {
        missingNutrients: [],
        totalEnergy: null,
        childProfile: null
      };
    }
    
    // Apply energy requirements adjustment if available
    const energyRequirements = storageService.getLocalItem<ChildEnergyRequirementsResponse | null>({
      key: STORAGE_KEYS.ENERGY_REQUIREMENTS,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ENERGY_REQUIREMENTS]
    });
    
    let adjustedResult = { ...result };
    
    // If we have energy requirements that are higher than the base recommendation,
    // adjust the energy nutrient target in the result
    if (energyRequirements) {
      const energyNutrientKey = Object.keys(result.nutrient_gaps).find(key => 
        key.toLowerCase().includes('energy')
      );
      
      if (energyNutrientKey) {
        const baseEnergy = result.nutrient_gaps[energyNutrientKey];
        const adjustedTarget = energyRequirements.estimated_energy_requirement;
        
        // Only adjust if the estimated requirement is higher
        if (adjustedTarget > baseEnergy.recommended_intake) {
          adjustedResult = {
            ...result,
            nutrient_gaps: {
              ...result.nutrient_gaps,
              [energyNutrientKey]: {
                ...baseEnergy,
                recommended_intake: adjustedTarget,
                gap: Math.max(0, adjustedTarget - baseEnergy.current_intake),
                // Mark this as adjusted so UI can show it appropriately
                isAdjustedForActivity: true
              }
            }
          };
          console.log(`[NutriRecommendService] Adjusted energy requirements from ${baseEnergy.recommended_intake} to ${adjustedTarget}`);
        }
      }
    }

    // Process the nutrient gap with the selected recommendation type
    let processResult;
    try {
      switch (recommendationType) {
        case RecommendationType.OPTIMIZED:
          console.log('[NutriRecommendService] Processing optimized food results');
          processResult = await this.processOptimizedFoodResults(adjustedResult);
          break;
        case RecommendationType.SEASONAL:
          // Use provided region or get from storage
          const selectedRegion = region || this.getSelectedRegion();
          console.log(`[NutriRecommendService] Processing seasonal food results for region: ${selectedRegion}`);
          
          if (!selectedRegion) {
            console.warn('[NutriRecommendService] No region available for seasonal recommendations, falling back to standard');
            processResult = await this.processNutrientGapResult(adjustedResult);
          } else {
            processResult = await this.processSeasonalFoodResults(adjustedResult, selectedRegion);
          }
          break;
        case RecommendationType.STANDARD:
        default:
          console.log('[NutriRecommendService] Processing standard food results');
          processResult = await this.processNutrientGapResult(adjustedResult);
          break;
      }
    } catch (error) {
      console.error(`[NutriRecommendService] Error processing ${recommendationType} recommendations:`, error);
      // Fallback to standard processing if there's an error
      console.log('[NutriRecommendService] Falling back to standard processing due to error');
      processResult = await this.processNutrientGapResult(adjustedResult);
    }
    
    const { missingNutrients, totalEnergy } = processResult;
    
    console.log(`[NutriRecommendService] Successfully processed ${missingNutrients.length} missing nutrients with ${recommendationType} type`);
    
    return {
      missingNutrients,
      totalEnergy,
      childProfile
    };
  },

  /**
   * Process stored results when the page is loaded from localStorage
   * Uses the standard recommendation type by default
   */
  async processStoredResults(
    result: NutrientGapResponse, 
    selectedChildId: number | null
  ): Promise<{
    missingNutrients: ExtendedNutrientGap[], 
    totalEnergy: number | null,
    childProfile: ChildProfile | null
  }> {
    return this.processStoredResultsWithType(result, selectedChildId, RecommendationType.STANDARD);
  },

  /**
   * Clean local storage
   */
  cleanLocalStorage() {
    storageService.removeLocalItem(STORAGE_KEYS.SELECTED_INGREDIENT_IDS);
    storageService.removeLocalItem(STORAGE_KEYS.SCANNED_FOODS);
    storageService.removeLocalItem(STORAGE_KEYS.RECOMMENDED_FOOD_IDS);
    storageService.removeLocalItem(STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS);
    storageService.removeLocalItem(STORAGE_KEYS.ENERGY_REQUIREMENTS);
    storageService.removeLocalItem(STORAGE_KEYS.ACTIVITY_RESULT);
    storageService.removeLocalItem(STORAGE_KEYS.ACTIVITY_PAL);
    storageService.removeLocalItem(STORAGE_KEYS.SELECTED_ACTIVITIES);
    storageService.removeLocalItem(STORAGE_KEYS.ACTIVE_NOTE_ID);
  }
};