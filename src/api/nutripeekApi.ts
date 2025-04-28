/**
 * NutriPeek API Service
 * Provides methods for interacting with the NutriPeek backend API
 */

import { apiClient } from './apiClient';
import {
  HealthCheckResponse,
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
  FoodCategoriesResponse,
  NutrientIntakeResponse
} from './types';

/**
 * NutriPeek API service
 * Contains methods for all available API endpoints
 */
export class NutriPeekApi {
  /**
   * Check the health of the API
   * @returns Health check information
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    return apiClient.get<HealthCheckResponse>('/api/v1/health/');
  }

  /**
   * Simple health check
   * @returns Simple ping response
   */
  async ping(): Promise<Record<string, any>> {
    return apiClient.get<Record<string, any>>('/api/v1/health/ping');
  }

  /**
   * Detect food items in an image
   * @param imageFile - Image file to analyze
   * @returns Detected food items with bounding boxes
   */
  async detectFoodItems(imageFile: File): Promise<FoodDetectionResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return apiClient.uploadFile<FoodDetectionResponse>('/api/v1/food-detection/detect', formData);
  }

  /**
   * Map detected food items to nutrient data
   * @param request - Food mapping request
   * @returns Mapped food items with nutrient information
   */
  async mapFoodToNutrients(request: FoodMappingRequest): Promise<FoodMappingResponse> {
    return apiClient.post<FoodMappingResponse>('/api/v1/food-detection/map-nutrients', request);
  }

  /**
   * Generate a QR code for image upload
   * @param expirySeconds - Time in seconds before the upload link expires (60-3600 seconds)
   * @returns QR code and upload URL information
   */
  async generateUploadQR(expirySeconds: number = 300): Promise<GenerateUploadQRResponse> {
    const formData = new FormData();
    formData.append('expiry_seconds', expirySeconds.toString());
    
    return apiClient.uploadFile<GenerateUploadQRResponse>('/api/v1/qrcode/generate', formData);
  }

  /**
   * Upload an image using a shortcode
   * @param shortcode - Unique identifier for the upload
   * @param imageFile - Image file to upload
   * @returns Upload response with status
   */
  async uploadImage(shortcode: string, imageFile: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    return apiClient.uploadFile<UploadImageResponse>(`/api/v1/qrcode/upload/${shortcode}`, formData);
  }

  /**
   * Get the status of an uploaded file
   * @param shortcode - Unique identifier for the upload
   * @returns File status information
   */
  async getFileStatus(shortcode: string): Promise<FileStatusResponse> {
    return apiClient.get<FileStatusResponse>(`/api/v1/qrcode/status/${shortcode}`);
  }

  /**
   * Get the processing result for an uploaded image
   * @param shortcode - Unique identifier for the upload
   * @returns Food detection results
   */
  async getProcessingResult(shortcode: string): Promise<FoodDetectionResponse> {
    return apiClient.get<FoodDetectionResponse>(`/api/v1/qrcode/result/${shortcode}`);
  }

  /**
   * Search for foods by name (autocomplete)
   * @param query - Search term for food items
   * @param limit - Maximum number of results to return (1-50)
   * @returns List of matching food items
   */
  async searchFoods(query: string, limit: number = 10): Promise<FoodAutocompleteResponse[]> {
    return apiClient.get<FoodAutocompleteResponse[]>('/api/v1/food/autocomplete', {
      query,
      limit
    });
  }

  /**
   * Get food categories with average nutrient values
   * @param excludeEmpty - Whether to exclude categories with null/empty values (default: true)
   * @returns List of food categories with average nutrient values
   */
  async getFoodCategories(excludeEmpty: boolean = true): Promise<FoodCategoriesResponse> {
    return apiClient.get<FoodCategoriesResponse>('/api/v1/food/categories', {
      exclude_empty: excludeEmpty
    });
  }

  /**
   * Get detailed nutrient information for a food item
   * @param foodId - Unique identifier for the food item
   * @returns Detailed nutrient information
   */
  async getFoodNutrients(foodId: string): Promise<FoodNutrientResponse> {
    return apiClient.get<FoodNutrientResponse>(`/api/v1/food/${foodId}`);
  }

  /**
   * Calculate nutritional gaps for a child
   * @param request - Nutrient gap calculation request
   * @returns Nutritional gap analysis
   */
  async calculateNutrientGap(request: NutrientGapRequest): Promise<NutrientGapResponse> {
    return apiClient.post<NutrientGapResponse>('/api/v1/nutrient/calculate-gap', request);
  }

  /**
   * Get required nutrient intake for a child
   * @param childProfile - Profile with age and gender
   * @returns Required daily nutrient intake information
   */
  async getNutrientIntake(childProfile: { age: number; gender: 'boy' | 'girl' }): Promise<NutrientIntakeResponse> {
    return apiClient.post<NutrientIntakeResponse>('/api/v1/nutrient/nutrient-intake', childProfile);
  }
}

// Export a singleton instance
export const nutripeekApi = new NutriPeekApi();