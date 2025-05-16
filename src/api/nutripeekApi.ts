import { apiClient } from "./apiClient";
import {
  HealthCheckResponse,
  FoodDetectionResponse,
  FoodMappingRequest,
  FoodMappingResponse,
  CreateSessionResponse,
  SessionStatusResponse,
  JoinSessionResponse,
  FileUploadResponse,
  FilesListResponse,
  FoodAutocompleteResponse,
  FoodNutrientResponse,
  NutrientGapRequest,
  NutrientGapResponse,
  FoodCategoriesResponse,
  NutrientIntakeResponse,
  FoodCategoryFunFactResponse,
  FoodCategoryFunFactsResponse,
  FoodRecommendation,
  ActivityResponse,
  ActivityResult,
  ChildEnergyRequirementsResponse,
  ActivityEntry,
  MealType,
  SessionStatus,
  Season,
  SeasonalFoodResponse,
  SeasonalFoodListResponse,
  FarmersMarketListResponse,
  FarmersMarketResponse,
  SeasonalFoodDetailResponse,
  OptimizedFoodRecommendation,
  OptimizedFoodRecommendationRequest,
} from "./types";

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
    return apiClient.get<HealthCheckResponse>("/api/v1/health/");
  }

  /**
   * Simple health check
   * @returns Simple ping response
   */
  async ping(): Promise<Record<string, any>> {
    return apiClient.get<Record<string, any>>("/api/v1/health/ping");
  }

  /**
   * Check if an image file needs conversion before processing
   * @param file - The file to check
   * @returns True if the file needs conversion
   */
  isImageConversionNeeded(file: File): boolean {
    // Direct HEIC/HEIF detection
    if (
      file.type.toLowerCase().includes("heic") ||
      file.type.toLowerCase().includes("heif")
    ) {
      console.log(
        `Image conversion needed for ${file.name}: HEIC/HEIF format detected`
      );
      return true;
    }

    // File has no type or unrecognized type
    if (!file.type || file.type === "application/octet-stream") {
      // Check file extension for HEIC/HEIF
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension === "heic" || extension === "heif") {
        console.log(
          `Image conversion needed for ${file.name}: HEIC/HEIF extension detected`
        );
        return true;
      }
    }

    // Safari/iOS sometimes provides incorrect mime type for HEIC
    if (
      file.type === "image/jpeg" &&
      file.name.toLowerCase().endsWith(".heic")
    ) {
      console.log(
        `Image conversion needed for ${file.name}: HEIC file with incorrect mime type`
      );
      return true;
    }

    // Large PNG or WebP files could benefit from conversion to JPEG
    if (
      (file.type === "image/png" || file.type === "image/webp") &&
      file.size > 2 * 1024 * 1024 // > 2MB
    ) {
      console.log(
        `Image conversion suggested for ${file.name}: Large ${file.type} file`
      );
      return true;
    }

    // No conversion needed
    return false;
  }

  /**
   * Convert an image file to a standard format using the backend service
   * @param imageFile - The file to convert
   * @param targetFormat - Format to convert to (default: JPEG)
   * @param quality - Image quality for JPEG (default: 90)
   * @returns Converted file information
   */
  async convertImage(
    imageFile: File,
    targetFormat: string = "JPEG",
    quality: number = 90
  ): Promise<{
    file: File;
    url: string;
    originalType: string;
    contentType: string;
  }> {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("target_format", targetFormat);
      formData.append("quality", quality.toString());

      // Use the uploadAndDownloadBlob method to get the converted file
      const blob = await apiClient.uploadAndDownloadBlob(
        "/api/v1/file-conversion/convert-download",
        formData
      );

      // Prepare filename and determine content type
      let fileName = imageFile.name;

      // Check if the filename extension should be updated
      if (
        targetFormat.toLowerCase() !==
        imageFile.name.split(".").pop()?.toLowerCase()
      ) {
        // Update filename extension to match target format
        const baseName = fileName.substring(0, fileName.lastIndexOf("."));
        fileName = `${baseName}.${targetFormat.toLowerCase()}`;
      }

      // Create a new File object with the converted blob
      const convertedFile = new File([blob], fileName, {
        type: blob.type || `image/${targetFormat.toLowerCase()}`,
      });

      // Create a URL for the blob
      const url = URL.createObjectURL(convertedFile);

      return {
        file: convertedFile,
        url,
        originalType: imageFile.type,
        contentType: blob.type || `image/${targetFormat.toLowerCase()}`,
      };
    } catch (error) {
      console.error("Error converting image:", error);
      // Create URL for original file if conversion fails
      const url = URL.createObjectURL(imageFile);
      return {
        file: imageFile,
        url,
        originalType: imageFile.type,
        contentType: imageFile.type,
      };
    }
  }

  /**
   * Detect food items in an image, handling conversion if needed
   * @param imageFile - The image file to process
   * @returns Detection results
   */
  async detectFoodItems(imageFile: File): Promise<FoodDetectionResponse> {
    // Check if we need to convert the image first
    if (this.isImageConversionNeeded(imageFile)) {
      try {
        // Convert the image to JPEG
        const { file: convertedFile } = await this.convertImage(
          imageFile,
          "JPEG"
        );

        // Use the converted file for detection
        const formData = new FormData();
        formData.append("image", convertedFile);

        return apiClient.uploadFile<FoodDetectionResponse>(
          "/api/v1/food-detection/detect",
          formData
        );
      } catch (error) {
        console.error("Error converting or detecting image:", error);
        // Fall back to trying with the original file
        const formData = new FormData();
        formData.append("image", imageFile);

        return apiClient.uploadFile<FoodDetectionResponse>(
          "/api/v1/food-detection/detect",
          formData
        );
      }
    } else {
      // No conversion needed, proceed as normal
      const formData = new FormData();
      formData.append("image", imageFile);

      return apiClient.uploadFile<FoodDetectionResponse>(
        "/api/v1/food-detection/detect",
        formData
      );
    }
  }

  /**
   * Map detected food items to nutrient data
   * @param request - Food mapping request
   * @returns Mapped food items with nutrient information
   */
  async mapFoodToNutrients(
    request: FoodMappingRequest
  ): Promise<FoodMappingResponse> {
    return apiClient.post<FoodMappingResponse>(
      "/api/v1/food-detection/map-nutrients",
      request
    );
  }

  /**
   * Create a new WebSocket session
   * @param expirySeconds - Time in seconds before the session expires (60-3600 seconds)
   * @returns Session ID, QR code and join URL information
   */
  async createSession(
    expirySeconds: number = 300
  ): Promise<CreateSessionResponse> {
    const formData = new FormData();
    formData.append("expiry_seconds", expirySeconds.toString());

    return apiClient.uploadFile<CreateSessionResponse>(
      "/api/v1/session/create",
      formData
    );
  }

  /**
   * Get the status of a session
   * @param sessionId - Unique identifier for the session
   * @returns Session status information
   */
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    return apiClient.get<SessionStatusResponse>(
      `/api/v1/session/status/${sessionId}`
    );
  }

  /**
   * Join a session
   * @param sessionId - Unique identifier for the session
   * @returns Join response with session status
   */
  async joinSession(sessionId: string): Promise<JoinSessionResponse> {
    return apiClient.post<JoinSessionResponse>(
      `/api/v1/session/join?session_id=${sessionId}`,
      {}
    );
  }

  /**
   * Connect to the session via WebSocket to activate it
   * @param sessionId - Unique identifier for the session
   * @param onOpen - Callback when connection is established
   * @param onMessage - Callback when message is received
   * @param onClose - Callback when connection is closed
   * @param onError - Callback when error occurs
   * @returns WebSocket instance
   */
  connectToSessionWebSocket(
    sessionId: string,
    onOpen?: () => void,
    onMessage?: (data: any) => void,
    onClose?: () => void,
    onError?: (error: Event) => void
  ): WebSocket | null {
    // Use the new apiClient WebSocket connection method
    return apiClient.createWebSocketConnection(
      `/api/v1/session/ws/${sessionId}`,
      {
        onOpen,
        onMessage,
        onClose,
        onError,
        // Development URL resolver for WebSocket connections
        developmentUrlResolver: async (endpoint: string) => {
          try {
            if (process.env.NODE_ENV === "development") {
              const appUrl =
                process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
              const wsInfoEndpoint = `${appUrl}/api/v1/ws/${sessionId}`;

              const response = await fetch(wsInfoEndpoint);
              const data = await response.json();
              return data.wsUrl || "";
            }
            return endpoint;
          } catch (error) {
            console.error("Error resolving WebSocket URL:", error);
            throw error;
          }
        },
      }
    );
  }

  /**
   * Activate a session by repeatedly calling the join API
   * This is a fallback when WebSocket connections aren't available
   * @private
   */
  private activateViaJoinAPI(
    sessionId: string,
    onSuccess?: () => void,
    onError?: (error: Event) => void
  ): void {
    // Make a series of join requests to nudge the session into active state
    const attemptJoin = () => {
      this.joinSession(sessionId)
        .then((response) => {
          if (response.status === "active") {
            if (onSuccess) onSuccess();
            return;
          }

          // Check if we need to try again
          if (response.status === "created") {
            // Check status directly
            return this.getSessionStatus(sessionId);
          }

          // Other status means we can't activate
          throw new Error(
            `Cannot activate session with status: ${response.status}`
          );
        })
        .then((statusResponse) => {
          if (statusResponse && statusResponse.status === "active") {
            if (onSuccess) onSuccess();
          } else if (statusResponse && statusResponse.status === "created") {
            // Try one more time with a delay
            setTimeout(attemptJoin, 1000);
          }
        })
        .catch((error) => {
          console.error("Error activating session via join API:", error);
          if (onError)
            onError(new ErrorEvent("error", { message: error.message }));
        });
    };

    // Start the first attempt
    attemptJoin();
  }

  /**
   * Helper function to check if a WebSocket message is a session status update
   * @param data - Message data from WebSocket
   * @returns Whether the message is a session status update and the status
   */
  isSessionStatusUpdateMessage(data: any): {
    isStatusUpdate: boolean;
    status?: SessionStatus;
  } {
    if (
      data &&
      typeof data === "object" &&
      data.type === "session_update" &&
      typeof data.status === "string"
    ) {
      return {
        isStatusUpdate: true,
        status: data.status as SessionStatus,
      };
    }
    return { isStatusUpdate: false };
  }

  /**
   * Upload a file to a session
   * @param sessionId - Unique identifier for the session
   * @param file - File to upload
   * @param mealType - Type of meal (breakfast, lunch, dinner)
   * @returns Upload response with status
   */
  async uploadFileToSession(
    sessionId: string,
    file: File,
    mealType?: MealType
  ): Promise<FileUploadResponse> {
    // Check if we need to convert the image first
    let fileToUpload = file;

    if (this.isImageConversionNeeded(file)) {
      try {
        // Convert HEIC/HEIF files to JPEG
        const { file: convertedFile } = await this.convertImage(file, "JPEG");
        fileToUpload = convertedFile;
      } catch (error) {
        console.error("Error converting image for upload:", error);
        // Continue with original file if conversion fails
      }
    }

    // Create FormData for the upload
    const formData = new FormData();
    formData.append("file", fileToUpload, fileToUpload.name);

    if (mealType) {
      formData.append("meal_type", mealType);
    }

    // Use apiClient to upload the file
    return apiClient.uploadFile<FileUploadResponse>(
      `/api/v1/session/upload/${sessionId}`,
      formData
    );
  }

  /**
   * List files in a session
   * @param sessionId - Unique identifier for the session
   * @returns List of files in the session
   */
  async listSessionFiles(sessionId: string): Promise<FilesListResponse> {
    return apiClient.get<FilesListResponse>(
      `/api/v1/session/files/${sessionId}`
    );
  }

  /**
   * Download a file from a session
   * @param sessionId - Unique identifier for the session
   * @param fileId - Unique identifier for the file
   * @returns File content as a Blob
   */
  async downloadSessionFile(sessionId: string, fileId: string): Promise<Blob> {
    return apiClient.downloadFile(
      `/api/v1/session/file/${sessionId}/${fileId}`
    );
  }

  /**
   * Extend the expiry time of a session
   * @param sessionId - Unique identifier for the session
   * @param additionalSeconds - Additional time in seconds (60-3600)
   * @returns Success message
   */
  async extendSession(
    sessionId: string,
    additionalSeconds: number
  ): Promise<any> {
    const formData = new FormData();
    formData.append("additional_seconds", additionalSeconds.toString());

    return apiClient.uploadFile<any>(
      `/api/v1/session/extend/${sessionId}`,
      formData
    );
  }

  /**
   * Close a session
   * @param sessionId - Unique identifier for the session
   * @returns Success message
   */
  async closeSession(sessionId: string): Promise<any> {
    return apiClient.post<any>(`/api/v1/session/close/${sessionId}`, null);
  }

  /**
   * Search for foods by name (autocomplete)
   * @param query - Search term for food items
   * @param limit - Maximum number of results to return (1-50)
   * @returns List of matching food items
   */
  async searchFoods(
    query: string,
    limit: number = 10
  ): Promise<FoodAutocompleteResponse[]> {
    return apiClient.get<FoodAutocompleteResponse[]>(
      "/api/v1/food/autocomplete",
      {
        query,
        limit,
      }
    );
  }

  /**
   * Get food categories with average nutrient values
   * @param excludeEmpty - Whether to exclude categories with null/empty values (default: true)
   * @returns List of food categories with average nutrient values
   */
  async getFoodCategories(
    excludeEmpty: boolean = true
  ): Promise<FoodCategoriesResponse> {
    return apiClient.get<FoodCategoriesResponse>("/api/v1/food/categories", {
      exclude_empty: excludeEmpty,
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
  async calculateNutrientGap(
    request: NutrientGapRequest
  ): Promise<NutrientGapResponse> {
    return apiClient.post<NutrientGapResponse>(
      "/api/v1/nutrient/calculate-gap",
      request
    );
  }

  /**
   * Get required nutrient intake for a child
   * @param childProfile - Profile with age and gender
   * @returns Required daily nutrient intake information
   */
  async getNutrientIntake(childProfile: {
    age: number;
    gender: "boy" | "girl";
  }): Promise<NutrientIntakeResponse> {
    return apiClient.post<NutrientIntakeResponse>(
      "/api/v1/nutrient/nutrient-intake",
      childProfile
    );
  }

  /**
   * Get recommended foods for a nutrient
   * @param nutrient_name - The name of the nutrient
   * @param limit - Maximum number of results to return (1-50)
   * @returns List of recommended foods
   */
  async getRecommendedFoods(
    nutrient_name: string,
    limit: number = 10
  ): Promise<FoodRecommendation[]> {
    return apiClient.get<FoodRecommendation[]>(
      "/api/v1/nutrient/recommend-food",
      { nutrient_name, limit }
    );
  }

  /**
   * Get optimized food recommendations to fill specific nutrient gaps
   * @param request - The request containing nutrient name, target amount, and other parameters
   * @returns List of optimized food recommendations with gap satisfaction information
   */
  async getOptimizedFoodRecommendations(
    request: OptimizedFoodRecommendationRequest
  ): Promise<OptimizedFoodRecommendation[]> {
    return apiClient.post<OptimizedFoodRecommendation[]>(
      "/api/v1/nutrient/recommend-optimized-food",
      request
    );
  }

  /**
   * Get random fun facts for food categories
   * @param count - Number of random fun facts to return (1-50)
   * @param categories - Optional list of food categories to get fun facts for
   * @returns List of food category fun facts
   */
  async getFoodCategoryFunFacts(
    count: number = 5,
    categories?: string[]
  ): Promise<FoodCategoryFunFactsResponse> {
    const params: Record<string, any> = { count };

    if (categories && categories.length > 0) {
      params.categories = categories;
    }

    return apiClient.get<FoodCategoryFunFactsResponse>(
      "/api/v1/food-category/fun-facts",
      params
    );
  }

  /**
   * Get a fun fact for a specific food category
   * @param category - The food category name
   * @returns Fun fact for the specified food category
   */
  async getFoodCategoryFunFact(
    category: string
  ): Promise<FoodCategoryFunFactResponse> {
    return apiClient.get<FoodCategoryFunFactResponse>(
      `/api/v1/food-category/fun-facts/${category}`
    );
  }

  /**
   * Get all activities
   * @returns List of all activities
   */
  async getAllActivities(): Promise<ActivityResponse> {
    return apiClient.get<ActivityResponse>("/api/v1/activity/activities");
  }

  /**
   * Calculate the PAL for a child
   * @param age - The age of the child
   * @param activities - The activities the child is doing with their durations
   * @returns The PAL for the child
   */
  async calculatePAL(
    age: number,
    activities: ActivityEntry[]
  ): Promise<ActivityResult> {
    return apiClient.post<ActivityResult>("/api/v1/activity/calculate-pal", {
      age,
      activities,
    });
  }

  /**
   * Get the target energy for a child
   * @param age - The age of the child
   * @param gender - The gender of the child
   * @param pal - The PAL of the child
   * @returns The target energy for the child
   */
  async getTargetEnergy(
    age: number,
    gender: string,
    physical_activity_level: number
  ): Promise<ChildEnergyRequirementsResponse> {
    return apiClient.post<ChildEnergyRequirementsResponse>(
      "/api/v1/child-energy-requirements/find-nearest-pal",
      { age, gender, physical_activity_level }
    );
  }

  /**
   * Get seasonal food with optional filtering
   * @param params - Filter parameters
   * @returns List of seasonal foods
   */
  async getSeasonalFood(params: {
    region?: string;
    season?: Season;
    month?: string;
    category?: string;
    food_name?: string;
    skip?: number;
    limit?: number;
  } = {}): Promise<SeasonalFoodListResponse> {
    return apiClient.get<SeasonalFoodListResponse>("/api/v1/seasonal-food/", params);
  }

  /**
   * Get all available regions for seasonal food
   * @returns List of regions
   */
  async getSeasonalFoodRegions(): Promise<string[]> {
    return apiClient.get<string[]>("/api/v1/seasonal-food/regions");
  }

  /**
   * Get autocomplete suggestions for seasonal food names
   * @param query - Search term
   * @param limit - Maximum number of results
   * @returns List of food name suggestions
   */
  async autocompleteSeasonalFood(
    query: string,
    limit: number = 10
  ): Promise<string[]> {    
    return apiClient.get<string[]>("/api/v1/seasonal-food/autocomplete", { query, limit });
  }

  /**
   * Get a seasonal food by ID
   * @param id - The seasonal food ID
   * @returns Details of the seasonal food
   */
  async getSeasonalFoodById(id: number): Promise<SeasonalFoodResponse> {
    return apiClient.get<SeasonalFoodResponse>(`/api/v1/seasonal-food/${id}`);
  }

  /**
   * Get farmers markets with optional filtering and pagination
   * @param params - Optional parameters for filtering and pagination
   * @returns List of farmers markets and total count
   */
  async getFarmersMarkets(params: {
    skip?: number;
    limit?: number;
    region?: string;
  } = {}): Promise<FarmersMarketListResponse> {
    return apiClient.get<FarmersMarketListResponse>("/api/v1/farmers-markets", params);
  }

  /**
   * Get detailed information about a specific farmers market
   * @param marketId - UUID of the farmers market to retrieve
   * @returns Detailed farmers market information
   */
  async getFarmersMarketById(marketId: string): Promise<FarmersMarketResponse> {
    return apiClient.get<FarmersMarketResponse>(`/api/v1/farmers-markets/${marketId}`);
  }

  /**
   * Get detailed information about a seasonal food item including nutrient data
   * @param foodName - Name of the food item to look up
   * @param region - Geographic region for seasonal availability data
   * @returns Detailed food information including seasonal availability and nutrients
   */
  async getSeasonalFoodDetails(foodName: string, region: string): Promise<SeasonalFoodDetailResponse> {
    return apiClient.get<SeasonalFoodDetailResponse>(`/api/v1/seasonal-food/details/${foodName}`, { region });
  }
}

// Export a singleton instance
export const nutripeekApi = new NutriPeekApi();
