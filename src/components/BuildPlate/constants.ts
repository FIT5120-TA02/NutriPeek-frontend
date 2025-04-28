/**
 * Constants for the Build Plate feature
 */
import { PlateSection, FoodCategory } from './types';

/**
 * Number of food items to display per page in the food grid
 */
export const ITEMS_PER_PAGE = 18;

/**
 * Default nutrition scores for calculating plate balance
 */
export const DEFAULT_NUTRITION_TARGETS = {
  protein: 20, // grams
  carbs: 60,   // grams
  fiber: 10,   // grams
  maxFat: 30   // grams (over this is penalized)
};

/**
 * Fallback image URLs for each food category
 */
export const FALLBACK_IMAGES = {
  protein: `/foods/protein.png`,
  carbs: `/foods/carbs.png`,
  extras: `/foods/fruit.png`,
};

/**
 * Predefined sections for the lunchbox plate
 * These coordinates are based on the lunchbox.png image
 * using percentages for responsive design
 */
export const PLATE_SECTIONS: PlateSection[] = [
  {
    id: 'section1',
    name: 'left_section',
    type: 'section',
    title: 'Main Section',
    position: { 
      x: 39.5, 
      y: 44, 
      width: 30, 
      height: 38
    }
  },
  {
    id: 'section2',
    name: 'top_right_section',
    type: 'section',
    title: 'Top Right Section',
    position: { 
      x: 65, 
      y: 34, 
      width: 20, 
      height: 14 
    }
  },
  {
    id: 'section3',
    name: 'bottom_right_section',
    type: 'section',
    title: 'Bottom Right Section',
    position: { 
      x: 65, 
      y: 53, 
      width: 20, 
      height: 18 
    }
  }
];

/**
 * Default foods to use when API fails
 */
export const DEFAULT_FOODS: { name: string; category: FoodCategory; fileName: string }[] = [
  { name: 'Chicken', category: 'protein', fileName: 'chicken' },
  { name: 'Beef', category: 'protein', fileName: 'meat' },
  { name: 'Fish', category: 'protein', fileName: 'fish' },
  { name: 'Eggs', category: 'protein', fileName: 'eggs' },
  { name: 'Bread', category: 'carbs', fileName: 'bread' },
  { name: 'Rice', category: 'carbs', fileName: 'rice' },
  { name: 'Pasta', category: 'carbs', fileName: 'pasta' },
  { name: 'Potato', category: 'carbs', fileName: 'potato' },
  { name: 'Apple', category: 'extras', fileName: 'apple' },
  { name: 'Banana', category: 'extras', fileName: 'banana' },
  { name: 'Broccoli', category: 'extras', fileName: 'broccoli' },
  { name: 'Carrot', category: 'extras', fileName: 'carrot' }
]; 