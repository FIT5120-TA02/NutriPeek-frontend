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
import { ArrowLeft, ArrowRight, ChartPie, Table, ChartBar } from 'phosphor-react';

import { nutripeekApi } from '@/api/nutripeekApi';
import { NutrientIntakeResponse } from '@/api/types';
import { 
  PlateFood,
  PlacedFood,
  PlateSummary,
  CategoryFoods,
  AvatarEmotion,
} from './types';
import { PLATE_SECTIONS } from './constants';
import { 
  transformCategoryDataToFoods, 
  getDefaultFoods, 
  getAvatarEmotion,
  getFeedbackMessage 
} from './utils';
import { calculatePersonalizedNutritionSummary } from './nutrientCalculations';

import LoadingSpinner from '../ui/LoadingSpinner';
import SectionedPlate from './SectionedPlate';
import FoodPalette from './FoodPalette';
import NutritionChart from './NutritionChart';
import AvatarFeedback from './AvatarFeedback';
import ProfileSelectionModal from './ProfileSelectionModal';
import FoodNutrientTable from './FoodNutrientTable';

import { ChildProfile } from '@/types/profile';

// Animation variants for smooth transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.5 }
  },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

type ViewMode = 'build' | 'review';

// Function to toggle between view modes
const getOppositeViewMode = (mode: ViewMode): ViewMode => {
  return mode === 'build' ? 'review' : 'build';
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
  const [viewMode, setViewMode] = useState<ViewMode>('build');
  
  // Profile selection modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Generate a stable key for each mode to prevent React key collision
  const buildModeKey = useMemo(() => 'build-mode-stable', []);
  const reviewModeKey = useMemo(() => 'review-mode-stable', []);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Nutrient intake API state
  const [nutrientIntakeLoading, setNutrientIntakeLoading] = useState(false);
  const [nutrientIntakeResponse, setNutrientIntakeResponse] = useState<NutrientIntakeResponse | null>(null);
  
  // Child profile state
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number>(0);
  const [selectedProfile, setSelectedProfile] = useState<ChildProfile | null>(null);
  
  // Max values for nutrition chart derived from API response
  const [nutrientMaxValues, setNutrientMaxValues] = useState<{
    energy: number;
    protein: number;
    fat: number;
    carbs: number;
    fibre: number;
  } | null>(null);
  
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
  
  // Handle profile selection from ProfileSelector or ProfileSelectionModal
  const handleProfileSelect = useCallback((profile: ChildProfile, index: number) => {
    setSelectedProfile(profile);
    setSelectedProfileIndex(index);
  }, []);
  
  // Calculate nutrition summary for placed foods
  // If in review mode, use personalized calculation with API data
  const nutritionSummary = useMemo<PlateSummary>(() => {
    if (viewMode === 'review' && nutrientIntakeResponse) {
      return calculatePersonalizedNutritionSummary(placedFoods, nutrientIntakeResponse);
    } else {
      return calculatePersonalizedNutritionSummary(placedFoods, null);
    }
  }, [placedFoods, nutrientIntakeResponse, viewMode]);
  
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
    return grouped;
  }, [placedFoods, viewMode]);
  
  // Fetch nutrient intake data from API when toggling to review mode
  const fetchNutrientIntake = useCallback(async () => {
    if (!selectedProfile) {
      console.warn('No profile selected, cannot fetch nutrient intake data');
      return false;
    }
    
    try {
      setNutrientIntakeLoading(true);
      
      // Parse age to number and determine gender format for API
      const age = parseInt(selectedProfile.age, 10);
      const gender = selectedProfile.gender.toLowerCase() === 'female' ? 'girl' : 'boy';
      
      if (isNaN(age)) {
        console.error('Invalid age:', selectedProfile.age);
        return false;
      }
      
      // Call the API
      const response = await nutripeekApi.getNutrientIntake({ age, gender });
      setNutrientIntakeResponse(response);
      
      // Extract max values for chart from response
      if (response && response.nutrient_intakes) {
        const intakes = response.nutrient_intakes;
        const maxValues = {
          energy: getRecommendedIntake(intakes, ['energy', 'energy_kj', 'kilojoules'], 1000),
          protein: getRecommendedIntake(intakes, ['protein', 'protein_g'], 20),
          fat: getRecommendedIntake(intakes, ['fat', 'total_fat', 'total_fat_g'], 30),
          carbs: getRecommendedIntake(intakes, ['carbohydrate', 'carbs', 'carbohydrate_g'], 60),
          fibre: getRecommendedIntake(intakes, ['fiber', 'fibre', 'dietary_fibre', 'dietary_fibre_g'], 10)
        };
        setNutrientMaxValues(maxValues);
      }
      
      return true;
    } catch (err) {
      console.error('Failed to fetch nutrient intake data:', err);
      return false;
    } finally {
      setNutrientIntakeLoading(false);
    }
  }, [selectedProfile]);
  
  // Helper function to get recommended intake from API response
  function getRecommendedIntake(
    intakes: Record<string, any>,
    possibleKeys: string[],
    defaultValue: number
  ): number {
    for (const key of possibleKeys) {
      if (intakes[key] && typeof intakes[key].recommended_intake === 'number') {
        return intakes[key].recommended_intake;
      }
    }
    return defaultValue;
  }
  
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
    // Reset API response
    setNutrientIntakeResponse(null);
  }, []);
  
  // Toggle between build and review modes
  const toggleViewMode = useCallback(async () => {
    // Prevent switching to review mode if there's no food on the plate
    if (viewMode === 'build' && placedFoods.length === 0) {
      return;
    }
    
    // If in build mode and trying to switch to review, show profile modal instead of direct switch
    if (viewMode === 'build') {
      setIsProfileModalOpen(true);
      return;
    }
        
    // Create a clean copy of placed foods to prevent duplicate state issues
    // Keep their original instanceIds to maintain stable references
    const dedupedFoods = [...new Map(placedFoods.map(food => 
      [food.instanceId, food]
    )).values()];
    
    // Only update if we actually removed duplicates
    if (dedupedFoods.length !== placedFoods.length) {
      setPlacedFoods(dedupedFoods);
    }
    
    // Set view mode to the opposite of the current mode
    setViewMode(getOppositeViewMode(viewMode));
  }, [viewMode, placedFoods]);
  
  // Proceed with switching to review mode after profile selection
  const handleConfirmProfileSelection = useCallback(async () => {
    if (!selectedProfile) {
      console.warn('No profile selected, cannot fetch nutrient intake data');
      return;
    }
    
    setNutrientIntakeLoading(true);
    const success = await fetchNutrientIntake();
    setNutrientIntakeLoading(false);
    
    if (!success) {
      console.warn('Failed to fetch nutrient intake data, using default values');
      // We'll continue with default values in this case
    }
    
    setViewMode('review');
  }, [selectedProfile, fetchNutrientIntake]);
  
  // Check if plate has items to determine if we can switch to review mode
  const hasFood = placedFoods.length > 0;
  const hasProfile = selectedProfile !== null;
  const canReview = hasFood && hasProfile;
  
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
        
        {/* Profile Selection Modal */}
        <ProfileSelectionModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileSelect={handleProfileSelect}
          selectedProfileIndex={selectedProfileIndex}
          onConfirm={handleConfirmProfileSelection}
        />
        
        {/* Mode toggle button */}
        <div className="absolute top-4 right-4 z-20">
          <motion.button
            onClick={toggleViewMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold 
                    transition-all ${canReview 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md cursor-pointer' 
                      : 'bg-gray-400 cursor-not-allowed opacity-70'}`}
            whileHover={canReview ? { scale: 1.05 } : {}}
            whileTap={canReview ? { scale: 0.95 } : {}}
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
        
        {/* Loading overlay for API calls */}
        {nutrientIntakeLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-30">
            <div className="flex flex-col items-center p-6 rounded-lg">
              <LoadingSpinner size="medium" />
              <p className="mt-4 text-indigo-700 font-medium">
                {t('loading_nutrition_data') || 'Loading nutrition data...'}
              </p>
            </div>
          </div>
        )}
        
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
                onProfileSelect={handleProfileSelect}
                selectedProfileIndex={selectedProfileIndex}
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
                nutrientMaxValues={nutrientMaxValues}
                selectedProfile={selectedProfile}
                placedFoods={placedFoods}
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
  modeKey,
  onProfileSelect,
  selectedProfileIndex
}: {
  groupedFoodsByCategory: CategoryFoods;
  allFoods: PlateFood[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, food: PlateFood) => void;
  onRemoveFood: (foodInstanceId: string, category: string) => void;
  onFoodPositioned: (foodInstanceId: string, position: { x: number, y: number }, sectionId: string) => void;
  loading: boolean;
  modeKey: string;
  onProfileSelect: (profile: ChildProfile, index: number) => void;
  selectedProfileIndex: number;
}) {
  const t = useTranslations('BuildPlate');
  
  return (
    <div className="pt-10">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-green-600 mb-2">{t('plate_title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('plate_instructions')}</p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Left Side - Plate */}
        <div className="lg:w-1/2">
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
        <div className="lg:w-1/2">
          <div className="bg-white bg-opacity-80 rounded-2xl p-6 shadow-sm h-full">
            <FoodPalette 
              foods={allFoods}
              onDragStart={onDragStart}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Review Mode Component
 * Shows the plate alongside nutrition information and feedback
 */
function ReviewMode({
  groupedFoodsByCategory,
  nutritionSummary,
  avatarEmotion,
  onReset,
  modeKey,
  nutrientMaxValues,
  selectedProfile,
  placedFoods
}: {
  groupedFoodsByCategory: CategoryFoods;
  nutritionSummary: PlateSummary;
  avatarEmotion: AvatarEmotion;
  onReset: () => void;
  modeKey: string;
  nutrientMaxValues: {
    energy: number;
    protein: number;
    fat: number;
    carbs: number;
    fibre: number;
  } | null;
  selectedProfile: ChildProfile | null;
  placedFoods: PlacedFood[];
}) {
  const t = useTranslations('BuildPlate');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  
  return (
    <div className="pt-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2">{t('nutrition_title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {selectedProfile ? 
            `${t('nutrition_description')} ${t('personalized_for') || 'Personalized for'} ${selectedProfile.name}.` : 
            t('nutrition_description')
          }
        </p>
        
        {/* View toggle buttons */}
        <div className="flex justify-center mt-4">
          <div className="bg-gray-100 rounded-full p-1 inline-flex">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded-full flex items-center text-sm font-medium ${
                viewMode === 'summary' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-indigo-500'
              }`}
              aria-current={viewMode === 'summary' ? 'page' : undefined}
            >
              <ChartBar size={18} weight="bold" className="mr-1.5" />
              {t('summary_view')}
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-full flex items-center text-sm font-medium ${
                viewMode === 'detailed' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-indigo-500'
              }`}
              aria-current={viewMode === 'detailed' ? 'page' : undefined}
            >
              <Table size={18} weight="bold" className="mr-1.5" />
              {t('detailed_view')}
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {viewMode === 'summary' ? (
          <motion.div 
            key="summary-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col lg:flex-row gap-8 items-center"
          >
            {/* Left Side - Nutrition Summary */}
            <div className="lg:w-1/2 flex flex-col justify-center">
              <div className="bg-white bg-opacity-80 rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="text-xl font-bold text-indigo-600 mb-6">{t('nutrition_summary')}</h3>
                
                <div className="w-full max-w-md mx-auto">
                  <NutritionChart 
                    summary={nutritionSummary} 
                    maxValues={nutrientMaxValues || undefined}
                  />
                </div>
              </div>
              
              {/* Reset Button */}
              <div className="flex justify-center">
                <motion.button 
                  onClick={onReset}
                  className="py-3 px-6 bg-gradient-to-r from-red-400 to-pink-400 text-white font-bold rounded-full 
                          hover:from-red-500 hover:to-pink-500 transition-all duration-300 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('reset_button')}
                </motion.button>
              </div>
            </div>
            
            {/* Right Side - Avatar and Plate */}
            <div className="lg:w-1/2 flex flex-col">
              {/* Avatar Feedback */}
              <div className="rounded-2xl p-6 mb-6">
                <AvatarFeedback 
                  emotion={avatarEmotion} 
                  message={getFeedbackMessage(avatarEmotion, t)} 
                />
              </div>
              
              {/* Plate (readonly version) */}
              <div>            
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
          </motion.div>
        ) : (
          <motion.div 
            key="detailed-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Detailed nutrition breakdown */}
            <div className="mb-6">
              <FoodNutrientTable placedFoods={placedFoods} />
            </div>
            
            {/* Reset Button */}
            <div className="flex justify-center">
              <motion.button 
                onClick={onReset}
                className="py-3 px-6 bg-gradient-to-r from-red-400 to-pink-400 text-white font-bold rounded-full 
                        hover:from-red-500 hover:to-pink-500 transition-all duration-300 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('reset_button')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 