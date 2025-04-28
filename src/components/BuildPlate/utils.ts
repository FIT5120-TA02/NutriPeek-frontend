/**
 * Utility functions for the Build Plate feature
 */
import { 
  PlateFood, 
  PlacedFood, 
  PlateSummary, 
  FoodCategory,
  AvatarEmotion,
  PlateSection,
  type NutrientInfo
} from './types';
import { DEFAULT_NUTRITION_TARGETS, DEFAULT_FOODS } from './constants';
import { getFoodImageUrl } from '@/utils/assetHelpers';
import { type FoodCategoryAvgNutrients } from '@/api/types';

/**
 * Transforms API category data to food items for the Build Plate feature
 */
export function transformCategoryDataToFoods(categories: FoodCategoryAvgNutrients[]): PlateFood[] {
  const result: PlateFood[] = [];
  
  // Map food categories to our internal food types
  const categoryMapping: Record<string, FoodCategory> = {
    // Protein foods
    'meat': 'protein',
    'poultry': 'protein',
    'fish': 'protein',
    'eggs': 'protein',
    'dairy': 'protein',
    'legumes': 'protein',
    'nuts': 'protein',
    'tofu': 'protein',
    
    // Carbohydrate foods
    'grains': 'carbs',
    'bread': 'carbs',
    'pasta': 'carbs',
    'rice': 'carbs',
    'cereals': 'carbs',
    'potato': 'carbs',
    'starchy': 'carbs',
    
    // Fruits and vegetables
    'fruit': 'extras',
    'vegetable': 'extras',
    'berries': 'extras',
    'leafy': 'extras',
    'citrus': 'extras'
  };
  
  // Process each category from the API
  categories.forEach((category, index) => {
    // Skip categories with missing essential data
    if (!category.food_category) return;
    
    // Determine the food category based on the name
    let foodCategory: FoodCategory = 'extras'; // Default to extras
    
    const categoryName = category.food_category.toLowerCase();
    
    // Try to match the category name to one of our mappings
    for (const [key, value] of Object.entries(categoryMapping)) {
      if (categoryName.includes(key)) {
        foodCategory = value;
        break;
      }
    }
    
    // Create a food item for this category
    result.push({
      id: `food-${index}`,
      instanceId: `food-instance-${index}-${Date.now()}`, // Add unique instanceId
      name: category.food_category,
      category: foodCategory,
      imageUrl: getFoodImageUrl(category.food_category),
      nutrients: {
        energy_kj: category.energy_with_fibre_kj || 0,
        protein_g: category.protein_g || 0,
        fat_g: category.total_fat_g || 0,
        carbohydrate_g: category.carbs_with_sugar_alcohols_g || 0,
        fiber_g: category.dietary_fibre_g || 0,
      }
    });
  });
  
  // Ensure we have some foods in each category
  ensureMinimumFoodsInEachCategory(result);
  
  return result;
}

/**
 * Ensure we have minimum foods in each category
 */
function ensureMinimumFoodsInEachCategory(foods: PlateFood[], minPerCategory = 2): void {
  // Check if we have at least 2 items in each category
  const proteinCount = foods.filter(f => f.category === 'protein').length;
  const carbsCount = foods.filter(f => f.category === 'carbs').length;
  const extrasCount = foods.filter(f => f.category === 'extras').length;
  
  // Add default foods if needed
  if (proteinCount < minPerCategory) {
    addDefaultFoodsForCategory(foods, 'protein', minPerCategory - proteinCount);
  }
  
  if (carbsCount < minPerCategory) {
    addDefaultFoodsForCategory(foods, 'carbs', minPerCategory - carbsCount);
  }
  
  if (extrasCount < minPerCategory) {
    addDefaultFoodsForCategory(foods, 'extras', minPerCategory - extrasCount);
  }
}

/**
 * Add default foods for a specific category
 */
