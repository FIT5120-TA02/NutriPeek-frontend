'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ExtendedNutrientGap } from './types';
import { FoodItem } from '@/types/notes';

interface SelectedFoodsProps {
  selectedFoods: FoodItem[];
  nutrients: ExtendedNutrientGap[];
  onRemoveFood: (nutrientName: string, food: FoodItem) => void;
}

/**
 * Displays the user's selected foods and nutrition improvements
 */
export default function SelectedFoods({
  selectedFoods,
  nutrients,
  onRemoveFood
}: SelectedFoodsProps) {
  const [showAllImprovements, setShowAllImprovements] = useState(false);
  
  // Get nutrients with improvements
  const nutrientsWithImprovements = nutrients.filter(
    nutrient => nutrient.updatedPercentage > nutrient.percentage
  );
  
  // Sort by improvement amount (descending)
  const sortedNutrients = [...nutrientsWithImprovements].sort(
    (a, b) => (b.updatedPercentage - b.percentage) - (a.updatedPercentage - a.percentage)
  );
  
  // Display top 3 improvements or all if toggled
  const displayNutrients = showAllImprovements 
    ? sortedNutrients 
    : sortedNutrients.slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h2 className="font-bold text-lg text-gray-800 mb-3">Your Selection</h2>
      
      {selectedFoods.length > 0 ? (
        <>
          <div className="max-h-[330px] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              {selectedFoods.map((food) => (
                <motion.div
                  key={food.id}
                  className="p-3 rounded-lg border-2 border-green-500 bg-green-50 relative"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <button 
                    className="absolute top-1 right-1 bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center"
                    onClick={() => {
                      // Find the original nutrient this food was recommended for
                      // We'll use the first nutrient that has this food in its recommendations
                      const nutrient = nutrients.find(n => 
                        n.recommendedFoods.some(f => f.id === food.id)
                      );
                      
                      if (nutrient) {
                        onRemoveFood(nutrient.name, food);
                      } else {
                        // Fallback: use the first nutrient in the list
                        // This shouldn't happen in normal circumstances, but it's a safety check
                        if (nutrients.length > 0) {
                          onRemoveFood(nutrients[0].name, food);
                        }
                      }
                    }}
                  >
                    ×
                  </button>
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={food.imageUrl}
                      alt={food.category}
                      className="w-12 h-12 object-contain mb-1"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-food.png';
                      }}
                    />
                    <span className="text-xs font-medium capitalize">{food.name}</span>
                    {food.quantity > 1 && (
                      <div className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full mt-1">
                        Qty: {food.quantity}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Nutrition Improvements</h3>
              {nutrientsWithImprovements.length > 3 && (
                <button 
                  onClick={() => setShowAllImprovements(!showAllImprovements)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showAllImprovements ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>
            
            {nutrientsWithImprovements.length > 0 ? (
              <div className={`space-y-2 ${showAllImprovements && nutrientsWithImprovements.length > 5 ? 'max-h-[210px] overflow-y-auto pr-2' : ''}`}>
                {displayNutrients.map(nutrient => {
                  const improvement = nutrient.updatedPercentage - nutrient.percentage;
                  const percentComplete = Math.min(Math.round(nutrient.percentage), 100);
                  const percentImprovement = Math.min(Math.round(improvement), 100 - percentComplete);
                  
                  return (
                    <div key={nutrient.name} className="w-full">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{nutrient.name}</span>
                        <span className="font-medium text-green-600">+{Math.round(improvement)}%</span>
                      </div>
                      <div className="w-full h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-400 float-left"
                          style={{ width: `${percentComplete}%` }}
                        ></div>
                        <div
                          className="h-full bg-green-400 float-left"
                          style={{ width: `${percentImprovement}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                
                {!showAllImprovements && nutrientsWithImprovements.length > 3 && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    +{nutrientsWithImprovements.length - 3} more improvements not shown
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center mt-2">
                No improvements yet. Add more foods to see nutrition benefits.
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[330px] text-center">
          <p className="text-gray-500 mb-2">No foods selected yet</p>
          <p className="text-sm text-gray-400">
            Click on foods from the recommendations to add them to your selection
          </p>
        </div>
      )}
    </div>
  );
}