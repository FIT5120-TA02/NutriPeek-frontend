'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useDetectFoodItems, useQRCodeFlow } from "../../../api";
import { FoodItemDetection, FoodMappingRequest } from "../../../api/types";
import { nutripeekApi } from "../../../api/nutripeekApi";
import ScanningSection from "../../../components/NutriScan/ScanningSection";
import ResultsSection from "../../../components/NutriScan/ResultsSection";
import { FoodItemDisplay, MealType, MealImage } from "../../../components/NutriScan/types";
import storageService from '../../../libs/StorageService';
import useDeviceDetection from "../../../hooks/useDeviceDetection";

export default function NutriScanPage() {
  const { isMobile } = useDeviceDetection();
  
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
        setMealImages(prev => {
          const updated = [...prev];
          updated[processingMealIndex] = {
            ...updated[processingMealIndex],
            processingStep: 'mapping'
          };
          return updated;
        });
        toast.loading('Mapping nutrients...', { id: 'qr-processing' });
        
        // Process the detected items with nutrient mapping
        processDetectedFood(resultData.detected_items || [])
          .then(mappedItems => {
            setMealImages(prev => {
              const updated = [...prev];
              if (processingMealIndex !== null) {
                // Get the imageUrl from the result data
                const imageUrl = null;
                
                updated[processingMealIndex] = {
                  ...updated[processingMealIndex],
                  file: new File([], "qr_uploaded_image.jpg"), // Dummy file since we don't have the actual file
                  imagePreviewUrl: imageUrl,
                  detectedItems: mappedItems,
                  processingStep: 'complete',
                  isProcessing: false
                };
              }
              return updated;
            });
            
            setProcessingMealIndex(null);
            setShowResults(true);
            toast.success('Food analysis complete!', { id: 'qr-processing' });
          })
          .catch(error => {
            toast.error('Failed to map nutrients', { id: 'qr-processing' });
            // Fallback to basic mapping without nutrients
            if (processingMealIndex !== null) {
              const basicItems = mapDetectionToDisplay(resultData.detected_items || []);
              setMealImages(prev => {
                const updated = [...prev];
                // Get the imageUrl from the result data
                const imageUrl = null;
                
                updated[processingMealIndex] = {
                  ...updated[processingMealIndex],
                  file: new File([], "qr_uploaded_image.jpg"), // Dummy file
                  imagePreviewUrl: imageUrl,
                  detectedItems: basicItems,
                  processingStep: 'complete',
                  isProcessing: false
                };
                return updated;
              });
              
              setProcessingMealIndex(null);
              setShowResults(true);
            }
          });
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
    
    // Update the meal image
    setMealImages(prev => {
      const updated = [...prev];
      updated[mealIndex] = {
        ...updated[mealIndex],
        file,
        imagePreviewUrl: URL.createObjectURL(file)
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


  const handleScan = async () => {
    // Check if there are any images to scan
    const mealsToScan = mealImages.filter(meal => meal.file !== null && !meal.isProcessing);
    
    if (mealsToScan.length === 0) {
      toast.error('Please upload at least one meal image first!');
      return;
    }

    // Process each meal image in sequence
    for (let i = 0; i < mealsToScan.length; i++) {
      const mealIndex = mealImages.findIndex(meal => meal === mealsToScan[i]);
      if (mealIndex === -1) continue;
      
      const meal = mealImages[mealIndex];
      if (!meal.file) continue;
      
      const toastId = `scan-${mealIndex}`;
      const mealName = meal.mealType === 'breakfast' ? 'Breakfast' : 
                       meal.mealType === 'lunch' ? 'Lunch' : 'Dinner';
      
      // Update processing state
      setMealImages(prev => {
        const updated = [...prev];
        updated[mealIndex] = {
          ...updated[mealIndex],
          processingStep: 'detecting',
          isProcessing: true
        };
        return updated;
      });
      
      toast.loading(`Detecting food items in ${mealName}...`, { id: toastId });

      try {
        // Step 1: Detect food items
        const detectionData = await detectFoodItems(meal.file);
        
        if (detectionData.detected_items && detectionData.detected_items.length > 0) {
          // Update processing state to mapping
          setMealImages(prev => {
            const updated = [...prev];
            updated[mealIndex] = {
              ...updated[mealIndex],
              processingStep: 'mapping'
            };
            return updated;
          });
          
          toast.loading(`Mapping nutrients for ${mealName}...`, { id: toastId });
          
          // Step 2: Map nutrients to detected items
          try {
            const mappedItems = await processDetectedFood(detectionData.detected_items);
            
            // Update the meal with processed results
            setMealImages(prev => {
              const updated = [...prev];
              updated[mealIndex] = {
                ...updated[mealIndex],
                detectedItems: mappedItems,
                processingStep: 'complete',
                isProcessing: false
              };
              return updated;
            });
            
            toast.success(`${mealName} analysis complete!`, { id: toastId });
          } catch (error) {
            console.error('Nutrient mapping failed for ${mealName}, falling back to basic display', error);
            toast.error(`Nutrient mapping failed for ${mealName}, displaying basic results`, { id: toastId });
            
            // Fallback to basic mapping without nutrients
            const basicItems = mapDetectionToDisplay(detectionData.detected_items);
            
            setMealImages(prev => {
              const updated = [...prev];
              updated[mealIndex] = {
                ...updated[mealIndex],
                detectedItems: basicItems,
                processingStep: 'complete',
                isProcessing: false
              };
              return updated;
            });
          }
        } else {
          toast.error(`No food items detected in the ${mealName} image`, { id: toastId });
          
          setMealImages(prev => {
            const updated = [...prev];
            updated[mealIndex] = {
              ...updated[mealIndex],
              processingStep: 'idle',
              isProcessing: false
            };
            return updated;
          });
        }
      } catch (error) {
        console.error(`Error processing ${mealName} image:`, error);
        toast.error(`Failed to process the ${mealName} image!`, { id: toastId });
        
        setMealImages(prev => {
          const updated = [...prev];
          updated[mealIndex] = {
            ...updated[mealIndex],
            processingStep: 'idle',
            isProcessing: false
          };
          return updated;
        });
      }
    }
    
    // If any meal was successfully processed, show results
    if (mealImages.some(meal => meal.detectedItems && meal.detectedItems.length > 0)) {
      setShowResults(true);
    }
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

  // Function to reset the scanning process
  const handleReset = () => {
    setShowResults(false);
    
    // Clear all meal data but keep the meal types
    setMealImages(prev => 
      prev.map(meal => ({
        file: null,
        mealType: meal.mealType,
        imagePreviewUrl: null,
        processingStep: 'idle',
        isProcessing: false
      }))
    );
    
    // Clear the scanned foods when resetting
    storageService.setLocalItem('scannedFoods', []);
    
    // If on desktop, generate a new QR code
    if (!isMobile) {
      regenerateQRCode();
    }
  };

  // Check if any processing is happening
  const isLoading = isDetecting || isQrProcessing || mealImages.some(meal => meal.isProcessing);

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
          handleReset={handleReset}
          onMealTypeChange={handleMealTypeChange}
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

