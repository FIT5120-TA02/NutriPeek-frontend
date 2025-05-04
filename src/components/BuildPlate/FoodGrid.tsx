"use client";

/**
 * Food Grid Component
 * Displays a grid of draggable food items with pagination
 */
import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { PlateFood, FoodGridProps } from "./types";
import DraggableFoodItem from "./DraggableFoodItem";
import { ITEMS_PER_PAGE } from "./constants";
import NutrientInfoBanner from "./NutrientInfoBanner";

/**
 * Grid of food items with pagination controls
 */
const FoodGrid: React.FC<FoodGridProps> = ({
  foods,
  onDragStart,
  title,
  loading = false
}) => {
  const t = useTranslations('BuildPlate');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.ceil(foods.length / ITEMS_PER_PAGE);
  
  // Get current page items
  const currentFoods = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return foods.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [foods, currentPage]);
  
  // Reset to first page when foods list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [foods.length]);
  
  // Handle page changes
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  // Handle drag start from food grid
  const handleFoodDragStart = (e: React.DragEvent<HTMLDivElement>, food: PlateFood) => {
    // Call the provided onDragStart handler
    onDragStart(e, food);
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Title (optional) */}
      {title && (
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          
          {/* Nutrient portion info banner - positioned right after the title for context */}
          <NutrientInfoBanner />
        </div>
      )}
      
      {/* Show banner without title if no title is provided */}
      {!title && <NutrientInfoBanner />}

      {/* Food grid with adaptive height and dynamic layout */}
      <div className="flex flex-col">
        <div 
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-auto`}
        >
          {loading ? (
            // Loading skeleton placeholders
            Array.from({ length: 12 }).map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className="animate-pulse bg-gray-200 rounded-lg h-24"
              />
            ))
          ) : (
            // Food items
            currentFoods.map((food) => (
              <DraggableFoodItem
                key={`${food.id}-grid`}
                food={food}
                onDragStart={handleFoodDragStart}
              />
            ))
          )}
        </div>

        {/* Empty state message */}
        {!loading && currentFoods.length === 0 && (
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-gray-500">{t('no_foods_found')}</p>
          </div>
        )}
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-500">
            {t('page_x_of_y', { current: currentPage, total: totalPages })}
          </span>
          
          <div className="flex space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-100 disabled:opacity-50 hover:bg-gray-200 
                      transition-colors rounded"
              aria-label={t('previous')}
            >
              {t('previous')}
            </button>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-100 disabled:opacity-50 hover:bg-gray-200 
                      transition-colors rounded"
              aria-label={t('next')}
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodGrid; 