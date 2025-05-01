'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExtendedNutrientGap, FoodItem } from './types';

interface RecommendedFoodsProps {
  activeNutrient: string | null;
  nutrients: ExtendedNutrientGap[];
  onToggleFood: (nutrientName: string, food: FoodItem) => void;
  onUpdateQuantity: (nutrientName: string, food: FoodItem, quantity: number) => void;
}

/**
 * Displays recommended foods for the selected nutrient
 */
export default function RecommendedFoods({
  activeNutrient,
  nutrients,
  onToggleFood,
  onUpdateQuantity
}: RecommendedFoodsProps) {
  // Find the active nutrient data
  const activeNutrientData = activeNutrient 
    ? nutrients.find(n => n.name === activeNutrient) 
    : null;
  
  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    nutrientName: string,
    food: FoodItem
  ) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      onUpdateQuantity(nutrientName, food, newQuantity);
    }
  };

  // Get top 3 nutrients that each food helps with
  const getFoodNutrientImprovements = (food: FoodItem) => {
    if (!food.nutrients) return [];

    // Calculate how much each nutrient is improved by this food
    const improvementsByNutrient = nutrients
      .filter(nutrient => 
        food.nutrients[nutrient.name] !== undefined && 
        food.nutrients[nutrient.name] > 0
      )
      .map(nutrient => {
        const contributionPercentage = (food.nutrients[nutrient.name] / nutrient.recommended_intake) * 100;
        return {
          name: nutrient.name,
          contribution: contributionPercentage
        };
      })
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3);

    return improvementsByNutrient;
  };
    
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h2 className="font-bold text-lg text-gray-800 mb-3">
        {activeNutrient ? `Recommended Foods for ${activeNutrient}` : 'Select a nutrient'}
      </h2>
      
      <style jsx>{`
        /* Remove arrow buttons from number input */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      
      <AnimatePresence mode="wait">
        {activeNutrient && activeNutrientData && (
          <motion.div
            key={activeNutrient}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2"
          >
            {activeNutrientData.recommendedFoods.map((food) => {
              const topNutrients = getFoodNutrientImprovements(food);
              
              return (
                <motion.div
                  key={food.id}
                  className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                    food.selected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !food.selected && onToggleFood(activeNutrient, food)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={food.imageUrl}
                      alt={food.category}
                      className="w-16 h-16 object-contain mb-2"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-food.png';
                      }}
                    />
                    <span className="text-sm font-medium capitalize">{food.name}</span>
                    
                    {/* Show nutrient improvements this food provides */}
                    {!food.selected && topNutrients.length > 0 && (
                      <div className="w-full mt-2">
                        <p className="text-xs text-gray-600 mb-1">Improves:</p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {topNutrients.map(nutrient => (
                            <span 
                              key={nutrient.name} 
                              className="text-xs bg-blue-50 text-blue-700 px-1 py-0.5 rounded"
                            >
                              {nutrient.name.split(' ')[0]} +{Math.round(nutrient.contribution)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {food.selected ? (
                      <div className="mt-2 w-full">
                        <div className="flex items-center justify-between">
                          <button 
                            className="bg-green-100 text-green-700 w-8 h-8 rounded-l-md flex items-center justify-center hover:bg-green-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (food.quantity > 1) {
                                onUpdateQuantity(activeNutrient, food, food.quantity - 1);
                              } else {
                                onToggleFood(activeNutrient, food);
                              }
                            }}
                          >
                            −
                          </button>
                          
                          <input
                            type="number"
                            min="1"
                            value={food.quantity}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(e, activeNutrient, food);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 text-center border-t border-b text-sm font-semibold"
                          />
                          
                          <button 
                            className="bg-green-100 text-green-700 w-8 h-8 rounded-r-md flex items-center justify-center hover:bg-green-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateQuantity(activeNutrient, food, food.quantity + 1);
                            }}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full mt-2">
                          Added
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 px-2 py-1 mt-1">
                        Click to add
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {activeNutrient && activeNutrientData?.recommendedFoods.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <p className="text-gray-500">No recommendations available</p>
        </div>
      )}

      {!activeNutrient && (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <p className="text-gray-500">Select a nutrient from the left to see recommendations</p>
        </div>
      )}
    </div>
  );
}