/**
 * Type definitions for NutriScan components
 */

/**
 * Display format for food items detected in images
 */
export interface FoodItemDisplay {
  id?: string;
  name: string;
  confidence?: number;
  quantity?: number;
  nutrients: Record<string, number>;
}

/**
 * Extended food item with editing capabilities
 */
export interface EditableFoodItem extends FoodItemDisplay {
  isCustomAdded?: boolean;
  uniqueId?: string; // Unique identifier for duplicate ingredients
  quantity?: number; // Number of this ingredient (for duplicates)
}

/**
 * QR code data returned from the API
 */
export interface QRCodeData {
  session_id: string;
  qrcode_base64: string;
  expires_in_seconds: number;
  join_url: string;
}

export type MealType = "breakfast" | "lunch" | "dinner";

export interface MealImage {
  file: File | null;
  mealType: MealType;
  imagePreviewUrl: string | null;
  processingStep: "idle" | "detecting" | "mapping" | "complete";
  isProcessing: boolean;
  detectedItems?: FoodItemDisplay[];
  shouldReprocess?: boolean;
}
