/**
 * API Types for NutriPeek
 * Generated from OpenAPI specification
 */

// Common types
export type Gender = 'boy' | 'girl';

// Seasonal Food
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

// Farmers Market types
export type DayOfWeekEnum = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface FarmersMarketResponse {
  id: string; // UUID
  name: string;
  address: string;
  opening_hours_text: string;
  region: string;
  city?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  primary_day?: DayOfWeekEnum | null;
  is_recurring?: boolean | null;
  frequency?: string | null;
  opening_time?: string | null; // Time format
  closing_time?: string | null; // Time format
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
}

export interface FarmersMarketListResponse {
  items: FarmersMarketResponse[];
  total: number;
}

export interface SeasonalFoodResponse {
  id: string;
  name: string;
  region: string;
  category: string;
  db_category: string;
  description: string;
  nutritionalValue: string;
  availableMonths: number[];
  imageUrl: string;
}

export interface SeasonalFoodListResponse {
  items: SeasonalFoodResponse[];
  total: number;
}

// Health Check
export interface HealthCheckResponse {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime?: number;
  dependencies: Record<string, any>;
  system_info?: Record<string, string> | null;
}

// Food Detection
export interface FoodItemDetection {
  class_name: string;
  confidence: number; // Between 0 and 1
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface FoodDetectionResponse {
  detected_items?: FoodItemDetection[];
  processing_time_ms: number;
  image_width: number;
  image_height: number;
}

export interface FoodDetectionError {
  detail: string;
}

// Food Mapping
export interface FoodMappingRequest {
  detected_items: string[];
  children_profile_id?: string | null;
  store_in_inventory?: boolean;
}

export interface FoodNutrientSummary {
  id: string;
  food_name: string;
  food_category?: string | null;
  energy_with_fibre_kj?: number | null;
  protein_g?: number | null;
  total_fat_g?: number | null;
  carbs_with_sugar_alcohols_g?: number | null;
  dietary_fibre_g?: number | null;
}

export interface FoodItemQuantity {
  nutrient_data: FoodNutrientSummary;
  quantity: number; // Quantity of the food item detected
}

export interface FoodMappingResponse {
  mapped_items: Record<string, FoodItemQuantity>;
  unmapped_items?: string[];
}

// WebSocket Session
export type SessionStatus = 'created' | 'active' | 'expired' | 'closed';
export type FileTransferStatus = 'pending' | 'transferring' | 'completed' | 'failed';
export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface CreateSessionResponse {
  session_id: string;
  qrcode_base64: string;
  expires_in_seconds: number;
  join_url: string;
}

export interface SessionStatusResponse {
  session_id: string;
  status: SessionStatus;
  connected_clients: number;
  created_at: string;
  expires_at: string;
  error?: string | null;
}

export interface JoinSessionResponse {
  session_id: string;
  status: SessionStatus;
  message: string;
}

export interface FileInfo {
  file_id: string;
  filename: string;
  size: number;
  content_type: string;
  status: FileTransferStatus;
  uploaded_at: string;
  meal_type?: MealType | null;
}

export interface FileUploadResponse {
  file_id: string;
  session_id: string;
  status: FileTransferStatus;
  message: string;
  meal_type?: MealType | null;
}

export interface FilesListResponse {
  session_id: string;
  files: FileInfo[];
}

// Food Search
export interface FoodAutocompleteResponse {
  id: string;
  food_name: string;
}

export interface FoodNutrientResponse extends FoodNutrientSummary {}

/**
 * Food category with average nutrient values
 * Contains the category name and average nutritional values of all foods in that category
 */
export interface FoodCategoryAvgNutrients {
  food_category: string;
  count: number;
  energy_with_fibre_kj?: number | null;
  protein_g?: number | null;
  total_fat_g?: number | null;
  carbs_with_sugar_alcohols_g?: number | null;
  dietary_fibre_g?: number | null;
  sodium_mg?: number | null;
}

/**
 * Response for food categories with average nutrient values
 */
export interface FoodCategoriesResponse {
  categories: FoodCategoryAvgNutrients[];
}

/**
 * Food category fun fact response
 */
export interface FoodCategoryFunFactResponse {
  category: string;
  fun_fact: string;
  id: string;
}

/**
 * Multiple food category fun facts response
 */
export interface FoodCategoryFunFactsResponse {
  fun_facts: FoodCategoryFunFactResponse[];
}

// Nutrient Gap
export interface ChildProfile {
  age: number; // 0-18
  gender: Gender;
}

export interface NutrientInfo {
  name: string;
  recommended_intake: number;
  current_intake: number;
  unit: string;
  gap: number;
  gap_percentage: number;
  category?: string | null;
  isAdjustedForActivity?: boolean;
}

export interface NutrientGapRequest {
  child_profile: ChildProfile;
  ingredient_ids: string[]; // At least 1 item
}

export interface NutrientGapResponse {
  nutrient_gaps: Record<string, NutrientInfo>;
  missing_nutrients?: NutrientGapDetails[];
  excess_nutrients?: string[];
  total_calories?: number;
}

// Nutrient Intake
export interface NutrientIntakeInfo {
  name: string;
  recommended_intake: number;
  unit: string;
  category?: string | null;
}

export interface NutrientIntakeResponse {
  nutrient_intakes: Record<string, NutrientIntakeInfo>;
}

/**
 * Food recommendation based on specific nutrient content
 */
export interface FoodRecommendation {
  id: string;
  food_name: string;
  food_category: string;
  nutrient_value: number;
  nutrients?: Record<string, number>;
}

/**
 * Enhanced food recommendations grouped by nutrient
 */
export interface NutrientRecommendation {
  nutrient: string;
  foodCategories: string[];
}

/**
 * Extended nutrient information with gap details
 */
export interface NutrientGapDetails {
  name: string;
  unit: string;
  gap: number;
  recommended_intake: number;
  current_intake: number;
}

// Activity
export interface ActivityResponse {
  activities: string[];
}

export interface ActivityEntry {
  name: string;
  hours: number;
}

export interface MetyActivity {
  category: string;
  specificActivity: string;
}

export interface ActivityDetail {
  activity: string;
  hours: number;
  mety_level: number;
  mety_minutes: number;
}

export interface ActivityResult {
  pal: number;
  total_mety_minutes: number;
  details: ActivityDetail[];
}

// Child Energy Requirements
export interface ChildEnergyRequirementsResponse {
  input_physical_activity_level: number;
  matched_physical_activity_level: number;
  age: number;
  gender: Gender;
  unit: string;
  estimated_energy_requirement: number;
}


// API Error Responses
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface processedFiles {
  file: FileInfo; 
  detectionResult: FoodDetectionResponse;
}

export interface SeasonalAvailability {
  season: Season;
  month: string;
  category: string;
}

export interface SeasonalFoodDetailResponse {
  food_name: string;
  region: string;
  seasonal_availability: SeasonalAvailability[];
  nutrient_data?: FoodNutrientSummary | null;
}

/**
 * Request for optimized food recommendations based on nutrient gaps
 */
export interface OptimizedFoodRecommendationRequest {
  nutrient_name: string;
  target_amount: number;
  current_amount?: number;
  limit?: number;
}

/**
 * Optimized food recommendation with gap satisfaction information
 */
export interface OptimizedFoodRecommendation {
  id: string;
  food_name: string;
  food_category: string;
  nutrient_value: number;
  nutrients?: Record<string, number>;
  amount_needed: number;
  gap_satisfaction_percentage: number;
}

/**
 * Recommendation type for categorizing different recommendation approaches
 */
export enum RecommendationType {
  STANDARD = 'standard',
  OPTIMIZED = 'optimized'
}