'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FoodItemDisplay, EditableFoodItem } from './types';
import { IngredientsList } from './FoodIngredients';
import { useNutrition } from '../../contexts/NutritionContext';
import storageService from '@/libs/StorageService';
import { motion } from 'framer-motion';

interface ChildProfile {
  name: string;
  age: string;
  gender: string;
  allergies: string[];
}

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

  // Get gender for API in expected format
  const getGenderForApi = (gender: string): 'boy' | 'girl' => {
    return gender.toLowerCase() === 'female' ? 'girl' : 'boy';
  };

  // Handle nutritional gap calculation
  const handleCalculateGap = async (ingredientIds: string[]) => {
    if (ingredientIds.length === 0) return;
    
    // Check if child profiles exist
    if (childProfiles.length === 0) {
      alert("Please create a child profile first to get personalized nutritional analysis.");
      router.push('/profile');
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
      
      // Navigate to the results page (locale-aware routing)
      router.push('/results');
      
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
            onClick={() => router.push('/profile')}
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
                {profile.allergies.length > 0 ? (
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

  return (
    <div className="flex flex-col items-center w-full max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
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
                onClick={() => router.push('/profile')}
                className="text-green-600 hover:underline text-sm font-medium"
              >
                Manage Profiles
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* CTA Button - Prominent Calculate Nutritional Gap button */}
      <div className="w-full mt-8 mb-4">
        <button
          onClick={() => {
            if (ingredients.length > 0) {
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
          Calculate Nutritional Gap
        </button>
        {ingredients.length === 0 && 
          <p className="text-center text-red-500 mt-2 text-sm">Please add ingredients to continue</p>
        }
        {ingredients.length > 0 && childProfiles.length === 0 && 
          <p className="text-center text-red-500 mt-2 text-sm">Please create a child profile to continue</p>
        }
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