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
   * Detect food items in an image
   * @param imageFile - Image file to analyze
   * @returns Detected food items with bounding boxes
   */
  async detectFoodItems(imageFile: File): Promise<FoodDetectionResponse> {
    const formData = new FormData();
    formData.append("image", imageFile);

    return apiClient.uploadFile<FoodDetectionResponse>(
      "/api/v1/food-detection/detect",
      formData
    );
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
    try {
      // Try direct fetch for debugging in development
      if (process.env.NODE_ENV === "development") {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const url = `${apiUrl}/api/v1/session/status/${sessionId}`;

        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Get session status failed: ${errorText}`);
          throw new Error(
            `Failed to get session status: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        return data as SessionStatusResponse;
      }

      // Use API client for production
      const response = await apiClient.get<SessionStatusResponse>(
        `/api/v1/session/status/${sessionId}`
      );
      return response;
    } catch (error) {
      console.error("Error getting session status:", error);
      throw error;
    }
  }

  /**
   * Join a session
   * @param sessionId - Unique identifier for the session
   * @returns Join response with session status
   */
  async joinSession(sessionId: string): Promise<JoinSessionResponse> {
    const formData = new FormData();
    try {
      const response = await apiClient.post<JoinSessionResponse>(
        `/api/v1/session/join?session_id=${sessionId}`,
        formData
      );
      return response;
    } catch (error) {
      console.error("Error joining session:", error);
      throw error;
    }
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
    if (typeof window === "undefined") {
      return null;
    }

    try {
      // Get the appropriate WebSocket URL
      let wsUrl = "";

      // In development, we'll use our Next.js API route to get the WebSocket URL
      // In production, we would configure a direct connection to the WebSocket server
      if (process.env.NODE_ENV === "development") {
        // For development, use our API route to get the WebSocket URL
        // This allows us to handle different backend configurations
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        wsUrl = `${appUrl}/api/v1/ws/${sessionId}`;
      } else {
        // For production, construct the WebSocket URL directly
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || window.location.origin;
        const wsProtocol =
          window.location.protocol === "https:" ? "wss:" : "ws:";

        // Convert http(s):// to ws(s)://
        const baseUrl = apiUrl.replace(/^http(s?):\/\//, "");
        wsUrl = `${wsProtocol}//${baseUrl}/api/v1/ws/${sessionId}`;
      }

      // In development, we need to fetch the actual WebSocket URL from our API route
      if (process.env.NODE_ENV === "development") {
        // First make a GET request to our API route to get the actual WebSocket URL
        fetch(wsUrl)
          .then((response) => response.json())
          .then((data) => {
            // Now connect to the actual WebSocket URL
            if (data.wsUrl) {
              // Try to create a WebSocket connection
              try {
                this.createWebSocketConnection(
                  data.wsUrl,
                  onOpen,
                  onMessage,
                  onClose,
                  onError
                );
              } catch (wsError) {
                console.warn(
                  "WebSocket connection failed, falling back to join API for activation",
                  wsError
                );
                // Fall back to activating via the join API
                this.activateViaJoinAPI(sessionId, onOpen, onError);
              }
            } else {
              console.error("No WebSocket URL provided by API");
              // Try to activate via the join API as a fallback
              this.activateViaJoinAPI(sessionId, onOpen, onError);
            }
          })
          .catch((error) => {
            console.error("Error fetching WebSocket URL:", error);
            // Try to activate via the join API as a fallback
            this.activateViaJoinAPI(sessionId, onOpen, onError);
          });

        // Return null for now, the actual connection will be created in the Promise
        return null;
      } else {
        // For production, try to create the WebSocket connection directly
        try {
          return this.createWebSocketConnection(
            wsUrl,
            onOpen,
            onMessage,
            onClose,
            onError
          );
        } catch (wsError) {
          console.warn(
            "WebSocket connection failed, falling back to join API for activation",
            wsError
          );
          // Fall back to activating via the join API
          this.activateViaJoinAPI(sessionId, onOpen, onError);
          return null;
        }
      }
    } catch (error) {
      console.error("Error establishing WebSocket connection:", error);
      if (onError) onError(error as Event);
      return null;
    }
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
   * Create a WebSocket connection with the provided URL
   * @private
   */
  private createWebSocketConnection(
    wsUrl: string,
    onOpen?: () => void,
    onMessage?: (data: any) => void,
    onClose?: () => void,
    onError?: (error: Event) => void
  ): WebSocket {
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);

    // Setup event handlers
    ws.onopen = () => {
      if (onOpen) onOpen();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
        if (onMessage) onMessage(event.data);
      }
    };

    ws.onclose = () => {
      if (onClose) onClose();
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error:`, error);
      if (onError) onError(error);
    };

    return ws;
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
    // Create new FormData object
    const formData = new FormData();

    try {
      // Append the file with specific name to make it more explicit
      formData.append("file", file, file.name);

      if (mealType) {
        formData.append("meal_type", mealType);
      }

      // Try direct fetch for more control (fallback)
      if (process.env.NODE_ENV === "development") {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const url = `${apiUrl}/api/v1/session/upload/${sessionId}`;

        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Upload failed with status ${response.status}: ${errorText}`
          );
          throw new Error(
            `Upload failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        return data as FileUploadResponse;
      }

      // Use the API client for production
      const response = await apiClient.uploadFile<FileUploadResponse>(
        `/api/v1/session/upload/${sessionId}`,
        formData
      );
      return response;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
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
    // Use the Direct API URL - Note: API must be properly configured for CORS
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Fixed URL path to match backend router configuration
    // The router has prefix="/session", so we need to use just "/api/v1/session/file/..." not "/api/v1/session/session/file/..."
    const url = `${apiUrl}/api/v1/session/file/${sessionId}/${fileId}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `File download failed: ${response.status} ${response.statusText} - ${errorText}`
        );
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
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
}

// Export a singleton instance
export const nutripeekApi = new NutriPeekApi();
