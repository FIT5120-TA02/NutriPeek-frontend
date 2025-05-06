'use client';

import { useEffect, useState } from 'react';
import { useNutrition } from '@/contexts/NutritionContext';
import { nutripeekApi } from '@/api/nutripeekApi';
import { useRouter } from 'next/navigation';
import { ChildProfile } from '@/types/profile';
import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';
import storageService from '@/libs/StorageService';
import { ChildEnergyRequirementsResponse } from '@/api/types';
import {
  RecommendHeader,
  NutrientList,
  RecommendedFoods,
  SelectedFoods,
  LoadingSpinner,
  ErrorMessage,
  FoodItem,
  ExtendedNutrientGap,
  NutriRecommendService
} from '@/components/NutriRecommend';
import TooltipButton from '@/components/ui/TooltipButton';

export default function NutriRecommendPage() {
  const { ingredientIds, selectedChildId, clearIngredientIds } = useNutrition();
  const router = useRouter();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [missingNutrients, setMissingNutrients] = useState<ExtendedNutrientGap[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [activeNutrient, setActiveNutrient] = useState<string | null>(null);
  const [totalEnergy, setTotalEnergy] = useState<number | null>(null); // TODO: Display this in the somewhere in the UI
  const [energyRequirements, setEnergyRequirements] = useState<ChildEnergyRequirementsResponse | null>(null);
  const [hasAdjustedEnergy, setHasAdjustedEnergy] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Check for energy requirements based on activity level
        const storedEnergyRequirements = storageService.getLocalItem({
          key: 'energyRequirements',
          defaultValue: null
        });
        
        if (storedEnergyRequirements) {
          setEnergyRequirements(storedEnergyRequirements);
        }
        
        if (ingredientIds.length === 0) {
          const storedResults = localStorage.getItem('nutripeekGapResults');
          if (storedResults) {
            const { missingNutrients, totalEnergy, childProfile } = 
              await NutriRecommendService.processStoredResults(JSON.parse(storedResults), selectedChildId);
            
            setMissingNutrients(missingNutrients);
            setTotalEnergy(totalEnergy);
            setSelectedChild(childProfile);
            
            // Check if any nutrients were adjusted for activity
            const hasAdjusted = missingNutrients.some(nutrient => 
              nutrient.isAdjustedForActivity && 
              nutrient.name.toLowerCase().includes('energy')
            );
            setHasAdjustedEnergy(hasAdjusted);
            
            if (missingNutrients.length > 0) {
              setActiveNutrient(missingNutrients[0].name);
            }
            
            setLoading(false);
            return;
          }
          setError('No ingredients selected');
          setLoading(false);
          return;
        }

        // Store ingredient IDs for future reference
        storageService.setLocalItem('selectedIngredientIds', ingredientIds);

        // Get child profile
        const childProfile = NutriRecommendService.getChildProfile(selectedChildId);
        
        if (!childProfile) {
          setError('No child profile found');
          setLoading(false);
          return;
        }

        setSelectedChild(childProfile);

        const apiGender = childProfile.gender.toLowerCase() === 'female' ? 'girl' : 'boy';

        // Call API to calculate nutrient gap
        const result = await nutripeekApi.calculateNutrientGap({
          child_profile: {
            age: parseInt(childProfile.age, 10),
            gender: apiGender
          },
          ingredient_ids: ingredientIds
        });

        const { missingNutrients, totalEnergy } = 
          await NutriRecommendService.processNutrientGapResult(result, childProfile);
        
        setMissingNutrients(missingNutrients);
        setTotalEnergy(totalEnergy);
        
        // Check if any nutrients were adjusted for activity
        const hasAdjusted = missingNutrients.some(nutrient => 
          nutrient.isAdjustedForActivity && 
          nutrient.name.toLowerCase().includes('energy')
        );
        setHasAdjustedEnergy(hasAdjusted);
        
        if (missingNutrients.length > 0) {
          setActiveNutrient(missingNutrients[0].name);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [ingredientIds, selectedChildId]);

  // Toggle food selection
  const handleToggleFood = (nutrientName: string, foodItem: FoodItem) => {
    // Update the selected foods list
    setSelectedFoods(prev => {
      const isAlreadySelected = prev.some(item => item.id === foodItem.id);
      
      if (isAlreadySelected) {
        return prev.filter(item => item.id !== foodItem.id);
      } else {
        return [...prev, { ...foodItem, selected: true, quantity: 1 }];
      }
    });

    // Update the food item in ALL nutrient's recommended foods that contain it
    setMissingNutrients(prev => {
      return prev.map(nutrient => {
        // Check if this nutrient has the food in its recommendations
        const hasFoodInRecommendations = nutrient.recommendedFoods.some(food => food.id === foodItem.id);
        
        if (hasFoodInRecommendations) {
          const updatedFoods = nutrient.recommendedFoods.map(food => {
            if (food.id === foodItem.id) {
              return { ...food, selected: !food.selected };
            }
            return food;
          });
          return { ...nutrient, recommendedFoods: updatedFoods };
        }
        return nutrient;
      });
    });
  };

  // Update food quantity
  const handleUpdateQuantity = (nutrientName: string, foodItem: FoodItem, quantity: number) => {
    // Update the selected foods list
    setSelectedFoods(prev => {
      return prev.map(item => {
        if (item.id === foodItem.id) {
          return { ...item, quantity };
        }
        return item;
      });
    });

    // Update the food item in ALL nutrient's recommended foods that contain it
    setMissingNutrients(prev => {
      return prev.map(nutrient => {
        // Check if this nutrient has the food in its recommendations
        const hasFoodInRecommendations = nutrient.recommendedFoods.some(food => food.id === foodItem.id);
        
        if (hasFoodInRecommendations) {
          const updatedFoods = nutrient.recommendedFoods.map(food => {
            if (food.id === foodItem.id) {
              return { ...food, quantity };
            }
            return food;
          });
          return { ...nutrient, recommendedFoods: updatedFoods };
        }
        return nutrient;
      });
    });
  };

  // Calculate updated nutrient percentages based on selected foods
  useEffect(() => {
    // Reset all nutrients to their original percentage if no foods are selected
    if (!missingNutrients.length) return;
    
    if (selectedFoods.length === 0) {
      // Reset all nutrient percentages to their original values
      setMissingNutrients(prev => {
        return prev.map(nutrient => ({
          ...nutrient,
          updatedPercentage: nutrient.percentage
        }));
      });
      return;
    }

    // Calculate new percentages based on all nutrients contributed by selected foods
    setMissingNutrients(prev => {
      return prev.map(nutrient => {
        let additionalAmount = 0;
        
        // For each selected food, check if it contributes to this nutrient
        selectedFoods.forEach(food => {
          // Find this nutrient in the food's nutrients
          if (food.nutrients && food.nutrients[nutrient.name] !== undefined) {
            // Multiply by quantity to get the total contribution
            additionalAmount += food.nutrients[nutrient.name] * food.quantity;
          }
        });
        
        // Calculate the updated intake and percentage
        const updatedIntake = nutrient.current_intake + additionalAmount;
        const updatedPercentage = Math.min(100, (updatedIntake / nutrient.recommended_intake) * 100);
        
        return {
          ...nutrient,
          updatedPercentage
        };
      });
    });
  }, [selectedFoods, missingNutrients.length]);

  // Save selection and go to scan again
  const handleSaveSelection = () => {
    // Only save a note if the user has selected foods
    if (selectedFoods.length > 0) {
      // Save the selected foods to create a new nutrition note
      NutriRecommendService.saveSelectedFoods(selectedFoods);
      // Navigate to notes page
      router.push('/Note');
    }
  };
  
  // Just go scan more without saving
  const handleScanMore = () => {
    clearIngredientIds();
    router.push('/NutriScan');
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <FloatingEmojisLayout
      backgroundClasses="min-h-screen w-full flex flex-col bg-gradient-to-b from-green-50 to-green-100"
      emojisCount={15}
    >
      <div className="w-full px-6 lg:px-8 pt-24 pb-16 max-w-7xl mx-auto">
        {/* Header with Back Button, Title, and Avatar in one row */}
        <RecommendHeader selectedChild={selectedChild} />

        {/* Display message about adjusted energy if applicable */}
        {hasAdjustedEnergy && energyRequirements && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Adjusted Energy Requirements</h3>
                <p className="mt-1 text-sm">
                  Due to your child's high activity level (PAL: {energyRequirements.input_physical_activity_level.toFixed(2)}), 
                  their energy requirements have been increased to {energyRequirements.estimated_energy_requirement.toFixed(0)} {energyRequirements.unit}.
                  Consider adding energy-rich foods to meet these needs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 w-full">
          {/* Nutrient Tabs - Left Column */}
          <NutrientList 
            nutrients={missingNutrients} 
            activeNutrient={activeNutrient} 
            onSelectNutrient={setActiveNutrient} 
          />

          {/* Recommended Foods - Middle Column */}
          <RecommendedFoods 
            activeNutrient={activeNutrient}
            nutrients={missingNutrients}
            onToggleFood={handleToggleFood}
            onUpdateQuantity={handleUpdateQuantity}
          />

          {/* Selected Foods Summary - Right Column */}
          <SelectedFoods 
            selectedFoods={selectedFoods}
            nutrients={missingNutrients}
            onRemoveFood={handleToggleFood}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 w-full">
          {/* Save Selection button - shows disabled state with tooltip when no selections */}
          <TooltipButton
            onClick={handleSaveSelection}
            disabled={selectedFoods.length === 0}
            disabledTooltip="Select at least one food to save your selection"
            className="px-6 sm:px-8 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition text-base sm:text-lg font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
            Save Selection & View Notes
          </TooltipButton>
          
          {/* Scan More button - always enabled */}
          <TooltipButton
            onClick={handleScanMore}
            className="px-6 sm:px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition text-base sm:text-lg font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Scan Another Food
          </TooltipButton>
        </div>
      </div>
    </FloatingEmojisLayout>
  );
}


