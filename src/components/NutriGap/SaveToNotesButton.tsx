import { ChildProfile } from '@/types/profile';
import { NutrientGapResponse } from '@/api/types';
import { NutriRecommendService } from '@/components/NutriRecommend/NutriRecommendService';

interface SaveToNotesButtonProps {
  results: NutrientGapResponse | null;
  childProfile: ChildProfile | null;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

/**
 * Button component that saves the current nutrition analysis to notes
 */
export default function SaveToNotesButton({
  results,
  childProfile,
  onSuccess,
  onError,
  className = '',
}: SaveToNotesButtonProps) {
  /**
   * Save the current analysis to notes without recommendations
   */
  const handleSaveToNotes = async () => {
    if (!results || !childProfile) {
      onError?.('Missing analysis data or child profile');
      return;
    }
    
    try {      
      // Save to notes using the NutriRecommendService
      NutriRecommendService.saveNutritionalNote(
        results,
        childProfile,
        [], // No selected foods since we're saving just the analysis
      );
      
      onSuccess?.();
    } catch (error) {
      console.error("Error saving analysis to notes:", error);
      onError?.(error);
    }
  };

  return (
    <button
      onClick={handleSaveToNotes}
      className={`px-8 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition text-lg font-semibold flex items-center justify-center gap-2 ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Save Analysis to Notes
    </button>
  );
} 