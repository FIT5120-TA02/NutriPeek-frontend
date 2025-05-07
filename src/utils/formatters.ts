/**
 * Utility functions for formatting values
 */

/**
 * Format a number with appropriate precision
 * @param value The number to format
 * @param precision Number of decimal places (default: 1)
 * @returns Formatted number as string
 */
export function formatNumber(value: number, precision: number = 1): string {
  // For values less than 1, show more precision
  if (Math.abs(value) < 1 && value !== 0) {
    return value.toFixed(2);
  }
  
  // For values between 1 and 10, show one decimal place
  if (Math.abs(value) < 10) {
    return value.toFixed(1);
  }
  
  // For values 10 or greater, round to whole number
  return Math.round(value).toString();
}

/**
 * Format a percentage value
 * @param value The percentage to format
 * @param includePlusSign Whether to include a plus sign for positive values
 * @returns Formatted percentage as string with % symbol
 */
export function formatPercentage(value: number, includePlusSign: boolean = false): string {
  const formattedValue = formatNumber(value);
  if (includePlusSign && value > 0) {
    return `+${formattedValue}%`;
  }
  return `${formattedValue}%`;
} 