'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, ChevronDown, ChevronUp, Plus, BarChart2, LightbulbIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import UnitFormatter from '@/utils/UnitFormatter';
import ChildAvatar from '@/components/ui/ChildAvatar';
import { FoodItem, type NutritionalNote } from '@/types/notes';
import { type ActivityResult, type NutrientGapResponse, type ActivityEntry, type ChildEnergyRequirementsResponse } from '@/api/types';
import NutritionScoreCard from './NutritionScoreCard';
import storageService from '@/libs/StorageService';
import { STORAGE_KEYS } from '@/types/storage';

interface NoteCardProps {
  note: NutritionalNote;
  onDelete: (id: string) => void;
  child?: {
    name: string;
    gender: string;
    age?: string | number;
  };
}

export default function NoteCard({
  note,
  onDelete,
  child,
}: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  const { id, createdAt, originalFoods, additionalFoods, nutrient_gaps, nutrientComparisons, activityResult, activityPAL, selectedActivities, energyRequirements } = note;
  const date = new Date(createdAt);

  // Format the date in a user-friendly format
  const formattedDate = (() => {
    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'MMM d, yyyy • h:mm a');
  })();

  // Determine if there are foods to show in different sections
  const hasOriginalFoods = originalFoods && originalFoods.length > 0;
  const hasAdditionalFoods = additionalFoods && additionalFoods.length > 0;
  const hasBothFoodTypes = hasOriginalFoods && hasAdditionalFoods;
  
  // If we don't have separate original/additional foods, but do have additionalFoods,
  // display all of them as originalFoods
  const displayFoods = {
    original: hasOriginalFoods ? originalFoods : (hasBothFoodTypes ? [] : additionalFoods),
    additional: additionalFoods
  };

  /**
   * Store data from this note to local storage for analysis
   */
  const prepareData = (isForRecommendations: boolean = false) => {
    // Store the note ID as the active note being viewed
    storageService.setLocalItem<string>(STORAGE_KEYS.ACTIVE_NOTE_ID, id.toString());
    
    // Store gap results
    storageService.setLocalItem<NutrientGapResponse>(STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS, nutrient_gaps);

    // Store ingredient from the original foods and additional foods
    storageService.setLocalItem<FoodItem[]>(STORAGE_KEYS.SCANNED_FOODS, originalFoods || []);
    storageService.setLocalItem<string[]>(STORAGE_KEYS.SELECTED_INGREDIENT_IDS, originalFoods?.map(food => food.id) || []);
    storageService.setLocalItem<string[]>(STORAGE_KEYS.RECOMMENDED_FOOD_IDS, additionalFoods?.map(food => food.id) || []);

    // Store activity data
    storageService.setLocalItem<ActivityResult>(STORAGE_KEYS.ACTIVITY_RESULT, activityResult!); // TODO: null safety
    storageService.setLocalItem<number>(STORAGE_KEYS.ACTIVITY_PAL, activityPAL || 0);
    storageService.setLocalItem<ActivityEntry[]>(STORAGE_KEYS.SELECTED_ACTIVITIES, selectedActivities || []);

    // Store energy requirements
    storageService.setLocalItem<ChildEnergyRequirementsResponse>(STORAGE_KEYS.ENERGY_REQUIREMENTS, energyRequirements!); // TODO: null safety

    // Navigate to the gap analysis page
    router.push('/NutriGap');

    if (isForRecommendations) {
      router.push('/NutriRecommend');
    }
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
          onDelete(id.toString());
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
      
      {/* Nutritional Score Card & Action Buttons */}
      <div className="px-4 pb-4">
        <NutritionScoreCard 
          allNutrients={nutrient_gaps.nutrient_gaps}
          missingCount={nutrient_gaps.missing_nutrients?.length || 0}
          excessCount={nutrient_gaps.excess_nutrients?.length || 0}
          totalCalories={nutrient_gaps.total_calories || 0}
          showDetails={false}
          className="w-full mb-3"
        />

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              prepareData();
            }}
            className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm flex items-center justify-center gap-1"
          >
            <BarChart2 size={16} />
            View Analysis
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              prepareData(true);
            }}
            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors text-sm flex items-center justify-center gap-1"
          >
            <LightbulbIcon size={16} />
            View Recommendations
          </button>
        </div>
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
            {displayFoods.original && displayFoods.original.length > 0 && (
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
            {displayFoods.additional && displayFoods.additional.length > 0 && (
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
              {/* Activity & Energy Requirements Summary */}
              {(activityPAL !== undefined || energyRequirements) && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
                  <div className="p-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Activity & Energy</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {activityPAL !== undefined && activityPAL > 0 && (
                        <div className="bg-purple-50 rounded-lg p-2 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2.5 10a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" clipRule="evenodd" />
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-purple-700">Activity Level (PAL)</p>
                            <p className="text-sm font-semibold">{activityPAL.toFixed(2)}</p>
                          </div>
                        </div>
                      )}
                      
                      {energyRequirements?.estimated_energy_requirement && (
                        <div className="bg-orange-50 rounded-lg p-2 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-orange-700">Daily Energy Needs</p>
                            <p className="text-sm font-semibold">{Math.round(energyRequirements.estimated_energy_requirement)} kJ</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}


              {/* Nutrition Stats */}
              <div className="grid grid-cols-3 divide-x bg-white rounded-xl shadow-sm overflow-hidden mb-4">
                <div className="p-3 text-center">
                  <p className="text-xs text-blue-600 mb-1">Total Calories</p>
                  <p className="text-base font-bold">{nutrient_gaps.total_calories?.toFixed(0) || 0} kJ</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-red-600 mb-1">Missing</p>
                  <p className="text-base font-bold">{nutrient_gaps.missing_nutrients?.length || 0}</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-amber-600 mb-1">Excess</p>
                  <p className="text-base font-bold">{nutrient_gaps.excess_nutrients?.length || 0}</p>
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
                    {nutrientComparisons &&nutrientComparisons.map((item) => (
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



