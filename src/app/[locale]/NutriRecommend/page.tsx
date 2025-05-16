'use client';

import { useEffect, useState } from 'react';
import { useNutrition } from '@/contexts/NutritionContext';
import { nutripeekApi } from '@/api/nutripeekApi';
import { useRouter } from 'next/navigation';
import { ChildProfile } from '@/types/profile';
import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';
import storageService from '@/libs/StorageService';
import { ChildEnergyRequirementsResponse, type NutrientGapResponse, RecommendationType } from '@/api/types';
import {
  RecommendHeader,
  NutrientList,
  RecommendedFoods,
  SelectedFoods,
  LoadingSpinner,
  ErrorMessage,
  ExtendedNutrientGap,
  NutriRecommendService,
  RecommendationTypeToggle,
  RegionSelectionDialog
} from '@/components/NutriRecommend';
import { FoodItem } from '@/types/notes';
import TooltipButton from '@/components/ui/TooltipButton';
import { STORAGE_KEYS, STORAGE_DEFAULTS } from '@/types/storage';
import RecommendedFoodsUtil from '@/utils/RecommendedFoodsUtil';
import SeasonalFoodCTA from '@/components/SeasonalFood/SeasonalFoodCTA';

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
  const [energyRequirements, setEnergyRequirements] = useState<ChildEnergyRequirementsResponse | null>(null);
  const [hasAdjustedEnergy, setHasAdjustedEnergy] = useState(false);
  const [prevRecommendedFoods, setPrevRecommendedFoods] = useState<FoodItem[]>([]);
  const [recommendationType, setRecommendationType] = useState<RecommendationType>(RecommendationType.STANDARD);
  
  // State for region selection
  const [showRegionDialog, setShowRegionDialog] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  // State to track if there are new selections made compared to previously recommended foods
  const [hasNewSelections, setHasNewSelections] = useState(false);
  
  // Store nutrient gap data for reprocessing when recommendation type changes
  const [nutrientGapData, setNutrientGapData] = useState<NutrientGapResponse | null>(null);

  // Navigation handlers
  const handleNavigateToSeasonalFood = () => {
    router.push('/SeasonalFood');
  };

  // Load the selected region from storage when the component mounts
  useEffect(() => {
    const region = NutriRecommendService.getSelectedRegion();
    if (region) {
      setSelectedRegion(region);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Check for energy requirements based on activity level
        const storedEnergyRequirements = storageService.getLocalItem<ChildEnergyRequirementsResponse>({
          key: STORAGE_KEYS.ENERGY_REQUIREMENTS,
          defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ENERGY_REQUIREMENTS]
        });
        
        if (storedEnergyRequirements) {
          setEnergyRequirements(storedEnergyRequirements);
        }
        
        if (ingredientIds.length === 0) {
          const storedResults = storageService.getLocalItem<NutrientGapResponse>({
            key: STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS,
            defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS]
          });
          if (storedResults) {
            setNutrientGapData(storedResults);
            
            const { missingNutrients, totalEnergy, childProfile } = 
              await NutriRecommendService.processStoredResultsWithType(
                storedResults, 
                selectedChildId,
                recommendationType,
                selectedRegion || undefined
              );
            
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
            
            // Check for previously recommended foods
            const recommendedFoodsData = RecommendedFoodsUtil.getRecommendedFoodsData();
            if (recommendedFoodsData.hasRecommendedFoods && recommendedFoodsData.foodItems.length > 0) {
              setPrevRecommendedFoods(recommendedFoodsData.foodItems);
              
              // Pre-select these foods
              const preSelectedFoods = recommendedFoodsData.foodItems.map(food => ({
                ...food,
                selected: true
              }));
              
              setSelectedFoods(preSelectedFoods);
              
              // Mark the foods as selected in the nutrient lists
              setMissingNutrients(prevNutrients => {
                return prevNutrients.map(nutrient => {
                  const updatedFoods = nutrient.recommendedFoods.map(food => {
                    const matchingFood = preSelectedFoods.find(selected => selected.id === food.id);
                    if (matchingFood) {
                      return { ...food, selected: true, quantity: matchingFood.quantity || 1 };
                    }
                    return food;
                  });
                  
                  return { ...nutrient, recommendedFoods: updatedFoods };
                });
              });
            }
            
            setLoading(false);
            return;
          }
          setError('No ingredients selected');
          setLoading(false);
          return;
        }

        // Store ingredient IDs for future reference
        storageService.setLocalItem<string[]>(STORAGE_KEYS.SELECTED_INGREDIENT_IDS, ingredientIds);

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
        
        // Store the gap results for later reprocessing when recommendation type changes
        setNutrientGapData(result);

        // Process the nutrient gap with the selected recommendation type
        const { missingNutrients, totalEnergy } = recommendationType === RecommendationType.OPTIMIZED
          ? await NutriRecommendService.processOptimizedFoodResults(result)
          : await NutriRecommendService.processNutrientGapResult(result);
        
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
        
        // Check for previously recommended foods
        const recommendedFoodsData = RecommendedFoodsUtil.getRecommendedFoodsData();
        if (recommendedFoodsData.hasRecommendedFoods && recommendedFoodsData.foodItems.length > 0) {
          setPrevRecommendedFoods(recommendedFoodsData.foodItems);
          
          // Pre-select these foods
          const preSelectedFoods = recommendedFoodsData.foodItems.map(food => ({
            ...food,
            selected: true
          }));
          
          setSelectedFoods(preSelectedFoods);
          
          // Mark the foods as selected in the nutrient lists
          setMissingNutrients(prevNutrients => {
            return prevNutrients.map(nutrient => {
              const updatedFoods = nutrient.recommendedFoods.map(food => {
                const matchingFood = preSelectedFoods.find(selected => selected.id === food.id);
                if (matchingFood) {
                  return { ...food, selected: true, quantity: matchingFood.quantity || 1 };
                }
                return food;
              });
              
              return { ...nutrient, recommendedFoods: updatedFoods };
            });
          });
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [ingredientIds, selectedChildId, recommendationType, selectedRegion]);

  // Handle recommendation type change
  const handleRecommendationTypeChange = async (newType: RecommendationType) => {
    if (newType === recommendationType) return;
    
    // If changing to seasonal type, check if region is selected
    if (newType === RecommendationType.SEASONAL) {
      // Check if we already have a region
      if (!NutriRecommendService.hasSelectedRegion()) {
        // Show region selection dialog
        setShowRegionDialog(true);
        // Don't change recommendation type yet, wait for user to select region
        return;
      }
    }
    
    // Set loading state while we refresh the recommendations
    setLoading(true);
    
    // Update the recommendation type, which will trigger the useEffect
    setRecommendationType(newType);
    
    // For seasonal recommendations, provide some feedback to the user
    if (newType === RecommendationType.SEASONAL) {
      // Get the current month for the UI
      const currentMonth = new Date().toLocaleString('en-AU', { month: 'long' });
    }
  };

  // Handle region selection from the dialog
  const handleRegionSelect = (region: string) => {
    // Save the selected region
    NutriRecommendService.saveSelectedRegion(region);
    setSelectedRegion(region);
    
    // Close the dialog
    setShowRegionDialog(false);
    
    // Now set the recommendation type to seasonal
    setLoading(true);
    setRecommendationType(RecommendationType.SEASONAL);
  };

  // Handle closing the region dialog without selecting a region
  const handleRegionDialogClose = () => {
    setShowRegionDialog(false);
  };

  // Calculate if there are new selections compared to previously recommended foods
  useEffect(() => {
    // Skip if we don't have both arrays populated
    if (prevRecommendedFoods.length === 0 && selectedFoods.length === 0) {
      setHasNewSelections(false);
      return;
    }
    
    // If there were no previous selections, any selection is new
    if (prevRecommendedFoods.length === 0) {
      setHasNewSelections(selectedFoods.length > 0);
      return;
    }
    
    // Check if any new foods have been added
    const hasNewFoods = selectedFoods.some(currentFood => 
      !prevRecommendedFoods.some(prevFood => prevFood.id === currentFood.id)
    );
    
    // Check if any existing food's quantity has been increased
    const hasIncreasedQuantities = selectedFoods.some(currentFood => {
      const prevFood = prevRecommendedFoods.find(prevFood => prevFood.id === currentFood.id);
      if (prevFood) {
        const prevQuantity = prevFood.quantity || 1;
        const currentQuantity = currentFood.quantity || 1;
        return currentQuantity > prevQuantity;
      }
      return false;
    });
    
    // Check if any foods have been removed or decreased in quantity
    const hasRemovedOrDecreased = prevRecommendedFoods.some(prevFood => {
      const currentFood = selectedFoods.find(currFood => currFood.id === prevFood.id);
      
      // Food was completely removed
      if (!currentFood) return true;
      
      // Food quantity was decreased
      const prevQuantity = prevFood.quantity || 1;
      const currentQuantity = currentFood.quantity || 1;
      return currentQuantity < prevQuantity;
    });
    
    setHasNewSelections(hasNewFoods || hasIncreasedQuantities || hasRemovedOrDecreased);
  }, [selectedFoods, prevRecommendedFoods]);

  // Toggle food selection
  const handleToggleFood = (nutrientName: string, foodItem: FoodItem) => {
    // First update the missing nutrients list to show selected state
    setMissingNutrients(prevNutrients => {
      return prevNutrients.map(nutrient => {
        if (nutrient.name !== nutrientName) return nutrient;
        
        // Update this nutrient's foods
        const updatedFoods = nutrient.recommendedFoods.map(food => {
          if (food.id !== foodItem.id) return food;
          
          // Toggle selection
          return { ...food, selected: !food.selected };
        });
        
        return { ...nutrient, recommendedFoods: updatedFoods };
      });
    });
    
    // Then update the selected foods list
    setSelectedFoods(prevSelected => {
      const existingIndex = prevSelected.findIndex(food => food.id === foodItem.id);
      
      // If it's already in the list, remove it
      if (existingIndex !== -1) {
        return prevSelected.filter(food => food.id !== foodItem.id);
      }
      
      // Otherwise add it
      return [...prevSelected, { ...foodItem, selected: true }];
    });
  };

  // Update food quantity
  const handleUpdateQuantity = (nutrientName: string, foodItem: FoodItem, quantity: number) => {
    // Update the quantity in missing nutrients list
    setMissingNutrients(prevNutrients => {
      return prevNutrients.map(nutrient => {
        if (nutrient.name !== nutrientName) return nutrient;
        
        // Update this nutrient's foods
        const updatedFoods = nutrient.recommendedFoods.map(food => {
          if (food.id !== foodItem.id) return food;
          
          // Update quantity
          return { ...food, quantity };
        });
        
        return { ...nutrient, recommendedFoods: updatedFoods };
      });
    });
    
    // Update quantity in selected foods
    setSelectedFoods(prevSelected => {
      return prevSelected.map(food => {
        if (food.id !== foodItem.id) return food;
        return { ...food, quantity };
      });
    });
  };

  // Calculate updated nutrient percentages based on selected foods
  useEffect(() => {
    // Skip calculation if no selected foods
    if (selectedFoods.length === 0 || missingNutrients.length === 0) return;
    
    // Create a map of nutrient added values
    const addedNutrients: Record<string, number> = {};
    
    // Calculate total added nutrients from all selected foods
    selectedFoods.forEach(food => {
      if (food.nutrients) {
        Object.entries(food.nutrients).forEach(([nutrient, value]) => {
          // Multiply by quantity
          const actualValue = food.quantity ? value * food.quantity : value;
          addedNutrients[nutrient] = (addedNutrients[nutrient] || 0) + actualValue;
        });
      }
    });
    
    // Update percentages in missing nutrients
    setMissingNutrients(prevNutrients => {
      return prevNutrients.map(nutrient => {
        // Calculate current percentage
        const currentPercentage = (nutrient.current_intake / nutrient.recommended_intake) * 100;
        
        // Check if this nutrient has added values
        if (addedNutrients[nutrient.name]) {
          // Calculate updated percentage with added nutrients
          const updatedIntake = nutrient.current_intake + addedNutrients[nutrient.name];
          const updatedPercentage = (updatedIntake / nutrient.recommended_intake) * 100;
          
          return {
            ...nutrient,
            updatedPercentage
          };
        }
        
        // No update needed
        return {
          ...nutrient,
          updatedPercentage: currentPercentage
        };
      });
    });
  }, [selectedFoods, missingNutrients.length]);

  // Save selection and go to notes
  const handleSaveSelection = () => {
    if (selectedFoods.length > 0) {
      // Save the selected foods to create a new nutrition note
      NutriRecommendService.saveSelectedFoods(selectedFoods);
      
      // Also save the food IDs for reference in other pages
      RecommendedFoodsUtil.saveRecommendedFoodIds(selectedFoods);
      
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
    return <LoadingSpinner recommendationType={recommendationType} />;
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
        <RecommendHeader 
          selectedChild={selectedChild} 
          hasNewSelections={hasNewSelections}
        />

        {/* Show a banner if we pre-populated foods from a previous selection */}
        {prevRecommendedFoods.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Previous Recommendations Loaded</h3>
                <p className="mt-1 text-sm">
                  We've preloaded {prevRecommendedFoods.length} recommended food{prevRecommendedFoods.length !== 1 ? 's' : ''} from your previous analysis.
                  You can modify these selections or add new foods.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Recommendation Type Toggle */}
        <RecommendationTypeToggle 
          selectedType={recommendationType} 
          onTypeChange={handleRecommendationTypeChange}
          selectedRegion={selectedRegion}
        />

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
        
        {/* Information Banner about current recommendation type */}
        <div className={`mb-6 p-4 rounded-lg border text-sm bg-blue-50 border-blue-200 text-blue-800`}>
          {recommendationType === RecommendationType.STANDARD ? (
            <p>
              <strong>Standard Recommendation:</strong> Shows recommended foods based on their maximum nutrient content.
            </p>
          ) : recommendationType === RecommendationType.OPTIMIZED ? (
            <p>
              <strong>Optimized Recommendation:</strong> Shows foods with precise amounts needed to fill nutrient gaps efficiently. 
              The quantity shown (in grams) indicates how much is needed to meet the specific nutrient gap.
            </p>
          ) : (
            <p>
              <strong>Seasonal Recommendation:</strong> Shows foods that are currently in season and rich in the nutrients you need.
              Eating seasonal foods can provide better taste, nutrition, and environmental benefits.
            </p>
          )}
        </div>
        
        {/* Seasonal Banner - only shown when seasonal recommendation is selected */}
        {recommendationType === RecommendationType.SEASONAL && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  Showing Seasonal Foods for {new Date().toLocaleString('en-AU', { month: 'long' })}
                  {selectedRegion && (
                    <span className="ml-1">
                      in <span className="font-semibold">{selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}</span>
                    </span>
                  )}
                </h3>
                <p className="mt-1 text-sm">
                  Seasonal foods are fresher, more nutritious, and often more affordable. 
                  Look for the <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">Seasonal</span> label to identify foods that are currently in season.
                </p>
                {selectedRegion && (
                  <button
                    onClick={() => setShowRegionDialog(true)}
                    className="text-xs text-amber-700 underline mt-2 hover:text-amber-800"
                  >
                    Change region
                  </button>
                )}
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
          {/* Save Selection button - enabled only when there are selections and changes */}
          <TooltipButton
            onClick={handleSaveSelection}
            disabled={selectedFoods.length === 0 || !hasNewSelections}
            disabledTooltip={selectedFoods.length === 0 
              ? "Select at least one food to save your selection" 
              : "No changes detected. Make changes to your selections before saving."}
            position="top"
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
          
          {/* Seasonal Foods button - always enabled */}
          <SeasonalFoodCTA
            variant="button"
            size="large"
            color="amber"
            label="Find Seasonal Foods"
            className="w-full sm:w-auto text-base sm:text-lg font-semibold"
          />
        </div>

        {/* Region Selection Dialog */}
        <RegionSelectionDialog 
          visible={showRegionDialog}
          onHide={handleRegionDialogClose}
          onRegionSelect={handleRegionSelect}
        />
      </div>
    </FloatingEmojisLayout>
  );
}


