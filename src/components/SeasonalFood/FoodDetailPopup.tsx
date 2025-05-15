'use client';

import React, { useEffect, useState } from 'react';
import { SeasonalFoodResponse, SeasonalFoodDetailResponse, Season as ApiSeason } from '../../api/types';
import Image from 'next/image';
import Banner from '../ui/Banner';
import { nutripeekApi } from '../../api/nutripeekApi';
import seasonalFoodService from '@/libs/SeasonalFoodService';
import { Season } from '@/types/seasonal';

interface FoodDetailPopupProps {
  food: SeasonalFoodResponse;
  onClose: () => void;
}

/**
 * Popup component that displays detailed information about a selected seasonal food
 * Shows name, image, description, nutritional info, and availability
 */
export default function FoodDetailPopup({ food, onClose }: FoodDetailPopupProps) {
  const [foodDetails, setFoodDetails] = useState<SeasonalFoodDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Check if the food is already pinned
  useEffect(() => {
    // Generate a consistent ID based on the food name and region
    const foodId = `${food.name.toLowerCase().replace(/\s+/g, '-')}-${food.region.toLowerCase().replace(/\s+/g, '-')}`;
    setIsPinned(seasonalFoodService.isSeasonalFoodPinned(foodId));
  }, [food.name, food.region]);
  
  // Fetch detailed food information when the component mounts
  useEffect(() => {
    const fetchFoodDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const details = await nutripeekApi.getSeasonalFoodDetails(food.name, food.region);
        setFoodDetails(details);
      } catch (err) {
        console.error(`Error fetching details for ${food.name}:`, err);
        setError('Unable to load detailed information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFoodDetails();
  }, [food.name, food.region]);
  
  // Add escape key handler to close popup
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent scrolling of the body when popup is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  // Create a handler function that will dispatch event when closing
  const handleClose = () => {
    // Dispatch an event that the popup is being closed
    // This helps other components (like PinnedItemsLayout) to know they should stay open
    window.dispatchEvent(new CustomEvent('foodDetailPopupClosed', { bubbles: false }));
    
    // Call the original onClose
    onClose();
  };
  
  // Handler for pinning/unpinning the food
  const handleTogglePin = () => {
    // Generate a consistent ID based on the food name and region
    const foodId = `${food.name.toLowerCase().replace(/\s+/g, '-')}-${food.region.toLowerCase().replace(/\s+/g, '-')}`;
    
    if (isPinned) {
      // Unpin the food
      seasonalFoodService.unpinSeasonalFood(foodId);
      setIsPinned(false);
      
      // Notify other components that pinned foods have been updated
      window.dispatchEvent(new Event('pinnedFoodsUpdated'));
    } else {
      // Convert availability to seasons
      const seasons: Season[] = [];
      
      // Get seasons from the food details if available, otherwise derive from available months
      if (foodDetails?.seasonal_availability) {
        const availableSeasons = foodDetails.seasonal_availability.map(item => {
          // Convert API seasons to our Season enum
          switch(item.season) {
            case 'Spring': return Season.Spring;
            case 'Summer': return Season.Summer;
            case 'Autumn': return Season.Autumn;
            case 'Winter': return Season.Winter;
            default: return null;
          }
        }).filter((season): season is Season => season !== null);
        
        // Add unique seasons
        for (const season of availableSeasons) {
          if (!seasons.includes(season)) {
            seasons.push(season);
          }
        }
      } else if (food.availableMonths?.length) {
        // Map months to seasons (simplified)
        for (const month of food.availableMonths) {
          // 12,1,2 - Winter; 3,4,5 - Spring; 6,7,8 - Summer; 9,10,11 - Autumn
          if (month >= 3 && month <= 5 && !seasons.includes(Season.Spring)) {
            seasons.push(Season.Spring);
          } else if (month >= 6 && month <= 8 && !seasons.includes(Season.Summer)) {
            seasons.push(Season.Summer);
          } else if (month >= 9 && month <= 11 && !seasons.includes(Season.Autumn)) {
            seasons.push(Season.Autumn);
          } else if ((month === 12 || month <= 2) && !seasons.includes(Season.Winter)) {
            seasons.push(Season.Winter);
          }
        }
      }
      
      // If no season data available, include a default
      if (seasons.length === 0) {
        seasons.push(Season.Spring); // Default to Spring as a fallback
      }
      
      // Extract nutrient data safely
      const nutritionalInfo = foodDetails?.nutrient_data ? {
        calories: foodDetails.nutrient_data.energy_with_fibre_kj ?? undefined,
        proteins: foodDetails.nutrient_data.protein_g ?? undefined,
        carbs: foodDetails.nutrient_data.carbs_with_sugar_alcohols_g ?? undefined,
        fats: foodDetails.nutrient_data.total_fat_g ?? undefined,
        fiber: foodDetails.nutrient_data.dietary_fibre_g ?? undefined,
      } : undefined;
      
      // Pin the food (first create the food with the appropriate ID)
      const newPinnedFood = seasonalFoodService.pinSeasonalFood({
        name: food.name,
        image: food.imageUrl,
        description: food.description,
        seasons,
        region: food.region,
        nutritionalInfo
      });
      
      setIsPinned(true);
      
      // Notify other components that pinned foods have been updated
      window.dispatchEvent(new Event('pinnedFoodsUpdated'));
    }
  };
  
  // Nutrient data formatting helper
  const formatNutrientValue = (value: number | null | undefined, unit: string): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${value} ${unit}`;
  };
  
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-0 animate-fade-in" 
      onClick={(e) => {
        e.stopPropagation(); // Prevent event from reaching PullableSheet
        handleClose();
      }}
    >
      <div 
        className="relative bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent event from reaching PullableSheet
            handleClose();
          }}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Pin button */}
        <button 
          onClick={handleTogglePin}
          className={`absolute left-4 top-4 p-2 rounded-full transition-colors z-10 ${
            isPinned 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          aria-label={isPinned ? "Unpin food" : "Pin food"}
          title={isPinned ? "Remove from pinned foods" : "Save to pinned foods"}
        >
          {isPinned ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          )}
        </button>
        
        {/* Food header */}
        <div className="flex flex-col items-center p-6 pb-4 bg-gradient-to-b from-green-50 to-white">
          <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 shadow-md">
            {food.imageUrl ? (
              <Image 
                src={food.imageUrl} 
                alt={food.name}
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-green-100 flex items-center justify-center">
                <span className="text-4xl">🍎</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">{food.name}</h2>
          {food.category && (
            <div className="mt-2">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                {food.category}
              </span>
            </div>
          )}
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-600">Loading detailed information...</p>
          </div>
        )}
        
        {/* Error state */}
        {error && !isLoading && (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-800 font-medium">{error}</p>
            <p className="text-gray-600 mt-1">Please try again later</p>
          </div>
        )}
        
        {/* Food details - Only show when data is loaded */}
        {!isLoading && !error && foodDetails && (
          <div className="p-6 pt-3 space-y-4">
            {/* Description */}
            {food.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Description</h3>
                <p className="text-gray-700">{food.description}</p>
              </div>
            )}
            
            {/* Nutritional Value */}
            {(food.nutritionalValue || foodDetails.nutrient_data) && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Nutritional Value</h3>
                
                {/* Show banner for portion size information */}
                <Banner
                  id="food-nutrient-info-banner"
                  message="Nutritional values are based on 100 grams of edible portion"
                  variant="info"
                  position="static"
                  persistDismissal={false}
                  className="mb-3 py-2"
                />
                
                {/* API-based nutrient data */}
                {foodDetails.nutrient_data && (
                  <div className="bg-green-50 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {foodDetails.nutrient_data.energy_with_fibre_kj !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Energy:</span>
                          <span className="font-medium">
                            {formatNutrientValue(foodDetails.nutrient_data.energy_with_fibre_kj, 'kJ')}
                          </span>
                        </div>
                      )}
                      
                      {foodDetails.nutrient_data.protein_g !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Protein:</span>
                          <span className="font-medium">
                            {formatNutrientValue(foodDetails.nutrient_data.protein_g, 'g')}
                          </span>
                        </div>
                      )}
                      
                      {foodDetails.nutrient_data.total_fat_g !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fat:</span>
                          <span className="font-medium">
                            {formatNutrientValue(foodDetails.nutrient_data.total_fat_g, 'g')}
                          </span>
                        </div>
                      )}
                      
                      {foodDetails.nutrient_data.carbs_with_sugar_alcohols_g !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Carbs:</span>
                          <span className="font-medium">
                            {formatNutrientValue(foodDetails.nutrient_data.carbs_with_sugar_alcohols_g, 'g')}
                          </span>
                        </div>
                      )}
                      
                      {foodDetails.nutrient_data.dietary_fibre_g !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fiber:</span>
                          <span className="font-medium">
                            {formatNutrientValue(foodDetails.nutrient_data.dietary_fibre_g, 'g')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Original description-based nutritional value */}
                {!foodDetails.nutrient_data && food.nutritionalValue && (
                  <p className="text-gray-700">{food.nutritionalValue}</p>
                )}
              </div>
            )}
            
            {/* Seasonality - Use data from API if available */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Available Months</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {monthNames.map((month, index) => {
                  // Use the API response data for availability if we have it
                  const monthAbbr = month.substring(0, 3).toLowerCase();
                  const isAvailable = foodDetails.seasonal_availability?.some(
                    sa => sa.month.toLowerCase() === monthAbbr
                  ) || food.availableMonths?.includes(index + 1);
                  
                  return (
                    <div 
                      key={month} 
                      className={`px-1 py-2 rounded-md text-xs text-center ${
                        isAvailable 
                          ? 'bg-green-100 text-green-800 font-medium' 
                          : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {month.substring(0, 3)}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Region */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Region</h3>
              <p className="text-gray-700">{food.region}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 