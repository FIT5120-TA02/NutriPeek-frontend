/**
 * NutriPeek API Layer
 * Entry point for all API-related functionality
 */

// Export API types
export * from "./types";

// Export API client
export { apiClient, ApiError } from "./apiClient";

// Export NutriPeek API service
export { nutripeekApi, NutriPeekApi } from "./nutripeekApi";

// Export React hooks
export * from "./hooks";

// Export all hooks and API utilities with consistent naming
export {
  useDetectFoodItems,
  useMapFoodToNutrients,
  useWebSocketSession,
  useSearchFoods,
  useFoodNutrients,
  useCalculateNutrientGap,
  useGetNutrientIntake,
} from "./hooks";
