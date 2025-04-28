/**
 * Asset Helper Functions
 * Provides utility functions for handling asset URLs
 */

/**
 * Gets the CDN URL for a food image
 * @param foodName - Name of the food item
 * @returns Full URL to the food image
 */
export function getFoodImageUrl(foodName: string): string {
  // Encode food name to handle spaces and special characters
  const encodedName = encodeURIComponent(`asset_${foodName}`);
  return `${process.env.NEXT_PUBLIC_CDN_URL}/foods/${encodedName}.png`;
}

/**
 * Gets the CDN URL for a plate or lunchbox image
 * @param imageName - Name of the plate/lunchbox image
 * @returns Full URL to the plate/lunchbox image
 */
export function getPlateImageUrl(imageName: string): string {
  return `${process.env.NEXT_PUBLIC_CDN_URL}/plates/${imageName}.png`;
} 