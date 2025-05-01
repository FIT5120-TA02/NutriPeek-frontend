'use client';

import { ChildProfile } from '@/types/profile';
import { useMemo } from 'react';

interface NutrientData {
  name: string;
  recommended_intake: number;
  current_intake: number;
  unit: string;
  gap: number;
}

interface ProfileSummaryProps {
  profile: ChildProfile | null;
  totalCalories: number;
  missingNutrients: number;
  excessNutrients: number;
  allNutrients?: Record<string, NutrientData>;
  onViewRecommendations?: () => void;
}

export default function ProfileSummary({
  profile,
  totalCalories,
  missingNutrients,
  excessNutrients,
  allNutrients = {},
  onViewRecommendations
}: ProfileSummaryProps) {
  const avatarGradient = profile?.gender?.toLowerCase() === 'female'
    ? 'from-pink-400 to-pink-600'
    : 'from-blue-500 to-blue-700';

  const getOverallScore = () => {
    // If we have nutrient data, calculate the average percentage
    if (Object.keys(allNutrients).length > 0) {
      let totalPercentage = 0;
      let nutrientCount = 0;
      
      Object.values(allNutrients).forEach(nutrient => {
        if (nutrient.recommended_intake > 0) {
          // Calculate percentage (capped at 100%)
          const percentage = Math.min(100, (nutrient.current_intake / nutrient.recommended_intake) * 100);
          totalPercentage += percentage;
          nutrientCount++;
        }
      });
      
      // Return the average percentage, rounded to nearest integer
      return nutrientCount > 0 ? Math.round(totalPercentage / nutrientCount) : 50;
    }
    
    // Fallback to the old method if no nutrient data is available
    const totalNutrientsScore = 100 - (missingNutrients * 3) - (excessNutrients * 2);
    return Math.max(0, Math.min(100, totalNutrientsScore));
  };

  const score = getOverallScore();
  const scoreColor = score < 60 ? 'text-red-500' : score < 80 ? 'text-yellow-500' : 'text-green-500';
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-5 relative">
        <div className="flex justify-between items-center">
          <h3 className="text-white text-lg font-semibold">Nutrition Report</h3>
          <div className={`h-16 w-16 ${scoreColor} bg-white rounded-full flex items-center justify-center font-bold text-2xl shadow-md`}>
            {score}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-6 py-4 flex items-center border-b">
        <div className={`w-16 h-16 bg-gradient-to-r ${avatarGradient} rounded-full flex items-center justify-center text-white text-lg font-bold mr-4 flex-shrink-0`}>
          {profile?.name?.[0] || 'C'}
        </div>
        <div>
          <h4 className="font-semibold text-lg text-gray-800">{profile?.name || 'Child'}</h4>
          <p className="text-gray-500 text-sm">
            {profile?.age ? `${profile.age} year${profile.age !== '1' ? 's' : ''}` : 'Age not specified'} 
            {profile?.gender ? ` • ${profile.gender}` : ''}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x">
        <div className="p-4 text-center">
          <p className="text-sm text-blue-600 mb-1">Total Calories</p>
          <p className="text-xl font-bold">{totalCalories.toFixed(0)} kJ</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-red-600 mb-1">Missing</p>
          <p className="text-xl font-bold">{missingNutrients}</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-amber-600 mb-1">Excess</p>
          <p className="text-xl font-bold">{excessNutrients}</p>
        </div>
      </div>

      {/* Recommendations Button */}
      {onViewRecommendations && (
        <div className="p-4 border-t">
          <button
            onClick={onViewRecommendations}
            className="w-full py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            View Recommendations
          </button>
        </div>
      )}
    </div>
  );
} 