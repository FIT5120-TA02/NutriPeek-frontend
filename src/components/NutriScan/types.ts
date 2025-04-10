/**
 * Type definitions for NutriScan components
 */

/**
 * Display format for food items detected in images
 */
export interface FoodItemDisplay {
  id?: string;
  name: string;
  confidence: number;
  quantity?: number; // Number of this item (for grouping)
  nutrients?: {
    [key: string]: number;
  };
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
  upload_url: string;
  qrcode_base64: string;
  expires_in_seconds?: number;
}