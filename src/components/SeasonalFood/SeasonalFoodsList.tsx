'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { SeasonalFoodResponse } from '@/api/types';
import { useSeasonalFood } from '@/hooks/useSeasonalFood';

interface SeasonalFoodsListProps {
  foods: SeasonalFoodResponse[];
  isLoading: boolean;
  region: string;
  currentSeason: string;
  currentMonth: number;
  onFoodSelect: (food: SeasonalFoodResponse) => void;
}

/**
 * Component to display a list of seasonal foods for the selected region
 * Features categorization, filtering, and food selection
 */
const SeasonalFoodsList: React.FC<SeasonalFoodsListProps> = React.memo(({
  foods,
  isLoading,
  region,
  currentSeason,
  currentMonth,
  onFoodSelect,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const { getMonthAbbreviation } = useSeasonalFood();

  // Get month name
  const getMonthName = (month: number): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1] || '';
  };

  // Memoized and filtered foods by category with search filtering
  const { foodsByCategory, categories } = useMemo(() => {
    // First apply text search filter
    const filteredFoods = searchText.trim() 
      ? foods.filter(food => 
          food.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (food.category && food.category.toLowerCase().includes(searchText.toLowerCase()))
        )
      : foods;
    
    // Then apply category filter
    const foodsAfterCategoryFilter = activeFilter === 'all' 
      ? filteredFoods 
      : filteredFoods.filter(food => food.category === activeFilter);
    
    // Group by category
    const byCategory = foodsAfterCategoryFilter.reduce<Record<string, SeasonalFoodResponse[]>>((acc, food) => {
      if (!food || !food.category) return acc;
      
      if (!acc[food.category]) {
        acc[food.category] = [];
      }
      acc[food.category].push(food);
      return acc;
    }, {});
    
    // Get unique categories from all foods for filter options
    const allCategories = foods
      .map(food => food.category)
      .filter((category, index, self) => 
        category && self.indexOf(category) === index
      ) as string[];
    
    return { 
      foodsByCategory: byCategory, 
      categories: allCategories
    };
  }, [foods, searchText, activeFilter]);

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 h-[540px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="animate-pulse h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="animate-pulse space-y-4 flex-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No foods found state
  if (!foods || foods.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 h-[540px] flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Seasonal Foods in {region}
        </h3>
        <div className="py-10 text-center flex-1 flex flex-col items-center justify-center">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-gray-600 mb-2">No seasonal foods found for this region.</p>
          <p className="text-gray-500 text-sm">Try selecting a different region or season.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[540px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Seasonal Foods in {region}
            </h3>
            <p className="text-sm text-gray-600">
              Foods in season during {currentSeason} ({getMonthName(currentMonth)})
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className="text-xs font-medium text-gray-500">
              {foods.length} foods available
            </span>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="mt-4 space-y-3">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search foods..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                activeFilter === 'all'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeFilter === category
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Foods list */}
      <div className="p-4 overflow-y-auto flex-1">
        {Object.keys(foodsByCategory).length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-600">No foods match your search.</p>
            <button
              onClick={() => {
                setSearchText('');
                setActiveFilter('all');
              }}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Categories */}
            {Object.entries(foodsByCategory).map(([category, categoryFoods]) => (
              <div key={category} className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3 pb-2 border-b border-gray-100">
                  {category} <span className="text-gray-400 text-sm">({categoryFoods.length})</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryFoods.map((food) => (
                    <div
                      key={food.id}
                      className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 cursor-pointer transition-all"
                      onClick={() => {
                        // Set source flag before calling onFoodSelect
                        localStorage.setItem('foodPopupSource', 'list');
                        onFoodSelect(food);
                      }}
                    >
                      <div className="flex-shrink-0 mr-3">
                        {food.imageUrl ? (
                          <img
                            src={food.imageUrl}
                            alt={food.name}
                            className="w-14 h-14 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                            🍎
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-green-50/50 px-2 py-1 rounded inline-block mb-1 max-w-full">
                          <h5 className="font-medium text-gray-900 truncate text-sm w-full overflow-hidden">
                            {food.name || 'Unnamed Food'}
                          </h5>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                            {(() => {
                              // Show "Best in: [Current Month]" if the food is in season this month
                              if (food.availableMonths?.includes(currentMonth)) {
                                return `Best in: ${getMonthName(currentMonth)}`;
                              }
                              
                              // Otherwise show first available month
                              if (food.availableMonths && food.availableMonths.length > 0) {
                                const firstMonth = Math.min(...food.availableMonths);
                                return `Available: ${getMonthName(firstMonth)}`;
                              }
                              
                              return 'Seasonal';
                            })()}
                          </span>
                          
                          {food.nutritionalValue && (
                            <span className="text-xs text-gray-500 truncate">
                              {food.nutritionalValue.substring(0, 20)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
});

// Display name for better debugging
SeasonalFoodsList.displayName = 'SeasonalFoodsList';

export default SeasonalFoodsList; 