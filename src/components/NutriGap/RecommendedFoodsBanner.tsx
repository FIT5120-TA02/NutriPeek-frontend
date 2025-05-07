import { useMemo } from 'react';
import Banner from '@/components/ui/Banner';
import { FoodItem } from '@/types/notes';

interface RecommendedFoodsBannerProps {
  foodItems: FoodItem[];
  className?: string;
}

/**
 * Banner component that displays information about recommended foods that are affecting the current analysis
 */
export default function RecommendedFoodsBanner({
  foodItems,
  className = '',
}: RecommendedFoodsBannerProps) {
  // Get the total number of foods and most significant nutrient improvements
  const totalFoods = foodItems.length;

  // Generate food names string
  const foodNamesString = useMemo(() => {
    if (foodItems.length <= 3) {
      return foodItems.map(food => food.name).join(' | ');
    } else {
      return `${foodItems.slice(0, 2).map(food => food.name).join(' | ')} and ${foodItems.length - 2} more`;
    }
  }, [foodItems]);

  // Custom icon for the banner
  const bannerIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  );

  // Create the banner message
  const bannerMessage = useMemo(() => {
    let message = `This analysis includes ${totalFoods} recommended food${totalFoods !== 1 ? 's' : ''}: ${foodNamesString}. `  
    
    return message;
  }, [totalFoods, foodNamesString]);

  return (
    <Banner
      id="recommended-foods-banner"
      message={bannerMessage}
      variant="info"
      persistDismissal={false}
      icon={bannerIcon}
      className={className}
    />
  );
} 