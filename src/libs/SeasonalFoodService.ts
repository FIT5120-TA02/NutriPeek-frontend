import { v4 as uuidv4 } from 'uuid';
import storageService from './StorageService';
import { STORAGE_DEFAULTS, STORAGE_KEYS } from '@/types/storage';
import { SeasonalFood, SeasonalFoodData } from '@/types/seasonal';

/**
 * Service for managing pinned seasonal foods
 * Handles pinning, unpinning, and retrieving pinned foods
 */
export class SeasonalFoodService {
  /**
   * Get all pinned seasonal foods
   * @returns Array of pinned seasonal foods, sorted by date (most recent first)
   */
  getAllPinnedFoods(): SeasonalFood[] {
    const pinnedFoods = storageService.getLocalItem<SeasonalFood[]>({
      key: STORAGE_KEYS.PINNED_SEASONAL_FOODS,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.PINNED_SEASONAL_FOODS]
    });
    
    const filteredFoods: SeasonalFood[] = Array.isArray(pinnedFoods) ? pinnedFoods.filter(this.isValidSeasonalFood) : [];
    
    // Sort by date (newest first)
    return filteredFoods.sort((a, b) => {
      const dateA = new Date(a.pinnedAt).getTime();
      const dateB = new Date(b.pinnedAt).getTime();
      return dateB - dateA;
    });
  }
  
  /**
   * Check if a food is already pinned
   * @param id The ID of the food to check
   * @returns True if the food is pinned, false otherwise
   */
  isSeasonalFoodPinned(id: string): boolean {
    const pinnedFoods = this.getAllPinnedFoods();
    return pinnedFoods.some(food => food.id === id);
  }
  
  /**
   * Pin a seasonal food
   * @param data Food data without ID and timestamp
   * @returns The pinned food with ID and timestamp
   */
  pinSeasonalFood(data: SeasonalFoodData): SeasonalFood {
    // Check if the food is already pinned (by name as fallback if no ID)
    const existingFoods = this.getAllPinnedFoods();
    const existingFood = existingFoods.find(food => 
      (data as any).id ? food.id === (data as any).id : food.name === data.name
    );
    
    if (existingFood) {
      return existingFood;
    }
    
    // Create the pinned food object
    const now = new Date();
    const id = (data as any).id || uuidv4();
    
    const pinnedFood: SeasonalFood = {
      id,
      name: data.name,
      image: data.image,
      description: data.description,
      seasons: data.seasons,
      pinnedAt: now.toISOString(),
      region: data.region,
      nutritionalInfo: data.nutritionalInfo,
    };
    
    // Save the pinned food
    storageService.setLocalItem<SeasonalFood[]>(
      STORAGE_KEYS.PINNED_SEASONAL_FOODS, 
      [pinnedFood, ...existingFoods]
    );
    
    return pinnedFood;
  }
  
  /**
   * Unpin a seasonal food by ID
   * @param id The ID of the food to unpin
   * @returns True if the food was unpinned, false if not found
   */
  unpinSeasonalFood(id: string): boolean {
    const pinnedFoods = this.getAllPinnedFoods();
    const updatedFoods = pinnedFoods.filter(food => food.id !== id);
    
    if (updatedFoods.length === pinnedFoods.length) {
      return false;
    }
    
    storageService.setLocalItem<SeasonalFood[]>(
      STORAGE_KEYS.PINNED_SEASONAL_FOODS, 
      updatedFoods
    );
    
    return true;
  }
  
  /**
   * Clear all pinned seasonal foods
   * @returns True if foods were successfully cleared
   */
  clearAllPinnedFoods(): boolean {
    try {
      storageService.setLocalItem<SeasonalFood[]>(STORAGE_KEYS.PINNED_SEASONAL_FOODS, []);
      return true;
    } catch (error) {
      console.error('Error clearing pinned seasonal foods:', error);
      return false;
    }
  }
  
  /**
   * Type guard to check if an object is a valid SeasonalFood
   */
  isValidSeasonalFood(food: any): food is SeasonalFood {
    return (
      food &&
      typeof food.id === 'string' &&
      typeof food.name === 'string' &&
      typeof food.pinnedAt === 'string' &&
      Array.isArray(food.seasons)
    );
  }
}

// Create a singleton instance
const seasonalFoodService = new SeasonalFoodService();

export default seasonalFoodService; 