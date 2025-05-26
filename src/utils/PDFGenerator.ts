/**
 * PDF Generator Utility
 * 
 * Comprehensive utility for generating nutrition note PDFs.
 * Handles data processing, PDF generation, and file download functionality.
 * 
 * @author NutriPeek Team
 * @version 1.0.0
 */

import { pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { NutritionalNote } from '@/types/notes';
import { PDFNoteData, PDFGenerationOptions, PDFGenerationResult } from '@/types/pdf';
import { NotesPDFTemplate } from '@/components/PDF/NotesPDFTemplate';
import { calculateNutritionScore, getNutritionScoreColor } from '@/utils/NutritionScoreUtils';
import React from 'react';

/**
 * PDF Generator Service
 * Provides methods for generating and downloading nutrition note PDFs
 */
export class PDFGenerator {
  /**
   * Generate a PDF from a nutrition note
   * 
   * @param note - The nutritional note to convert to PDF
   * @param options - PDF generation options
   * @returns Promise resolving to PDF generation result
   */
  static async generateNotePDF(
    note: NutritionalNote,
    options: PDFGenerationOptions = {}
  ): Promise<PDFGenerationResult> {
    try {
      // Process the note data for PDF rendering
      const pdfData = this.processNoteData(note);
      
      // Generate filename
      const filename = this.generateFilename(note);
      
      // Create PDF blob - pass the component directly to pdf()
      const blob = await pdf(
        React.createElement(NotesPDFTemplate, { data: pdfData, options }) as any
      ).toBlob();
      
      return {
        success: true,
        blob,
        filename,
      };
    } catch (error) {
      console.error('PDF generation failed:', error);
      return {
        success: false,
        filename: this.generateFilename(note),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
  
  /**
   * Generate and download a PDF from a nutrition note
   * 
   * @param note - The nutritional note to convert to PDF
   * @param options - PDF generation options
   * @returns Promise resolving to success status
   */
  static async downloadNotePDF(
    note: NutritionalNote,
    options: PDFGenerationOptions = {}
  ): Promise<boolean> {
    try {
      const result = await this.generateNotePDF(note, options);
      
      if (!result.success || !result.blob) {
        throw new Error(result.error || 'Failed to generate PDF');
      }
      
      // Create download link and trigger download
      this.triggerDownload(result.blob, result.filename);
      
      return true;
    } catch (error) {
      console.error('PDF download failed:', error);
      return false;
    }
  }
  
  /**
   * Process nutrition note data into PDF-optimized format
   * 
   * @param note - The nutritional note to process
   * @returns Processed data optimized for PDF rendering
   */
  static processNoteData(note: NutritionalNote): PDFNoteData {
    const date = new Date(note.createdAt);
    const formattedDate = format(date, 'MMM d, yyyy • h:mm a');
    
    // Calculate nutrition score
    const score = calculateNutritionScore(
      note.nutrient_gaps.nutrient_gaps,
      note.nutrient_gaps.missing_nutrients?.length || 0,
      note.nutrient_gaps.excess_nutrients?.length || 0
    );
    
    // Process nutrients data
    const nutrients = Object.entries(note.nutrient_gaps.nutrient_gaps || {}).map(([name, nutrient]) => {
      const percentage = (nutrient.current_intake / nutrient.recommended_intake) * 100;
      let status: 'adequate' | 'deficient' | 'excess' = 'adequate';
      
      if (percentage < 80) {
        status = 'deficient';
      } else if (percentage > 120) {
        status = 'excess';
      }
      
      // Find corresponding comparison data if available
      const comparison = note.nutrientComparisons?.find(comp => comp.name === name);
      
      return {
        name: nutrient.name || name,
        unit: nutrient.unit,
        currentIntake: nutrient.current_intake,
        recommendedIntake: nutrient.recommended_intake,
        percentage,
        status,
        beforeValue: comparison?.beforeValue,
        afterValue: comparison?.afterValue,
        improvement: comparison ? comparison.afterValue - comparison.beforeValue : undefined,
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    
    // Process food items
    const originalFoods = (note.originalFoods || []).map(food => ({
      id: food.id,
      name: food.name,
      category: food.category,
      imageUrl: food.imageUrl,
    }));
    
    const additionalFoods = (note.additionalFoods || []).map(food => ({
      id: food.id,
      name: food.name,
      category: food.category,
      imageUrl: food.imageUrl,
    }));
    
    // Process activity data
    const activity = note.activityPAL || note.energyRequirements ? {
      pal: note.activityPAL,
      energyRequirement: note.energyRequirements?.estimated_energy_requirement,
      selectedActivities: note.selectedActivities?.map(activity => ({
        name: activity.name || 'Unknown Activity',
        duration: activity.hours ? activity.hours * 60 : undefined, // Convert hours to minutes
        intensity: 'moderate', // Default intensity since it's not in ActivityEntry
      })),
    } : undefined;
    
    // Process gaps - handle both string[] and NutrientGapDetails[]
    const gaps = {
      missing: note.nutrient_gaps.missing_nutrients?.map(nutrient => 
        typeof nutrient === 'string' ? nutrient : nutrient.name
      ) || [],
      excess: note.nutrient_gaps.excess_nutrients || [],
    };
    
    return {
      id: note.id,
      createdAt: note.createdAt,
      formattedDate,
      child: {
        name: note.childName,
        gender: note.childGender,
        age: note.childAge,
      },
      nutrition: {
        score,
        scoreColor: getNutritionScoreColor(score),
        totalCalories: note.nutrient_gaps.total_calories || 0,
        missingCount: note.nutrient_gaps.missing_nutrients?.length || 0,
        excessCount: note.nutrient_gaps.excess_nutrients?.length || 0,
      },
      foods: {
        original: originalFoods,
        additional: additionalFoods,
      },
      activity,
      nutrients,
      gaps,
    };
  }
  
  /**
   * Generate a filename for the PDF
   * 
   * @param note - The nutritional note
   * @returns Generated filename
   */
  private static generateFilename(note: NutritionalNote): string {
    const date = new Date(note.createdAt);
    const dateStr = format(date, 'yyyy-MM-dd');
    const childName = note.childName.replace(/[^a-zA-Z0-9]/g, '_');
    
    return `NutriPeek_${childName}_${dateStr}.pdf`;
  }
  
  /**
   * Trigger file download in the browser
   * 
   * @param blob - The PDF blob to download
   * @param filename - The filename for the download
   */
  private static triggerDownload(blob: Blob, filename: string): void {
    // Create object URL
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    URL.revokeObjectURL(url);
  }
  
  /**
   * Get default PDF generation options
   * 
   * @returns Default options for PDF generation
   */
  static getDefaultOptions(): PDFGenerationOptions {
    return {
      includeNutrientDetails: true,
      includeFoodItems: true,
      includeActivityInfo: true,
      includeRecommendations: true,
      includeBranding: true,
    };
  }
  
  /**
   * Validate if a note can be converted to PDF
   * 
   * @param note - The nutritional note to validate
   * @returns True if the note can be converted to PDF
   */
  static canGeneratePDF(note: NutritionalNote): boolean {
    return !!(
      note &&
      note.id &&
      note.childName &&
      note.nutrient_gaps &&
      note.createdAt
    );
  }
  
  /**
   * Get estimated PDF size information
   * 
   * @param note - The nutritional note
   * @returns Estimated size information
   */
  static getEstimatedSize(note: NutritionalNote): {
    pages: number;
    sections: string[];
  } {
    const sections: string[] = ['Header', 'Child Info', 'Nutrition Score'];
    let estimatedPages = 1;
    
    // Add sections based on available data
    if ((note.originalFoods && note.originalFoods.length > 0) || 
        (note.additionalFoods && note.additionalFoods.length > 0)) {
      sections.push('Food Items');
    }
    
    if (note.activityPAL || note.energyRequirements) {
      sections.push('Activity & Energy');
    }
    
    if (note.nutrient_gaps.nutrient_gaps && 
        Object.keys(note.nutrient_gaps.nutrient_gaps).length > 0) {
      sections.push('Nutrient Analysis');
      // Estimate additional pages for large nutrient tables
      const nutrientCount = Object.keys(note.nutrient_gaps.nutrient_gaps).length;
      if (nutrientCount > 15) {
        estimatedPages += Math.ceil((nutrientCount - 15) / 20);
      }
    }
    
    if ((note.nutrient_gaps.missing_nutrients && note.nutrient_gaps.missing_nutrients.length > 0) ||
        (note.nutrient_gaps.excess_nutrients && note.nutrient_gaps.excess_nutrients.length > 0)) {
      sections.push('Recommendations');
    }
    
    return {
      pages: estimatedPages,
      sections,
    };
  }
}

/**
 * Default export for convenience
 */
export default PDFGenerator; 