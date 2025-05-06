'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FoodItemDisplay, EditableFoodItem, MealType, MealImage } from './types';
import { IngredientsList } from './FoodIngredients';
import { useNutrition } from '../../contexts/NutritionContext';
import storageService from '@/libs/StorageService';
import { motion } from 'framer-motion';
import { ChildProfile } from '@/types/profile';
import { Calendar } from './ActivityCalendar';
import { ActivityEntry } from '@/api/types';
import { nutripeekApi } from '@/api/nutripeekApi';
import MealResultCard from './Meal/MealResultCard';
import MobileCarousel, { CarouselItem } from '@/components/ui/MobileCarousel';
import useDeviceDetection from '@/hooks/useDeviceDetection';
import { toast } from 'sonner';
import { getMealTitle } from './utils';

interface ResultsSectionProps {
  mealImages: MealImage[];
  onMealTypeChange: (index: number, newType: MealType) => void;
  toggleView: () => void;
}

export default function ResultsSection({
  mealImages,
  onMealTypeChange,
  toggleView
}: ResultsSectionProps) {
  const router = useRouter();
  const { setIngredientIds, setSelectedChildId } = useNutrition();
  const [ingredients, setIngredients] = useState<EditableFoodItem[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [selectedActivities, setSelectedActivities] = useState<ActivityEntry[]>([]);
  const [activityPAL, setActivityPAL] = useState<number | null>(null);
  const [ingredientsInitialized, setIngredientsInitialized] = useState(false);
  
  // Use device detection hook to check if screen is mobile
  const { isMobile, isTablet } = useDeviceDetection();
  const shouldUseCarousel = isMobile || isTablet;
  
  const CHILDREN_KEY = "user_children";
  
    // Load child profiles
    useEffect(() => {
      const saved = storageService.getLocalItem({ key: CHILDREN_KEY, defaultValue: [] });
      if (saved && saved.length > 0) {
        setChildProfiles(saved);
      }
    }, []);

  // Generate a unique ID
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Get all images that have been successfully processed
  const processedMealImages = mealImages.filter(meal => 
    meal.file !== null && meal.detectedItems && meal.detectedItems.length > 0
  );

  // Calculate existing meal types for validation
  const existingMealTypes = mealImages
    .filter(meal => meal.file !== null)
    .map(meal => meal.mealType);

  // Reset ingredients to force re-initialization
  const handleResetIngredients = () => {
    setIngredients([]);
    setIngredientsInitialized(false);
  };

  // Handle meal type change with validation
  const handleSafeMealTypeChange = (index: number, newType: MealType) => {
    // Check if the new meal type is already in use
    const currentMealTypes = processedMealImages.map(meal => meal.mealType);
    
    // Remove the current meal type from the list (since it's being changed)
    const targetMeal = mealImages[index];
    const otherMealTypes = currentMealTypes.filter(
      (_, i) => processedMealImages[i] !== targetMeal
    );
    
    // Check if any other meal already has this type
    if (otherMealTypes.includes(newType)) {
      toast.error(`A ${getMealTitle(newType)} image already exists. Each meal type can only be used once.`);
      return;
    }
    
    // If valid, proceed with the change
    onMealTypeChange(index, newType);
  };
  
  // Group all detected items from all meals into a single list for ingredients
  useEffect(() => {
    // Skip effect if no processed meals
    if (processedMealImages.length === 0) return;
    
    // Skip if ingredients have already been initialized
    if (ingredientsInitialized) {
      return;
    }
    
    // Collect all detected items from all processed meals
    const allDetectedItems: FoodItemDisplay[] = [];
    
    processedMealImages.forEach(meal => {
      if (meal.detectedItems) {
        // Add each item with meal type metadata
        meal.detectedItems.forEach(item => {
          allDetectedItems.push({
            ...item,
          });
        });
      }
    });
    
    // Create a map to consolidate duplicate ingredients by name
    const consolidatedItemsMap = new Map<string, EditableFoodItem>();
    
    // Process each detected item and consolidate duplicates
    allDetectedItems.forEach(item => {
      const itemName = item.name.trim().toLowerCase();
      
      if (consolidatedItemsMap.has(itemName)) {
        // Item with this name already exists, increment quantity
        const existingItem = consolidatedItemsMap.get(itemName)!;
        const currentQuantity = existingItem.quantity || 1;
        const newQuantity = currentQuantity + (item.quantity || 1);
        
        // Update nutrients if they exist
        let updatedNutrients = existingItem.nutrients || {};
        if (item.nutrients) {
          // Combine nutrients from both items
          updatedNutrients = { ...updatedNutrients };
          Object.entries(item.nutrients).forEach(([key, value]) => {
            updatedNutrients[key] = (updatedNutrients[key] || 0) + value;
          });
        }
        
        // Update the existing item in the map, preserving the uniqueId and other properties
        consolidatedItemsMap.set(itemName, {
          ...existingItem,
          quantity: newQuantity,
          nutrients: updatedNutrients,
          // Keep original id, uniqueId and other properties needed for editing
        });
      } else {
        // New item, add to map with uniqueId
        const newItem = {
          ...item,
          name: item.name,
          quantity: item.quantity || 1,
          isCustomAdded: false,
          uniqueId: generateUniqueId(),
        } as EditableFoodItem;
        
        consolidatedItemsMap.set(itemName, newItem);
      }
    });
    
    // Convert consolidated map back to array
    const editableIngredients = Array.from(consolidatedItemsMap.values());

    // Only set the ingredients initially
    setIngredients(editableIngredients);
    setIngredientsInitialized(true);
    
  }, [processedMealImages, ingredientsInitialized]); // Add ingredientsInitialized as a dependency

  // Handle ingredient list changes (add/remove)
  const handleIngredientsChange = (updatedIngredients: EditableFoodItem[]) => {
    setIngredients(updatedIngredients);
  };

  // Navigate to previous profile
  const handlePrevProfile = () => {
    if (childProfiles.length === 0) return;
    setCurrentProfileIndex((prev) => 
      prev === 0 ? childProfiles.length - 1 : prev - 1
    );
  };

  // Navigate to next profile
  const handleNextProfile = () => {
    if (childProfiles.length === 0) return;
    setCurrentProfileIndex((prev) => 
      prev === childProfiles.length - 1 ? 0 : prev + 1
    );
  };

  /**
   * Create meal cards for either carousel or grid display
   * This avoids duplicating the MealResultCard rendering logic
   */
  const renderMealCards = () => {
    return processedMealImages.map((meal, index) => (
      <MealResultCard
        key={`${meal.mealType}-${index}`}
        mealType={meal.mealType}
        imagePreviewUrl={meal.imagePreviewUrl}
        detectedItems={meal.detectedItems || []}
        onMealTypeChange={(newType) => {
          // Find the original index in mealImages array
          const originalIndex = mealImages.findIndex(m => m === meal);
          handleSafeMealTypeChange(originalIndex, newType);
        }}
      />
    ));
  };

  /**
   * Create carousel items from meal cards
   */
  const createCarouselItems = (): CarouselItem[] => {
    return processedMealImages.map((meal, index) => ({
      key: `${meal.mealType}-${index}`,
      content: (
        <div className="px-2">
          <MealResultCard
            mealType={meal.mealType}
            imagePreviewUrl={meal.imagePreviewUrl}
            detectedItems={meal.detectedItems || []}
            onMealTypeChange={(newType) => {
              // Find the original index in mealImages array
              const originalIndex = mealImages.findIndex(m => m === meal);
              handleSafeMealTypeChange(originalIndex, newType);
            }}
          />
        </div>
      )
    }));
  };

  // Handle nutritional gap calculation
  const handleCalculateGap = async (ingredientIds: string[]) => {
    if (ingredientIds.length === 0) return;
    
    // Check if child profiles exist
    if (childProfiles.length === 0) {
      alert("Please create a child profile first to get personalized nutritional analysis.");
      router.push('/Profile');
      return;
    }

    try {
      setIsCalculating(true);
      
      // Create an expanded list of IDs that respects quantities
      const expandedIds: string[] = [];
      
      // For each ingredient, add its ID the appropriate number of times
      ingredients.forEach(item => {
        if (item.id) {
          const quantity = item.quantity || 1;
          for (let i = 0; i < quantity; i++) {
            expandedIds.push(item.id);
          }
        }
      });
      
      // Store the expanded IDs in context
      setIngredientIds(expandedIds);
      
      // Store the selected child profile index
      setSelectedChildId(currentProfileIndex);

      // Save the finalized ingredients list as scannedFoods for use in notes
      // Convert EditableFoodItem to FoodItem format
      const scannedFoods = ingredients.map(item => ({
        id: item.id || `food-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: item.name,
        category: item.name.toLowerCase().includes('fruit') ? 'Fruits' : 
                 item.name.toLowerCase().includes('vegetable') ? 'Vegetables' : 'Other',
        imageUrl: '', // Use default empty string since EditableFoodItem doesn't have imageUrl / food category
        nutrients: item.nutrients || {},
        selected: true,
        quantity: item.quantity || 1
      }));
      
      // Store in localStorage
      storageService.setLocalItem('scannedFoods', scannedFoods);
      
      // Check if activity data is present
      const hasActivityData = selectedActivities && selectedActivities.length > 0;
      
      // Always use the current activity data for PAL calculation, not previous data
      let calculatedPAL = null;
      let energyRequirements = null;
      
      if (hasActivityData) {
        // Get the current child's age and gender
        const childProfile = childProfiles[currentProfileIndex];
        const childAge = parseInt(childProfile.age, 10);
        const childGender = childProfile.gender.toLowerCase() === 'female' || childProfile.gender.toLowerCase() === 'girl' ? 'girl' : 'boy';
        
        try {
          // Always calculate fresh PAL based on current selected activities
          const activityResult = await nutripeekApi.calculatePAL(childAge, selectedActivities);
          calculatedPAL = activityResult.pal;
          
          // Store the latest activity data
          storageService.setLocalItem('activityResult', activityResult);
          storageService.setLocalItem('activityPAL', calculatedPAL);
          storageService.setLocalItem('selectedActivities', selectedActivities);        
          
          // Now get the target energy based on the PAL
          if (calculatedPAL) {
            energyRequirements = await nutripeekApi.getTargetEnergy(childAge, childGender, calculatedPAL);
            storageService.setLocalItem('energyRequirements', energyRequirements);
          }
        } catch (error) {
          console.error("Error calculating PAL or target energy:", error);
        }
      } else {
        // Clear any previous activity data if no activities are selected
        storageService.removeLocalItem('activityResult');
        storageService.removeLocalItem('activityPAL');
        storageService.removeLocalItem('selectedActivities');
        storageService.removeLocalItem('energyRequirements');
      }
      
      // Navigate to the results page (locale-aware routing)
      router.push('/NutriGap');
      
    } catch (error) {
      console.error("Error preparing nutritional gap calculation:", error);
      alert("Error preparing nutritional gap calculation. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Render the current child profile
  const renderCurrentProfile = () => {
    if (childProfiles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2 text-center">No child profiles available</p>
          <button
            onClick={() => router.push('/Profile')}
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            Create a Profile
          </button>
        </div>
      );
    }

    const profile = childProfiles[currentProfileIndex];
    return (
      <div className="flex flex-col items-center px-4">
        <motion.div 
          key={profile.name} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-4 shadow-md w-full"
        >
          <h3 className="text-xl font-semibold text-green-700 text-center mb-3">{profile.name}</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Age:</span>
              <span className="font-medium">{profile.age} years</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <span className="font-medium">{profile.gender}</span>
            </div>
          </div>
        </motion.div>
        
        <p className="text-center text-gray-500 mt-3 text-sm">
          Analysis will be personalized for {profile.name}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl">
      {/* Meal Images Section */}
      <div className="w-full mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center">Your Meals</h2>
        
        {processedMealImages.length > 0 ? (
          <div className="w-full">
            {shouldUseCarousel ? (
              <MobileCarousel
                items={createCarouselItems()}
                showControls={true}
                showIndicators={true}
                className="max-w-full"
                carouselItemClass="p-2"
                transitionType="slide"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderMealCards()}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No meal images processed yet.</p>
          </div>
        )}
        
        <div className="flex justify-center mt-4">
          <button
            className="flex items-center justify-center gap-2 mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={toggleView}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Scan More Images
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
        {/* Ingredients Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-center">Check Your Ingredients</h2>
            {ingredientsInitialized && (
              <button
                onClick={handleResetIngredients}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                title="Reset ingredients to their initial state based on detected food items"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Reset List
              </button>
            )}
          </div>
          
          <IngredientsList 
            ingredients={ingredients}
            onIngredientsChange={handleIngredientsChange}
            onCalculateGap={handleCalculateGap}
          />
        </div>
        
        {/* Child Profile Selection Section */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full min-h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-center">Select Child Profile</h2>
          
          <div className="flex-grow flex flex-col justify-center">
            {/* Carousel navigation */}
            {childProfiles.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={handlePrevProfile}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  disabled={childProfiles.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="text-sm text-gray-500">
                  {childProfiles.length > 0 ? `${currentProfileIndex + 1}/${childProfiles.length}` : ''}
                </span>
                
                <button 
                  onClick={handleNextProfile}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  disabled={childProfiles.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Profile card */}
            <div className="flex-grow flex items-center justify-center">
              {renderCurrentProfile()}
            </div>
          </div>
          
          {childProfiles.length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/Profile')}
                className="text-green-600 hover:underline text-sm font-medium"
              >
                Manage Profiles
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Activity Tracking Section */}
      <div className="w-full mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">Daily Activity Tracker</h2>
        <p className="text-gray-600 mb-6 text-center">
          Add your child's activities to calculate their Physical Activity Level (PAL) for more accurate nutritional recommendations.
        </p>
        
        <Calendar
          selectedActivities={selectedActivities}
          setSelectedActivities={setSelectedActivities}
          childAge={childProfiles[currentProfileIndex]?.age ? 
            parseInt(childProfiles[currentProfileIndex].age.toString()) : 
            undefined}
        />
      </div>
      
      {/* CTA Button - Prominent Calculate Nutritional Gap button */}
      <div className="w-full mt-8 mb-4">
        <button
          onClick={() => {
            if (ingredients.length > 0) {
              // Extract the IDs without worrying about quantities here,
              // as handleCalculateGap will handle the quantities
              const ingredientIds = ingredients
                .filter(item => item.id)
                .map(item => item.id as string);
              
              handleCalculateGap(ingredientIds);
            }
          }}
          disabled={ingredients.length === 0 || childProfiles.length === 0}
          className={`w-full max-w-xl mx-auto py-4 rounded-lg text-white font-semibold text-lg shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-105 
            ${(ingredients.length > 0 && childProfiles.length > 0)
              ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
              : 'bg-gray-300 cursor-not-allowed'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="8" cy="8" r="2" strokeWidth={2} />
            <circle cx="16" cy="16" r="2" strokeWidth={2} />
            <line x1="6" y1="18" x2="18" y2="6" strokeWidth={2} strokeLinecap="round" />
          </svg>
          Calculate Nutritional & Activity Analysis
        </button>
        {ingredients.length === 0 && 
          <p className="text-center text-red-500 mt-2 text-sm">Please add ingredients to continue</p>
        }
        {ingredients.length > 0 && childProfiles.length === 0 && 
          <p className="text-center text-red-500 mt-2 text-sm">Please create a child profile to continue</p>
        }
        
        {/* Activity status indicator */}
        {ingredients.length > 0 && childProfiles.length > 0 && (
          <div className="text-center mt-2 text-sm">
            {selectedActivities.length > 0 ? (
              <p className="text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Activity data included in analysis
              </p>
            ) : (
              <p className="text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Add activities for a complete analysis
              </p>
            )}
          </div>
        )}
      </div>
      
      {isCalculating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700">Calculating nutritional gap...</p>
          </div>
        </div>
      )}
    </div>
  );
}