'use client';

import { motion } from 'framer-motion';
import { ExtendedNutrientGap } from './types';

interface NutrientListProps {
  nutrients: ExtendedNutrientGap[];
  activeNutrient: string | null;
  onSelectNutrient: (nutrientName: string) => void;
}

/**
 * Displays a list of missing nutrients with progress bars
 */
export default function NutrientList({ 
  nutrients, 
  activeNutrient, 
  onSelectNutrient 
}: NutrientListProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 overflow-hidden">
      <h2 className="font-bold text-lg text-gray-800 mb-3">Missing Nutrients</h2>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {nutrients.map((nutrient) => (
          <motion.div
            key={nutrient.name}
            className={`cursor-pointer rounded-lg p-3 transition-all ${
              activeNutrient === nutrient.name
                ? 'bg-green-100 border-l-4 border-green-500'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => onSelectNutrient(nutrient.name)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{nutrient.name}</span>
              <div className="text-xs font-semibold">
                <span className={nutrient.updatedPercentage > nutrient.percentage ? 'text-green-600' : 'text-gray-600'}>
                  {Math.min(Math.round(nutrient.updatedPercentage), 100)}%
                </span>
                {nutrient.updatedPercentage > nutrient.percentage && (
                  <span className="text-gray-400 ml-1">
                    (↑{Math.round(nutrient.updatedPercentage - nutrient.percentage)}%)
                  </span>
                )}
              </div>
            </div>
            <div className="w-full h-2 mt-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400"
                style={{ width: `${Math.min(Math.round(nutrient.percentage), 100)}%` }}
              ></div>
              {nutrient.updatedPercentage > nutrient.percentage && (
                <div
                  className="h-full bg-green-400 -mt-2"
                  style={{ 
                    width: `${Math.min(Math.round(nutrient.updatedPercentage - nutrient.percentage), 100 - Math.round(nutrient.percentage))}%`,
                    marginLeft: `${Math.min(Math.round(nutrient.percentage), 100)}%`
                  }}
                ></div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}