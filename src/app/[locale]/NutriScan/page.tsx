'use client';

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

=======
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDetectFoodItems, useQRCodeFlow } from "../../../api";
import { FoodItemDetection, FoodMappingRequest } from "../../../api/types";
import { nutripeekApi } from "../../../api/nutripeekApi";
import ScanningSection from "../../../components/NutriScan/ScanningSection";
import ResultsSection from "../../../components/NutriScan/ResultsSection";
import { FoodItemDisplay } from "../../../components/NutriScan/types";
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f

export default function NutriScanPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
<<<<<<< HEAD
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
=======
  const [isMobile, setIsMobile] = useState(false);
  const [detectedItems, setDetectedItems] = useState<FoodItemDisplay[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<'idle' | 'detecting' | 'mapping' | 'complete'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
      
      // First, set the detecting state and update UI
      setProcessingStep('detecting');
      toast.loading('Detecting food items...', { id: 'processing' });
      
      // Prepare for mapping nutrients (second step)
      setProcessingStep('mapping');
      toast.loading('Mapping nutrients...', { id: 'processing' });
      
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
      
      // Process is complete
      setProcessingStep('complete');
      toast.success('Food analysis complete!', { id: 'processing' });
      
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
  
  // Detect if the user is on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
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
      setProcessingStep('detecting');
      toast.loading('Food detection in progress...', { id: 'qr-processing' });
    } else if (uploadStatus === 'processed' && resultData) {
      // QR processed, now map nutrients
      if (resultData.detected_items && resultData.detected_items.length > 0) {
        setProcessingStep('mapping');
        toast.loading('Mapping nutrients...', { id: 'qr-processing' });
        
        // Process the detected items with nutrient mapping
        processDetectedFood(resultData.detected_items || [])
          .then(mappedItems => {
            setDetectedItems(mappedItems);
            setShowResults(true);
            setProcessingStep('complete');
            toast.success('Food analysis complete!', { id: 'qr-processing' });
          })
          .catch(error => {
            toast.error('Failed to map nutrients', { id: 'qr-processing' });
            // Fallback to basic mapping without nutrients
            setDetectedItems(mapDetectionToDisplay(resultData.detected_items || []));
            setShowResults(true);
          });
      } else {
        toast.error('No food items detected in the uploaded image', { id: 'qr-processing' });
        setProcessingStep('idle');
      }
    } else if (uploadStatus === 'error') {
      toast.error(errorMessage || 'An error occurred', { id: 'qr-processing' });
      setProcessingStep('idle');
    }
  }, [uploadStatus, resultData, errorMessage, mapDetectionToDisplay, processDetectedFood]);
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setImage(file);
<<<<<<< HEAD
=======
      setImagePreviewUrl(URL.createObjectURL(file));
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f
      toast.success('Image selected successfully!');
    }
  };

<<<<<<< HEAD
  const generateQrCode = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/generate_upload_qr`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error during QR code generation: ${errorText}`);
      }

      const data = await response.json();
      setQrCodeUrl(`data:image/png;base64,${data.qrcode_base64}`);
      setUploadUrl(data.upload_url);
      toast.success('QR Code generated successfully!');
    } catch (error) {
      toast.error('Failed to generate QR Code.');
    }
  };

  const handleScan = async () => {
    if (!image && !uploadUrl) {
      toast.error('Please upload an image or wait for QR code generation!');
      return;
    }

    toast.loading('Processing your scan...', { id: 'scan' });

    try {
      if (image) {
        const formData = new FormData();
        formData.append('image', image);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/food-detection/detect`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error during upload: ${errorText}`);
        }

        const data = await response.json();
        toast.success('Scan completed!', { id: 'scan' });

        if (data.detected_items || data.label) {
          const items = encodeURIComponent(JSON.stringify(data.detected_items || data.label));
          router.push(`/NutriResult?items=${items}`);
        }
      } else if (uploadUrl) {
        const shortcode = uploadUrl.split('/').pop();
        const resultResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/result/${shortcode}`);

        if (!resultResponse.ok) {
          throw new Error('Failed to fetch result');
        }

        const resultData = await resultResponse.json();
        toast.success('Scan completed!', { id: 'scan' });

        const items = encodeURIComponent(JSON.stringify(resultData.detected_items || resultData.label));
        router.push(`/NutriResult?items=${items}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to process the image!', { id: 'scan' });
    }
  };

  useEffect(() => {
    generateQrCode();
  }, []);
