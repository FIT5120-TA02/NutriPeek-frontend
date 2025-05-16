'use client';

import { RecommendationType } from '@/api/types';

interface LoadingSpinnerProps {
  recommendationType?: RecommendationType;
}

/**
 * Loading spinner for the NutriRecommend page
 * Shows additional message when loading seasonal recommendations due to increased complexity
 */
export default function LoadingSpinner({ recommendationType }: LoadingSpinnerProps) {
  const isSeasonalType = recommendationType === RecommendationType.SEASONAL;
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
      <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-green-700 font-medium">Loading recommendations...</p>
      
      {isSeasonalType && (
        <div className="mt-2 max-w-md text-center">
          <p className="text-amber-600 text-sm">
            Seasonal recommendations may take a bit longer to load due to additional processing of regional and seasonal data.
          </p>
        </div>
      )}
    </div>
  );
}