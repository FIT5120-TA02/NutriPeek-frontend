'use client';

import React from 'react';

interface Nutrient {
  name: string;
  recommended_intake: number;
  current_intake: number;
  unit: string;
  gap: number;
}

interface FoodGroupDetailsProps {
  gaps: Record<string, Nutrient>;
}

export default function FoodGroupDetails({ gaps }: FoodGroupDetailsProps) {
  const nutrientList = Object.values(gaps);

  const satisfied = nutrientList.filter(n => {
    const pct = n.recommended_intake > 0
      ? (n.current_intake / n.recommended_intake) * 100
      : 0;
    return pct >= 70;
  });

  const missing = nutrientList.filter(n => {
    const pct = n.recommended_intake > 0
      ? (n.current_intake / n.recommended_intake) * 100
      : 0;
    return pct < 70;
  });

  const orderedList = [...satisfied, ...missing];

  return (
    <div className="space-y-6">
      {orderedList.map((nutrient, index) => {
        const percentage = nutrient.recommended_intake > 0
          ? (nutrient.current_intake / nutrient.recommended_intake) * 100
          : 0;

        const isUnderrepresented = percentage < 70;

        return (
          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-gray-800">{nutrient.name}</h4>
              <span className={`text-sm ${isUnderrepresented ? 'text-red-500' : 'text-green-500'}`}>
                {percentage.toFixed(1)}% of recommendation
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              {isUnderrepresented
                ? 'Currently underrepresented in the meal. Consider boosting intake of this group.'
                : 'Sufficient intake. No immediate action needed.'}
            </p>
            {isUnderrepresented && (
              <div className="text-xs text-gray-500 italic">
                Tip: Add more sources rich in {nutrient.name.toLowerCase()} to balance the diet.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
