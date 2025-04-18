/**
 * API Types for NutriPeek
 * Generated from OpenAPI specification
 */

// Common types
export type Gender = 'boy' | 'girl';

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

// QR Code
export interface GenerateUploadQRResponse {
  upload_url: string;
  qrcode_base64: string;
  expires_in_seconds?: number;
}

export interface UploadImageResponse {
  message: string;
  shortcode?: string | null;
}

export interface FileStatusResponse {
  shortcode: string;
  status: string;
  error?: string | null;
}

// Food Search
export interface FoodAutocompleteResponse {
  id: string;
  food_name: string;
}

export interface FoodNutrientResponse extends FoodNutrientSummary {}

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
}

export interface NutrientGapRequest {
  child_profile: ChildProfile;
  ingredient_ids: string[]; // At least 1 item
}

export interface NutrientGapResponse {
  nutrient_gaps: Record<string, NutrientInfo>;
  missing_nutrients?: string[];
  excess_nutrients?: string[];
  total_calories?: number;
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