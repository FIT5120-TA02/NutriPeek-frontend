'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UnitFormatter from '@/components/UnitFormatter/UnitFormatter';
import ChildAvatar from '@/components/ui/ChildAvatar';
import { FoodItem, NutrientComparison, calculateNutritionalScore } from '@/types/notes';
import { NutrientInfo } from '@/api/types';
import { calculateGapSummary } from './gapCalculator';
import NutritionScoreCard from './NutritionScoreCard';

interface NoteCardProps {
  id: string;
  timestamp: number;
  selectedFoods?: FoodItem[];
  originalFoods?: FoodItem[];
  additionalFoods?: FoodItem[];
  nutrient_gaps: Record<string, NutrientInfo>;
  nutrientComparisons?: NutrientComparison[];
  totalCalories?: number;
  missingCount?: number;
  excessCount?: number;
  onDelete: (id: string) => void;
  child?: {
    name: string;
    gender: string;
    age?: string | number;
  };
}

export default function NoteCard({
  id,
  timestamp,
  selectedFoods = [],
  originalFoods = [],
  additionalFoods = [],
  nutrient_gaps = {},
  nutrientComparisons,
  totalCalories = 0,
  missingCount = 0,
  excessCount = 0,
  onDelete,
  child,
}: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Format the date in a user-friendly format
  const formattedDate = (() => {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'MMM d, yyyy • h:mm a');
  })();

  // Use existing nutrient comparisons or calculate them
  const { comparison, totalMet } = nutrientComparisons 
    ? { comparison: nutrientComparisons, totalMet: 0 } 
    : calculateGapSummary({
        id,
        timestamp,
        selectedFoods: selectedFoods.length > 0 ? selectedFoods : [...originalFoods, ...additionalFoods],
        originalFoods,
        additionalFoods,
        nutrient_gaps,
      });
  
  // Calculate nutritional score based on combined original and additional foods
  const nutritionalScore = calculateNutritionalScore(nutrient_gaps, missingCount, excessCount);

  // Determine if there are foods to show in different sections
  const hasOriginalFoods = originalFoods.length > 0;
  const hasAdditionalFoods = additionalFoods.length > 0;
  const hasBothFoodTypes = hasOriginalFoods && hasAdditionalFoods;
  
  // If we don't have separate original/additional foods, but do have selectedFoods,
  // display all of them as originalFoods
  const displayFoods = {
    original: hasOriginalFoods ? originalFoods : (hasBothFoodTypes ? [] : selectedFoods),
    additional: additionalFoods
  };

  return (
    <motion.div
      layout
      initial={{ borderRadius: 16 }}
      className="relative w-full bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
    >
      {/* Delete button */}
      <button
        className="absolute top-3 right-3 text-red-500 hover:text-red-700 z-10 p-1 rounded-full hover:bg-red-50"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
      >
        <Trash2 size={18} />
      </button>

      {/* Collapsible Card Header (always visible) */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-4">
          <ChildAvatar name={child?.name || 'N/A'} gender={child?.gender || 'male'} size={52} />
          <div className="flex flex-col flex-grow">
            <span className="text-sm font-semibold text-gray-800">{child?.name || 'Unknown'}</span>
            <span className="text-xs text-gray-500">{formattedDate}</span>
            {child?.age && (
              <span className="text-xs text-gray-500">Age: {child.age}</span>
            )}
          </div>
          
          <div className="ml-auto mt-4">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>
      
      {/* Nutritional Score Card - Always visible below header */}
      <div className="px-4 pb-4">
        <NutritionScoreCard 
          allNutrients={nutrient_gaps}
          missingCount={missingCount}
          excessCount={excessCount}
          totalCalories={totalCalories}
          showDetails={false}
          className="w-full"
        />
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            {/* Original Foods Section */}
            {displayFoods.original.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  {hasBothFoodTypes ? 'Original Foods' : 'Selected Foods'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {displayFoods.original.map((food) => (
                    <div key={food.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                      {food.imageUrl && (
                        <img
                          src={food.imageUrl}
                          alt={food.name}
                          className="w-6 h-6 object-contain rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <span className="text-sm text-gray-700">{food.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Foods Section */}
            {displayFoods.additional.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Added Recommendations</h4>
                <div className="flex flex-wrap gap-2">
                  {displayFoods.additional.map((food) => (
                    <div key={food.id} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-2 py-1">
                      <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center">
                        <Plus size={12} className="text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">{food.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              {/* Nutrition Stats */}
              <div className="grid grid-cols-3 divide-x bg-white rounded-xl shadow-sm overflow-hidden mb-4">
                <div className="p-3 text-center">
                  <p className="text-xs text-blue-600 mb-1">Total Calories</p>
                  <p className="text-base font-bold">{totalCalories.toFixed(0)} kJ</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-red-600 mb-1">Missing</p>
                  <p className="text-base font-bold">{missingCount}</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-amber-600 mb-1">Excess</p>
                  <p className="text-base font-bold">{excessCount}</p>
                </div>
              </div>

              {/* Nutrient Comparison Details Toggle */}
              <button
                className="w-full text-sm text-blue-500 mt-2 py-2 flex items-center justify-center gap-1 hover:bg-blue-50 rounded-md"
                onClick={() => setShowDetails((prev) => !prev)}
              >
                {showDetails ? 'Hide Details' : 'Show Nutrient Details'}
                {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* Nutrient Details */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-2"
                  >
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Nutrient Improvements</h4>
                    {comparison.map((item) => (
                      <div key={item.name} className="bg-gray-50 p-3 rounded-md border">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700 font-medium">{item.name}</span>
                          <span className="text-gray-500">{item.percentAfter.toFixed(1)}% Met</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                          {/* Before value */}
                          <div className="h-full bg-blue-300 relative" style={{ width: `${item.percentBefore}%` }}>
                            {/* Additional value on top */}
                            <div 
                              className="h-full bg-green-500 absolute top-0 left-full" 
                              style={{ width: `${item.percentAfter - item.percentBefore}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                          <span>
                            Before: <UnitFormatter value={item.beforeValue} unit={item.unit} />
                          </span>
                          <span>
                            After: <UnitFormatter value={item.afterValue} unit={item.unit} />
                          </span>
                          <span>
                            Needed: <UnitFormatter value={item.recommendedValue} unit={item.unit} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



