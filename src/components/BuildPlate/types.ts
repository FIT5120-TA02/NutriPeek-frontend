/**
 * Type definitions for BuildPlate components
 */

/**
 * Valid food categories for the sectioned plate
 */
export type FoodCategory = 'protein' | 'carbs' | 'extras' | 'section';

/**
 * Nutrient information for a food item
 */
export interface NutrientInfo {
  energy_kj?: number;
  protein_g?: number;
  fat_g?: number;
  carbohydrate_g?: number;
  sugars_g?: number;
  fiber_g?: number;
}

/**
 * Base food item data for the Build a Plate feature
 */
export interface PlateFood {
  id: string;
  instanceId: string; // Unique identifier for each instance of the food on the plate
  name: string;
  category: FoodCategory;
  nutrients: NutrientInfo;
  imageUrl: string;
}

/**
 * Food item with position information when placed on the plate
 */
export interface PlacedFood extends PlateFood {
  position: { x: number; y: number };
  sectionId: string; // The section ID where this food is placed
  readOnly?: boolean; // Whether the food item is in read-only mode
}

/**
 * Represents a plate section and its associated foods
 */
export interface PlateSection {
  id: string;
  name: string;
  type: FoodCategory;
  title: string;
  description?: string;
  // Position and dimensions of the section within the plate
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Nutritional summary for the entire plate
 */
export interface PlateSummary {
  totalEnergy: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalFibre: number;
  nutritionScore: number; // 0-100 score based on balance
}

/**
 * Avatar emotion types for feedback
 */
export type AvatarEmotion = 'happy' | 'neutral' | 'sad';

/**
 * Feedback level for the plate composition
 */
export type FeedbackLevel = 'poor' | 'average' | 'good' | 'excellent';

/**
 * Grouped foods by category
 */
export interface CategoryFoods {
  protein: PlacedFood[];
  carbs: PlacedFood[];
  extras: PlacedFood[];
}

/**
 * Props for DraggableFoodItem component
 */
export interface DraggableFoodItemProps {
  food: PlateFood;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, food: PlateFood) => void;
  showTooltip?: boolean;
}

/**
 * Props for the FoodGrid component
 */
export interface FoodGridProps {
  foods: PlateFood[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, food: PlateFood) => void;
  title?: string;
  loading?: boolean;
}

/**
 * Props for Food Palette component
 */
export interface FoodPaletteProps {
  foods: PlateFood[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, food: PlateFood) => void;
  loading?: boolean;
}

/**
 * Props for Sectioned Plate component
 */
export interface SectionedPlateProps {
  selectedFoods: CategoryFoods;
  plateSections: PlateSection[];
  onRemoveFood: (foodInstanceId: string, section: string) => void;
  onFoodPositioned?: (foodInstanceId: string, position: { x: number, y: number }, sectionId: string) => void;
  readOnly?: boolean;
} 