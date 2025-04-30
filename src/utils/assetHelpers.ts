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
  // Replace forward slashes with colons before encoding
  const sanitizedName = foodName.replace(/\//g, ':');
  // Encode food name to handle spaces and special characters
  const encodedName = encodeURIComponent(`asset_${sanitizedName}`);
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

/**
 * Gets the CDN URL for an avatar image
 * @param emotionType - Type of avatar emotion (happy, neutral, sad)
 * @returns Full URL to the avatar image
 */
export function getAvatarImageUrl(emotionType: string): string {
  return `${process.env.NEXT_PUBLIC_CDN_URL}/avatars/${emotionType}_avatar.png`;
} 

