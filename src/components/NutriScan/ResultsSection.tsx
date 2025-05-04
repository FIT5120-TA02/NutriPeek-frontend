'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FoodItemDisplay, EditableFoodItem } from './types';
import { IngredientsList } from './FoodIngredients';
import { useNutrition } from '../../contexts/NutritionContext';
import storageService from '@/libs/StorageService';
import { motion } from 'framer-motion';
import { ChildProfile } from '@/types/profile';
import { Calendar } from './ActivityCalendar';
import { ActivityEntry } from '@/api/types';
import { nutripeekApi } from '@/api/nutripeekApi';

interface ResultsSectionProps {
  detectedItems: FoodItemDisplay[];
  imagePreviewUrl: string | null;
  handleReset: () => void;
}

export default function ResultsSection({
  detectedItems,
  imagePreviewUrl,
  handleReset
}: ResultsSectionProps) {
  const router = useRouter();
  const { setIngredientIds, setSelectedChildId } = useNutrition();
  const [ingredients, setIngredients] = useState<EditableFoodItem[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [selectedActivities, setSelectedActivities] = useState<ActivityEntry[]>([]);
  const [activityPAL, setActivityPAL] = useState<number | null>(null);
  
  const CHILDREN_KEY = "user_children";
  
  /**
   * Important: Clear any previously stored activity data when component mounts
   * This fixes the bug where old activity data persists when users revisit the page
   */
  useEffect(() => {
    // Clear previously stored activity data to prevent using stale data
    storageService.removeLocalItem('activityResult');
    storageService.removeLocalItem('activityPAL');
    storageService.removeLocalItem('selectedActivities');
    storageService.removeLocalItem('energyRequirements');
    
    // Reset the state values
    setSelectedActivities([]);
    setActivityPAL(null);
  }, []);

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

  // Group identical ingredients and assign quantities
  useEffect(() => {
    // Since the backend already groups items and provides quantities,
    // we can directly transform the detected items into editable items
    const edibleIngredients: EditableFoodItem[] = detectedItems.map(item => {
      return {
        ...item,
        name: item.name, // Remove any legacy quantity formatting
        quantity: item.quantity || 1, // Use the quantity from the API
        isCustomAdded: false,
        uniqueId: generateUniqueId()
      } as EditableFoodItem;
    });

    setIngredients(edibleIngredients);
  }, [detectedItems]);

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
            
            <div className="mt-3">
              <span className="text-gray-600 block mb-1">Allergies:</span>
              <div className="flex flex-wrap gap-1">
                {profile.allergies && profile.allergies.length > 0 ? (
                  profile.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No allergies recorded</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        <p className="text-center text-gray-500 mt-3 text-sm">
          Analysis will be personalized for {profile.name}
        </p>
      </div>
    );
  };

  /**
   * Handle activity result from ActivityCalendar
   * This callback receives the calculated PAL from the Calendar component
   */
  const handleActivityResult = async (pal: number) => {
    setActivityPAL(pal);
    
    try {
      // Get the current child profile
      const childProfile = childProfiles[currentProfileIndex];
      if (!childProfile) return;
      
      // Get the child's age
      const childAge = parseInt(childProfile.age, 10);
      
      // Make sure we have activities
      if (selectedActivities.length === 0) return;
      
      // Call the API to calculate PAL with the array of ActivityEntry objects
      const activityResult = await nutripeekApi.calculatePAL(childAge, selectedActivities);
      
      // We do NOT store the activity results here anymore.
      // Instead, we wait until the user proceeds to calculation and store it there.
      // This prevents stale data from persisting.
      console.log('Activity PAL calculated:', activityResult.pal, '(not storing yet)');
    } catch (error) {
      console.error('Error calculating PAL:', error);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {/* Image Preview Section */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full flex flex-col min-h-[400px]">
          <h2 className="text-xl font-semibold mb-4 text-center">Your Food</h2>
          <div className="flex-grow flex flex-col justify-center items-center space-y-4">
            <div className="w-full max-h-64 overflow-hidden rounded-lg border-2 border-gray-200">
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="Food"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-400">No image selected</p>
                </div>
              )}
            </div>
            <button
              onClick={handleReset}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
              disabled={isCalculating}
            >
              Scan Another Image
            </button>
          </div>
        </div>

        {/* Ingredients Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full min-h-[400px]">
          <h2 className="text-xl font-semibold mb-4 text-center">Check Your Ingredients</h2>
          
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
      
      {/* Activity Tracking Section (Refactored) */}
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
          onActivityResult={handleActivityResult}
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