function addDefaultFoodsForCategory(foods: PlateFood[], category: FoodCategory, count: number): void {
  DEFAULT_FOODS
    .filter(f => f.category === category)
    .slice(0, count)
    .forEach((food, i) => {
      foods.push({
        id: `default-${category}-${i}`,
        instanceId: `default-${category}-instance-${i}-${Date.now()}`,
        name: food.name,
        category: food.category,
        imageUrl: `${process.env.NEXT_PUBLIC_CDN_URL}/foods/${food.fileName}.png`,
        nutrients: generateDefaultNutrients(food.category)
      });
    });
}

/**
 * Generate default nutrient values based on food category
 */
function generateDefaultNutrients(category: FoodCategory): NutrientInfo {
  switch (category) {
    case 'protein':
      return {
        energy_kj: 200 + Math.floor(Math.random() * 100),
        protein_g: 15 + Math.floor(Math.random() * 10),
        fat_g: 8 + Math.floor(Math.random() * 7),
        carbohydrate_g: 2 + Math.floor(Math.random() * 5),
        fiber_g: 0 + Math.floor(Math.random() * 2)
      };
    case 'carbs':
      return {
        energy_kj: 300 + Math.floor(Math.random() * 100),
        protein_g: 5 + Math.floor(Math.random() * 5),
        fat_g: 2 + Math.floor(Math.random() * 3),
        carbohydrate_g: 30 + Math.floor(Math.random() * 20),
        fiber_g: 2 + Math.floor(Math.random() * 3)
      };
    case 'extras':
      return {
        energy_kj: 100 + Math.floor(Math.random() * 50),
        protein_g: 1 + Math.floor(Math.random() * 3),
        fat_g: 0 + Math.floor(Math.random() * 2),
        carbohydrate_g: 10 + Math.floor(Math.random() * 10),
        fiber_g: 3 + Math.floor(Math.random() * 4)
      };
    default:
      return {
        energy_kj: 0,
        protein_g: 0,
        fat_g: 0,
        carbohydrate_g: 0,
        fiber_g: 0
      };
  }
}

/**
 * Get a set of default foods to use when API fails
 */
export function getDefaultFoods(): PlateFood[] {
  return DEFAULT_FOODS.map((food, index) => ({
    id: `default-food-${index}`,
    instanceId: `default-food-instance-${index}-${Date.now()}`,
    name: food.name,
    category: food.category,
    imageUrl: `${process.env.NEXT_PUBLIC_CDN_URL}/foods/${food.fileName}.png`,
    nutrients: generateDefaultNutrients(food.category)
  }));
}

/**
 * Calculate nutrition summary for placed foods
 */
export function calculateNutritionSummary(placedFoods: PlacedFood[]): PlateSummary {
  // Default values
  const summary: PlateSummary = {
    totalEnergy: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    totalFibre: 0,
    nutritionScore: 0
  };
  
  if (placedFoods.length === 0) {
    return summary;
  }
  
  // Calculate totals
  for (const food of placedFoods) {
    summary.totalEnergy += food.nutrients.energy_kj || 0;
    summary.totalProtein += food.nutrients.protein_g || 0;
    summary.totalFat += food.nutrients.fat_g || 0;
    summary.totalCarbs += food.nutrients.carbohydrate_g || 0;
    summary.totalFibre += food.nutrients.fiber_g || 0;
  }
  
  // Calculate nutrition score based on balance of nutrients
  const targets = DEFAULT_NUTRITION_TARGETS;
  const proteinScore = Math.min(100, (summary.totalProtein / targets.protein) * 100);
  const carbsScore = Math.min(100, (summary.totalCarbs / targets.carbs) * 100);
  const fibreScore = Math.min(100, (summary.totalFibre / targets.fiber) * 100);
  
  // Penalize excessive fat
  const fatPenalty = summary.totalFat > targets.maxFat ? 
    Math.min(50, ((summary.totalFat - targets.maxFat) / targets.maxFat) * 50) : 0;
  
  // Calculate overall score
  summary.nutritionScore = Math.round(
    (proteinScore + carbsScore + fibreScore) / 3 - fatPenalty
  );
  
  // Ensure score is between 0-100
  summary.nutritionScore = Math.max(0, Math.min(100, summary.nutritionScore));
  
  return summary;
}

