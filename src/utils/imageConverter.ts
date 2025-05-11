/**
 * Utilities for handling image file conversions, particularly HEIC/HEIF files from iOS devices
 */
import { nutripeekApi } from "../api/nutripeekApi";

/**
 * Checks if a file needs conversion (e.g., HEIC/HEIF files)
 * @param file The file to check
 * @returns True if conversion is needed
 */
export const isConversionNeeded = (file: File): boolean => {
  return nutripeekApi.isImageConversionNeeded(file);
};

/**
 * Converts an image file to a standard format using the backend service
 * @param file The file to convert
 * @param format Optional format to convert to (default: JPEG)
 * @returns A promise with the converted file and new URL
 */
export const convertImageFile = async (
  file: File,
  format: string = "JPEG"
): Promise<{ file: File; url: string }> => {
  try {
    const result = await nutripeekApi.convertImage(file, format);
    return { file: result.file, url: result.url };
  } catch (error) {
    console.error("Image conversion failed:", error);
    // Return the original file if conversion fails
    const url = URL.createObjectURL(file);
    return { file, url };
  }
};

/**
 * Processes an image file, converting it if necessary and returning the file and URL
 * @param file The file to process
 * @returns A promise with the processed file and URL
 */
export const processImageFile = async (
  file: File
): Promise<{ file: File; url: string }> => {
  if (isConversionNeeded(file)) {
    // Convert the file if needed
    return convertImageFile(file);
  } else {
    // Just create a URL for the file
    const url = URL.createObjectURL(file);
    return { file, url };
  }
};
