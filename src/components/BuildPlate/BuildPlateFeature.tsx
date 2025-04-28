"use client";

/**
 * Build a Plate Feature
 * Main interactive component for the Build a Balanced Plate activity
 * Features two modes: build mode and nutrition review mode
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { DndContext } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChartPie } from 'phosphor-react';

import { nutripeekApi } from '@/api/nutripeekApi';
import { 
  PlateFood,
  PlacedFood,
  PlateSummary,
  CategoryFoods,
  AvatarEmotion,
  PlateSection
} from './types';
import { PLATE_SECTIONS } from './constants';
import { 
  transformCategoryDataToFoods, 
  getDefaultFoods, 
  calculateNutritionSummary,
  getAvatarEmotion,
  getFeedbackMessage 
} from './utils';

import LoadingSpinner from '../ui/LoadingSpinner';
import SectionedPlate from './SectionedPlate';
import FoodPalette from './FoodPalette';
import NutritionChart from './NutritionChart';
import AvatarFeedback from './AvatarFeedback';

// Animation variants for smooth transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.5 }
  },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

/**
 * Main component for the Build a Plate feature
 * with both build mode and nutrition review mode
 */
export default function BuildPlateFeature() {
  const t = useTranslations('BuildPlate');
  
  // State for all available food items
  const [allFoods, setAllFoods] = useState<PlateFood[]>([]);
  
  // State for foods placed on the plate
  const [placedFoods, setPlacedFoods] = useState<PlacedFood[]>([]);
  
  // Mode state (build or review)
  const [viewMode, setViewMode] = useState<'build' | 'review'>('build');
  
  // Generate a stable key for each mode to prevent React key collision
  const buildModeKey = useMemo(() => 'build-mode-stable', []);
  const reviewModeKey = useMemo(() => 'review-mode-stable', []);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load food categories data on mount
  useEffect(() => {
    const loadFoodCategories = async () => {
      try {
        setLoading(true);
        
        // Get food categories with nutrient data, including non-empty ones
        const response = await nutripeekApi.getFoodCategories(false);
        
        if (response && response.categories && response.categories.length > 0) {
          // Transform API data to our internal format
          const transformedFoods = transformCategoryDataToFoods(response.categories);
          setAllFoods(transformedFoods);
        } else {
          console.warn('Food categories API returned empty data');
          // Set some default foods if the API doesn't return anything
          setAllFoods(getDefaultFoods());
        }
      } catch (err) {
        console.error('Failed to load food categories:', err);
        setError(t('error_loading'));
        // Set default foods on error
        setAllFoods(getDefaultFoods());
      } finally {
        setLoading(false);
      }
    };
    
    loadFoodCategories();
  }, [t]);
  
  // Calculate nutrition summary for placed foods
  const nutritionSummary = useMemo<PlateSummary>(() => {
    return calculateNutritionSummary(placedFoods);
  }, [placedFoods]);
  
  // Determine avatar emotion based on nutrition score
  const avatarEmotion = useMemo<AvatarEmotion>(() => {
    return getAvatarEmotion(nutritionSummary.nutritionScore);
  }, [nutritionSummary]);
  
  // Group placed foods by category for SectionedPlate
  const groupedFoodsByCategory = useMemo<CategoryFoods>(() => {
    const grouped = {
      protein: placedFoods.filter(food => food.category === 'protein'),
      carbs: placedFoods.filter(food => food.category === 'carbs'),
      extras: placedFoods.filter(food => food.category === 'extras')
    };
    console.log('Grouped foods by category:', {
      mode: viewMode,
      proteinIds: grouped.protein.map(f => f.instanceId),
      carbsIds: grouped.carbs.map(f => f.instanceId),
      extrasIds: grouped.extras.map(f => f.instanceId)
    });
    return grouped;
  }, [placedFoods, viewMode]);
  
  // Handle drag start from food palette
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, food: PlateFood) => {
    e.dataTransfer.setData('application/json', JSON.stringify(food));
  }, []);
  
  // Handle food positioning on the plate
  const handleFoodPositioned = useCallback((
    foodInstanceId: string, 
    position: { x: number; y: number },
    sectionId: string
  ) => {
    // Only allow positioning in build mode
    if (viewMode === 'review') return;
    
    // Update the position of the food in our state
    setPlacedFoods(prev => {
      // Check if this food instance already exists
      const exists = prev.some(food => food.instanceId === foodInstanceId);
      
      if (exists) {
        // Update existing food position
        return prev.map(food => 
          food.instanceId === foodInstanceId 
            ? { ...food, position, sectionId } 
            : food
        );
      } else {
        // This is a new food being added from SectionedPlate
        // Find it in allFoods by extracting the base id from instanceId
        const baseId = foodInstanceId.split('-instance-')[0];
        const foodBase = allFoods.find(f => f.id === baseId);
        
        if (foodBase) {
          // Create a new food with a stable ID that won't cause conflicts
          const stableInstanceId = `${foodBase.id}-instance-${Date.now()}`;
          const newFood: PlacedFood = {
            ...foodBase,
            instanceId: stableInstanceId,
            position,
            sectionId
          };
          return [...prev, newFood];
        }
        return prev;
      }
    });
  }, [allFoods, viewMode]);
  
  // Remove a food item from the plate
  const handleRemoveFood = useCallback((foodInstanceId: string, category: string) => {
    // Only allow removal in build mode
    if (viewMode === 'review') return;
    
    setPlacedFoods(prev => prev.filter(food => food.instanceId !== foodInstanceId));
  }, [viewMode]);
  
  // Reset the plate
  const handleResetPlate = useCallback(() => {
    setPlacedFoods([]);
    // Reset to build mode when plate is reset
    setViewMode('build');
  }, []);
  
  // Toggle between build and review modes
  const toggleViewMode = useCallback(() => {
    // Prevent switching to review mode if there's no food on the plate
    if (viewMode === 'build' && placedFoods.length === 0) {
      return;
    }
    console.log('Toggling view mode from', viewMode, 'to', viewMode === 'build' ? 'review' : 'build');
    
    // Create a clean copy of placed foods to prevent duplicate state issues
    // Keep their original instanceIds to maintain stable references
    const dedupedFoods = [...new Map(placedFoods.map(food => 
      [food.instanceId, food]
    )).values()];
    
    // Only update if we actually removed duplicates
    if (dedupedFoods.length !== placedFoods.length) {
      console.log(`Removed ${placedFoods.length - dedupedFoods.length} duplicate foods`);
      setPlacedFoods(dedupedFoods);
    }
    
    setViewMode(prev => prev === 'build' ? 'review' : 'build');
  }, [viewMode, placedFoods]);
  
  // Check if plate has items to determine if we can switch to review mode
  const hasFood = placedFoods.length > 0;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <LoadingSpinner size="large" label={t('loading_message')} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 bg-red-50 rounded-xl text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg" 
          onClick={() => window.location.reload()}
        >
          {t('try_again')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Main container with shared gradient background */}
      <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-6 shadow-lg overflow-hidden">
        {/* Decorative elements - updated to be responsive and better positioned */}
        <div className="absolute -top-[10%] right-[5%] w-[25%] h-[25%] max-w-[240px] max-h-[240px] bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-[10%] left-[5%] w-[25%] h-[25%] max-w-[240px] max-h-[240px] bg-green-100 rounded-full opacity-20"></div>
        <div className="absolute top-[30%] -left-[5%] w-[15%] h-[15%] max-w-[120px] max-h-[120px] bg-yellow-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-[40%] -right-[5%] w-[15%] h-[15%] max-w-[120px] max-h-[120px] bg-purple-100 rounded-full opacity-20"></div>
        
        {/* Mode toggle button */}
        <div className="absolute top-4 right-4 z-20">
          <motion.button
            onClick={toggleViewMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold 
                    transition-all ${hasFood 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md cursor-pointer' 
                      : 'bg-gray-400 cursor-not-allowed opacity-70'}`}
            whileHover={hasFood ? { scale: 1.05 } : {}}
            whileTap={hasFood ? { scale: 0.95 } : {}}
          >
            {viewMode === 'build' ? (
              <>
                <ChartPie size={20} weight="bold" />
                {t('view_nutrition')}
                <ArrowRight size={18} />
              </>
            ) : (
              <>
                <ArrowLeft size={18} />
                {t('back_to_building')}
              </>
            )}
          </motion.button>
        </div>
        
        {/* Build Mode or Review Mode */}
        <AnimatePresence mode="wait">
          {viewMode === 'build' ? (
            <motion.div
              key="build-mode"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="min-h-[600px]"
            >
              <BuildMode
                groupedFoodsByCategory={groupedFoodsByCategory}
                allFoods={allFoods}
                onDragStart={handleDragStart}
                onRemoveFood={handleRemoveFood}
                onFoodPositioned={handleFoodPositioned}
                loading={loading}
                modeKey={buildModeKey}
              />
            </motion.div>
          ) : (
            <motion.div
              key="review-mode"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="min-h-[600px]"
            >
              <ReviewMode
                groupedFoodsByCategory={groupedFoodsByCategory}
                nutritionSummary={nutritionSummary}
                avatarEmotion={avatarEmotion}
                onReset={handleResetPlate}
                modeKey={reviewModeKey}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Build Mode Component
 * Shows the plate and food palette for building a meal
 */
function BuildMode({
  groupedFoodsByCategory,
  allFoods,
  onDragStart,
  onRemoveFood,
  onFoodPositioned,
  loading,
  modeKey
}: {
  groupedFoodsByCategory: CategoryFoods;
  allFoods: PlateFood[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, food: PlateFood) => void;
  onRemoveFood: (foodInstanceId: string, category: string) => void;
  onFoodPositioned: (foodInstanceId: string, position: { x: number, y: number }, sectionId: string) => void;
  loading: boolean;
  modeKey: string;
}) {
  const t = useTranslations('BuildPlate');
  
  // Use a stable key
  console.log('BuildMode rendering foods:', 
    Object.values(groupedFoodsByCategory).flat().map(f => f.instanceId));
  
  return (
    <div className="pt-10">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-green-600 mb-2">{t('plate_title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('plate_instructions')}</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side - Plate */}
        <div className="flex flex-col">
          <DndContext>
            <SectionedPlate 
              key={modeKey}
              selectedFoods={groupedFoodsByCategory}
              plateSections={PLATE_SECTIONS}
              onRemoveFood={onRemoveFood}
              onFoodPositioned={onFoodPositioned}
              readOnly={false}
            />
          </DndContext>
        </div>
        
        {/* Right Side - Food Palette */}
        <div className="bg-white bg-opacity-80 rounded-2xl p-6 shadow-sm">
          <FoodPalette 
            foods={allFoods}
            onDragStart={onDragStart}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Review Mode Component
 * Shows the plate alongside nutrition information and feedback
 * Highlights avatar feedback first followed by nutrition details
 */
function ReviewMode({
  groupedFoodsByCategory,
  nutritionSummary,
  avatarEmotion,
  onReset,
  modeKey
}: {
  groupedFoodsByCategory: CategoryFoods;
  nutritionSummary: PlateSummary;
  avatarEmotion: AvatarEmotion;
  onReset: () => void;
  modeKey: string;
}) {
  const t = useTranslations('BuildPlate');
  
  // Use a stable key
  console.log('ReviewMode rendering foods:', 
    Object.values(groupedFoodsByCategory).flat().map(f => f.instanceId));
  
  return (
    <div className="pt-10">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2">{t('nutrition_title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('nutrition_description')}</p>
      </div>
      
      {/* Reorganized to highlight avatar feedback first */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-full max-w-lg">
          <AvatarFeedback 
            emotion={avatarEmotion} 
            message={getFeedbackMessage(avatarEmotion, t)} 
          />
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 mt-6">
        {/* Left Side - Nutrition Info */}
        <div className="bg-white bg-opacity-80 rounded-2xl p-6 shadow-sm flex flex-col items-center">
          <h3 className="text-xl font-bold text-indigo-600 mb-6 self-start">{t('nutrition_summary')}</h3>
          
          <div className="w-full max-w-md">
            <NutritionChart summary={nutritionSummary} />
          </div>
          
          {/* Reset Button */}
          <motion.button 
            onClick={onReset}
            className="mt-8 py-3 px-6 bg-gradient-to-r from-red-400 to-pink-400 text-white font-bold rounded-full 
                     hover:from-red-500 hover:to-pink-500 transition-all duration-300 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('reset_button')}
          </motion.button>
        </div>
        
        {/* Right Side - Plate (readonly version) */}
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-green-600 mb-4">{t('your_plate')}</h3>
          
          <DndContext>
            <SectionedPlate 
              key={modeKey}
              selectedFoods={groupedFoodsByCategory}
              plateSections={PLATE_SECTIONS}
              onRemoveFood={() => {}} // Empty function as we're in read-only mode
              onFoodPositioned={() => {}} // Empty function as we're in read-only mode
              readOnly={true} // Set to true to indicate read-only state
            />
          </DndContext>
        </div>
      </div>
    </div>
  );
} 