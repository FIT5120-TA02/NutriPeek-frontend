'use client';

import React from 'react';
import UnitFormatter from '@/components/UnitFormatter/UnitFormatter';

interface NutrientInfo {
  name: string;
  unit: string;
  gap: number;
}

interface RecommendationComparisonProps {
  missingNutrients: Record<string, NutrientInfo>;
  excessNutrients: Record<string, NutrientInfo>;
}

export default function RecommendationComparison({
  missingNutrients,
  excessNutrients
}: RecommendationComparisonProps) {
  return (
    <div className="space-y-10">

      {/* Missing Nutrients */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-red-600">
          <i className="ph ph-warning-circle text-red-600 text-3xl"></i>
          Nutrients You Need More Of
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(missingNutrients).map((nutrient, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="text-gray-900 font-semibold">{nutrient.name}</div>
              <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <UnitFormatter value={nutrient.gap} unit={nutrient.unit} />
                <span>needed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Excess Nutrients */}
      {Object.keys(excessNutrients).length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-green-600">
            <i className="ph ph-avocado text-green-600 text-3xl"></i>
            Nutrients You May Have Too Much
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(excessNutrients).map((nutrient, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="text-gray-900 font-semibold">{nutrient.name}</div>
                <div className="text-green-500 text-sm mt-1 flex items-center gap-1">
                  <UnitFormatter value={nutrient.gap} unit={nutrient.unit} />
                  <span>excessive</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

