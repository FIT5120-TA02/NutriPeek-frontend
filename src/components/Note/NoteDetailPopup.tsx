'use client';

import React, { useEffect } from 'react';
import { NutritionalNote, FoodItem } from '@/types/notes';
import ChildAvatar from '@/components/ui/ChildAvatar';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Plus, BarChart2, LightbulbIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import UnitFormatter from '@/utils/UnitFormatter';
import NutritionScoreCard from './NutritionScoreCard';
import storageService from '@/libs/StorageService';
import { STORAGE_KEYS } from '@/types/storage';
import { ActivityResult, NutrientGapResponse, ActivityEntry, ChildEnergyRequirementsResponse } from '@/api/types';

interface NoteDetailPopupProps {
  note: NutritionalNote;
  onClose: () => void;
  navbarHeight?: string;
}

/**
 * Popup component that displays detailed information about a selected note
 * Shows child info, nutrition score, foods, and detailed nutritional data
 */
export default function NoteDetailPopup({ note, onClose, navbarHeight = '72px' }: NoteDetailPopupProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = React.useState(false);
  
  // Get data from the note
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

  // Add escape key handler to close popup
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
    storageService.setLocalItem<ActivityResult>(STORAGE_KEYS.ACTIVITY_RESULT, activityResult!);
    storageService.setLocalItem<number>(STORAGE_KEYS.ACTIVITY_PAL, activityPAL || 0);
    storageService.setLocalItem<ActivityEntry[]>(STORAGE_KEYS.SELECTED_ACTIVITIES, selectedActivities || []);

    // Store energy requirements
    storageService.setLocalItem<ChildEnergyRequirementsResponse>(STORAGE_KEYS.ENERGY_REQUIREMENTS, energyRequirements!);

    // Navigate to the appropriate page
    if (isForRecommendations) {
      router.push('/NutriRecommend');
    } else {
      router.push('/NutriGap');
    }
    
    // Close the popup
    handleClose();
  };

  // Create a handler function that will dispatch an event when closing
  const handleClose = () => {
    // Dispatch an event that the popup is being closed
    // This helps PinnedItemsLayout to know it should stay open
    window.dispatchEvent(new CustomEvent('noteDetailPopupClosed', { bubbles: false }));
    
    // Call the original onClose
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-0 animate-fade-in" 
      onClick={handleClose}
      style={{
        paddingTop: navbarHeight,
        alignItems: 'flex-start'
      }}
    >
      <div 
        className="relative bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto mt-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: `calc(90vh - ${navbarHeight})`,
        }}
      >
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Note header */}
        <div className="flex flex-col items-center p-6 pb-4 bg-gradient-to-b from-green-50 to-white">
          <ChildAvatar 
            name={note.childName || 'N/A'} 
            gender={note.childGender || 'male'} 
            size={96}
          />
          <h2 className="text-2xl font-bold text-gray-900 text-center mt-4">{note.childName}'s Nutrition</h2>
          <div className="mt-2 flex flex-col items-center">
            <span className="text-sm text-gray-500">{formattedDate}</span>
            {note.childAge && (
              <span className="inline-block px-3 py-1 mt-2 bg-blue-100 text-blue-800 text-sm rounded-full">
                Age: {note.childAge}
              </span>
            )}
          </div>
        </div>

        {/* Note details */}
        <div className="p-6 pt-3 space-y-4">
          {/* Nutrition Score Card */}
          <NutritionScoreCard 
            allNutrients={nutrient_gaps.nutrient_gaps}
            missingCount={nutrient_gaps.missing_nutrients?.length || 0}
            excessCount={nutrient_gaps.excess_nutrients?.length || 0}
            totalCalories={nutrient_gaps.total_calories || 0}
            showDetails={true}
            className="w-full mb-3"
          />

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-4">
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

          {/* Original Foods Section */}
          {displayFoods.original && displayFoods.original.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {hasBothFoodTypes ? 'Original Foods' : 'Selected Foods'}
              </h3>
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
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Added Recommendations</h3>
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

          {/* Activity & Energy Requirements Summary */}
          {(activityPAL !== undefined || energyRequirements) && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Activity & Energy</h3>
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
          )}

          {/* Nutrient Comparisons Details */}
          <div className="mt-4">
            <button
              className="w-full text-sm text-blue-500 py-2 flex items-center justify-center gap-1 hover:bg-blue-50 rounded-md"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Nutrient Details'}
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

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
                  {nutrientComparisons && nutrientComparisons.map((item) => (
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
        </div>
      </div>
    </div>
  );
} 