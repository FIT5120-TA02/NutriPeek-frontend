'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NutrientInfo } from '@/api/types';
import { calculateNutritionalScore } from '@/types/notes';

interface NutritionScoreCardProps {
  allNutrients: Record<string, NutrientInfo>;
  totalCalories?: number;
  missingCount?: number;
  excessCount?: number;
  showDetails?: boolean;
  title?: string;
  className?: string;
  compact?: boolean;
}

/**
 * A reusable component that displays a nutritional score and summary
 * Can be used in the Notes page, Profile Summary, or anywhere a nutritional score is needed
 */
export default function NutritionScoreCard({
  allNutrients,
  totalCalories = 0,
  missingCount = 0,
  excessCount = 0,
  showDetails = true,
  title = 'Nutritional Score',
  className = '',
  compact = false,
}: NutritionScoreCardProps) {
  // Calculate the score based on nutrient data
  const score = calculateNutritionalScore(allNutrients, missingCount, excessCount);
  
  // Determine the color based on score
  const scoreColor = score < 60 
    ? 'text-red-500 border-red-200' 
    : score < 80 
      ? 'text-yellow-500 border-yellow-200' 
      : 'text-green-500 border-green-200';
  
  // If compact mode is enabled, just return the score circle
  if (compact) {
    return (
      <motion.div 
        className={`h-14 w-14 ${scoreColor} bg-white rounded-full flex items-center justify-center font-bold text-xl shadow-md ${className}`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {score}
      </motion.div>
    );
  }
  
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white text-base font-semibold">{title}</h3>
          <motion.div 
            className={`h-14 w-14 ${scoreColor} bg-white rounded-full flex items-center justify-center font-bold text-xl shadow-md`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {score}
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      {showDetails && (
        <div className="grid grid-cols-3 divide-x">
          <div className="p-3 text-center">
            <p className="text-xs text-blue-600 mb-1">Total Calories</p>
            <p className="text-base font-bold">{totalCalories.toFixed(0)} kJ</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-xs text-red-600 mb-1">Missing</p>
            <p className="text-base font-bold">{missingCount}</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-xs text-amber-600 mb-1">Excess</p>
            <p className="text-base font-bold">{excessCount}</p>
          </div>
        </div>
      )}
    </div>
  );
} 