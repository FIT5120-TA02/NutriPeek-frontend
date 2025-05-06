import { MealType } from './types';

  
// Helper to get readable meal title
export const getMealTitle = (type: MealType) => {
  switch(type) {
    case 'breakfast': return 'Breakfast';
    case 'lunch': return 'Lunch';
    case 'dinner': return 'Dinner';
    default: return 'Meal'; // Keep default case for type safety
  }
};
