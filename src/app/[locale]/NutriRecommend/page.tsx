'use client';

import { useEffect, useState } from 'react';
import { useNutrition } from '@/contexts/NutritionContext';
import { nutripeekApi } from '@/api/nutripeekApi';
import { useRouter } from 'next/navigation';
import { ChildProfile } from '@/types/profile';
import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';
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
  const [totalEnergy, setTotalEnergy] = useState<number | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        if (ingredientIds.length === 0) {
          const storedResults = localStorage.getItem('nutripeekGapResults');
          if (storedResults) {
            const { missingNutrients, totalEnergy, childProfile } = 
              await NutriRecommendService.processStoredResults(JSON.parse(storedResults), selectedChildId);
            
            setMissingNutrients(missingNutrients);
            setTotalEnergy(totalEnergy);
            setSelectedChild(childProfile);
            
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
  const handleSaveAndScan = () => {
    // Save the selected foods to the nutrition note if needed
    NutriRecommendService.saveSelectedFoods(selectedFoods);
    
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
      <div className="w-full px-4 py-16 max-w-7xl mx-auto">
        {/* Header with Back Button, Title, and Avatar in one row */}
        <RecommendHeader selectedChild={selectedChild} />

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 w-full">
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

        {/* Action Button */}
        <div className="flex justify-center mt-8 w-full">
          <button
            onClick={handleSaveAndScan}
            className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition text-lg font-semibold"
          >
            {selectedFoods.length > 0 ? 'Save Selection & Scan More' : 'Scan Another Food'}
          </button>
        </div>
      </div>
    </FloatingEmojisLayout>
  );
}