/**
 * Calculate position for placing a food on the plate
 */
export function calculateFoodPosition(
  section: FoodCategory, 
  existingFoods: PlacedFood[], 
  plateSection: PlateSection
): { x: number; y: number } {
  // Count existing foods in this section
  const sectionFoods = existingFoods.filter(food => food.category === section);
  const count = sectionFoods.length;
  
  // Get section position
  const { x, y, width, height } = plateSection.position;
  
  // Calculate base position (center of the section)
  const baseX = x;
  const baseY = y;
  
  // Calculate spread factors
  const spreadX = width * 0.6; // Use 60% of the width to ensure items stay within bounds
  const spreadY = height * 0.6; // Use 60% of the height
  
  // Create a grid-like arrangement based on the count
  const columns = Math.ceil(Math.sqrt(count + 1)); // +1 for the new item
  const rows = Math.ceil((count + 1) / columns);
  
  // Calculate position in the grid
  const col = count % columns;
  const row = Math.floor(count / columns);
  
  // Convert grid position to percentage coordinates
  const xPos = baseX + (col - (columns - 1) / 2) * (spreadX / Math.max(1, columns - 1));
  const yPos = baseY + (row - (rows - 1) / 2) * (spreadY / Math.max(1, rows - 1));
  
  // Add a small random variation to prevent exact overlaps
  const randomX = Math.random() * 5 - 2.5;
  const randomY = Math.random() * 5 - 2.5;
  
  return {
    x: xPos + randomX,
    y: yPos + randomY
  };
}

/**
 * Get avatar feedback emotion based on nutrition score
 */
export function getAvatarEmotion(nutritionScore: number): AvatarEmotion {
  if (nutritionScore >= 70) return 'happy';
  if (nutritionScore >= 40) return 'neutral';
  return 'sad';
}

/**
 * Determines if a point is within a section
 * Uses circular detection for section1 (left section) and rectangular for others
 */
function isPointInSection(
  x: number, 
  y: number, 
  section: PlateSection
): boolean {
  const { position } = section;
  
  // Special handling for the left circular section (section1)
  if (section.id === 'section1') {
    // Calculate the distance from the center of the circle
    const centerX = position.x;
    const centerY = position.y;
    // Use radius as half the width
    const radius = position.width / 2;
    
    // Calculate distance using Pythagorean theorem
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );
    
    // If distance is less than radius, point is in the circle
    return distance <= radius;
  }
  
  // For rectangular sections, check if point is within the rectangle bounds
  const minX = position.x - position.width / 2;
  const maxX = position.x + position.width / 2;
  const minY = position.y - position.height / 2;
  const maxY = position.y + position.height / 2;
  
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

/**
 * Finds which section contains the given point coordinates
 * Returns the section ID or null if not in any section
 */
export function findSectionAtPosition(
  x: number, 
  y: number, 
  sections: PlateSection[]
): string | null {
  // Check each section
  for (const section of sections) {
    if (isPointInSection(x, y, section)) {
      return section.id;
    }
  }
  
  // If point is not in any section, return null
  return null;
}

/**
 * Gets a category-appropriate section ID
 */
export function getSectionForCategory(
  category: FoodCategory,
  sections: PlateSection[]
): string {
  // For section-based plate, use our mapping
  switch (category) {
    case 'protein':
      return sections.find(s => s.id === 'section1')?.id || 'section1';
    case 'carbs':
      return sections.find(s => s.id === 'section2')?.id || 'section2';
    case 'extras':
      return sections.find(s => s.id === 'section3')?.id || 'section3';
    default:
      return sections[0]?.id || 'section1';
  }
}

/**
 * Get feedback message based on avatar emotion
 */
export function getFeedbackMessage(
  emotion: AvatarEmotion, 
  t: (key: string) => string
): string {
  switch (emotion) {
    case 'happy':
      return t('feedback_happy');
    case 'neutral':
      return t('feedback_neutral');
    case 'sad':
      return t('feedback_sad');
    default:
      return t('feedback_default');
  }
} 