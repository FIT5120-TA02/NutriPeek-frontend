'use client';

import { useState } from 'react';
import UnitFormatter from '@/components/UnitFormatter/UnitFormatter';

interface NutrientGapOverviewProps {
  gaps: Record<string, {
    name: string;
    recommended_intake: number;
    current_intake: number;
    unit: string;
    gap: number;
  }>;
}

export default function NutrientGapOverview({ gaps }: NutrientGapOverviewProps) {
  const [showAll, setShowAll] = useState(false);

  const nutrientsArray = Object.values(gaps);

  const calculatePercentage = (nutrient: any) => {
    if (nutrient.recommended_intake === 0) return 0;
    return Math.min(100, Math.max(0, (nutrient.current_intake / nutrient.recommended_intake) * 100));
  };

  const getBarColor = (percentage: number) => {
    if (percentage === 0) return 'bg-blue-400';
    if (percentage < 70) return 'bg-red-400';
    if (percentage < 90) return 'bg-yellow-400';
    if (percentage <= 110) return 'bg-green-400';
    return 'bg-amber-400';
  };

  const sortedNutrients = [...nutrientsArray].sort((a, b) => {
    const percA = calculatePercentage(a);
    const percB = calculatePercentage(b);
    return percB - percA;
  });

  const displayedNutrients = showAll ? sortedNutrients : sortedNutrients.slice(0, 6);

  return (
    <div className="p-6 mb-6 flex flex-col h-full">
      {/* Section Title */}
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold">Nutrient Gap Overview</h2>
      </div>
  
      {/* Nutrient List */}
      <div className="space-y-4 flex-1">
        {displayedNutrients.map((nutrient, index) => {
          const percentage = calculatePercentage(nutrient);
          const color = getBarColor(percentage);
  
          return (
            <div key={index} className="flex items-center justify-between space-x-4">
              {/* Left side: Nutrient name and progress bar */}
              <div className="w-2/3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{nutrient.name}</span>
                  <span className="text-sm font-medium text-gray-700">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className={`${color} h-3 rounded-full`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
  
              {/* Right side: Nutrient gap value or "Met" */}
              <div className="w-1/3 text-right">
                <span className="text-sm font-medium text-gray-700">
                  {percentage >= 100
                    ? 'Met'
                    : (
                      <UnitFormatter value={nutrient.gap} unit={nutrient.unit} />
                    )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
  
      {/* Show More Button */}
      {nutrientsArray.length > 10 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {showAll ? 'Show Less' : 'Show More Nutrients'}
          </button>
        </div>
      )}
    </div>
  );
}



