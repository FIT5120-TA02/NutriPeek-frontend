/**
 * React hooks for using the NutriPeek API
 * Provides hooks with loading, error, and data states
 */

import { useState, useEffect, useCallback } from 'react';
import { nutripeekApi } from './nutripeekApi';
import { ApiError } from './apiClient';
import {
  FoodDetectionResponse,
  FoodMappingRequest,
  FoodMappingResponse,
  GenerateUploadQRResponse,
  UploadImageResponse,
  FileStatusResponse,
  FoodAutocompleteResponse,
  FoodNutrientResponse,
  NutrientGapRequest,
  NutrientGapResponse,
  NutrientIntakeResponse
} from './types';

interface ApiHookState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface ApiHookResult<T> extends ApiHookState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

/**
 * Create a hook for API calls with loading, error, and data states
 * @param apiFunction - Function that makes the API call
 * @returns Hook state and execute function
 */
function useApiCall<T, Args extends any[]>(
  apiFunction: (...args: Args) => Promise<T>,
  executeOnMount = false,
  defaultArgs?: Args
): ApiHookResult<T> {
  const [state, setState] = useState<ApiHookState<T>>({
    data: null,
    isLoading: executeOnMount,
    error: null
  });

  const execute = useCallback(async (...args: Args) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await apiFunction(...args);
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unknown error occurred';
      
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  useEffect(() => {
    if (executeOnMount && defaultArgs) {
      execute(...defaultArgs);
    }
  }, [executeOnMount, execute, defaultArgs]);

  return { ...state, execute, reset };
}

// API Hooks

/**
 * Hook for detecting food items in an image
 */
export function useDetectFoodItems() {
  return useApiCall<FoodDetectionResponse, [File]>(
    (imageFile: File) => nutripeekApi.detectFoodItems(imageFile)
  );
}

/**
 * Hook for mapping detected food items to nutrient data
 */
export function useMapFoodToNutrients() {
  return useApiCall<FoodMappingResponse, [FoodMappingRequest]>(
    (request: FoodMappingRequest) => nutripeekApi.mapFoodToNutrients(request)
  );
}

/**
 * Hook for generating a QR code for image upload
 */
export function useGenerateUploadQR(executeOnMount = false) {
  return useApiCall<GenerateUploadQRResponse, [number?]>(
    (expirySeconds?: number) => nutripeekApi.generateUploadQR(expirySeconds),
    executeOnMount,
    [300]
  );
}

/**
 * Hook for uploading an image using a shortcode
 */
export function useUploadImage() {
  return useApiCall<UploadImageResponse, [string, File]>(
    (shortcode: string, imageFile: File) => nutripeekApi.uploadImage(shortcode, imageFile)
  );
}

/**
 * Hook for polling the status of an uploaded file
 * @param shortcode - Shortcode for the upload
 * @param pollInterval - Polling interval in milliseconds (default: 2000)
 * @param maxAttempts - Maximum number of polling attempts (default: 15)
 */
export function useFileStatusPolling(
  shortcode: string | null,
  pollInterval = 2000,
  maxAttempts = 15
) {
  const [status, setStatus] = useState<ApiHookState<FileStatusResponse>>({
    data: null,
    isLoading: false,
    error: null
  });
  const [attempts, setAttempts] = useState(0);
  const [polling, setPolling] = useState(false);

  const startPolling = useCallback(() => {
    if (!shortcode) return;
    
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    setPolling(true);
    setAttempts(0);
  }, [shortcode]);

  const stopPolling = useCallback(() => {
    setPolling(false);
  }, []);

  useEffect(() => {
    if (!polling || !shortcode) return;

    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const data = await nutripeekApi.getFileStatus(shortcode);
        setStatus({ data, isLoading: false, error: null });

        // If processing is complete or there's an error, stop polling
        if (data.status === 'processed' || data.status === 'failed' || (data.error && data.error.length > 0)) {
          setPolling(false);
        } else if (attempts >= maxAttempts) {
          setStatus(prev => ({ ...prev, isLoading: false, error: 'Polling timed out' }));
          setPolling(false);
        } else {
          setAttempts(prev => prev + 1);
          timeoutId = setTimeout(pollStatus, pollInterval);
        }
      } catch (error) {
        const errorMessage = error instanceof ApiError 
          ? error.message 
          : 'An unknown error occurred';
        
        setStatus(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        setPolling(false);
      }
    };

    pollStatus();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [shortcode, polling, attempts, maxAttempts, pollInterval]);

  return { ...status, startPolling, stopPolling, isPolling: polling };
}

/**
 * Hook for getting the processing result for an uploaded image
 */
export function useProcessingResult() {
  return useApiCall<FoodDetectionResponse, [string]>(
    (shortcode: string) => nutripeekApi.getProcessingResult(shortcode)
  );
}

/**
 * Complete hook for QR code-based food detection flow
 * Handles QR code generation, polling for upload, and retrieving results
 */
export function useQRCodeFlow() {
  const [shortcode, setShortcode] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'pending' | 'uploaded' | 'processed' | 'error'>('pending');
  const [resultData, setResultData] = useState<FoodDetectionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formattedQrData, setFormattedQrData] = useState<GenerateUploadQRResponse | null>(null);
  
  // Generate QR code
  const qrCode = useGenerateUploadQR(false);
  
  // File status polling
  const fileStatus = useFileStatusPolling(shortcode, 2000, 30);
  
  // Processing result
  const processingResult = useProcessingResult();
  
  // Initialize QR code and extract shortcode
  const initializeQRCode = useCallback(async (expirySeconds = 300) => {
    try {
      setUploadStatus('pending');
      setResultData(null);
      setErrorMessage(null);
      
      const data = await qrCode.execute(expirySeconds);
      
      // Extract shortcode from upload URL
      const extractedShortcode = data.upload_url.split('/').pop() || null;
      setShortcode(extractedShortcode);
      
      // Create a modified version of the QR data with a formatted upload URL
      // that redirects to our QRUpload page with the shortcode
      if (extractedShortcode) {
        // Format the URL to point to our QRUpload page
        const websiteOrigin = window.location.origin; // e.g., https://nutripeek.com
        const uploadPageUrl = `${websiteOrigin}/QRUpload?code=${extractedShortcode}`;
        
        // Create formatted QR data with our custom URL
        const formatted = {
          ...data,
          upload_url: uploadPageUrl
        };
        
        setFormattedQrData(formatted);
        
        // Start polling for status
        fileStatus.startPolling();
      }
      
      return data;
    } catch (error) {
      setErrorMessage('Failed to generate QR code');
      throw error;
    }
  }, [qrCode, fileStatus]);
  
  // Reset the flow
  const reset = useCallback(() => {
    setShortcode(null);
    setUploadStatus('pending');
    setResultData(null);
    setErrorMessage(null);
    setFormattedQrData(null);
    fileStatus.stopPolling();
    qrCode.reset();
    processingResult.reset();
  }, [fileStatus, qrCode, processingResult]);
  
  // Monitor file status changes
  useEffect(() => {
    if (fileStatus.data) {
      if (fileStatus.data.status === 'processed') {
        setUploadStatus('processed');
        
        // If processed, get the result
        if (shortcode) {
          processingResult.execute(shortcode)
            .then(data => {
              setResultData(data);
            })
            .catch(error => {
              setErrorMessage('Failed to retrieve results');
              setUploadStatus('error');
            });
        }
      } else if (fileStatus.data.status === 'error' || fileStatus.data.error) {
        setUploadStatus('error');
        setErrorMessage(fileStatus.data.error || 'An error occurred during processing');
      } else if (fileStatus.data.status === 'uploaded') {
        setUploadStatus('uploaded');
      }
    }
  }, [fileStatus.data, shortcode, processingResult]);
  
  // Handle errors
  useEffect(() => {
    if (fileStatus.error) {
      setErrorMessage(fileStatus.error);
      setUploadStatus('error');
    }
  }, [fileStatus.error]);
  
  const isLoading = qrCode.isLoading || fileStatus.isLoading || processingResult.isLoading;
  
  return {
    initializeQRCode,
    qrData: formattedQrData || qrCode.data,
    originalQrData: qrCode.data,
    shortcode,
    uploadStatus,
    resultData,
    errorMessage,
    isLoading,
    reset
  };
}

