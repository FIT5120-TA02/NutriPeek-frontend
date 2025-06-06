'use client';

import { ChildProfile } from '@/types/profile';
import { useMemo } from 'react';
import { ChildEnergyRequirementsResponse } from '@/api/types';
import ChildAvatar from '@/components/ui/ChildAvatar';
import InfoPopup from '@/components/ui/InfoPopup';
import { 
  calculateNutritionScore, 
  getNutritionScoreColorClasses, 
  type NutrientDataForScoring 
} from '@/utils/NutritionScoreUtils';

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
  activityPAL?: number;
  energyRequirements?: ChildEnergyRequirementsResponse | null;
  onViewRecommendations?: () => void;
}

export default function ProfileSummary({
  profile,
  totalCalories,
  missingNutrients,
  excessNutrients,
  allNutrients = {},
  activityPAL,
  energyRequirements,
  onViewRecommendations
}: ProfileSummaryProps) {

  // PAL calculation explanation content for the InfoPopup
  const palExplanationContent = (
    <div className="max-w-[280px]">
      <p className="font-medium text-gray-800 mb-2">How is PAL calculated?</p>
      <p className="mb-2">
        PAL (Physical Activity Level) is calculated by tracking daily activities and their intensity levels:
      </p>
      <ol className="list-decimal pl-5 space-y-1 mb-2">
        <li>Each activity is assigned a METy value (intensity level)</li>
        <li>We multiply time spent on each activity by its METy value</li>
        <li>These values are summed and divided by total minutes in a day</li>
      </ol>
      <p>This gives an accurate picture of overall physical activity, which helps determine energy requirements.</p>
    </div>
  );

  const avatarGradient = profile?.gender?.toLowerCase() === 'female'
  ? 'from-pink-400 to-pink-600'
  : 'from-blue-500 to-blue-700';
  // Calculate adjusted calories based on activity level
  const baseEnergyTarget = useMemo(() => {
    // First try to find the Energy nutrient in allNutrients
    const energyNutrient = Object.values(allNutrients).find(
      n => n.name.toLowerCase().includes('energy')
    );
    
    return energyNutrient?.recommended_intake || 0;
  }, [allNutrients]);
  
  // Calculate energy requirements from API response
  const adjustedEnergyTarget = useMemo(() => {
    if (!energyRequirements) return null;
    return energyRequirements.estimated_energy_requirement;
  }, [energyRequirements]);
  
  // Determine if we need to increase the energy target
  const shouldIncreaseEnergy = useMemo(() => {
    if (!adjustedEnergyTarget || !baseEnergyTarget) return false;
    return adjustedEnergyTarget > baseEnergyTarget;
  }, [adjustedEnergyTarget, baseEnergyTarget]);
  
  // Calculate the energy increase percentage
  const energyIncreasePercentage = useMemo(() => {
    if (!shouldIncreaseEnergy || !baseEnergyTarget || !adjustedEnergyTarget) return 0;
    return Math.round(((adjustedEnergyTarget - baseEnergyTarget) / baseEnergyTarget) * 100);
  }, [shouldIncreaseEnergy, baseEnergyTarget, adjustedEnergyTarget]);

  /**
   * Calculate the overall nutrition score using the centralized utility
   * Converts the component's nutrient data format to the utility's expected format
   */
  const score = useMemo(() => {
    // Convert allNutrients to the format expected by the scoring utility
    const convertedNutrients: Record<string, NutrientDataForScoring> = {};
    
    Object.entries(allNutrients).forEach(([key, nutrient]) => {
      convertedNutrients[key] = {
        current_intake: nutrient.current_intake,
        recommended_intake: nutrient.recommended_intake,
        unit: nutrient.unit
      };
    });
    
    // Use the centralized scoring function
    return calculateNutritionScore(convertedNutrients, missingNutrients, excessNutrients);
  }, [allNutrients, missingNutrients, excessNutrients]);

  // Get consistent color styling using the utility
  const scoreColorClasses = getNutritionScoreColorClasses(score);
  const scoreColor = scoreColorClasses.textColor;
  
  // Determine PAL status text and color
  const getPALStatus = () => {
    if (!activityPAL) return { text: 'Not tracked', color: 'text-gray-500' };
    if (activityPAL < 1.4) return { text: 'Low', color: 'text-yellow-500' };
    if (activityPAL > 1.8) return { text: 'High', color: 'text-blue-500' };
    return { text: 'Moderate', color: 'text-green-500' };
  };
  
  const { text: palText, color: palColor } = getPALStatus();
  
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
        <ChildAvatar name={profile?.name || 'Child'} gender={profile?.gender || 'male'} size={52} />
        <div className="ml-4">
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
      
      {/* Activity PAL */}
      {activityPAL && (
        <div className="px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <p className="text-sm text-gray-600">Physical Activity Level:</p>
                <InfoPopup 
                  content={palExplanationContent}
                  position="top"
                  iconSize={16}
                  iconClassName="ml-1.5 text-gray-400 mt-0.5"
                />
              </div>
              <p className={`text-lg font-semibold ${palColor}`}>
                {activityPAL.toFixed(2)} <span className="text-sm font-normal">({palText})</span>
              </p>
            </div>
            <div className="bg-gray-100 p-2 rounded-full flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Energy Requirements based on Activity */}
      {shouldIncreaseEnergy && (
        <div className="px-6 py-4 border-t bg-blue-50">
          <div className="flex items-center">
            <div className="mr-3 bg-blue-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Increased Energy Needed</p>
              <p className="text-sm text-blue-600">
                Due to high activity, energy needs are {energyIncreasePercentage}% higher:
                <span className="font-bold"> {adjustedEnergyTarget?.toFixed(0)} {energyRequirements?.unit}</span>
              </p>
            </div>
          </div>
        </div>
      )}

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