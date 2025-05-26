/**
 * PDF Generation Types
 * 
 * Type definitions for PDF generation functionality.
 * These interfaces ensure type safety and clear data structure for PDF templates.
 * 
 * @author NutriPeek Team
 * @version 1.0.0
 */

import { NutritionalNote } from '@/types/notes';

/**
 * Configuration options for PDF generation
 */
export interface PDFGenerationOptions {
  /** Include detailed nutrient breakdown */
  includeNutrientDetails?: boolean;
  /** Include food items section */
  includeFoodItems?: boolean;
  /** Include activity and energy information */
  includeActivityInfo?: boolean;
  /** Include recommendations section */
  includeRecommendations?: boolean;
  /** Custom title for the PDF */
  customTitle?: string;
  /** Include app branding */
  includeBranding?: boolean;
}

/**
 * Processed data structure optimized for PDF rendering
 */
export interface PDFNoteData {
  /** Basic note information */
  id: string;
  createdAt: string;
  formattedDate: string;
  
  /** Child information */
  child: {
    name: string;
    gender: string;
    age?: string | number;
  };
  
  /** Nutritional summary */
  nutrition: {
    score: number;
    scoreColor: string;
    totalCalories: number;
    missingCount: number;
    excessCount: number;
  };
  
  /** Food items */
  foods: {
    original: Array<{
      id: string;
      name: string;
      category: string;
      imageUrl?: string;
    }>;
    additional: Array<{
      id: string;
      name: string;
      category: string;
      imageUrl?: string;
    }>;
  };
  
  /** Activity and energy information */
  activity?: {
    pal?: number;
    energyRequirement?: number;
    selectedActivities?: Array<{
      name: string;
      duration?: number;
      intensity?: string;
    }>;
  };
  
  /** Detailed nutrient information */
  nutrients: Array<{
    name: string;
    unit: string;
    currentIntake: number;
    recommendedIntake: number;
    percentage: number;
    status: 'adequate' | 'deficient' | 'excess';
    beforeValue?: number;
    afterValue?: number;
    improvement?: number;
  }>;
  
  /** Missing and excess nutrients */
  gaps: {
    missing: string[];
    excess: string[];
  };
}

/**
 * PDF generation result
 */
export interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  filename: string;
  error?: string;
}

/**
 * PDF template props
 */
export interface PDFTemplateProps {
  data: PDFNoteData;
  options: PDFGenerationOptions;
} 