/**
 * Hook for searching foods by name (autocomplete)
 */
export function useSearchFoods() {
  return useApiCall<FoodAutocompleteResponse[], [string, number?]>(
    (query: string, limit?: number) => nutripeekApi.searchFoods(query, limit)
  );
}

/**
 * Hook for getting detailed nutrient information for a food item
 */
export function useFoodNutrients(foodId: string | null, executeOnMount = false) {
  return useApiCall<FoodNutrientResponse, [string]>(
    (id: string) => nutripeekApi.getFoodNutrients(id),
    executeOnMount && foodId !== null,
    foodId ? [foodId] : undefined
  );
}

/**
 * Hook for calculating nutritional gaps for a child
 */
export function useCalculateNutrientGap() {
  return useApiCall<NutrientGapResponse, [NutrientGapRequest]>(
    (request: NutrientGapRequest) => nutripeekApi.calculateNutrientGap(request)
  );
}

/**
 * Hook for getting recommended nutrient intake for a child
 */
export function useGetNutrientIntake() {
  return useApiCall<NutrientIntakeResponse, [{ age: number; gender: 'boy' | 'girl' }]>(
    (childProfile: { age: number; gender: 'boy' | 'girl' }) => nutripeekApi.getNutrientIntake(childProfile)
  );
}