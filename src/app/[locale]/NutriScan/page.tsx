'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useDetectFoodItems, useQRCodeFlow } from "../../../api";
import { FoodItemDetection, FoodMappingRequest } from "../../../api/types";
import { nutripeekApi } from "../../../api/nutripeekApi";
import ScanningSection from "../../../components/NutriScan/ScanningSection";
import ResultsSection from "../../../components/NutriScan/ResultsSection";
import { FoodItemDisplay, MealType, MealImage } from "../../../components/NutriScan/types";
import useDeviceDetection from "../../../hooks/useDeviceDetection";
import storageService from "../../../libs/StorageService";
import { STORAGE_KEYS } from "../../../types/storage";

export default function NutriScanPage() {
  const { isMobile } = useDeviceDetection();
  const hasCleanedStorage = useRef(false);
  
  // Initialize meal images with default empty states
  const initialMealImages: MealImage[] = [
    { file: null, mealType: 'breakfast', imagePreviewUrl: null, processingStep: 'idle', isProcessing: false },
    { file: null, mealType: 'lunch', imagePreviewUrl: null, processingStep: 'idle', isProcessing: false },
    { file: null, mealType: 'dinner', imagePreviewUrl: null, processingStep: 'idle', isProcessing: false }
  ];
  
  const [mealImages, setMealImages] = useState<MealImage[]>(initialMealImages);
  const [showResults, setShowResults] = useState(false);
  const [processingMealIndex, setProcessingMealIndex] = useState<number | null>(null);

  const { execute: detectFoodItems, isLoading: isDetecting } = useDetectFoodItems();
  const {
    qrData,
    initializeQRCode,
    uploadStatus,
    resultData,
    errorMessage,
    isLoading: isQrProcessing,
    reset: resetQrFlow,
  } = useQRCodeFlow();

  // Clean local storage when the component first mounts
  useEffect(() => {
    if (!hasCleanedStorage.current) {
      cleanLocalStorage();
      hasCleanedStorage.current = true;
    }
  }, []);

  // Function to clean local storage
  const cleanLocalStorage = () => {
    storageService.removeLocalItem(STORAGE_KEYS.SELECTED_INGREDIENT_IDS);
    storageService.removeLocalItem(STORAGE_KEYS.SCANNED_FOODS);
    storageService.removeLocalItem(STORAGE_KEYS.RECOMMENDED_FOOD_IDS);
    storageService.removeLocalItem(STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS);
    storageService.removeLocalItem(STORAGE_KEYS.ENERGY_REQUIREMENTS);
    storageService.removeLocalItem(STORAGE_KEYS.ACTIVITY_RESULT);
    storageService.removeLocalItem(STORAGE_KEYS.ACTIVITY_PAL);
    storageService.removeLocalItem(STORAGE_KEYS.SELECTED_ACTIVITIES);
    storageService.removeLocalItem(STORAGE_KEYS.ACTIVE_NOTE_ID);
  };

  // Process detected food items
  const processDetectedFood = useCallback(async (detectedItems: FoodItemDetection[]) => {
    try {
      // Extract class names
      const detectedNames = detectedItems.map(item => item.class_name);
      
      // Call the map-nutrients API
      const mappingRequest: FoodMappingRequest = {
        detected_items: detectedNames
      };
      
      const mappingResult = await nutripeekApi.mapFoodToNutrients(mappingRequest);
      
      // Count occurrences of each food item
      const foodCounts: Record<string, number> = {};
      detectedNames.forEach(name => {
        foodCounts[name] = (foodCounts[name] || 0) + 1;
      });
      
      // Group items by their class name for consolidated display
      const groupedItems: Record<string, FoodItemDisplay> = {};
      
      // Process each detected item
      detectedItems.forEach(item => {
        const mappedFood = mappingResult.mapped_items[item.class_name];
        
        if (mappedFood) {
          // Check if we already have this food in our grouped items
          if (!groupedItems[item.class_name]) {
            // Create a new item with the mapped data
            const nutrientData = mappedFood.nutrient_data;
            const quantity = mappedFood.quantity;
            
            groupedItems[item.class_name] = {
              id: nutrientData.id,
              name: nutrientData.food_name,
              confidence: item.confidence, // We'll average this later
              quantity: quantity, // Use the quantity from the API
              nutrients: {
                ...(nutrientData.energy_with_fibre_kj != null && { 'Energy (kJ)': nutrientData.energy_with_fibre_kj * quantity }),
                ...(nutrientData.protein_g != null && { 'Protein (g)': nutrientData.protein_g * quantity }),
                ...(nutrientData.total_fat_g != null && { 'Total Fat (g)': nutrientData.total_fat_g * quantity }),
                ...(nutrientData.carbs_with_sugar_alcohols_g != null && { 'Carbs (g)': nutrientData.carbs_with_sugar_alcohols_g * quantity }),
                ...(nutrientData.dietary_fibre_g != null && { 'Dietary Fibre (g)': nutrientData.dietary_fibre_g * quantity })
              }
            };
          } else {
            // Just accumulate confidence for averaging later
            groupedItems[item.class_name].confidence += item.confidence;
          }
        } else {
          // If no mapping found, add as a standalone item
          const itemKey = `unmapped-${item.class_name}`;
          if (!groupedItems[itemKey]) {
            groupedItems[itemKey] = {
              name: item.class_name,
              confidence: item.confidence,
              quantity: foodCounts[item.class_name],
              nutrients: {}
            };
          } else {
            groupedItems[itemKey].confidence += item.confidence;
          }
        }
      });
      
      // Convert the grouped items to an array and apply quantity formatting
      const displayItems: FoodItemDisplay[] = Object.values(groupedItems).map(item => {
        const quantity = item.quantity || 1;
        const avgConfidence = item.confidence / quantity; // Average confidence
        
        return {
          ...item,
          confidence: avgConfidence,
          quantity // Keep the quantity for later use
        };
      });
      
      return displayItems;
    } catch (error) {
      console.error('Error mapping nutrients:', error);
      toast.error('Failed to map nutrients', { id: 'processing' });
      throw error;
    }
  }, []);

  // Convert FoodItemDetection to FoodItemDisplay
  const mapDetectionToDisplay = useCallback((items: FoodItemDetection[]): FoodItemDisplay[] => {
    // Basic mapping without nutrients (used only as fallback)
    return items.map(item => ({
      name: item.class_name,
      confidence: item.confidence,
      nutrients: {}
    }));
  }, []);
  
  useEffect(() => {
    // Only run on initial render for desktop devices
    const shouldGenerateQR = !isMobile && !qrData && !isQrProcessing && !showResults;
    
    if (shouldGenerateQR) {
      const generateQR = async () => {
        try {
          await initializeQRCode(300);
        } catch (error) {
          toast.error('Failed to generate QR Code');
        }
      };
      generateQR();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, showResults]);

  useEffect(() => {
    if (uploadStatus === 'uploaded') {
      // Set processing state for the first available meal slot
      const availableIndex = mealImages.findIndex(meal => meal.file === null);
      if (availableIndex !== -1) {
        setProcessingMealIndex(availableIndex);
        setMealImages(prev => {
          const updated = [...prev];
          updated[availableIndex] = {
            ...updated[availableIndex],
            processingStep: 'detecting',
            isProcessing: true
          };
          return updated;
        });
        toast.loading('Food detection in progress...', { id: 'qr-processing' });
      }
    } else if (uploadStatus === 'processed' && resultData) {
      // QR processed, now map nutrients
      if (resultData.detected_items && resultData.detected_items.length > 0 && processingMealIndex !== null) {
        // Update state for mapping in process
        setMealImages(prev => {
          const updated = [...prev];
          updated[processingMealIndex] = {
            ...updated[processingMealIndex],
            processingStep: 'mapping'
          };
          return updated;
        });
        toast.loading('Mapping nutrients...', { id: 'qr-processing' });
        
        // Process the detected items with nutrient mapping in a self-contained function
        // to avoid state update conflicts
        const processQRDetection = async () => {
          try {
            const mappedItems = await processDetectedFood(resultData.detected_items || []);
            
            // Get the imageUrl from the result data
            const imageUrl = null;
            
            // Handle state updates together
            setMealImages(prev => {
              const updated = [...prev];
              updated[processingMealIndex] = {
                ...updated[processingMealIndex],
                file: new File([], "qr_uploaded_image.jpg"), // Dummy file
                imagePreviewUrl: imageUrl,
                detectedItems: mappedItems,
                processingStep: 'complete',
                isProcessing: false
              };
              return updated;
            });
            
            // Clear the processing meal index after updating meal data
            setProcessingMealIndex(null);
            
            // Wait for the next event cycle to show success toast and results
            setTimeout(() => {
              toast.success('Food analysis complete!', { id: 'qr-processing' });
              setShowResults(true);
            }, 50);
          } catch (error) {
            // Handle fallback if nutrient mapping fails
            const basicItems = mapDetectionToDisplay(resultData.detected_items || []);
            
            // Handle state updates together
            setMealImages(prev => {
              const updated = [...prev];
              updated[processingMealIndex] = {
                ...updated[processingMealIndex],
                file: new File([], "qr_uploaded_image.jpg"), // Dummy file
                imagePreviewUrl: null,
                detectedItems: basicItems,
                processingStep: 'complete',
                isProcessing: false
              };
              return updated;
            });
            
            // Clear the processing meal index after updating meal data
            setProcessingMealIndex(null);
            
            // Wait for the next event cycle to show error toast and results
            setTimeout(() => {
              toast.error('Failed to map nutrients', { id: 'qr-processing' });
              setShowResults(true);
            }, 50);
          }
        };
        
        // Execute the processing function
        processQRDetection();
      } else {
        toast.error('No food items detected in the uploaded image', { id: 'qr-processing' });
        if (processingMealIndex !== null) {
          setMealImages(prev => {
            const updated = [...prev];
            updated[processingMealIndex] = {
              ...updated[processingMealIndex],
              processingStep: 'idle',
              isProcessing: false
            };
            return updated;
          });
          setProcessingMealIndex(null);
        }
      }
    } else if (uploadStatus === 'error') {
      toast.error(errorMessage || 'An error occurred', { id: 'qr-processing' });
      if (processingMealIndex !== null) {
        setMealImages(prev => {
          const updated = [...prev];
          updated[processingMealIndex] = {
            ...updated[processingMealIndex],
            processingStep: 'idle',
            isProcessing: false
          };
          return updated;
        });
        setProcessingMealIndex(null);
      }
    }
  }, [uploadStatus, resultData, errorMessage, mapDetectionToDisplay, processDetectedFood, processingMealIndex]);

  const handleFileChange = (mealType: MealType, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    
    // Find the index of the meal with this type
    const mealIndex = mealImages.findIndex(meal => meal.mealType === mealType);
    if (mealIndex === -1) return;
    
    // Check if this is a new file or an update to an existing one
    const isReplacingExistingImage = mealImages[mealIndex].file !== null;
    
    // Update the meal image
    setMealImages(prev => {
      const updated = [...prev];
      updated[mealIndex] = {
        ...updated[mealIndex],
        file,
        imagePreviewUrl: URL.createObjectURL(file),
        // Clear any detected items if replacing existing image
        ...(isReplacingExistingImage && {
          detectedItems: undefined,
          shouldReprocess: true
        })
      };
      return updated;
    });
    
    toast.success(`${mealType === 'breakfast' ? 'Breakfast' : mealType === 'lunch' ? 'Lunch' : 'Dinner'} image selected!`);
  };

  const handleCameraCapture = (mealType: MealType) => {
    // Find the corresponding meal's index
    const mealIndex = mealImages.findIndex(meal => meal.mealType === mealType);
    if (mealIndex === -1) return;
    
    // Get a reference to the hidden camera input
    const input = document.getElementById(`camera-input-${mealType}`) as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  const handleScan = async (newImages: MealImage[] | null = null) => {
    // Check if there are any images to scan
    if (newImages !== null) {
      // Update the meal images state - IMPORTANT: use a single update for all images
      setMealImages(prev => {
        const updated = [...prev];
        
        // Update each meal that has a matching mealType
        for (const meal of newImages) {
          const mealIndex = updated.findIndex(m => m.mealType === meal.mealType);
          if (mealIndex === -1) continue;
          
          // Check if this is a new image (different from the current one)
          const isNewImage = meal.file !== updated[mealIndex].file;
          
          // Only keep existing detected items if:
          // 1. They exist AND
          // 2. The image hasn't changed AND
          // 3. The meal is not explicitly marked for reprocessing
          const keepExistingItems = 
            !isNewImage &&
            updated[mealIndex].detectedItems && 
            updated[mealIndex].detectedItems.length > 0 && 
            !updated[mealIndex].shouldReprocess;
          
          updated[mealIndex] = {
            ...updated[mealIndex],
            file: meal.file,
            imagePreviewUrl: meal.imagePreviewUrl,
            // Only preserve detected items if they exist and we should keep them
            ...(keepExistingItems ? {
              detectedItems: updated[mealIndex].detectedItems
            } : {
              // Otherwise clear the detected items to ensure they get reprocessed
              detectedItems: undefined,
              shouldReprocess: false // Reset the flag after using it
            })
          };
        }
        
        return updated;
      });
      
      // Use a callback to ensure we have the latest state
      setTimeout(() => {
        // Get the most up-to-date state for scanning
        processMealsBasedOnLatestState();
      }, 100);
    } else {
      processMealsBasedOnLatestState();
    }
  };
  
  // Extracted function to process meals sequentially
  const processMealsSequentially = async (mealsToScan: MealImage[], updatedMeals: MealImage[]) => {
    // Filter to meals that need processing:
    // - No detected items OR
    // - Explicitly marked for reprocessing
    const mealsToProcess = mealsToScan.filter(meal => 
      !meal.detectedItems || 
      meal.detectedItems.length === 0 || 
      meal.shouldReprocess === true
    );
    
    // If no meals need processing, check if we had any processed meals
    if (mealsToProcess.length === 0) {
      // Return success if any of the meals have detected items
      const hasProcessedMeals = mealsToScan.some(meal => 
        meal.detectedItems && meal.detectedItems.length > 0
      );
      return hasProcessedMeals;
    }
    
    let successfullyProcessed = false;
    
    // Process each meal image in sequence
    for (let i = 0; i < mealsToProcess.length; i++) {
      const meal = mealsToProcess[i];
      
      // Find the index in the original mealImages array
      const mealIndex = mealImages.findIndex(m => m.mealType === meal.mealType);
      
      if (mealIndex === -1) continue;
      
      if (!meal.file) continue;
      
      const toastId = `scan-${mealIndex}`;
      const mealName = meal.mealType === 'breakfast' ? 'Breakfast' : 
                       meal.mealType === 'lunch' ? 'Lunch' : 'Dinner';
      
      // Update processing state in our copy first
      updatedMeals[mealIndex] = {
        ...updatedMeals[mealIndex],
        processingStep: 'detecting',
        isProcessing: true,
        shouldReprocess: false // Reset the reprocessing flag
      };
      
      // Update the state only once per meal
      setMealImages(updatedMeals.map(m => ({...m})));
      
      toast.loading(`Detecting food items in ${mealName}...`, { id: toastId });

      try {
        // Step 1: Detect food items
        const detectionData = await detectFoodItems(meal.file);
        
        if (detectionData.detected_items && detectionData.detected_items.length > 0) {
          // Update processing state to mapping in our copy
          updatedMeals[mealIndex] = {
            ...updatedMeals[mealIndex],
            processingStep: 'mapping'
          };
          setMealImages(updatedMeals.map(m => ({...m})));
          
          toast.loading(`Mapping nutrients for ${mealName}...`, { id: toastId });
          
          // Step 2: Map nutrients to detected items
          try {
            const mappedItems = await processDetectedFood(detectionData.detected_items);
            
            // Update the meal with processed results in our copy
            updatedMeals[mealIndex] = {
              ...updatedMeals[mealIndex],
              detectedItems: mappedItems,
              processingStep: 'complete',
              isProcessing: false,
              shouldReprocess: false // Ensure the flag is reset
            };
            
            // Flag success before updating state or showing toast
            successfullyProcessed = true;
            
            // Updated state with all changes
            setMealImages(updatedMeals.map(m => ({...m})));
            
            toast.success(`${mealName} analysis complete!`, { id: toastId });
          } catch (error) {
            console.error(`Nutrient mapping failed for ${mealName}:`, error);
            
            // Fallback to basic mapping without nutrients
            const basicItems = mapDetectionToDisplay(detectionData.detected_items);
            
            // Update in our copy
            updatedMeals[mealIndex] = {
              ...updatedMeals[mealIndex],
              detectedItems: basicItems,
              processingStep: 'complete',
              isProcessing: false,
              shouldReprocess: false // Ensure the flag is reset
            };
            
            // Flag success before updating state
            successfullyProcessed = true;
            
            // Updated state with all changes
            setMealImages(updatedMeals.map(m => ({...m})));
            
            toast.error(`Nutrient mapping failed for ${mealName}, displaying basic results`, { id: toastId });
          }
        } else {
          toast.error(`No food items detected in the ${mealName} image`, { id: toastId });
          
          // Update in our copy
          updatedMeals[mealIndex] = {
            ...updatedMeals[mealIndex],
            processingStep: 'idle',
            isProcessing: false,
            shouldReprocess: false // Ensure the flag is reset
          };
          
          // Updated state with all changes
          setMealImages(updatedMeals.map(m => ({...m})));
        }
      } catch (error) {
        console.error(`Error processing ${mealName} image:`, error);
        toast.error(`Failed to process the ${mealName} image!`, { id: toastId });
        
        // Update in our copy
        updatedMeals[mealIndex] = {
          ...updatedMeals[mealIndex],
          processingStep: 'idle',
          isProcessing: false,
          shouldReprocess: false // Ensure the flag is reset
        };
        
        // Updated state with all changes
        setMealImages(updatedMeals.map(m => ({...m})));
      }
    }
    
    // Return true if any meal was processed successfully or already had detected items
    return successfullyProcessed || mealsToScan.some(meal => 
      meal.detectedItems && meal.detectedItems.length > 0
    );
  };

  // Function to process meals based on the latest state
  const processMealsBasedOnLatestState = () => {
    // Get a fresh reference to mealImages from the component's current state
    const currentMealImages = [...mealImages];
    
    // First, check if we have any meals that need processing
    const mealsWithFiles = currentMealImages.filter(meal => meal.file !== null);
    
    if (mealsWithFiles.length === 0) {
      toast.error('Please upload at least one meal image first!');
      return;
    }

    // Get meals that need processing:
    // 1. Has a file AND
    // 2. Either doesn't have detected items OR is marked for reprocessing
    const mealsToScan = mealsWithFiles.filter(meal => 
      !meal.detectedItems || 
      meal.detectedItems.length === 0 || 
      meal.shouldReprocess === true
    );
    
    // Check if there's anything to process
    if (mealsToScan.length === 0) {
      // If nothing needs processing but we have processed meals, just show results
      const hasProcessedMeals = mealsWithFiles.some(meal => 
        meal.detectedItems && meal.detectedItems.length > 0
      );
      
      if (hasProcessedMeals) {
        setShowResults(true);
      } else {
        toast.error('Something went wrong. Please try uploading your images again.');
      }
      return;
    }
    
    // Create a copy of processed meals to avoid state update conflicts
    const updatedMeals = [...currentMealImages];

    // Process each meal image in sequence
    processMealsSequentially(mealsToScan, updatedMeals)
      .then(success => {
        if (success) {
          // Delay showing results slightly to ensure meal data updates have been applied
          setTimeout(() => {
            setShowResults(true);
          }, 50); // Small delay to make sure UI updates happen first
        }
      })
      .catch(error => {
        console.error("Error processing meals:", error);
      });
  };

  // Function to regenerate QR code
  const regenerateQRCode = useCallback(() => {
    // Prevent regeneration if already in progress
    if (isQrProcessing) return;
    
    const regenerate = async () => {
      try {
        // First reset the current QR flow
        resetQrFlow();
        // Then generate a new one
        await initializeQRCode(300);
      } catch (error) {
        toast.error('Failed to regenerate QR Code');
      }
    };
    
    regenerate();
  }, [initializeQRCode, resetQrFlow, isQrProcessing]);

  // Function to handle meal type changes
  const handleMealTypeChange = (index: number, newType: MealType) => {
    // Make sure the new type isn't already used
    const existingIndex = mealImages.findIndex(meal => 
      meal.mealType === newType && meal.file !== null
    );
    
    if (existingIndex !== -1 && existingIndex !== index) {
      // If this meal type is already used, swap the meal types
      setMealImages(prev => {
        const updated = [...prev];
        // Get the current meal type at the target index
        const currentType = updated[index].mealType;
        
        // Swap the meal types
        updated[existingIndex] = {
          ...updated[existingIndex],
          mealType: currentType
        };
        
        updated[index] = {
          ...updated[index],
          mealType: newType
        };
        
        return updated;
      });
      
      toast.info('Meal types have been swapped');
    } else {
      // Simply update the meal type
      setMealImages(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          mealType: newType
        };
        return updated;
      });
    }
  };

  // Check if any processing is happening
  const isLoading = isDetecting || isQrProcessing || mealImages.some(meal => meal.isProcessing);

  // Toggle between scanning and results view
  const toggleView = () => {
    setShowResults(prev => !prev);
    
    // If going back to scanning view, regenerate QR code on desktop
    if (showResults && !isMobile) {
      regenerateQRCode();
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-6 pt-25">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        {showResults ? 'NutriScan Results' : 'Start Your NutriScan'}
      </h1>

      <p className="text-lg font-semibold text-gray-600 mb-6 text-center">
        {showResults 
          ? 'Here are the ingredients detected in your meals'
          : 'Upload photos of your meals to analyze the nutritional contents!'}
      </p>

      {showResults ? (
        <ResultsSection 
          mealImages={mealImages}
          onMealTypeChange={handleMealTypeChange}
          toggleView={toggleView}
        />
      ) : (
        <ScanningSection
          mealImages={mealImages}
          isMobile={isMobile}
          isLoading={isLoading}
          qrData={qrData}
          uploadStatus={uploadStatus}
          errorMessage={errorMessage || null}
          isQrProcessing={isQrProcessing}
          regenerateQRCode={regenerateQRCode}
          handleFileChange={handleFileChange}
          handleCameraCapture={handleCameraCapture}
          handleScan={handleScan}
        />
      )}
    </div>
  );
}