=======
  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };


  const handleScan = async () => {
    if (!image) {
      toast.error('Please upload an image or take a photo first!');
      return;
    }

    const toastId = 'scan';
    setProcessingStep('detecting');
    toast.loading('Detecting food items...', { id: toastId });

    try {
      // Step 1: Detect food items
      const detectionData = await detectFoodItems(image);
      
      if (detectionData.detected_items && detectionData.detected_items.length > 0) {
        setProcessingStep('mapping');
        toast.loading('Mapping nutrients...', { id: toastId });
        
        // Step 2: Map nutrients to detected items
        try {
          const mappedItems = await processDetectedFood(detectionData.detected_items);
          setDetectedItems(mappedItems);
          setShowResults(true);
          setProcessingStep('complete');
          toast.success('Food analysis complete!', { id: toastId });
        } catch (error) {
          console.error('Nutrient mapping failed, falling back to basic display', error);
          toast.error('Nutrient mapping failed, displaying basic results', { id: toastId });
          // Fallback to basic mapping without nutrients
          setDetectedItems(mapDetectionToDisplay(detectionData.detected_items));
          setShowResults(true);
          setProcessingStep('idle');
        }
      } else {
        toast.error('No food items detected in the image', { id: toastId });
        setProcessingStep('idle');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to process the image!', { id: toastId });
      setProcessingStep('idle');
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

  // Function to reset the scanning process
  const handleReset = () => {
    setShowResults(false);
    setDetectedItems([]);
    setImage(null);
    setProcessingStep('idle');
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    
    // If on desktop, generate a new QR code
    if (!isMobile) {
      regenerateQRCode();
    }
  };

  const isLoading = isDetecting || isQrProcessing || processingStep !== 'idle';
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
<<<<<<< HEAD
        Start Your NutriScan
      </h1>

      <p className="text-lg font-semibold text-gray-600 mb-6 text-center">
        Upload a photo of your fridge or scan the QR code to analyze the nutritional contents!
      </p>

      {/* Upload Local Image Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full sm:w-80 max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Upload Local Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded-md mb-4"
        />
        {image && <p className="text-gray-500 text-sm">File selected: {image.name}</p>}
        <button
          onClick={handleScan}
          className="w-full bg-green-500 text-white py-3 rounded-lg mt-4 hover:bg-green-600 transition"
        >
          Upload & Analyze
        </button>
      </div>

      {/* QR Code Section */}
      <div className="hidden md:block bg-white rounded-lg shadow-md p-6 w-full sm:w-80 max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Scan QR Code</h2>
        <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 mb-4">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="Generated QR Code" className="w-48 h-48 object-contain" />
          ) : (
            <p className="text-gray-500 text-center">Generating QR Code...</p>
          )}
        </div>
        {uploadUrl && (
          <p className="text-xs text-center text-gray-400 break-words">{uploadUrl}</p>
        )}
      </div>
    </div>
  );
}

=======
        {showResults ? 'NutriScan Results' : 'Start Your NutriScan'}
      </h1>

      <p className="text-lg font-semibold text-gray-600 mb-6 text-center">
        {showResults 
          ? 'Here are the ingredients detected in your food'
          : 'Upload a photo of your food to analyze the nutritional contents!'}
      </p>

      {showResults ? (
        <ResultsSection 
          detectedItems={detectedItems}
          imagePreviewUrl={imagePreviewUrl}
          handleReset={handleReset}
        />
      ) : (
        <ScanningSection
          image={image}
          isMobile={isMobile}
          isLoading={isLoading}
          processingStep={processingStep}
          imagePreviewUrl={imagePreviewUrl}
          fileInputRef={fileInputRef}
          cameraInputRef={cameraInputRef}
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
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f
