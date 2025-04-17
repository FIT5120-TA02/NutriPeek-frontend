/**
 * Theme colors constants for use in TypeScript code
 * Mirrors the CSS variables defined in global.css
 */

export const ThemeColors = {
  // Primary colors palette
  PRIMARY: '#89BE63',           // Strong green - main brand color
  PRIMARY_LIGHT: '#AFCCA9',     // Light green - secondary brand color
  SECONDARY: '#CFEDEE',         // Light blue - accent color
  SECONDARY_LIGHT: '#ECF9F2',   // Lightest blue-green - background color
  
  // Neutral/grayscale colors for text, borders, etc.
  NEUTRAL_50: '#F5F5F5',        // Lightest gray
  NEUTRAL_200: '#DEDEDE',       // Light gray
  NEUTRAL_300: '#C7C7C7',       // Medium gray
  NEUTRAL_400: '#B0B0B0',       // Darker gray
  NEUTRAL_800: '#333333',       // Dark gray for text
  
  // Function colors
  BACKGROUND: 'var(--background)',
  FOREGROUND: 'var(--foreground)',
  TEXT: 'var(--foreground)',
  
  DESTRUCTIVE: 'var(--destructive)',
  DESTRUCTIVE_FOREGROUND: 'var(--destructive-foreground)',
  
  // Helper method to get rgba version with opacity
  getRgba: (color: string, opacity: number): string => {
    // Extract RGB values based on color variable name
    let rgbValues: string;
    
    switch (color) {
      case 'PRIMARY':
        rgbValues = '137, 190, 99';       // #89BE63
        break;
      case 'PRIMARY_LIGHT':
        rgbValues = '175, 204, 169';      // #AFCCA9
        break;
      case 'SECONDARY':
        rgbValues = '207, 237, 238';      // #CFEDEE
        break;
      case 'SECONDARY_LIGHT':
        rgbValues = '236, 249, 242';      // #ECF9F2
        break;
      case 'NEUTRAL_50':
        rgbValues = '245, 245, 245';      // #F5F5F5
        break;
      case 'NEUTRAL_200':
        rgbValues = '222, 222, 222';      // #DEDEDE
        break;
      case 'NEUTRAL_300':
        rgbValues = '199, 199, 199';      // #C7C7C7
        break;
      case 'NEUTRAL_400':
        rgbValues = '176, 176, 176';      // #B0B0B0
        break;
      case 'NEUTRAL_800':
        rgbValues = '51, 51, 51';         // #333333
        break;
      default:
        rgbValues = '0, 0, 0';
    }
    
    return `rgba(${rgbValues}, ${opacity})`;
  }
};

// Type for theme color keys
export type ThemeColorKey = keyof typeof ThemeColors;

export default ThemeColors; 