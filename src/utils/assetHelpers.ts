/**
 * Asset Helper Functions
 * Provides utility functions for handling asset URLs
 */

// Cache CDN URL to avoid repeated environment variable lookups
let cachedCDNUrl: string | null = null;
let cdnUrlChecked = false;

/**
 * Validates and returns the CDN URL
 * @returns CDN URL or empty string if not configured
 */
function getCDNUrl(): string {
  // Return cached value if already checked
  if (cdnUrlChecked && cachedCDNUrl !== null) {
    return cachedCDNUrl;
  }

  // Check both build-time and runtime environment variables
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 
                 (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_CDN_URL);
  
  if (!cdnUrl || cdnUrl === 'undefined' || cdnUrl === '') {
    console.error('NEXT_PUBLIC_CDN_URL is not properly configured. Images may not load correctly.');
    console.error('Please ensure NEXT_PUBLIC_CDN_URL is set in your .env.local file');
    cachedCDNUrl = '';
    cdnUrlChecked = true;
    return '';
  }
  
  // Cache the valid URL
  cachedCDNUrl = cdnUrl;
  cdnUrlChecked = true;
  
  return cdnUrl;
}

/**
 * Gets the CDN URL for a food image
 * @param foodName - Name of the food item
 * @returns Full URL to the food image
 */
export function getFoodImageUrl(foodName: string): string {
  const cdnUrl = getCDNUrl();
  
  // Replace forward slashes with colons before encoding
  const sanitizedName = foodName.replace(/\//g, ':');
  // Encode food name to handle spaces and special characters
  const encodedName = encodeURIComponent(`asset_${sanitizedName}`);
  return `${cdnUrl}/foods/${encodedName}.png`;
}

/**
 * Gets the CDN URL for a plate or lunchbox image
 * @param imageName - Name of the plate/lunchbox image
 * @returns Full URL to the plate/lunchbox image
 */
export function getPlateImageUrl(imageName: string): string {
  const cdnUrl = getCDNUrl();
  return `${cdnUrl}/plates/${imageName}.png`;
}

/**
 * Gets the CDN URL for an avatar image
 * @param emotionType - Type of avatar emotion (happy, neutral, sad)
 * @returns Full URL to the avatar image
 */
export function getAvatarImageUrl(emotionType: string): string {
  const cdnUrl = getCDNUrl();
  return `${cdnUrl}/avatars/${emotionType}_avatar.png`;
}

/**
 * Gets the CDN URL for a child avatar image
 * @param gender - Gender of the child ('boy' or 'girl')
 * @param avatarNumber - Avatar number (1-5)
 * @returns Full URL to the child avatar image
 */
export function getChildAvatarUrl(gender: string, avatarNumber: number): string {
  const cdnUrl = getCDNUrl();
  
  // Normalize gender to ensure it's either 'boy' or 'girl'
  const normalizedGender = gender.toLowerCase() === 'female' ? 'girl' : 'boy';
  
  // Ensure avatar number is between 1-5
  const avatarNum = Math.max(1, Math.min(5, avatarNumber));
  
  return `${cdnUrl}/avatars/${normalizedGender}_avatar_${avatarNum}.png`;
}

/**
 * Gets the CDN URL for an Australian state image
 * @returns Full URL to the Australian state image
 */
export function getAuStateImageUrl(): string {
  const cdnUrl = getCDNUrl();
  return `${cdnUrl}/au-states/au.png`;
}

/**
 * Gets the CDN URL for a landing page asset
 * @param assetName - Name of the landing page asset
 * @returns Full URL to the landing page asset
 */
export function getLandingPageAssetUrl(assetName: string): string {
  const cdnUrl = getCDNUrl();
  return `${cdnUrl}/landing-page/${assetName}`;
}

/**
 * Gets the CDN URL for character avatars (father, mother, child, dog)
 * @param characterName - Name of the character (father, mother, child, dog)
 * @returns Full URL to the character avatar image
 */
export function getCharacterAvatarUrl(characterName: string): string {
  const cdnUrl = getCDNUrl();
  return `${cdnUrl}/avatars/${characterName}.png`;
}

/**
 * Gets the CDN URL for the product video
 * @returns Full URL to the product video
 */
export function getProductVideoUrl(): string {
  const cdnUrl = getCDNUrl();
  return `${cdnUrl}/product_video/NutriPeek.mp4`;
}